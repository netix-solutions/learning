import Link from "next/link";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_EMAIL } from "@/lib/contact";

/** A small, muted US flag — desaturated so it reads as a subtle mark, not decoration. */
function UsFlag() {
  const red = "#a86b6b";
  const navy = "#5d6a92";
  const off = "#ece9e6";
  // 13 stripes, red on the even rows; canton over the top-left 7.
  const stripeH = 12 / 13;
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 18 12"
      aria-hidden="true"
      className="shrink-0 opacity-80"
    >
      <defs>
        <clipPath id="us-flag-round">
          <rect width="18" height="12" rx="2" />
        </clipPath>
      </defs>
      <g clipPath="url(#us-flag-round)">
        <rect width="18" height="12" fill={off} />
        {Array.from({ length: 13 }).map((_, i) =>
          i % 2 === 0 ? (
            <rect key={i} y={i * stripeH} width="18" height={stripeH} fill={red} />
          ) : null,
        )}
        <rect width="7.4" height={stripeH * 7} fill={navy} />
      </g>
      <rect width="18" height="12" rx="2" fill="none" stroke="#0000000f" />
    </svg>
  );
}

/**
 * App-wide footer.
 *
 * Two tiers, deliberately quiet so it sits below the playful SummerSharp UI:
 *  1. A support panel that leads with a 24/7 phone number, plus the legal links.
 *  2. A thin bottom bar that merges the Netix credit, copyright, and origin —
 *     each fact stated once, no repetition.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto w-full px-4 pb-7 pt-8">
      <div className="mx-auto max-w-5xl border-t border-slate-200/70">
        {/* Tier 1 — support leads, legal follows */}
        <div className="flex flex-col items-center gap-6 py-7 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <p className="inline-flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-400">
              <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              24/7 Support
            </p>
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="font-display text-xl font-extrabold tracking-tight text-[var(--brand-blue)] transition-opacity hover:opacity-80"
            >
              {SUPPORT_PHONE}
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-[0.78rem] font-medium text-slate-500 transition-colors hover:text-slate-800"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>

          <nav className="flex flex-col items-center gap-2 sm:items-end">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-400">
              Legal
            </p>
            <Link href="/privacy" className="text-[0.82rem] font-medium text-slate-500 transition-colors hover:text-slate-800">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-[0.82rem] font-medium text-slate-500 transition-colors hover:text-slate-800">
              Terms of Use
            </Link>
          </nav>
        </div>

        {/* Tier 2 — one quiet line: credit · copyright · origin */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200/70 py-4 text-[0.7rem] text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            <a
              href="https://netixsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              Netix Solutions, LLC
            </a>
            . All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 font-medium uppercase tracking-[0.14em]">
            <UsFlag />
            Made in America
          </p>
        </div>
      </div>
    </footer>
  );
}
