"use client";

import Link from "next/link";
import { useState } from "react";

// Tries the user's PNG first, then the built-in SVG emblem, then a wordmark.
const SOURCES = ["/logo.png", "/logo.svg"];

/** SummerSharp wordmark — orange "Summer" + blue "Sharp". */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span style={{ color: "var(--brand-orange)" }}>Summer</span>
      <span style={{ color: "var(--brand-blue)" }}>Sharp</span>
    </span>
  );
}

function LogoMark({ className }: { className: string }) {
  const [idx, setIdx] = useState(0);
  const src = idx < SOURCES.length ? SOURCES[idx] : null;
  if (!src) return <span className={className}>☀️</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="SummerSharp"
      className={`${className} object-contain`}
      onError={() => setIdx((i) => i + 1)}
    />
  );
}

/**
 * Brand logo. Renders the logo image (PNG → SVG fallback) beside the wordmark,
 * so the header is always branded.
 */
export function BrandLogo({
  variant = "compact",
  href = "/",
}: {
  variant?: "compact" | "full";
  href?: string | null;
}) {
  if (variant === "full") {
    return (
      <div className="flex flex-col items-center gap-3">
        <LogoMark className="h-44 w-44 animate-float drop-shadow-xl sm:h-52 sm:w-52" />
        <Wordmark className="text-4xl sm:text-5xl" />
      </div>
    );
  }

  const inner = (
    <span className="flex items-center gap-2">
      <LogoMark className="h-10 w-10" />
      <Wordmark className="text-2xl" />
    </span>
  );

  return href ? (
    <Link href={href} className="inline-flex">
      {inner}
    </Link>
  ) : (
    inner
  );
}
