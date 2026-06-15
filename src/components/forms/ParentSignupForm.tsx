"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpParent, type FormState } from "@/app/actions/auth";

const initial: FormState = { error: null };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function ParentSignupForm() {
  const [state, action, pending] = useActionState(signUpParent, initial);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-1 block font-bold text-slate-600">Your name</label>
        <input
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Alex Parent"
          className={inputClass}
          required
        />
      </div>
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
        <label className="mb-1 block font-bold text-slate-600">Cell phone</label>
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="(813) 555-1234"
          className={inputClass}
          required
        />
        <p className="mt-1 text-sm text-slate-400">
          So we can reach you about your account and help fast if you call support.
        </p>
      </div>
      <div>
        <label className="mb-1 block font-bold text-slate-600">Password</label>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
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
        style={{ background: "var(--brand-orange)" }}
      >
        {pending ? "Creating…" : "Create my family account"}
      </button>

      <p className="text-center text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-[var(--brand-blue)] underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
