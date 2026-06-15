import { Suspense } from "react";
import { getSessionProfile } from "@/lib/auth";
import { getParentEntitlement } from "@/lib/entitlement";
import { Paywall } from "@/components/Paywall";
import { CollectPhoneDialog } from "@/components/CollectPhoneDialog";
import { ConversionEvents } from "@/components/analytics/ConversionEvents";

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
  let needsPhone = false;
  if (user && profile?.role === "parent") {
    const ent = await getParentEntitlement(user.id);
    locked = ent.reason === "locked";
    const phone = (user.user_metadata as { phone?: string } | null)?.phone;
    needsPhone = !phone?.trim();
  }

  return (
    <>
      {children}
      <Suspense fallback={null}>
        <ConversionEvents />
      </Suspense>
      {locked && <Paywall role="parent" />}
      {/* Ask pre-existing parents for a cell number, but don't stack it on the paywall. */}
      {!locked && needsPhone && <CollectPhoneDialog />}
    </>
  );
}
