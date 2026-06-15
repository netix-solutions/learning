// Google Analytics 4 (gtag) helpers.
//
// Privacy-by-design: SummerSharp is a children's app, so analytics is scoped to
// ADULT surfaces only. We never load gtag.js or send any hit on kid pages
// (/home, /practice, /kids) or the internal /admin area. Enhanced Measurement
// is disabled in GA, and gtag's automatic page_view is off (send_page_view:
// false) — we send page_views and events manually, and every sender below
// re-checks the current path so nothing leaks from a child page.

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

/** Surfaces we never track: children's pages + internal admin. */
const EXCLUDED = ["/home", "/practice", "/kids", "/admin"];

export function isAnalyticsExcluded(path: string): boolean {
  return EXCLUDED.some((x) => path === x || path.startsWith(x + "/"));
}

type GtagParams = Record<string, unknown>;

type GtagWindow = {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Push a gtag command, defining the standard stub if gtag.js hasn't loaded yet
 * so calls queue and flush once it does (it only loads on adult routes).
 */
function push(...args: unknown[]) {
  if (typeof window === "undefined" || !GA_ID) return;
  const w = window as unknown as GtagWindow;
  w.dataLayer = w.dataLayer || [];
  w.gtag =
    w.gtag ||
    function gtag() {
      // eslint-disable-next-line prefer-rest-params
      (w.dataLayer as unknown[]).push(arguments);
    };
  w.gtag(...args);
}

/** Fire a GA4 event from an adult surface. No-ops on kid/admin pages. */
export function gaEvent(name: string, params: GtagParams = {}) {
  if (typeof window === "undefined" || !GA_ID) return;
  if (isAnalyticsExcluded(window.location.pathname)) return;
  push("event", name, params);
}

/** Send a manual page_view (gtag's automatic one is disabled). */
export function gaPageview(url: string) {
  if (typeof window === "undefined" || !GA_ID) return;
  push("event", "page_view", {
    page_path: url,
    page_location: window.location.href,
    page_title: document.title,
  });
}
