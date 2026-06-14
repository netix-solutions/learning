import { getSessionProfile } from "@/lib/auth";
import { getParentEntitlement } from "@/lib/entitlement";
import { Paywall } from "@/components/Paywall";

/**
 * Wraps every /parent route. When the subscription isn't active, a blocking
 * paywall overlay covers the dashboard and child pages — but the Paywall
 * self-suppresses on /parent/billing so the parent can always reach checkout.
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
    locked = !ent.entitled;
  }

  return (
    <>
      {children}
      {locked && <Paywall role="parent" />}
    </>
  );
}
