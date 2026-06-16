"use client";

import { useState } from "react";
import { createKidLoginToken } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";

type Kid = { id: string; display_name: string; avatar: string };

/**
 * Parent-side, desktop-only: a "Play on a phone" button that shows a QR code
 * which logs one of the parent's kids into the app on a phone. One kid → QR
 * straight away; multiple kids → pick first. The QR encodes a single-use login
 * link minted server-side (see createKidLoginToken); scanning it opens the
 * child's account on the phone without touching the parent's session here.
 */
export function KidPhoneHandoff({ kids }: { kids: Kid[] }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ dataUrl: string; name: string } | null>(null);

  if (kids.length === 0) return null;

  function reset() {
    setQr(null);
    setError(null);
    setLoading(false);
  }

  async function generate(id: string) {
    setLoading(true);
    setError(null);
    setQr(null);
    const res = await createKidLoginToken(id);
    setLoading(false);
    if ("error" in res) setError(res.error);
    else setQr(res);
  }

  function openModal() {
    reset();
    setOpen(true);
    if (kids.length === 1) generate(kids[0].id);
  }

  function close() {
    setOpen(false);
    reset();
  }

  return (
    <>
      <button
        onClick={openModal}
        className="btn-pop hidden items-center gap-1.5 bg-white px-4 py-2 text-sm font-semibold text-slate-600 ring-2 ring-slate-200 hover:text-slate-900 sm:inline-flex"
      >
        📱 Play on a phone
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="card-fun w-full max-w-sm p-7 text-center animate-pop">
            <button
              onClick={close}
              aria-label="Close"
              className="float-right -mt-3 -mr-1 text-3xl leading-none text-slate-300 hover:text-slate-500"
            >
              ×
            </button>

            {/* Pick a kid (only when there's more than one and nothing chosen yet) */}
            {!qr && !loading && !error && kids.length > 1 && (
              <>
                <div className="text-5xl">📱</div>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-800">
                  Play on a phone
                </h2>
                <p className="mt-1 text-slate-500">Who&apos;s going to play?</p>
                <div className="mt-4 flex flex-col gap-2">
                  {kids.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => generate(k.id)}
                      className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white p-2 text-left transition-colors hover:border-[var(--brand-blue)]"
                    >
                      <span className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-amber-100">
                        <Avatar id={k.avatar} className="h-full w-full" />
                      </span>
                      <span className="font-bold text-slate-800">{k.display_name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {loading && (
              <>
                <div className="animate-bob text-5xl">📱</div>
                <p className="mt-3 font-semibold text-slate-500">Making a magic code…</p>
              </>
            )}

            {error && (
              <>
                <div className="text-5xl">😕</div>
                <p className="mt-3 font-semibold text-red-500">{error}</p>
                <button
                  onClick={() => (kids.length === 1 ? generate(kids[0].id) : reset())}
                  className="btn-pop mt-4 bg-[var(--brand-blue)] px-5 py-2 font-bold text-white"
                >
                  Try again
                </button>
              </>
            )}

            {qr && (
              <>
                <h2 className="font-display text-2xl font-bold text-slate-800">
                  Scan to play as {qr.name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Open the camera on {qr.name}&apos;s phone and point it at this code.
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qr.dataUrl}
                  alt={`QR code to log in ${qr.name}`}
                  width={256}
                  height={256}
                  className="mx-auto mt-4 rounded-2xl ring-1 ring-slate-100"
                />
                <p className="mt-3 text-xs text-slate-400">
                  One-time code — it works for a little while, then just make a new one.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {kids.length > 1 && (
                    <button
                      onClick={reset}
                      className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                    >
                      ← Another kid
                    </button>
                  )}
                  <button
                    onClick={close}
                    className="btn-pop bg-[var(--brand-orange)] px-5 py-2 text-sm font-bold text-white"
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
