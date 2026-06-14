"use client";

import { useState } from "react";
import Link from "next/link";
import {
  priceForKids,
  formatCents,
  BASE_PRICE_CENTS,
  EXTRA_PRICE_CENTS,
  TRIAL_DAYS,
} from "@/lib/billing";
import { Avatar } from "@/components/Avatar";

const KID_FACES = ["fox", "panda", "koala", "lion", "tiger", "frog"];

/**
 * Interactive price sheet: pick how many kids and watch the monthly price build
 * up — $4 for the first, +$2 each after. The number animates on every change.
 */
export function PriceCalculator({ max = 6 }: { max?: number }) {
  const [kids, setKids] = useState(1);
  const price = priceForKids(kids);

  return (
    <div className="card-fun overflow-hidden p-6 sm:p-8">
      <p className="text-center text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
        How many kids?
      </p>

      {/* Kid picker */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: max }).map((_, i) => {
          const n = i + 1;
          const active = n <= kids;
          return (
            <button
              key={n}
              onClick={() => setKids(n)}
              aria-label={`${n} ${n === 1 ? "kid" : "kids"}`}
              aria-pressed={n === kids}
              className={`h-12 w-12 overflow-hidden rounded-2xl p-0.5 transition-all duration-200 ${
                active
                  ? "scale-110 shadow-md ring-2 ring-[var(--brand-orange)]"
                  : "opacity-40 grayscale hover:opacity-70"
              }`}
            >
              <Avatar id={KID_FACES[i % KID_FACES.length]} className="h-full w-full" />
            </button>
          );
        })}
      </div>

      {/* Price display */}
      <div className="mt-6 text-center">
        <div className="flex items-baseline justify-center gap-1">
          <span
            key={price}
            className="animate-pop font-display text-6xl font-extrabold text-slate-800"
          >
            {formatCents(price)}
          </span>
          <span className="text-xl font-bold text-slate-400">/mo</span>
        </div>
        <p className="mt-2 text-slate-500">
          for {kids} {kids === 1 ? "kid" : "kids"} ·{" "}
          <span className="font-semibold text-slate-600">
            {formatCents(BASE_PRICE_CENTS)} first
            {kids > 1
              ? ` + ${formatCents(EXTRA_PRICE_CENTS)} × ${kids - 1} more`
              : ""}
          </span>
        </p>
      </div>

      {/* Visual cost breakdown bars */}
      <div className="mx-auto mt-5 max-w-xs space-y-1.5">
        {Array.from({ length: kids }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <Avatar id={KID_FACES[i % KID_FACES.length]} className="h-6 w-6 shrink-0" />
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: i === 0 ? "100%" : "40%",
                  background:
                    i === 0
                      ? "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))"
                      : "var(--brand-wave)",
                }}
              />
            </div>
            <span className="w-12 text-right font-semibold text-slate-500">
              {formatCents(i === 0 ? BASE_PRICE_CENTS : EXTRA_PRICE_CENTS)}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/signup"
        className="btn-pop mt-7 flex w-full items-center justify-center gap-2 px-6 py-4 text-lg font-extrabold text-white"
        style={{ background: "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))" }}
      >
        Start your {TRIAL_DAYS}-day free trial →
      </Link>
      <p className="mt-2 text-center text-xs text-slate-400">
        No charge today · cancel anytime
      </p>
    </div>
  );
}
