"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * A blocking overlay shown when the family's subscription isn't active (trial
 * ended, no active plan). It covers the page so content can't be used until the
 * parent subscribes.
 *
 * The paid boundary that actually matters — kids' practice — is enforced
 * server-side (see the practice route + getStudentEntitlement); this overlay is
 * the friendly, app-wide nudge that funnels parents to checkout.
 *
 * Only rendered by the /home and /parent layouts when entitlement is locked, so
 * `show` is implicit. The parent variant self-suppresses on /parent/billing so
 * the page they need in order to subscribe always stays reachable.
 */
export function Paywall({ role }: { role: "parent" | "student" }) {
  const pathname = usePathname();
  if (role === "parent" && pathname?.startsWith("/parent/billing")) return null;

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="card-fun w-full max-w-sm p-7 text-center animate-pop">
        {role === "parent" ? (
          <>
            <div className="text-6xl">🔓</div>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-800">
              Your free trial has ended
            </h2>
            <p className="mt-2 text-slate-500">
              Subscribe to keep your learners going all summer — from{" "}
              <strong>$4/mo</strong>. Their progress is saved and waiting!
            </p>
            <Link
              href="/parent/billing"
              className="btn-pop mt-6 inline-flex w-full justify-center px-6 py-3 font-bold text-white"
              style={{
                background:
                  "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))",
              }}
            >
              See plans &amp; subscribe →
            </Link>
          </>
        ) : (
          <>
            <div className="text-6xl">⭐</div>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-800">
              Time to ask a grown-up!
            </h2>
            <p className="mt-2 text-slate-500">
              Your learning is paused. A parent can unlock it again from their
              account. Don&apos;t worry — all your points are saved! 🎉
            </p>
          </>
        )}
      </div>
    </div>
  );
}
