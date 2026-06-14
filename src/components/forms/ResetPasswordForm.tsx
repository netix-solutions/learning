"use client";

import { useActionState } from "react";
import { confirmPasswordReset, type FormState } from "@/app/actions/auth";

const initial: FormState = { error: null };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(confirmPasswordReset, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block font-bold text-slate-600">New password</label>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          className={inputClass}
          required
          minLength={8}
        />
      </div>
      <div>
        <label className="mb-1 block font-bold text-slate-600">
          Confirm new password
        </label>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Type it again"
          className={inputClass}
          required
          minLength={8}
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-pop w-full px-6 py-3 text-lg text-white"
        style={{ background: "var(--brand-blue)" }}
      >
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
