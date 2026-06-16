"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { KidFooter } from "@/components/KidFooter";

// Children's surfaces get a stripped-down, playful footer; everywhere else gets
// the full marketing/support/legal footer.
const KID_PREFIXES = ["/home", "/practice", "/kids"];

export function AppFooter() {
  const pathname = usePathname();
  const isKid =
    !!pathname &&
    KID_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return isKid ? <KidFooter /> : <SiteFooter />;
}
