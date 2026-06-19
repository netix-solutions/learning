"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSetBilling } from "@/app/actions/admin";

/**
 * Operator master switch for billing. OFF = the app is free for everyone and
 * the UI shows "free for a limited time"; ON = sales pricing + paywall.
 */
export function BillingToggle({ enabled }: { enabled: boolean }) {
  const [on, setOn] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function toggle() {
    const next = !on;
    setError(null);
    setOn(next); // optimistic
    start(async () => {
      const res = await adminSetBilling(next);
      if (res.error) {
        setOn(!next); // revert
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-lg font-bold text-slate-800">
            Billing {on ? "ON" : "OFF"}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-bold ${
                on
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {on ? "Charging" : "Free for everyone"}
            </span>
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {on
              ? "Sales pricing is shown and new families must start a paid trial."
              : 'The whole app is free and the site reads "free for a limited time."'}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Toggle billing"
          disabled={pending}
          onClick={toggle}
          className={`relative h-9 w-16 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
            on ? "bg-emerald-500" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${
              on ? "left-8" : "left-1"
            }`}
          />
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm font-semibold text-red-500">{error}</p>
      )}
    </div>
  );
}
