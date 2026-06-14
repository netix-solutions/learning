import Link from "next/link";

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
          aria-label="Built by Netix Solutions — visit netixsolutions.com"
          className="group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-500 transition-colors hover:text-slate-800"
        >
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-slate-400 transition-colors group-hover:text-slate-500">
            Built by
          </span>

          {/* Monogram mark */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-900"
          >
            <path
              d="M5 18V6l14 12V6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span className="font-display text-sm font-semibold tracking-tight">
            Netix
            <span className="font-normal text-slate-400 transition-colors group-hover:text-slate-600">
              {" "}
              Solutions
            </span>
          </span>
        </a>

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

        <p className="text-[0.7rem] text-slate-400">
          © {new Date().getFullYear()} Netix Solutions, LLC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
