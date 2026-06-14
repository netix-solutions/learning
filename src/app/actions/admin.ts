"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { setSubscriptionCancel } from "@/lib/billing-info";
import {
  ADMIN_COOKIE,
  createAdminToken,
  isAdminAuthed,
  verifyAdminCredentials,
} from "@/lib/admin";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export type AdminFormState = { error: string | null };

/** Admin signs in with the configured email + password. */
export async function adminSignIn(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password)
    return { error: "Enter your email and password." };

  if (!verifyAdminCredentials(email, password))
    return { error: "Invalid credentials." };

  const store = await cookies();
  store.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h, matches the token TTL
  });

  redirect("/admin");
}

export async function adminSignOut() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/** Permanently delete a user. Cascades to profile, attempts, badges, links. */
export async function adminDeleteUser(
  userId: string,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!userId) return { error: "Missing user." };

  const db = createAdminClient();
  const { error } = await db.auth.admin.deleteUser(userId);
  if (error) return { error: "Could not delete that user." };

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { error: null };
}

// --- Billing, on a parent's behalf -----------------------------------------
// Every action re-checks the admin session before touching Stripe, mirroring
// adminDeleteUser — the parentId comes from the client, so authorization can't
// rely on it.

function revalidateAdminBilling(parentId: string) {
  revalidatePath("/admin/billing");
  revalidatePath(`/admin/billing/${parentId}`);
}

/** Cancel a parent's plan at period end (operator support action). */
export async function adminCancelSubscription(
  parentId: string,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!parentId) return { error: "Missing parent." };

  const res = await setSubscriptionCancel(parentId, true);
  if (res?.error) return { error: res.error };
  revalidateAdminBilling(parentId);
  return { error: null };
}

/** Undo a pending cancellation on a parent's plan. */
export async function adminResumeSubscription(
  parentId: string,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!parentId) return { error: "Missing parent." };

  const res = await setSubscriptionCancel(parentId, false);
  if (res?.error) return { error: res.error };
  revalidateAdminBilling(parentId);
  return { error: null };
}

/**
 * Open the Stripe Billing Portal for a parent's customer so the operator can
 * manage the card / plan on their behalf (the only PCI-safe way to touch the
 * payment method). Redirects back to that parent's admin billing detail page.
 */
export async function adminOpenParentPortal(
  parentId: string,
): Promise<{ error: string } | undefined> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!parentId) return { error: "Missing parent." };

  const stripe = getStripe();
  if (!stripe) return { error: "Billing isn't set up yet." };

  const db = createAdminClient();
  const { data: sub } = await db
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("parent_id", parentId)
    .maybeSingle();
  if (!sub?.stripe_customer_id) return { error: "This parent has no billing customer yet." };

  let url: string;
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${appUrl()}/admin/billing/${parentId}`,
    });
    url = session.url;
  } catch (err) {
    console.error("[admin] could not open portal", err);
    return { error: "Billing portal isn't available right now." };
  }
  redirect(url);
}
