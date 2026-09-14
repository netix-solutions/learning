"use client";

import Link from "next/link";
import { useState } from "react";

// Tries the brand PNG first, then older PNG / built-in SVG emblem, then a wordmark.
const SOURCES = ["/images/ui/logo.webp", "/logo.png", "/logo.svg"];

/** SunSharp wordmark — orange "Sun" + blue "Sharp". Never wraps. */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`brand-wordmark whitespace-nowrap tracking-tight ${className}`}>
      <span style={{ color: "var(--brand-orange)" }}>Sun</span>
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
      alt="SunSharp"
      className={`${className} object-contain rounded-[22%]`}
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
        <LogoMark className="h-24 w-24 sm:h-28 sm:w-28" />
        <Wordmark className="text-4xl sm:text-5xl" />
      </div>
    );
  }

  const inner = (
    // Slightly smaller on phones so the header never crowds action buttons.
    <span className="flex items-center gap-1.5 sm:gap-2">
      <LogoMark className="h-9 w-9 sm:h-10 sm:w-10" />
      <Wordmark className="text-xl sm:text-2xl" />
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
