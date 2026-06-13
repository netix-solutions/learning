"use client";

import Link from "next/link";
import { useState } from "react";

/** SummerSharp wordmark — orange "Summer" + blue "Sharp". */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      <span style={{ color: "var(--brand-orange)" }}>Summer</span>
      <span style={{ color: "var(--brand-blue)" }}>Sharp</span>
    </span>
  );
}

/**
 * Brand logo. Uses /logo.png if present, otherwise falls back to a styled
 * wordmark so the app always renders.
 */
export function BrandLogo({
  variant = "compact",
  href = "/",
}: {
  variant?: "compact" | "full";
  href?: string | null;
}) {
  const [imgOk, setImgOk] = useState(true);

  if (variant === "full") {
    return (
      <div className="flex flex-col items-center gap-3">
        {imgOk ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/logo.png"
            alt="SummerSharp"
            width={240}
            height={240}
            className="h-44 w-44 object-contain drop-shadow-xl animate-float sm:h-52 sm:w-52"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="animate-float text-7xl">☀️📖</div>
        )}
        <Wordmark className="text-4xl sm:text-5xl" />
      </div>
    );
  }

  const inner = (
    <span className="flex items-center gap-2">
      {imgOk ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <span className="text-2xl">☀️</span>
      )}
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
