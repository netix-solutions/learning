import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_TEL,
  SUPPORT_EMAIL,
  SUPPORT_URL,
} from "@/lib/contact";

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

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-400">
      {children}
    </p>
  );
}

/**
 * App-wide footer.
 *
 * A frosted card that reads as a deliberate panel over the meadow scene:
 * a branded column (logo + tagline) anchors the left, with Support and
 * Company link columns balancing the right, then a slim credit bar.
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto w-full px-4 pb-6 pt-10">
      <div className="mx-auto max-w-5xl rounded-[1.75rem] border border-white/80 bg-white/85 px-7 py-9 shadow-[0_12px_44px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:px-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <BrandLogo href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Stay sharp all summer — playful K–5 practice in math, reading
              &amp; science.
            </p>
          </div>

          {/* Link columns */}
          <div className="flex gap-12 sm:gap-20">
            <div>
              <ColHeading>
                <span className="inline-flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Support
                </span>
              </ColHeading>
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="block font-display text-lg font-extrabold tracking-tight text-[var(--brand-blue)] transition-opacity hover:opacity-80"
              >
                {SUPPORT_PHONE}
              </a>
              <p className="mt-0.5 text-xs font-bold text-emerald-600">
                Available 24/7
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-2 block text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                {SUPPORT_EMAIL}
              </a>
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Help center
              </a>
            </div>

            <div className="flex flex-col items-start gap-2.5">
              <ColHeading>Company</ColHeading>
              <FooterLink href="/about">About</FooterLink>
              <FooterLink href="/pricing">Pricing</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms of Use</FooterLink>
            </div>
          </div>
        </div>

        {/* Credit bar */}
        <div className="mt-9 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-5 text-[0.72rem] text-slate-400 sm:flex-row">
          <p>
            © {new Date().getFullYear()}{" "}
            <a
              href="https://netixsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-500 transition-colors hover:text-slate-900"
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
