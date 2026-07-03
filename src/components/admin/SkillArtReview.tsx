"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Approve / reject / regenerate controls for one skill-art card. */
export function SkillArtActions({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(next: string) {
    setBusy(next);
    await fetch("/api/admin/skill-art", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    router.refresh();
    setBusy(null);
  }

  async function regenerate() {
    setBusy("regen");
    await fetch("/api/admin/skill-art", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.refresh();
    setBusy(null);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {status !== "approved" && (
        <button
          onClick={() => setStatus("approved")}
          disabled={!!busy}
          className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
        >
          {busy === "approved" ? "…" : "✓ Approve"}
        </button>
      )}
      {status !== "rejected" && (
        <button
          onClick={() => setStatus("rejected")}
          disabled={!!busy}
          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:text-red-600"
        >
          {busy === "rejected" ? "…" : "Hide"}
        </button>
      )}
      <button
        onClick={regenerate}
        disabled={!!busy}
        className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:text-[var(--brand-blue)]"
      >
        {busy === "regen" ? "Painting… ~30s" : "🎨 Repaint"}
      </button>
    </div>
  );
}

/** Bulk approve everything still pending. */
export function ApproveAllPending({ pending }: { pending: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (pending === 0) return null;

  async function approveAll() {
    setBusy(true);
    await fetch("/api/admin/skill-art", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approveAllPending: true }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={approveAll}
      disabled={busy}
      className="btn-pop px-4 py-2 text-sm font-bold text-white"
      style={{ background: "var(--brand-blue)" }}
    >
      {busy ? "Approving…" : `✓ Approve all ${pending} pending`}
    </button>
  );
}
