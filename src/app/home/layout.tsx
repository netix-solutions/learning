import { getSessionProfile } from "@/lib/auth";
import { getStudentEntitlement } from "@/lib/entitlement";
import { Paywall } from "@/components/Paywall";

/**
 * Wraps the kid's home hub. When the family's subscription isn't active, a
 * blocking paywall overlay covers it (the page itself still redirects
 * unauthenticated visitors). No-op while BILLING_ENABLED is off, since
 * getStudentEntitlement returns entitled for everyone then.
 */
export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();
  let locked = false;
  if (user && profile?.role === "student") {
    const ent = await getStudentEntitlement(user.id);
    locked = !ent.entitled;
  }

  return (
    <>
      {children}
      {locked && <Paywall role="student" />}
    </>
  );
}
