"use client";

import { useActionState } from "react";
import { signInChild, type FormState } from "@/app/actions/auth";

const initial: FormState = { error: null };

export function KidLoginForm() {
  const [state, action, pending] = useActionState(signInChild, initial);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="mb-1 block text-center font-bold text-slate-600">
          Your username
        </label>
        <input
          name="username"
          type="text"
          autoCapitalize="none"
          autoComplete="username"
          placeholder="sunnyfox"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-2xl outline-none focus:border-[var(--brand-blue)]"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-center font-bold text-slate-600">
          Secret PIN 🔒
        </label>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          placeholder="••••"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-center text-3xl tracking-[0.5em] outline-none focus:border-[var(--brand-blue)]"
          required
        />
      </div>

      {state.error && (
        <p className="rounded-xl bg-red-50 px-4 py-2 text-center font-semibold text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-pop w-full px-6 py-4 text-2xl text-white"
        style={{ background: "var(--brand-orange)" }}
      >
        {pending ? "Let’s go…" : "Let’s go! 🚀"}
      </button>
    </form>
  );
}
