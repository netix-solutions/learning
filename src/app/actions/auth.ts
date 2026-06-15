"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { childEmail, childPassword } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";

export type FormState = { error: string | null };
export type ResetRequestState = { error: string | null; sent: boolean };
export type PhoneState = { error: string | null; saved: boolean };

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

// Coarse in-memory throttle for the kid→parent password check, so a child can't
// hammer parent-password guesses. Per serverless instance; Supabase also
// rate-limits auth, this is a cheap first line.
const switchHits = new Map<string, number[]>();
function switchRateLimited(id: string): boolean {
  const now = Date.now();
  const recent = (switchHits.get(id) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  switchHits.set(id, recent);
  return recent.length > 10;
}

/** Parent creates an account (email + password). */
export async function signUpParent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Please enter your name." };
  if (!email) return { error: "Please enter your email." };
  // Collected so support can find a family by the number they call in from.
  if (phone.replace(/\D/g, "").length < 10)
    return { error: "Please enter a valid cell phone number." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: "parent", display_name: name, phone } },
  });

  if (error) return { error: error.message };

  // Branded welcome email — best effort; never blocks or fails signup.
  await sendEmail({ to: email, ...welcomeEmail({ name }) }).catch(() => {});

  redirect("/parent");
}

/**
 * Save (or update) the signed-in parent's cell phone into their auth metadata.
 * Used by the sign-in prompt for parents who created accounts before we asked
 * for a number. updateUser merges into user_metadata, preserving role/name.
 */
export async function saveParentPhone(
  _prev: PhoneState,
  formData: FormData,
): Promise<PhoneState> {
  const phone = String(formData.get("phone") ?? "").trim();
  if (phone.replace(/\D/g, "").length < 10)
    return { error: "Please enter a valid cell phone number.", saved: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again.", saved: false };

  const { error } = await supabase.auth.updateUser({ data: { phone } });
  if (error) return { error: error.message, saved: false };
  return { error: null, saved: true };
}

/** Parent signs in. */
export async function signInParent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Please enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: "Hmm, that email or password didn't work." };
  redirect("/parent");
}

/** Kid signs in with username + PIN. */
export async function signInChild(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!username || !pin)
    return { error: "Type your username and your secret PIN!" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: childEmail(username),
    password: childPassword(pin),
  });

  if (error)
    return { error: "Oops! Check your username and PIN and try again." };
  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Parent forgot their password: email them a recovery link. The link lands on
 * /auth/confirm, which establishes a short-lived session and forwards to
 * /reset-password. We always report success (never reveal whether an email is
 * registered) — Supabase only sends if the account exists.
 */
export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Please enter your email.", sent: false };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl()}/auth/confirm?next=/reset-password`,
  });
  // Surface only genuine config/transport failures; otherwise stay vague.
  if (error && error.status && error.status >= 500)
    return { error: "Something went wrong. Please try again.", sent: false };

  return { error: null, sent: true };
}

/**
 * Set a new password. Runs on /reset-password, where the recovery link has
 * already established a session (so updateUser is authorized). Also works as a
 * plain authed password change for a signed-in parent.
 */
export async function confirmPasswordReset(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Those passwords don't match." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return {
      error: "Your reset link expired. Please request a new one.",
    };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  redirect("/parent");
}

/**
 * Parent → kid: open one of the parent's own children's accounts on this device
 * without the child typing their username/PIN. The parent is already
 * authenticated and must own the child; we mint a fresh child session via an
 * admin-generated magic link (no PIN needed) and swap the cookie session.
 */
export async function switchToChild(
  childId: string,
): Promise<{ error: string } | undefined> {
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

  const admin = createAdminClient();

  // The parent may only open a child they actually own.
  const { data: link } = await admin
    .from("parent_child")
    .select("child_id")
    .eq("parent_id", user.id)
    .eq("child_id", childId)
    .maybeSingle();
  if (!link) return { error: "That child isn't on your account." };

  const { data: childUser, error: childErr } =
    await admin.auth.admin.getUserById(childId);
  const childAuthEmail = childUser?.user?.email;
  if (childErr || !childAuthEmail)
    return { error: "Could not open that account." };

  // Admin-generate a one-time login token for the child, then consume it on the
  // current (cookie-bound) client so this device becomes the child's session.
  const { data: linkData, error: genErr } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: childAuthEmail,
    });
  const tokenHash = linkData?.properties?.hashed_token;
  if (genErr || !tokenHash) return { error: "Could not open that account." };

  const { error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: "magiclink",
  });
  if (verifyErr) return { error: "Could not open that account." };

  redirect("/home");
}

/**
 * Kid → parent: from a child's device, hand control back to the parent. Gated by
 * the parent's own password (so a child can't switch on their own). We look up
 * the parent(s) linked to this child and sign in with the supplied password.
 */
export async function switchToParent(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your password." };

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
  if (profile?.role !== "student")
    return { error: "Only a kid account can do that." };

  if (switchRateLimited(user.id))
    return { error: "Too many tries. Please wait a minute and try again." };

  const admin = createAdminClient();
  const { data: links } = await admin
    .from("parent_child")
    .select("parent_id")
    .eq("child_id", user.id);
  const parentIds = (links ?? []).map((l) => l.parent_id as string);
  if (!parentIds.length)
    return { error: "No grown-up account is linked to this login." };

  // Try the password against each linked parent's email. A success swaps the
  // current child session for the parent's.
  for (const parentId of parentIds) {
    const { data: parentUser } = await admin.auth.admin.getUserById(parentId);
    const parentAuthEmail = parentUser?.user?.email;
    if (!parentAuthEmail) continue;
    const { error } = await supabase.auth.signInWithPassword({
      email: parentAuthEmail,
      password,
    });
    if (!error) redirect("/parent");
  }

  return { error: "That password didn't match. Please try again." };
}
