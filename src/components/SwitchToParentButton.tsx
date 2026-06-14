"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { switchToParent, type FormState } from "@/app/actions/auth";

const initial: FormState = { error: null };

/**
 * Kid-side control to hand the device back to a grown-up. Shown discreetly so
 * kids don't wander into it; tapping reveals a small password prompt. The parent
 * types their own password and the server swaps back to the parent account.
 */
export function SwitchToParentButton() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(switchToParent, initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-pop bg-white px-4 py-2 text-sm text-slate-600 ring-2 ring-slate-200 hover:text-slate-900"
      >
        👋 Grown-up
      </button>
    );
  }

  return (
    <>
      {/* Dim the screen behind the prompt so kids see it's a "grown-up" gate. */}
      <div
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-0 z-50 grid place-items-center px-4">
        <div className="card-fun w-full max-w-sm p-6 text-center animate-pop">
          <div className="text-4xl">🔒</div>
          <h2 className="mt-2 font-display text-2xl font-bold text-slate-800">
            Grown-ups only
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your parent password to switch to your account.
          </p>

          <form action={action} className="mt-4 space-y-3">
            <input
              ref={inputRef}
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Parent password"
              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]"
              required
            />

            {state.error && (
              <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                {state.error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-pop flex-1 bg-white px-4 py-3 text-slate-600 ring-2 ring-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="btn-pop flex-1 px-4 py-3 font-bold text-white"
                style={{ background: "var(--brand-blue)" }}
              >
                {pending ? "Checking…" : "Switch →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
