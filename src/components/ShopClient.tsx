"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AVATAR_DEFS } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { playCorrect, playClick, playWrong, playTally } from "@/lib/sound";

type ShopItem = {
  id: string;
  kind: string;
  slug: string;
  name: string;
  image_url: string;
  price: number;
  owned: boolean;
};

type ShopData = {
  xp: number;
  balance: number;
  deal: { item_id: string; deal_price: number } | null;
  mystery_price: number;
  items: ShopItem[];
};

/** Rarity is derived from base price — no schema needed, and the tiers give
 *  cheap items dignity and expensive ones drama. */
function rarity(price: number) {
  if (price > 300)
    return { label: "Legendary", chip: "bg-amber-100 text-amber-700", ring: "ring-amber-300" };
  if (price > 250)
    return { label: "Epic", chip: "bg-violet-100 text-violet-700", ring: "ring-violet-300" };
  if (price > 150)
    return { label: "Rare", chip: "bg-sky-100 text-sky-700", ring: "ring-sky-300" };
  return { label: "Common", chip: "bg-emerald-100 text-emerald-700", ring: "ring-emerald-200" };
}

/**
 * The kid-facing Avatar Shop: spend earned points on AI-generated avatars,
 * then wear them. Free classic (SVG) avatars are always available below the
 * shop shelf, so every kid can restyle even with 0 points.
 */
export function ShopClient({ currentAvatar }: { currentAvatar: string }) {
  const [data, setData] = useState<ShopData | null>(null);
  const [avatar, setAvatar] = useState(currentAvatar);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [cheer, setCheer] = useState<string | null>(null);
  const [reveal, setReveal] = useState<{ name: string; image_url: string; price: number } | null>(
    null,
  );
  const [revealed, setRevealed] = useState(false);

  // Every purchase is an unboxing: the gift rumbles to a drumroll for a beat,
  // THEN bursts into the new avatar with confetti and the jackpot chime.
  useEffect(() => {
    if (!reveal) return;
    setRevealed(false);
    playTally();
    const t = setTimeout(() => {
      setRevealed(true);
      playCorrect(3);
      setConfettiKey((k) => k + 1);
    }, 1300);
    return () => clearTimeout(t);
  }, [reveal]);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_my_shop");
    if (data && !("error" in (data as object))) setData(data as ShopData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tapping anywhere else cancels a pending "tap again to buy".
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(null), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function buy(item: ShopItem) {
    if (busy || !data) return;
    if (confirming !== item.id) {
      playClick();
      setConfirming(item.id);
      return;
    }
    setConfirming(null);
    setBusy(true);
    const supabase = createClient();
    const { data: res } = await supabase.rpc("buy_shop_item", { p_item: item.id });
    const r = res as { ok?: boolean; balance?: number } | null;
    if (r?.ok) {
      // Wear it right away — buying a new look and not wearing it is no fun.
      await supabase.rpc("equip_shop_item", { p_item: item.id });
      setAvatar(item.image_url);
      setCheer(`${item.name} is yours! 🎉`);
      setReveal({ name: item.name, image_url: item.image_url, price: item.price });
      await load();
    } else {
      playWrong();
      await load(); // refresh balance in case it changed elsewhere
    }
    setBusy(false);
  }

  async function buyMysteryBox() {
    if (busy || !data) return;
    if (confirming !== "mystery") {
      playClick();
      setConfirming("mystery");
      return;
    }
    setConfirming(null);
    setBusy(true);
    const supabase = createClient();
    const { data: res } = await supabase.rpc("buy_mystery_box");
    const r = res as {
      ok?: boolean;
      item?: { id: string; name: string; image_url: string; price: number };
    } | null;
    if (r?.ok && r.item) {
      await supabase.rpc("equip_shop_item", { p_item: r.item.id });
      setAvatar(r.item.image_url);
      setCheer(`${r.item.name} is yours! 🎉`);
      setReveal({ name: r.item.name, image_url: r.item.image_url, price: r.item.price });
      await load();
    } else {
      playWrong();
      await load();
    }
    setBusy(false);
  }

  async function equipBought(item: ShopItem) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const { data: res } = await supabase.rpc("equip_shop_item", { p_item: item.id });
    if ((res as { ok?: boolean } | null)?.ok) {
      playClick();
      setAvatar(item.image_url);
    }
    setBusy(false);
  }

  async function equipClassic(id: string) {
    if (busy) return;
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar: id })
        .eq("id", user.id);
      if (!error) {
        playClick();
        setAvatar(id);
      }
    }
    setBusy(false);
  }

  const balance = data?.balance ?? null;

  return (
    <>
      <Confetti fire={confettiKey} />

      {/* Header: title + wallet */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-800">
            Avatar Shop 🛍️
          </h1>
          <p className="font-semibold text-slate-500">
            Spend the points you earn practicing!
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
          <span className="text-xs font-extrabold uppercase tracking-wide text-white/90">
            to spend
          </span>
        </div>
      </div>

      {/* Current look */}
      <div className="card-fun mt-5 flex items-center gap-4 p-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-4 ring-white">
          <Avatar id={avatar} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-bold text-slate-800">
            {cheer ?? "This is you right now!"}
          </p>
          <p className="text-sm font-semibold text-slate-500">
            Tap any avatar below to try a new look.
          </p>
        </div>
        <Link
          href="/home"
          className="btn-pop shrink-0 bg-white px-4 py-2 text-sm font-bold text-slate-600 ring-2 ring-slate-200"
        >
          🏠 Home
        </Link>
      </div>

      {/* Daily Deal + Mystery Box */}
      {data != null && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {(() => {
            const dealItem = data.deal
              ? data.items.find((i) => i.id === data.deal!.item_id)
              : undefined;
            if (!dealItem || dealItem.owned) return null;
            const affordable = (balance ?? 0) >= data.deal!.deal_price;
            return (
              <div
                className="card-fun flex items-center gap-4 p-4 ring-4 ring-rose-200"
                style={{ background: "linear-gradient(120deg, #fff1f2, #fff7ed)" }}
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={dealItem.image_url} alt={dealItem.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-rose-500">
                    ⏰ Deal of the day
                  </p>
                  <p className="font-display text-xl font-bold text-slate-800">{dealItem.name}</p>
                  <p className="text-sm font-bold text-slate-500">
                    <s className="opacity-60">⭐ {dealItem.price}</s>{" "}
                    <span className="text-rose-600">⭐ {data.deal!.deal_price}</span> — today only!
                  </p>
                </div>
                <button
                  onClick={() => buy({ ...dealItem, price: data.deal!.deal_price })}
                  disabled={busy || !affordable}
                  className={`btn-pop shrink-0 px-4 py-2 text-sm font-extrabold ${
                    affordable ? "text-white" : "cursor-not-allowed bg-slate-100 text-slate-400"
                  } ${confirming === dealItem.id ? "animate-cheer" : ""}`}
                  style={affordable ? { background: "linear-gradient(90deg, #f43f5e, #fb923c)" } : undefined}
                >
                  {confirming === dealItem.id ? "Tap again!" : "Grab it!"}
                </button>
              </div>
            );
          })()}

          {data.items.some((i) => !i.owned) && (
            <div
              className="card-fun flex items-center gap-4 p-4 ring-4 ring-violet-200"
              style={{ background: "linear-gradient(120deg, #f5f3ff, #eef2ff)" }}
            >
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-violet-400 to-fuchsia-400 text-5xl ring-4 ring-white">
                <span className="animate-float">🎁</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold uppercase tracking-wide text-violet-500">
                  Mystery box
                </p>
                <p className="font-display text-xl font-bold text-slate-800">Win ANY avatar!</p>
                <p className="text-sm font-bold text-slate-500">
                  ⭐ {data.mystery_price} — even a Legendary one 👀
                </p>
              </div>
              <button
                onClick={buyMysteryBox}
                disabled={busy || (balance ?? 0) < data.mystery_price}
                className={`btn-pop shrink-0 px-4 py-2 text-sm font-extrabold ${
                  (balance ?? 0) >= data.mystery_price
                    ? "text-white"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                } ${confirming === "mystery" ? "animate-cheer" : ""}`}
                style={
                  (balance ?? 0) >= data.mystery_price
                    ? { background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }
                    : undefined
                }
              >
                {confirming === "mystery" ? "Tap again!" : "Open it!"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI avatar shelf */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Super avatars ✨
      </h2>
      {data == null ? (
        <div className="card-fun p-8 text-center font-display text-lg text-slate-400">
          Opening the shop…
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.items.map((item) => {
            const wearing = avatar === item.image_url;
            const isDeal = data.deal?.item_id === item.id && !item.owned;
            const price = isDeal ? data.deal!.deal_price : item.price;
            const affordable = (balance ?? 0) >= price;
            const tier = rarity(item.price);
            return (
              <div
                key={item.id}
                className={`card-fun flex flex-col items-center p-4 text-center transition ${
                  wearing ? "ring-4 ring-amber-300" : ""
                }`}
              >
                <div
                  className={`h-24 w-24 overflow-hidden rounded-3xl ring-4 ${tier.ring} ${
                    item.owned || affordable ? "" : "opacity-60 grayscale-[35%]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-2 font-display text-lg font-bold leading-tight text-slate-800">
                  {item.name}
                </p>
                <span className={`mt-1 rounded-full px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-wide ${tier.chip}`}>
                  {isDeal ? "⏰ Deal!" : tier.label}
                </span>

                {wearing ? (
                  <span className="mt-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-extrabold text-amber-700">
                    Wearing it! 😎
                  </span>
                ) : item.owned ? (
                  <button
                    onClick={() => equipBought(item)}
                    disabled={busy}
                    className="btn-pop mt-2 px-4 py-1.5 text-sm font-extrabold text-white"
                    style={{ background: "var(--brand-blue)" }}
                  >
                    Wear it
                  </button>
                ) : (
                  <button
                    onClick={() => buy(item)}
                    disabled={busy || !affordable}
                    className={`btn-pop mt-2 px-4 py-1.5 text-sm font-extrabold ${
                      affordable
                        ? "text-white"
                        : "cursor-not-allowed bg-slate-100 text-slate-400"
                    } ${confirming === item.id ? "animate-cheer" : ""}`}
                    style={
                      affordable
                        ? {
                            background:
                              "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
                          }
                        : undefined
                    }
                  >
                    {confirming === item.id ? (
                      "Tap again to buy!"
                    ) : isDeal ? (
                      <>
                        <s className="opacity-70">⭐ {item.price}</s> ⭐ {price}
                      </>
                    ) : (
                      `⭐ ${price}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Not enough points? Point them back at practice. */}
      {data != null && (balance ?? 0) < Math.min(...data.items.filter((i) => !i.owned).map((i) => i.price), Infinity) && (
        <Link
          href="/practice/daily"
          className="btn-pop mt-4 flex items-center gap-3 px-5 py-4 text-white"
          style={{ background: "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))" }}
        >
          <span className="text-3xl">⭐</span>
          <span className="text-left">
            <span className="block font-display text-lg font-bold">
              Want more points?
            </span>
            <span className="block text-sm text-white/90">
              Play the Daily Challenge to earn some!
            </span>
          </span>
          <span className="ml-auto text-2xl">→</span>
        </Link>
      )}

      {/* Free classics */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Free classics
      </h2>
      <div className="card-fun grid grid-cols-4 gap-3 p-4 sm:grid-cols-6">
        {AVATAR_DEFS.map((d) => {
          const wearing = avatar === d.id;
          return (
            <button
              key={d.id}
              onClick={() => equipClassic(d.id)}
              disabled={busy}
              title={d.name}
              className={`btn-pop overflow-hidden rounded-2xl bg-white p-1 ${
                wearing ? "ring-4 ring-amber-300" : "ring-2 ring-slate-100"
              }`}
            >
              <Avatar id={d.id} className="h-full w-full" />
            </button>
          );
        })}
      </div>

      {/* Unboxing overlay: rumbling gift → burst reveal (used for every buy) */}
      {reveal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-6"
          onClick={() => revealed && setReveal(null)}
        >
          {!revealed ? (
            <div className="text-center">
              <div className="gift-rumble text-[7rem] leading-none drop-shadow-xl">🎁</div>
              <p className="mt-4 font-display text-xl font-extrabold text-white/90">
                Opening…
              </p>
            </div>
          ) : (
            <div
              className="card-fun w-full max-w-sm p-8 text-center animate-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-extrabold uppercase tracking-wide text-violet-500">
                It burst open!
              </p>
              <div
                className={`mx-auto mt-4 h-36 w-36 overflow-hidden rounded-3xl ring-8 ${rarity(reveal.price).ring} animate-cheer`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={reveal.image_url} alt={reveal.name} className="h-full w-full object-cover" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-extrabold text-slate-800">
                {reveal.name}!
              </h2>
              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${rarity(reveal.price).chip}`}
              >
                {rarity(reveal.price).label} · worth ⭐ {reveal.price}
              </span>
              <p className="mt-2 font-semibold text-slate-500">
                It&apos;s yours — and you&apos;re already wearing it! 😎
              </p>
              <button
                onClick={() => setReveal(null)}
                className="btn-pop mt-5 px-6 py-3 font-extrabold text-white"
                style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }}
              >
                Awesome!
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
