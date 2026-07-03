"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Admin "AI item studio": describe a character, and the Vercel AI Gateway
 * paints it, uploads it to storage, and lists it in the kids' shop.
 */
export function AdminShopStudio() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [price, setPrice] = useState(200);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; image_url: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch("/api/admin/shop-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, price }),
      });
      const data = (await res.json()) as {
        error?: string;
        item?: { name: string; image_url: string };
      };
      if (!res.ok || !data.item) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setPreview(data.item);
        setName("");
        setSubject("");
        router.refresh();
      }
    } catch {
      setError("Network error — try again.");
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-semibold text-slate-600">
          Item name (what kids see)
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={30}
            placeholder="Rainbow Sloth"
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-slate-600">
          Describe the character for the AI artist
          <textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            rows={2}
            maxLength={300}
            placeholder="a sleepy sloth hanging from a rainbow, wearing tiny star-shaped glasses"
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
          />
        </label>
        <label className="grid w-40 gap-1 text-sm font-semibold text-slate-600">
          Price (points)
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            min={0}
            step={50}
            required
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-800"
          />
        </label>
        <div>
          <button
            type="submit"
            disabled={busy}
            className="btn-pop px-5 py-2.5 font-bold text-white disabled:opacity-60"
            style={{ background: "var(--brand-blue)" }}
          >
            {busy ? "Painting… (~30s)" : "🎨 Generate & list item"}
          </button>
        </div>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
      </div>

      <div className="grid h-40 w-40 place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.image_url} alt={preview.name} className="h-full w-full object-cover" />
        ) : (
          <span className="px-3 text-center text-xs font-semibold text-slate-400">
            {busy ? "The AI is painting…" : "New art shows up here"}
          </span>
        )}
      </div>
    </form>
  );
}

/** Retire / relist buttons on each catalog row. */
export function ShopItemActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    await fetch("/api/admin/shop-item", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    router.refresh();
    setBusy(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 transition-colors ${
        active
          ? "bg-white text-slate-500 ring-slate-200 hover:text-red-600"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
      }`}
    >
      {busy ? "…" : active ? "Retire" : "Relist"}
    </button>
  );
}
