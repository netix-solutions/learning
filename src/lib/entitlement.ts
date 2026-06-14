import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Single source of truth for "is this account allowed to use the paid app?".
// Everything funnels through here so the gating POLICY is a one-place change.
//
// Policy (decided with the product owner):
//   • BILLING_ENABLED=false  → everyone is entitled (app is free). Default.
//   • Grandfathering         → parent accounts created before BILLING_LAUNCH_AT
//                              are free forever.
//   • Otherwise              → entitled while the Stripe subscription is
//                              active or trialing (7-day trial for new sign-ups).
//   • What's gated           → kids' practice (enforced at the practice route);
//                              the dashboard and billing page stay reachable.

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
    return { entitled: true, billingEnabled: false, reason: "billing_off", status: "free", seats: kids, kids };
  }

  const admin = createAdminClient();

  // Grandfathered accounts (signed up before launch) stay free forever.
  const { data: prof } = await admin
    .from("profiles")
    .select("created_at")
    .eq("id", parentId)
    .single();
  if (isGrandfathered(prof?.created_at)) {
    return { entitled: true, billingEnabled: true, reason: "grandfathered", status: "grandfathered", seats: kids, kids };
  }

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, seats, current_period_end")
    .eq("parent_id", parentId)
    .maybeSingle();

  const status = sub?.status ?? "free";
  const activeStatus = status === "active" || status === "trialing";
  const notExpired =
    !sub?.current_period_end || new Date(sub.current_period_end).getTime() > Date.now();
  const entitled = activeStatus && notExpired;

  return {
    entitled,
    billingEnabled: true,
    reason: status === "trialing" ? "trialing" : entitled ? "subscribed" : "locked",
    status,
    seats: sub?.seats ?? 0,
    kids,
  };
}

/** Entitlement for a STUDENT — entitled if ANY linked parent is entitled. */
export async function getStudentEntitlement(studentId: string): Promise<Entitlement> {
  if (!billingEnabled()) {
    return { entitled: true, billingEnabled: false, reason: "billing_off", status: "free", seats: 0, kids: 0 };
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
  return { entitled: false, billingEnabled: true, reason: "locked", status: "locked", seats: 0, kids: 0 };
}
