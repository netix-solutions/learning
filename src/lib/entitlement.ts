import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRIAL_DAYS } from "@/lib/billing";

// Single source of truth for "is this account allowed to use the paid app?".
// Everything funnels through here so the gating POLICY is a one-place change.
//
// Policy (decided with the product owner):
//   • BILLING_ENABLED=false  → everyone is entitled (app is free). Default.
//   • Grandfathering         → parent accounts created before BILLING_LAUNCH_AT
//                              are free forever.
//   • Free trial             → every NEW account is entitled for TRIAL_DAYS,
//                              measured from the parent profile's created_at, so
//                              the trial starts the moment the account exists —
//                              no card and no Stripe object required.
//   • Otherwise              → entitled while the Stripe subscription is active
//                              or trialing.
//   • What's gated           → kids' practice (enforced server-side at the
//                              practice route) plus a blocking paywall overlay
//                              on /home and /parent (the billing page stays open).

export type EntitlementReason =
  | "billing_off"
  | "grandfathered"
  | "subscribed"
  | "trialing"
  | "locked";

export type Entitlement = {
  entitled: boolean;
  billingEnabled: boolean;
  reason: EntitlementReason;
  status: string; // raw subscription status or a sentinel
  seats: number; // kids covered by the subscription
  kids: number; // kids currently on the account
  trialEndsAt: string | null; // ISO end of the active trial/period, if any
};

const DAY_MS = 86_400_000;

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

/** End of the signup-anchored free trial, in epoch ms (0 if unknown). */
export function signupTrialEndMs(createdAt: string | null | undefined): number {
  if (!createdAt) return 0;
  return new Date(createdAt).getTime() + TRIAL_DAYS * DAY_MS;
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

  // Auto-trial: entitled for TRIAL_DAYS from the moment the account was created.
  const trialEndMs = signupTrialEndMs(prof?.created_at);
  const inSignupTrial = trialEndMs > Date.now();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, seats, current_period_end")
    .eq("parent_id", parentId)
    .maybeSingle();

  const status = sub?.status ?? "free";
  const activeStatus = status === "active" || status === "trialing";
  const notExpired =
    !sub?.current_period_end || new Date(sub.current_period_end).getTime() > Date.now();
  const subEntitled = activeStatus && notExpired;

  const entitled = subEntitled || inSignupTrial;
  const reason: EntitlementReason = subEntitled
    ? status === "trialing"
      ? "trialing"
      : "subscribed"
    : inSignupTrial
      ? "trialing"
      : "locked";

  // Surface when the current free window ends, so the UI can nudge ("2 days
  // left"). Prefer Stripe's period end when subscribed; else the signup trial.
  const trialEndsAt =
    reason === "trialing"
      ? subEntitled && sub?.current_period_end
        ? new Date(sub.current_period_end).toISOString()
        : trialEndMs
          ? new Date(trialEndMs).toISOString()
          : null
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
