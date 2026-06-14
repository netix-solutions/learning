import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Shared chrome for the legal pages (Privacy Policy, Terms of Use).
 * Renders the brand header and a readable, document-style content column.
 */
export function LegalPage({
  title,
  effectiveDate,
  children,
}: {
  title: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <BrandLogo href="/" />
        <Link
          href="/"
          className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
        >
          ← Home
        </Link>
      </header>

      <article className="card-fun px-6 py-8 sm:px-10 sm:py-10">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Effective date: {effectiveDate}
        </p>

        <div className="legal-prose mt-6">{children}</div>
      </article>
    </main>
  );
}
