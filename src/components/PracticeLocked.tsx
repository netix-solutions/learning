import Link from "next/link";

/** Shown to a kid when their family's subscription isn't active (billing on). */
export function PracticeLocked() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <div className="text-6xl">🔒</div>
      <h1 className="mt-4 font-display text-2xl font-bold text-slate-800">
        Ask a grown-up to unlock SummerSharp
      </h1>
      <p className="mt-2 text-slate-500">
        A parent needs an active subscription so you can keep playing and
        learning. Your progress is saved!
      </p>
      <Link
        href="/home"
        className="btn-pop mt-6 bg-white px-6 py-3 ring-2 ring-slate-200"
      >
        ← Back home
      </Link>
    </main>
  );
}
