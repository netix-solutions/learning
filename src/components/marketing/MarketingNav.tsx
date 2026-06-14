import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/** Sticky, translucent top nav for the public marketing pages. */
export function MarketingNav() {
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <BrandLogo href="/" />

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/about"
            className="hidden rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900 sm:block"
          >
            About
          </Link>
          <Link
            href="/pricing"
            className="hidden rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900 sm:block"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="btn-pop px-4 py-2 text-sm font-extrabold text-white"
            style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
          >
            Start free
          </Link>
        </div>
      </div>
    </nav>
  );
}
