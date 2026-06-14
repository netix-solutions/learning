"use client";

import { useActionState, useState } from "react";
import { adminCreateCoupon, type CouponFormState } from "@/app/actions/admin";

const initial: CouponFormState = { error: null };
const inputClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 outline-none focus:border-[var(--brand-blue)]";

/** Operator form to mint a new coupon. Fields adapt to the chosen kind. */
export function AdminCouponForm() {
  const [state, action, pending] = useActionState(adminCreateCoupon, initial);
  const [kind, setKind] = useState<"free" | "trial_days">("free");

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-600">Code</span>
        <input name="code" placeholder="e.g. jacob" className={inputClass} required />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-600">Type</span>
        <select
          name="kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as "free" | "trial_days")}
          className={inputClass}
        >
          <option value="free">Free (comp up to N kids)</option>
          <option value="trial_days">Extended trial (N days)</option>
        </select>
      </label>

      {kind === "free" ? (
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-600">
            Max kids (blank = unlimited)
          </span>
          <input name="max_kids" type="number" min={1} placeholder="4" className={inputClass} />
        </label>
      ) : (
        <label className="block">
          <span className="mb-1 block text-sm font-bold text-slate-600">
            Total trial days
          </span>
          <input name="trial_days" type="number" min={1} placeholder="30" className={inputClass} required />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-600">
          Max redemptions (blank = unlimited)
        </span>
        <input name="max_redemptions" type="number" min={1} placeholder="100" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-600">Description</span>
        <input name="description" placeholder="Friends & family" className={inputClass} />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-bold text-slate-600">
          Expires (blank = never)
        </span>
        <input name="expires_at" type="date" className={inputClass} />
      </label>

      <div className="sm:col-span-2">
        {state.error && (
          <p className="mb-2 text-sm font-semibold text-red-500">{state.error}</p>
        )}
        {state.ok && (
          <p className="mb-2 text-sm font-semibold text-emerald-600">Coupon created.</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="btn-pop bg-[var(--brand-blue)] px-5 py-2.5 font-bold text-white disabled:opacity-50"
        >
          {pending ? "Creating…" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}
