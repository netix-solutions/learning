"use client";

import { useState, useTransition } from "react";
import {
  adminCancelSubscription,
  adminResumeSubscription,
  adminOpenParentPortal,
} from "@/app/actions/admin";

/**
 * Operator controls on a parent's billing detail page: manage the card/plan via
 * the Stripe portal (on the parent's behalf), and cancel/resume the plan.
 * `cancelScheduled` reflects whether it's already set to end at period close.
 */
export function AdminBillingActions({
  parentId,
  parentName,
  cancelScheduled,
}: {
  parentId: string;
  parentName: string;
  cancelScheduled: boolean;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function runPortal() {
    setError(null);
    start(async () => {
      const res = await adminOpenParentPortal(parentId);
      if (res?.error) setError(res.error);
    });
  }

  function runCancel() {
    if (
      !confirm(
        `Cancel ${parentName}'s subscription on their behalf? They keep access until the period ends, then it won't renew.`,
      )
    )
      return;
    setError(null);
    start(async () => {
      const res = await adminCancelSubscription(parentId);
      if (res.error) setError(res.error);
    });
  }

  function runResume() {
    setError(null);
    start(async () => {
      const res = await adminResumeSubscription(parentId);
      if (res.error) setError(res.error);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        disabled={pending}
        onClick={runPortal}
        className="btn-pop bg-[var(--brand-blue)] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
      >
        {pending ? "One sec…" : "Manage in Stripe portal"}
      </button>

      {cancelScheduled ? (
        <button
          disabled={pending}
          onClick={runResume}
          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 disabled:opacity-60"
        >
          {pending ? "One sec…" : "Resume subscription"}
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={runCancel}
          className="text-sm font-semibold text-slate-400 hover:text-red-500 disabled:opacity-60"
        >
          {pending ? "One sec…" : "Cancel subscription"}
        </button>
      )}

      {error && <p className="w-full text-sm font-semibold text-red-500">{error}</p>}
    </div>
  );
}
