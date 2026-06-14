import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Single source of truth for "is this account allowed to use the paid app?".
// Everything funnels through here so the gating POLICY is a one-place change.
//
// Policy (decided with the product owner):
//   • BILLING_ENABLED=false  → everyone is entitled (app is free). Default.
//   • Grandfathering         → parent accounts created before BILLING_LAUNCH_AT
//                              are free forever.
//   • Free trial             → the trial is a STRIPE trial, created via Checkout
//                              at signup (card on file). There is NO card-free
//                              auto-trial: a new account is NOT entitled until it
//                              completes Stripe Checkout. This makes starting the
//                              trial mandatory for every new signup.
//   • Otherwise              → entitled while the Stripe subscription is active
//                              or trialing.
//   • What's gated           → kids' practice (enforced server-side at the
//                              practice route) plus a blocking paywall overlay on
//                              /home, and on /parent ONLY once a trial has lapsed.
//                              New accounts mid-onboarding ("needs_subscription")
//                              keep /parent usable so they can add their kids
//                              before being funnelled into Checkout.

export type EntitlementReason =
  | "billing_off"
  | "grandfathered"
  | "subscribed"
  | "trialing"
  | "needs_subscription" // billing on, never subscribed yet — must start a trial
  | "locked"; // had a subscription/trial that has since lapsed

export type Entitlement = {
  entitled: boolean;
  billingEnabled: boolean;
  reason: EntitlementReason;
  status: string; // raw subscription status or a sentinel
  seats: number; // kids covered by the subscription
  kids: number; // kids currently on the account
  trialEndsAt: string | null; // ISO end of the active trial/period, if any
};

export function billingEnabled(): boolean {
  return process.env.BILLING_ENABLED === "true";
}

async function kidCount(parentId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("parent_child")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", parentId);
  return count ?? 0;
}

function isGrandfathered(createdAt: string | null | undefined): boolean {
  const launch = process.env.BILLING_LAUNCH_AT;
  if (!launch || !createdAt) return false;
  return new Date(createdAt).getTime() < new Date(launch).getTime();
}

/** Entitlement for a PARENT account. */
export async function getParentEntitlement(parentId: string): Promise<Entitlement> {
  const kids = await kidCount(parentId);

  if (!billingEnabled()) {
    return { entitled: true, billingEnabled: false, reason: "billing_off", status: "free", seats: kids, kids, trialEndsAt: null };
  }

  const admin = createAdminClient();

  // Grandfathered accounts (signed up before launch) stay free forever.
  const { data: prof } = await admin
    .from("profiles")
    .select("created_at")
    .eq("id", parentId)
    .single();
  if (isGrandfathered(prof?.created_at)) {
    return { entitled: true, billingEnabled: true, reason: "grandfathered", status: "grandfathered", seats: kids, kids, trialEndsAt: null };
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, seats, current_period_end, stripe_subscription_id")
    .eq("parent_id", parentId)
    .maybeSingle();

  const status = sub?.status ?? "free";
  const activeStatus = status === "active" || status === "trialing";
  const notExpired =
    !sub?.current_period_end || new Date(sub.current_period_end).getTime() > Date.now();
  const subEntitled = activeStatus && notExpired;

  // The only path to a trial is Stripe Checkout — there is no card-free
  // auto-trial. A brand-new account that has never created a Stripe subscription
  // is mid-onboarding ("needs_subscription"); an account whose subscription has
  // since lapsed is "locked" (gets the blocking paywall).
  const hasRealSub = !!sub?.stripe_subscription_id;
  const entitled = subEntitled;
  const reason: EntitlementReason = subEntitled
    ? status === "trialing"
      ? "trialing"
      : "subscribed"
    : hasRealSub
      ? "locked"
      : "needs_subscription";

  // Surface when the current paid/trial window ends, so the UI can nudge.
  const trialEndsAt =
    subEntitled && sub?.current_period_end
      ? new Date(sub.current_period_end).toISOString()
      : null;

  return {
    entitled,
    billingEnabled: true,
    reason,
    status,
    seats: sub?.seats ?? 0,
    kids,
    trialEndsAt,
  };
}

/** Entitlement for a STUDENT — entitled if ANY linked parent is entitled. */
export async function getStudentEntitlement(studentId: string): Promise<Entitlement> {
  if (!billingEnabled()) {
    return { entitled: true, billingEnabled: false, reason: "billing_off", status: "free", seats: 0, kids: 0, trialEndsAt: null };
  }
  const admin = createAdminClient();
  const { data: links } = await admin
    .from("parent_child")
    .select("parent_id")
    .eq("child_id", studentId);

  for (const link of links ?? []) {
    const e = await getParentEntitlement(link.parent_id as string);
    if (e.entitled) return e;
  }
  return { entitled: false, billingEnabled: true, reason: "locked", status: "locked", seats: 0, kids: 0, trialEndsAt: null };
}
