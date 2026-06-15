import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_TEL,
  SUPPORT_EMAIL,
  SUPPORT_URL,
} from "@/lib/contact";

/**
 * Friendly "call us anytime" callout where the phone number is the hero.
 *
 * Designed to feel warm and reassuring — a pulsing green "we're here" dot plus
 * 24/7 wording so families trust they can always reach a human. Reads from
 * `@/lib/contact` so the number stays consistent everywhere.
 *
 * - `loud` — a tappable gradient pill for high-stakes moments (paywall, billing).
 * - `soft` — a lighter inline treatment for calmer spots (footer).
 */
export function SupportCallout({
  variant = "loud",
  showEmail = false,
  className = "",
}: {
  variant?: "loud" | "soft";
  showEmail?: boolean;
  className?: string;
}) {
  if (variant === "soft") {
    return (
      <span className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${className}`}>
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="group inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 font-display text-sm font-bold text-[var(--brand-blue)] transition-colors hover:bg-sky-100"
        >
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="animate-bob text-base" aria-hidden="true">📞</span>
          {SUPPORT_PHONE}
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[0.55rem] font-extrabold uppercase tracking-wide text-emerald-700">
            24/7
          </span>
        </a>
        {showEmail && (
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-[0.72rem] font-medium text-slate-500 transition-colors hover:text-slate-800"
          >
            {SUPPORT_EMAIL}
          </a>
        )}
      </span>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <a
        href={`tel:${SUPPORT_PHONE_TEL}`}
        aria-label={`Call SummerSharp support 24/7 at ${SUPPORT_PHONE}`}
        className="btn-pop group inline-flex items-center gap-3 px-5 py-3 text-white"
        style={{
          background: "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))",
        }}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20">
          <span className="animate-wiggle text-xl" aria-hidden="true">📞</span>
        </span>
        <span className="text-left leading-tight">
          <span className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-white/85">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-80" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
            </span>
            24/7 Support · Call anytime
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            {SUPPORT_PHONE}
          </span>
        </span>
      </a>
      {showEmail && (
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-700"
        >
          or email {SUPPORT_EMAIL}
        </a>
      )}
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs font-semibold text-[var(--brand-blue)] transition-opacity hover:opacity-80"
      >
        Visit our help center →
      </a>
    </div>
  );
}
