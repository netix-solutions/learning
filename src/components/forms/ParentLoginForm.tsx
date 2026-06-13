"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInParent, type FormState } from "@/app/actions/auth";

const initial: FormState = { error: null };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function ParentLoginForm() {
  const [state, action, pending] = useActionState(signInParent, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block font-bold text-slate-600">Email</label>
        <input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
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
        {pending ? "Logging in…" : "Log in"}
      </button>

      <p className="text-center text-slate-600">
        New here?{" "}
        <Link href="/signup" className="font-bold text-[var(--brand-blue)] underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
