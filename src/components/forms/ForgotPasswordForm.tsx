"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset, type ResetRequestState } from "@/app/actions/auth";

const initial: ResetRequestState = { error: null, sent: false };
const inputClass =
  "w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]";

export function ForgotPasswordForm({ linkExpired }: { linkExpired?: boolean }) {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);

  if (state.sent) {
    return (
      <div className="text-center">
        <div className="text-5xl">📬</div>
        <p className="mt-3 font-semibold text-slate-700">
          If that email has an account, a reset link is on its way. Check your
          inbox (and spam) and follow the link to choose a new password.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block font-bold text-[var(--brand-blue)] underline"
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <p className="text-slate-600">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {linkExpired && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 font-semibold text-amber-700">
          That reset link expired or was already used. Request a fresh one below.
        </p>
      )}

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
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <p className="text-center text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="font-bold text-[var(--brand-blue)] underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
