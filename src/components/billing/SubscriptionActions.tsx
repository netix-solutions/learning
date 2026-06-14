"use client";

import { useState, useTransition } from "react";
import {
  openBillingPortal,
  cancelSubscription,
  resumeSubscription,
} from "@/app/actions/billing";

/**
 * The self-service controls on a parent's billing page: update the saved card
 * (via Stripe's hosted portal — card entry must stay on Stripe), and cancel or
 * resume the plan in place. `cancelScheduled` reflects whether the plan is
 * already set to end at the period close.
 */
export function SubscriptionActions({
  cancelScheduled,
  periodEndLabel,
}: {
  cancelScheduled: boolean;
  periodEndLabel: string | null;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runPortal() {
    setError(null);
    start(async () => {
      const res = await openBillingPortal();
      if (res?.error) setError(res.error);
    });
  }

  function runCancel() {
    const msg = periodEndLabel
      ? `Cancel your subscription? You'll keep full access until ${periodEndLabel}, then it won't renew.`
      : "Cancel your subscription? You'll keep access until the end of the current period, then it won't renew.";
    if (!confirm(msg)) return;
    setError(null);
    start(async () => {
      const res = await cancelSubscription();
      if (res?.error) setError(res.error);
    });
  }

  function runResume() {
    setError(null);
    start(async () => {
      const res = await resumeSubscription();
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        disabled={pending}
        onClick={runPortal}
        className="btn-pop w-full max-w-xs px-6 py-3 text-lg font-bold text-white disabled:opacity-60"
        style={{ background: "var(--brand-blue)" }}
      >
        {pending ? "One sec…" : "Update payment method"}
      </button>

      {cancelScheduled ? (
        <button
          disabled={pending}
          onClick={runResume}
          className="font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
        >
          {pending ? "One sec…" : "Resume subscription"}
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={runCancel}
          className="font-semibold text-slate-400 hover:text-red-500 disabled:opacity-60"
        >
          {pending ? "One sec…" : "Cancel subscription"}
        </button>
      )}

      {error && <p className="text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
}
