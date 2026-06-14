"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { redeemCoupon } from "@/app/actions/billing";

/**
 * A small "have a code?" redeemer. A `free` code comps the account immediately
 * (we refresh so the gate/labels update); a `trial_days` code extends the trial
 * that applies at checkout, so we tell them to continue to checkout.
 */
export function RedeemCoupon({ compact = false }: { compact?: boolean }) {
  const [code, setCode] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  function submit() {
    const c = code.trim();
    if (!c) return;
    setError(null);
    setSuccess(null);
    start(async () => {
      const res = await redeemCoupon(c);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (res.kind === "free") {
        const cap = res.maxKids
          ? ` Your plan is free for up to ${res.maxKids} ${res.maxKids === 1 ? "kid" : "kids"}.`
          : " Your plan is free.";
        setSuccess(`Code applied! 🎉${cap}`);
      } else {
        setSuccess(
          `Code applied! Your free trial is now ${res.trialDays} days — continue to checkout to start it.`,
        );
      }
      setCode("");
      router.refresh();
    });
  }

  return (
    <div className={compact ? "" : "card-fun p-5"}>
      {!compact && (
        <h3 className="mb-2 font-display text-lg font-bold text-slate-800">
          Have a code?
        </h3>
      )}
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Enter code"
          autoCapitalize="off"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 outline-none focus:border-[var(--brand-blue)]"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending || !code.trim()}
          className="btn-pop bg-[var(--brand-blue)] px-5 py-2.5 font-bold text-white disabled:opacity-50"
        >
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>}
      {success && (
        <p className="mt-2 text-sm font-semibold text-emerald-600">{success}</p>
      )}
    </div>
  );
}
