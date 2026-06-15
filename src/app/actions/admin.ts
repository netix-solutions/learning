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

/**
 * Set or clear a parent's cell phone (operator support action). Stored in the
 * parent's auth user_metadata; we merge so role/display_name survive. Pass an
 * empty string to clear. parentId comes from the client, so re-check admin.
 */
export async function adminSetParentPhone(
  parentId: string,
  phone: string,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!parentId) return { error: "Missing parent." };

  const trimmed = phone.trim();
  if (trimmed && trimmed.replace(/\D/g, "").length < 10)
    return { error: "Enter a valid phone number (or clear it)." };

  const db = createAdminClient();
  const { data: existing, error: getErr } = await db.auth.admin.getUserById(parentId);
  if (getErr || !existing?.user) return { error: "Could not find that parent." };

  const meta = { ...(existing.user.user_metadata ?? {}), phone: trimmed };
  const { error } = await db.auth.admin.updateUserById(parentId, {
    user_metadata: meta,
  });
  if (error) return { error: "Could not update the phone number." };

  revalidatePath("/admin/users");
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

// --- Coupons ---------------------------------------------------------------

export type CouponFormState = { error: string | null; ok?: boolean };

/** Create a coupon code (operator only). */
export async function adminCreateCoupon(
  _prev: CouponFormState,
  formData: FormData,
): Promise<CouponFormState> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };

  const code = String(formData.get("code") ?? "").trim().toLowerCase();
  const kind = String(formData.get("kind") ?? "");
  const description = String(formData.get("description") ?? "").trim() || null;
  const maxRedRaw = String(formData.get("max_redemptions") ?? "").trim();
  const expiresRaw = String(formData.get("expires_at") ?? "").trim();

  if (!code) return { error: "Enter a code." };
  if (!/^[a-z0-9-]+$/.test(code))
    return { error: "Code can use letters, numbers, and dashes only." };
  if (kind !== "free" && kind !== "trial_days")
    return { error: "Pick a coupon type." };

  let max_kids: number | null = null;
  let trial_days: number | null = null;
  if (kind === "free") {
    const mk = String(formData.get("max_kids") ?? "").trim();
    if (mk) {
      max_kids = Number(mk);
      if (!Number.isInteger(max_kids) || max_kids < 1)
        return { error: "Max kids must be a whole number ≥ 1 (or blank for unlimited)." };
    }
  } else {
    trial_days = Number(String(formData.get("trial_days") ?? "").trim());
    if (!Number.isInteger(trial_days) || trial_days < 1)
      return { error: "Trial days must be a whole number ≥ 1." };
  }

  let max_redemptions: number | null = null;
  if (maxRedRaw) {
    max_redemptions = Number(maxRedRaw);
    if (!Number.isInteger(max_redemptions) || max_redemptions < 1)
      return { error: "Max redemptions must be a whole number ≥ 1 (or blank for unlimited)." };
  }
  const expires_at = expiresRaw ? new Date(expiresRaw).toISOString() : null;

  const db = createAdminClient();
  const { error } = await db
    .from("coupons")
    .insert({ code, kind, description, max_kids, trial_days, max_redemptions, expires_at });
  if (error) {
    if (error.code === "23505") return { error: "That code already exists." };
    console.error("[admin] create coupon failed", error);
    return { error: "Could not create the coupon." };
  }

  revalidatePath("/admin/coupons");
  return { error: null, ok: true };
}

/** Activate or deactivate a coupon (operator only). */
export async function adminSetCouponActive(
  code: string,
  active: boolean,
): Promise<{ error: string | null }> {
  if (!(await isAdminAuthed())) return { error: "Not authorized." };
  if (!code) return { error: "Missing code." };

  const db = createAdminClient();
  const { error } = await db.from("coupons").update({ active }).eq("code", code);
  if (error) return { error: "Could not update the coupon." };

  revalidatePath("/admin/coupons");
  return { error: null };
}
