"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { GA_ID, isAnalyticsExcluded, gaPageview } from "@/lib/gtag";

// Dedup across mounts/route-change effects so a given URL is only counted once.
let lastUrl: string | null = null;

/**
 * Loads gtag.js and sends manual SPA page_views — but ONLY on adult surfaces.
 * On kid/admin routes this renders nothing (gtag.js never loads, no cookie, no
 * hits). See lib/gtag.ts for the privacy rationale.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const excluded = !pathname || isAnalyticsExcluded(pathname);

  useEffect(() => {
    if (!GA_ID || excluded || !pathname) return;
    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    if (url === lastUrl) return;
    lastUrl = url;
    gaPageview(url);
  }, [pathname, searchParams, excluded]);

  if (!GA_ID || excluded) return null;

  return (
    <>
      <Script
        id="ga-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}
