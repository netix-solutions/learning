"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Confetti } from "@/components/Confetti";
import { TradingCard, RevealCard, rarityCard, type CardData } from "@/components/TradingCard";
import { CARD_FACTS, CARD_ALBUMS, albumMeta } from "@/lib/card-facts";
import { playCorrect, playClick, playWrong, playTally } from "@/lib/sound";

type Item = {
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
  balance: number;
  shields: number;
  shield_price: number;
  favorite: string | null;
  pack: { key: string; price: number; count: number };
  items: Item[];
};

type Awarded = { id: string; name: string; image_url: string; rarity: string; collection: string };

export function CardCollection() {
  const [book, setBook] = useState<Book | null>(null);
  const [favorite, setFavorite] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  // Pack reveal.
  const [reveal, setReveal] = useState<Awarded[] | null>(null);
  const [opened, setOpened] = useState(false);
  const [flippedCount, setFlippedCount] = useState(0);
  // Big single-card viewer (tap a card in the binder).
  const [big, setBig] = useState<CardData | null>(null);
  const [bigFlipped, setBigFlipped] = useState(false);

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

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(null), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  // Card number within each set, so cards read "#3/10".
  const numberOf = useMemo(() => {
    const m = new Map<string, { number: number; total: number }>();
    if (book) {
      for (const a of CARD_ALBUMS) {
        const set = book.items.filter((i) => i.collection === a.key);
        set.forEach((i, idx) => m.set(i.id, { number: idx + 1, total: set.length }));
      }
    }
    return m;
  }, [book]);

  const toCard = useCallback(
    (i: { id: string; slug: string; name: string; image_url: string; rarity: string; collection: string }): CardData => ({
      ...i,
      number: numberOf.get(i.id)?.number,
      total: numberOf.get(i.id)?.total,
      fact: CARD_FACTS[i.slug],
    }),
    [numberOf],
  );

  // Reveal: burst the pack, then flip the cards face-up one by one.
  useEffect(() => {
    if (!reveal) return;
    setOpened(false);
    setFlippedCount(0);
    playTally();
    const burst = setTimeout(() => {
      setOpened(true);
      setConfettiKey((k) => k + 1);
    }, 1000);
    return () => clearTimeout(burst);
  }, [reveal]);

  useEffect(() => {
    if (!reveal || !opened) return;
    if (flippedCount >= reveal.length) return;
    const t = setTimeout(() => {
      const next = flippedCount + 1;
      setFlippedCount(next);
      const card = reveal[next - 1];
      playCorrect(card.rarity === "shiny" ? 4 : 2);
    }, flippedCount === 0 ? 250 : 650);
    return () => clearTimeout(t);
  }, [reveal, opened, flippedCount]);

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

  async function buyOne(item: Item) {
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

  async function makeBuddy(item: { id: string; image_url: string }) {
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
  const albums = CARD_ALBUMS.filter((a) => book?.items.some((i) => i.collection === a.key));

  return (
    <>
      <Confetti fire={confettiKey} />

      {/* Title + wallet */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">My Cards 🃏</h1>
          <p className="font-semibold text-slate-500">
            {total > 0 ? `${ownedCount} of ${total} cards collected` : "Let's start collecting!"}
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

      {/* Open a card pack */}
      <button
        onClick={canOpen ? openPack : undefined}
        disabled={busy || !canOpen}
        className={`btn-pop mt-5 flex w-full items-center gap-4 p-5 text-left text-white ${canOpen ? "" : "opacity-70"} ${confirming === "pack" ? "animate-cheer" : ""}`}
        style={{ background: "linear-gradient(120deg, #8b5cf6, #d946ef)", borderRadius: "2rem" }}
      >
        <span className="animate-float text-5xl">🎴</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl font-extrabold">
            {confirming === "pack" ? "Tap again to rip it open!" : "Open a Card Pack!"}
          </span>
          <span className="block text-white/90">
            {book ? `⭐ ${book.pack.price} · ${book.pack.count} surprise cards 👀` : "…"}
          </span>
        </span>
      </button>
      {!canOpen && book && (
        <Link
          href="/practice/daily"
          className="btn-pop mt-3 flex items-center justify-center gap-2 bg-white px-5 py-3 font-bold text-slate-600 ring-2 ring-slate-200"
        >
          Earn ⭐ {book.pack.price} to open a pack — play a round! →
        </Link>
      )}

      {/* Binder */}
      {book == null ? (
        <p className="card-fun mt-6 p-8 text-center font-display text-lg text-slate-400">Opening your binder…</p>
      ) : (
        albums.map((album) => {
          const cards = book.items.filter((i) => i.collection === album.key);
          const have = cards.filter((i) => i.owned).length;
          const pct = Math.round((have / cards.length) * 100);
          const complete = have === cards.length;
          return (
            <section key={album.key} className="mt-8">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-slate-700">
                  {album.emoji} {album.name}
                </h2>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold ${complete ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                  {complete ? "★ Complete!" : `${have}/${cards.length}`}
                </span>
              </div>
              <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {cards.map((c) =>
                  c.owned ? (
                    <button
                      key={c.id}
                      onClick={() => {
                        playClick();
                        setBigFlipped(false);
                        setBig(toCard(c));
                      }}
                      className={`transition-transform active:scale-95 ${favorite === c.image_url ? "rounded-xl ring-4 ring-amber-300" : ""}`}
                    >
                      <TradingCard card={toCard(c)} />
                    </button>
                  ) : (
                    <div key={c.id} className="flex flex-col items-center gap-1">
                      <TradingCard card={toCard(c)} faceDown className="w-full" />
                      <button
                        onClick={() => buyOne(c)}
                        disabled={busy || (balance ?? 0) < c.price}
                        className={`rounded-full px-2.5 py-0.5 text-[0.7rem] font-extrabold ${(balance ?? 0) >= c.price ? "text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"} ${confirming === c.id ? "animate-cheer" : ""}`}
                        style={(balance ?? 0) >= c.price ? { background: "var(--brand-blue)" } : undefined}
                      >
                        {confirming === c.id ? "Buy?" : `⭐ ${c.price}`}
                      </button>
                    </div>
                  ),
                )}
              </div>
            </section>
          );
        })
      )}

      {/* Power-up */}
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
              className={`btn-pop shrink-0 px-4 py-2 text-sm font-extrabold ${book.shields < 2 && (balance ?? 0) >= book.shield_price ? "text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"} ${confirming === "shield" ? "animate-cheer" : ""}`}
              style={book.shields < 2 && (balance ?? 0) >= book.shield_price ? { background: "linear-gradient(90deg, #0ea5e9, #3b82f6)" } : undefined}
            >
              {book.shields >= 2 ? "Maxed!" : confirming === "shield" ? "Tap again!" : `⭐ ${book.shield_price}`}
            </button>
          </div>
        </section>
      )}

      {/* Pack reveal: flip the new cards face-up */}
      {reveal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-6"
          onClick={() => opened && flippedCount >= reveal.length && setReveal(null)}
        >
          {!opened ? (
            <div className="text-center">
              <div className="gift-rumble text-[6rem] leading-none drop-shadow-xl">🎴</div>
              <p className="mt-4 font-display text-xl font-extrabold text-white/90">Ripping it open…</p>
            </div>
          ) : (
            <div className="w-full max-w-sm text-center" onClick={(e) => e.stopPropagation()}>
              <p className="font-display text-xl font-extrabold text-white drop-shadow">You pulled…</p>
              <div className="mt-4 flex items-start justify-center gap-2.5">
                {reveal.map((a, i) => (
                  <div key={a.id} className="w-24">
                    <RevealCard card={toCard({ ...a, slug: "", name: a.name })} flipped={i < flippedCount} />
                  </div>
                ))}
              </div>
              {flippedCount >= reveal.length && reveal.some((a) => a.rarity === "shiny") && (
                <p className="mt-4 animate-cheer font-display text-lg font-extrabold text-amber-300 drop-shadow">
                  ✦ A HOLO CARD! Super rare! ✦
                </p>
              )}
              {flippedCount >= reveal.length && (
                <button
                  onClick={() => setReveal(null)}
                  className="btn-pop mt-5 w-full px-6 py-3 font-extrabold text-white animate-pop"
                  style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }}
                >
                  Add to my binder! 🗂️
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Big single-card viewer */}
      {big && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-6" onClick={() => setBig(null)}>
          <div className="w-full max-w-[16rem] text-center" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setBigFlipped((f) => !f)} className="block w-full active:scale-95">
              <TradingCard card={big} flipped={bigFlipped} />
            </button>
            <p className="mt-2 text-sm font-bold text-white/80">Tap the card to flip it 🔄</p>
            <div className="mt-3 flex flex-col gap-2">
              {favorite === big.image_url ? (
                <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-extrabold text-amber-700">
                  ⭐ This is your buddy!
                </span>
              ) : (
                <button
                  onClick={() => makeBuddy(big)}
                  disabled={busy}
                  className="btn-pop px-5 py-2.5 text-sm font-extrabold text-white"
                  style={{ background: "var(--brand-blue)" }}
                >
                  ⭐ Make this my buddy
                </button>
              )}
              <button
                onClick={() => setBig(null)}
                className="btn-pop bg-white px-5 py-2 text-sm font-bold text-slate-500 ring-2 ring-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
