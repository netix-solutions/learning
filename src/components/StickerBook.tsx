"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Confetti } from "@/components/Confetti";
import { playCorrect, playClick, playWrong, playTally } from "@/lib/sound";

type Sticker = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  collection: string;
  rarity: string;
  price: number;
  available_until: string | null;
  owned: boolean;
};

type Book = {
  xp: number;
  balance: number;
  shields: number;
  shield_price: number;
  favorite: string | null;
  pack: { key: string; price: number; count: number };
  items: Sticker[];
};

type Awarded = { id: string; name: string; image_url: string; rarity: string };

// Album display metadata (the DB stores only the collection key).
const ALBUMS: { key: string; name: string; emoji: string }[] = [
  { key: "ocean", name: "Ocean Pals", emoji: "🌊" },
  { key: "animals", name: "Animal Friends", emoji: "🐾" },
  { key: "spacemagic", name: "Space & Magic", emoji: "🚀" },
  { key: "extras", name: "Extras", emoji: "✨" },
];

function rarityStyle(r: string) {
  switch (r) {
    case "shiny":
      return { label: "Shiny", ring: "ring-amber-300", chip: "bg-amber-100 text-amber-700", shine: true };
    case "epic":
      return { label: "Epic", ring: "ring-violet-300", chip: "bg-violet-100 text-violet-700", shine: false };
    case "rare":
      return { label: "Rare", ring: "ring-sky-300", chip: "bg-sky-100 text-sky-700", shine: false };
    default:
      return { label: "Common", ring: "ring-emerald-200", chip: "bg-emerald-100 text-emerald-700", shine: false };
  }
}

export function StickerBook() {
  const [book, setBook] = useState<Book | null>(null);
  const [favorite, setFavorite] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  // Pack-opening reveal: "shaking" the pack, then the stickers burst in.
  const [reveal, setReveal] = useState<Awarded[] | null>(null);
  const [opened, setOpened] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_sticker_book");
    if (data && !("error" in (data as object))) {
      const b = data as Book;
      setBook(b);
      setFavorite(b.favorite);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Cancel a pending "tap again" after a few seconds.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(null), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  // Drive the reveal: shake the pack for a beat, then burst it open.
  useEffect(() => {
    if (!reveal) return;
    setOpened(false);
    playTally();
    const t = setTimeout(() => {
      setOpened(true);
      playCorrect(reveal.some((a) => a.rarity === "shiny") ? 4 : 2);
      setConfettiKey((k) => k + 1);
    }, 1100);
    return () => clearTimeout(t);
  }, [reveal]);

  async function openPack() {
    if (busy || !book) return;
    if (confirming !== "pack") {
      playClick();
      setConfirming("pack");
      return;
    }
    setConfirming(null);
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("buy_sticker_pack");
    const r = data as { ok?: boolean; awarded?: Awarded[] } | null;
    if (r?.ok && r.awarded?.length) {
      setReveal(r.awarded);
      await load();
    } else {
      playWrong();
      await load();
    }
    setBusy(false);
  }

  async function buyOne(item: Sticker) {
    if (busy || !book) return;
    if (confirming !== item.id) {
      playClick();
      setConfirming(item.id);
      return;
    }
    setConfirming(null);
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("buy_shop_item", { p_item: item.id });
    if ((data as { ok?: boolean } | null)?.ok) {
      playCorrect(2);
      setConfettiKey((k) => k + 1);
      await load();
    } else {
      playWrong();
      await load();
    }
    setBusy(false);
  }

  async function makeBuddy(item: Sticker) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("equip_shop_item", { p_item: item.id });
    if ((data as { ok?: boolean } | null)?.ok) {
      playClick();
      setFavorite(item.image_url);
    }
    setBusy(false);
  }

  async function buyShield() {
    if (busy || !book) return;
    if (confirming !== "shield") {
      playClick();
      setConfirming("shield");
      return;
    }
    setConfirming(null);
    setBusy(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("buy_streak_shield");
    if ((data as { ok?: boolean } | null)?.ok) {
      playCorrect(1);
      await load();
    } else {
      playWrong();
      await load();
    }
    setBusy(false);
  }

  const balance = book?.balance ?? null;
  const total = book?.items.length ?? 0;
  const ownedCount = book?.items.filter((i) => i.owned).length ?? 0;
  const canOpen = (balance ?? 0) >= (book?.pack.price ?? 75);
  const albums = ALBUMS.filter((a) => book?.items.some((i) => i.collection === a.key));

  return (
    <>
      <Confetti fire={confettiKey} />

      {/* Title + wallet */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">
            My Sticker Book 📖
          </h1>
          <p className="font-semibold text-slate-500">
            {total > 0 ? `${ownedCount} of ${total} stickers collected` : "Let's start collecting!"}
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-full px-5 py-2.5 text-white shadow-sm"
          style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
        >
          <span className="text-xl">⭐</span>
          <span className="font-display text-2xl font-extrabold tabular-nums">
            {balance == null ? "…" : balance.toLocaleString()}
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">to spend</span>
        </div>
      </div>

      {/* THE fun: open a sticker pack */}
      <button
        onClick={canOpen ? openPack : undefined}
        disabled={busy || !canOpen}
        className={`btn-pop mt-5 flex w-full items-center gap-4 p-5 text-left text-white ${
          canOpen ? "" : "opacity-70"
        } ${confirming === "pack" ? "animate-cheer" : ""}`}
        style={{ background: "linear-gradient(120deg, #8b5cf6, #d946ef)", borderRadius: "2rem" }}
      >
        <span className="animate-float text-6xl">🎁</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl font-extrabold">
            {confirming === "pack" ? "Tap again to open!" : "Open a Sticker Pack!"}
          </span>
          <span className="block text-white/90">
            {book ? `⭐ ${book.pack.price} · ${book.pack.count} surprise stickers 👀` : "…"}
          </span>
        </span>
      </button>
      {!canOpen && (
        <Link
          href="/practice/daily"
          className="btn-pop mt-3 flex items-center justify-center gap-2 bg-white px-5 py-3 font-bold text-slate-600 ring-2 ring-slate-200"
        >
          Earn ⭐ {book?.pack.price} to open a pack — play a round! →
        </Link>
      )}

      {/* Albums */}
      {book == null ? (
        <p className="card-fun mt-6 p-8 text-center font-display text-lg text-slate-400">
          Opening your book…
        </p>
      ) : (
        albums.map((album) => {
          const stickers = book.items.filter((i) => i.collection === album.key);
          const have = stickers.filter((i) => i.owned).length;
          const pct = Math.round((have / stickers.length) * 100);
          const complete = have === stickers.length;
          return (
            <section key={album.key} className="mt-8">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-700">
                  {album.emoji} {album.name}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${complete ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                  {complete ? "★ Complete!" : `${have}/${stickers.length}`}
                </span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {stickers.map((s) => {
                  const rs = rarityStyle(s.rarity);
                  const isBuddy = favorite === s.image_url;
                  return (
                    <div
                      key={s.id}
                      className={`card-fun flex flex-col items-center p-2.5 text-center ${isBuddy ? "ring-4 ring-amber-300" : ""}`}
                    >
                      <div className={`relative h-20 w-20 overflow-hidden rounded-2xl ring-4 ${s.owned ? rs.ring : "ring-slate-100"}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={s.image_url}
                          alt={s.owned ? s.name : "Mystery sticker"}
                          className={`h-full w-full object-cover ${s.owned ? "" : "brightness-0 opacity-10"}`}
                        />
                        {!s.owned && (
                          <span className="absolute inset-0 grid place-items-center font-display text-3xl font-extrabold text-slate-400">
                            ?
                          </span>
                        )}
                        {s.owned && rs.shine && (
                          <span className="pointer-events-none absolute -right-1 -top-1 animate-twinkle text-lg">✨</span>
                        )}
                      </div>
                      <span className={`mt-1.5 truncate text-xs font-bold leading-tight ${s.owned ? "text-slate-700" : "text-slate-400"}`}>
                        {s.owned ? s.name : "???"}
                      </span>

                      {s.owned ? (
                        isBuddy ? (
                          <span className="mt-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-amber-600">
                            ⭐ Your buddy
                          </span>
                        ) : (
                          <button
                            onClick={() => makeBuddy(s)}
                            disabled={busy}
                            className="mt-1 rounded-full px-2 py-0.5 text-[0.65rem] font-bold text-slate-500 ring-1 ring-slate-200 hover:text-amber-600"
                          >
                            Make buddy
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => buyOne(s)}
                          disabled={busy || (balance ?? 0) < s.price}
                          className={`mt-1 rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold ${
                            (balance ?? 0) >= s.price ? "text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"
                          } ${confirming === s.id ? "animate-cheer" : ""}`}
                          style={(balance ?? 0) >= s.price ? { background: "var(--brand-blue)" } : undefined}
                        >
                          {confirming === s.id ? "Buy?" : `⭐ ${s.price}`}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}

      {/* Power-up: streak shield (tucked at the bottom) */}
      {book && (
        <section className="mt-10">
          <h2 className="mb-3 font-display text-xl font-bold text-slate-700">Power-Ups 🛡️</h2>
          <div className="card-fun flex items-center gap-4 p-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 text-3xl ring-2 ring-white">
              🛡️
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-slate-800">Streak Shield</p>
              <p className="text-sm font-semibold text-slate-500">
                Saves your 🔥 streak if you miss a day · you have {book.shields}/2
              </p>
            </div>
            <button
              onClick={buyShield}
              disabled={busy || book.shields >= 2 || (balance ?? 0) < book.shield_price}
              className={`btn-pop shrink-0 px-4 py-2 text-sm font-extrabold ${
                book.shields < 2 && (balance ?? 0) >= book.shield_price
                  ? "text-white"
                  : "cursor-not-allowed bg-slate-100 text-slate-400"
              } ${confirming === "shield" ? "animate-cheer" : ""}`}
              style={
                book.shields < 2 && (balance ?? 0) >= book.shield_price
                  ? { background: "linear-gradient(90deg, #0ea5e9, #3b82f6)" }
                  : undefined
              }
            >
              {book.shields >= 2 ? "Maxed!" : confirming === "shield" ? "Tap again!" : `⭐ ${book.shield_price}`}
            </button>
          </div>
        </section>
      )}

      {/* Pack-opening reveal */}
      {reveal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-6"
          onClick={() => opened && setReveal(null)}
        >
          {!opened ? (
            <div className="text-center">
              <div className="gift-rumble text-[7rem] leading-none drop-shadow-xl">🎁</div>
              <p className="mt-4 font-display text-xl font-extrabold text-white/90">Opening…</p>
            </div>
          ) : (
            <div
              className="card-fun w-full max-w-sm p-6 text-center animate-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-display text-lg font-extrabold text-violet-500">You got…</p>
              <div className="mt-4 flex flex-wrap items-end justify-center gap-3">
                {reveal.map((a, i) => {
                  const rs = rarityStyle(a.rarity);
                  return (
                    <div
                      key={a.id}
                      className="flex w-24 flex-col items-center animate-pop"
                      style={{ animationDelay: `${i * 250}ms` }}
                    >
                      <div className={`relative h-20 w-20 overflow-hidden rounded-2xl ring-4 ${rs.ring}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.image_url} alt={a.name} className="h-full w-full object-cover" />
                        {rs.shine && (
                          <span className="pointer-events-none absolute -right-1 -top-1 animate-twinkle text-xl">✨</span>
                        )}
                      </div>
                      <span className="mt-1 truncate text-xs font-bold text-slate-700">{a.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-extrabold uppercase ${rs.chip}`}>
                        {rs.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {reveal.some((a) => a.rarity === "shiny") && (
                <p className="mt-4 font-display text-lg font-extrabold text-amber-600 animate-cheer">
                  ✨ A SHINY! Super rare! ✨
                </p>
              )}
              <button
                onClick={() => setReveal(null)}
                className="btn-pop mt-5 w-full px-6 py-3 font-extrabold text-white"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }}
              >
                Add to my book! 📖
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
