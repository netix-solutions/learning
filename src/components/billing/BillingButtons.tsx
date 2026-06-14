"use client";

import { useState, useTransition } from "react";
import { startCheckout, openBillingPortal } from "@/app/actions/billing";

/** Subscribe / Manage buttons that drive the Stripe Checkout & Portal flows. */
export function BillingButtons({ mode }: { mode: "subscribe" | "manage" }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = mode === "subscribe" ? startCheckout : openBillingPortal;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await run();
            if (res?.error) setError(res.error);
          });
        }}
        className="btn-pop px-6 py-3 text-lg font-bold text-white"
        style={{
          background:
            mode === "subscribe"
              ? "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))"
              : "var(--brand-blue)",
        }}
      >
        {pending
          ? "One sec…"
          : mode === "subscribe"
            ? "Start subscription →"
            : "Manage plan"}
      </button>
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
}
