import { getSessionProfile } from "@/lib/auth";
import { getParentEntitlement } from "@/lib/entitlement";
import { Paywall } from "@/components/Paywall";

/**
 * Wraps every /parent route. When a trial/subscription has LAPSED, a blocking
 * paywall overlay covers the dashboard and child pages — but it self-suppresses
 * on /parent/billing so the parent can always reach checkout.
 *
 * New accounts still onboarding ("needs_subscription") are deliberately NOT
 * blocked here: they need the dashboard to add their kids before being funnelled
 * into the mandatory Stripe trial (the /parent page renders that gate inline).
 * No-op while BILLING_ENABLED is off (entitlement returns entitled for all).
 */
export default async function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();
  let locked = false;
  if (user && profile?.role === "parent") {
    const ent = await getParentEntitlement(user.id);
    locked = ent.reason === "locked";
  }

  return (
    <>
      {children}
      {locked && <Paywall role="parent" />}
    </>
  );
}
