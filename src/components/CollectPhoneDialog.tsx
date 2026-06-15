"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveParentPhone, type PhoneState } from "@/app/actions/auth";

const initial: PhoneState = { error: null, saved: false };

/**
 * One-time prompt shown to a signed-in parent who has no cell number on file
 * (i.e. signed up before we asked). Saves to their auth metadata so support can
 * find them by the number they call from. Dismissible ("Not now") — it simply
 * reappears next visit until a number is provided.
 */
export function CollectPhoneDialog() {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveParentPhone, initial);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (state.saved) {
      setOpen(false);
      router.refresh();
    }
  }, [state.saved, router]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-fun w-full max-w-sm p-7 animate-pop">
        <div className="text-center text-5xl">📱</div>
        <h2 className="mt-3 text-center font-display text-2xl font-bold text-slate-800">
          Add your cell number
        </h2>
        <p className="mt-2 text-center text-slate-500">
          So we can reach you about your account — and help you fast if you ever
          call support.
        </p>

        <form action={action} className="mt-5 space-y-3">
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="(813) 555-1234"
            required
            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-lg outline-none focus:border-[var(--brand-blue)]"
          />

          {state.error && (
            <p className="rounded-xl bg-red-50 px-4 py-2 font-semibold text-red-600">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="btn-pop w-full px-6 py-3 font-bold text-white"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))",
            }}
          >
            {pending ? "Saving…" : "Save number"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full text-sm font-semibold text-slate-400 transition-colors hover:text-slate-600"
          >
            Not now
          </button>
        </form>
      </div>
    </div>
  );
}
