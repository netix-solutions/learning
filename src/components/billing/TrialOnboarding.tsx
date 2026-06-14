"use client";

import { useState, useTransition } from "react";
import { startCheckout } from "@/app/actions/billing";
import { RedeemCoupon } from "@/components/billing/RedeemCoupon";
import {
  priceForKids,
  formatCents,
  BASE_PRICE_CENTS,
  EXTRA_PRICE_CENTS,
  TRIAL_DAYS,
  MAX_KIDS,
} from "@/lib/billing";

/**
 * First-run onboarding gate. The parent picks HOW MANY kids (the seat count),
 * then we send them to Stripe Checkout to start the free trial with a card on
 * file. They create the actual kid logins afterwards, once the trial is active.
 */
export function TrialOnboarding() {
  const [kids, setKids] = useState(1);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dec = () => setKids((k) => Math.max(1, k - 1));
  const inc = () => setKids((k) => Math.min(MAX_KIDS, k + 1));

  return (
    <section className="card-fun mx-auto mt-8 max-w-md p-7 text-center ring-2 ring-[var(--brand-orange)]">
      <div className="text-5xl">🎈</div>
      <h2 className="mt-2 font-display text-2xl font-bold text-slate-800">
        Start your {TRIAL_DAYS}-day free trial
      </h2>
      <p className="mx-auto mt-1 max-w-xs text-slate-500">
        How many kids are you signing up? You can always change this later.
      </p>

      {/* Seat stepper */}
      <div className="mt-6 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={dec}
          disabled={kids <= 1}
          aria-label="Fewer kids"
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl font-bold text-slate-600 ring-2 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-30"
        >
          −
        </button>
        <div className="min-w-16">
          <div className="font-display text-5xl font-extrabold text-slate-800">
            {kids}
          </div>
          <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
            {kids === 1 ? "kid" : "kids"}
          </div>
        </div>
        <button
          type="button"
          onClick={inc}
          disabled={kids >= MAX_KIDS}
          aria-label="More kids"
          className="grid h-12 w-12 place-items-center rounded-2xl text-2xl font-bold text-slate-600 ring-2 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-30"
        >
          +
        </button>
      </div>

      {/* Price preview */}
      <div className="mx-auto mt-6 max-w-xs rounded-2xl bg-slate-50 p-4">
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display text-4xl font-extrabold text-slate-800">
            {formatCents(priceForKids(kids))}
          </span>
          <span className="text-slate-500">/mo after trial</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          {formatCents(BASE_PRICE_CENTS)} first kid +{" "}
          {formatCents(EXTRA_PRICE_CENTS)} each extra
        </p>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await startCheckout(kids);
            if (res?.error) setError(res.error);
          });
        }}
        className="btn-pop mt-6 w-full px-6 py-4 text-lg font-extrabold text-white"
        style={{
          background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
        }}
      >
        {pending ? "One sec…" : `Start ${TRIAL_DAYS}-day free trial →`}
      </button>
      {error && (
        <p className="mt-2 text-sm font-semibold text-red-500">{error}</p>
      )}
      <p className="mt-2 text-xs text-slate-400">
        Card required · no charge today · cancel anytime
      </p>

      {/* Coupon: a free code skips checkout entirely; an extended-trial code
          lengthens the trial you start above. */}
      <div className="mt-6 border-t border-slate-100 pt-5 text-left">
        <p className="mb-2 text-center text-sm font-semibold text-slate-500">
          Have a code?
        </p>
        <RedeemCoupon compact />
      </div>
    </section>
  );
}
