"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { childEmail, childPassword } from "@/lib/auth";
import { syncSubscriptionSeats } from "@/lib/billing-sync";
import { AVATARS, DEFAULT_AVATAR, GRADES, type Grade } from "@/lib/types";

export type ChildFormState = {
  error: string | null;
  success: string | null;
};

/** Confirm the caller is a signed-in parent; returns their user id. */
async function requireParent(): Promise<
  { parentId: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "parent")
    return { error: "Only a parent account can do that." };

  return { parentId: user.id };
}

/** Parent creates a new child login (username + PIN). */
export async function createChild(
  _prev: ChildFormState,
  formData: FormData,
): Promise<ChildFormState> {
  const auth = await requireParent();
  if ("error" in auth) return { error: auth.error, success: null };

  const displayName = String(formData.get("display_name") ?? "").trim();
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase();
  const grade = String(formData.get("grade") ?? "") as Grade;
  const pin = String(formData.get("pin") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? DEFAULT_AVATAR);

  if (!displayName) return { error: "Add your child's first name.", success: null };
  if (!/^[a-z0-9]{3,20}$/.test(username))
    return {
      error: "Username must be 3–20 letters or numbers (no spaces).",
      success: null,
    };
  if (!GRADES.includes(grade))
    return { error: "Pick a grade.", success: null };
  if (!/^\d{4}$/.test(pin))
    return { error: "PIN must be exactly 4 digits.", success: null };

  const safeAvatar = AVATARS.includes(avatar) ? avatar : DEFAULT_AVATAR;
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: childEmail(username),
    password: childPassword(pin),
    email_confirm: true,
    user_metadata: {
      role: "student",
      display_name: displayName,
      username,
      grade,
      avatar: safeAvatar,
    },
  });

  if (error || !data.user) {
    const msg = error?.message ?? "";
    if (/already|registered|exists/i.test(msg))
      return { error: `Username "${username}" is taken — try another.`, success: null };
    return { error: "Could not create that login. Please try again.", success: null };
  }

  const { error: linkError } = await admin
    .from("parent_child")
    .insert({ parent_id: auth.parentId, child_id: data.user.id });

  if (linkError) {
    // Roll back the orphaned auth user so usernames don't get stuck.
    await admin.auth.admin.deleteUser(data.user.id);
    return { error: "Could not link that child. Please try again.", success: null };
  }

  // Keep the subscription seat count in step (no-op unless billing is live).
  await syncSubscriptionSeats(auth.parentId).catch(() => {});

  revalidatePath("/parent");
  return {
    error: null,
    success: `${displayName} is ready! Username: ${username} · PIN: ${pin}`,
  };
}

/** Parent removes a child they own. */
export async function removeChild(childId: string): Promise<{ error: string | null }> {
  const auth = await requireParent();
  if ("error" in auth) return { error: auth.error };

  const admin = createAdminClient();
  const { data: link } = await admin
    .from("parent_child")
    .select("child_id")
    .eq("parent_id", auth.parentId)
    .eq("child_id", childId)
    .maybeSingle();

  if (!link) return { error: "That child isn't on your account." };

  // Deleting the auth user cascades to profile, attempts, badges, and link.
  const { error } = await admin.auth.admin.deleteUser(childId);
  if (error) return { error: "Could not remove that child." };

  // Drop the freed-up seat from the subscription (no-op unless billing is live).
  await syncSubscriptionSeats(auth.parentId).catch(() => {});

  revalidatePath("/parent");
  return { error: null };
}
