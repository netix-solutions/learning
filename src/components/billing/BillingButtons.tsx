"use client";

import { useState, useTransition } from "react";
import { startCheckout, openBillingPortal } from "@/app/actions/billing";
import { gaEvent } from "@/lib/gtag";

/** Subscribe / Manage buttons that drive the Stripe Checkout & Portal flows. */
export function BillingButtons({
  mode,
  label,
}: {
  mode: "subscribe" | "manage";
  label?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = mode === "subscribe" ? startCheckout : openBillingPortal;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        disabled={pending}
        onClick={() => {
          setError(null);
          if (mode === "subscribe") gaEvent("begin_checkout");
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
          : label
            ? label
            : mode === "subscribe"
              ? "Start subscription →"
              : "Manage plan"}
      </button>
      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
}
