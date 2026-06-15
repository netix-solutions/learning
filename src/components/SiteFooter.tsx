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
 * App-wide footer crediting Netix Solutions, LLC.
 *
 * A restrained, professional wordmark that links to netixsolutions.com —
 * deliberately understated so it sits below the playful SummerSharp UI
 * without competing with it. Also surfaces the legal pages.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto w-full px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2.5 text-center">
        <a
          href="https://netixsolutions.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Built by NetixSolutions — visit netixsolutions.com"
          className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-500 transition-colors hover:text-slate-800"
        >
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-slate-500">
            Built by
          </span>

          <span className="font-display text-sm font-semibold tracking-tight">
            Netix
            <span className="font-normal text-slate-400 transition-colors group-hover:text-slate-600">
              Solutions
            </span>
          </span>
        </a>

        <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.72rem] font-medium text-slate-500">
          <span className="text-slate-400">Need help?</span>
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className="transition-colors hover:text-slate-800">
            {SUPPORT_PHONE}
          </a>
          <span aria-hidden="true" className="text-slate-300">
            •
          </span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-slate-800">
            {SUPPORT_EMAIL}
          </a>
        </p>

        <nav className="flex items-center gap-3 text-[0.72rem] font-medium text-slate-500">
          <Link href="/privacy" className="transition-colors hover:text-slate-800">
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="text-slate-300">
            •
          </span>
          <Link href="/terms" className="transition-colors hover:text-slate-800">
            Terms of Use
          </Link>
        </nav>

        <p className="flex items-center gap-1.5 text-[0.66rem] font-medium uppercase tracking-[0.16em] text-slate-400">
          <UsFlag />
          Made in America
        </p>

        <p className="text-[0.7rem] text-slate-400">
          © {new Date().getFullYear()} Netix Solutions, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
