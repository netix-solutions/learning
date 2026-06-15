"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { gaEvent } from "@/lib/gtag";

/**
 * Fires conversion events that originate from a server-action redirect (where we
 * can't call gtag directly), signalled via a query marker, then strips the
 * marker from the URL. Mounted on /parent, the landing spot for both flows:
 *   - ?welcome=1            → sign_up  (just created an account)
 *   - ?status=success       → purchase (returned from Stripe Checkout)
 */
export function ConversionEvents() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (params.get("welcome") === "1") {
      gaEvent("sign_up", { method: "email" });
      params.delete("welcome");
      changed = true;
    }
    if (params.get("status") === "success") {
      gaEvent("purchase", { currency: "USD" });
      params.delete("status");
      changed = true;
    } else if (params.get("status") === "cancel") {
      params.delete("status");
      changed = true;
    }

    if (changed) {
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname || "/", {
        scroll: false,
      });
    }
  }, [searchParams, pathname, router]);

  return null;
}
