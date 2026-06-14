"use client";

import { useActionState } from "react";
import { adminSignIn, type AdminFormState } from "@/app/actions/admin";

const initial: AdminFormState = { error: null };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminSignIn, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block font-bold text-slate-600">Email</label>
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="email@netixsolutions.com"
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className="mb-1 block font-bold text-slate-600">Password</label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className={inputClass}
          required
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
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
