"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AVATAR_DEFS } from "@/components/Avatar";
import { Confetti } from "@/components/Confetti";
import { playCorrect, playClick, playWrong } from "@/lib/sound";

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
  items: ShopItem[];
};

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
      playCorrect(2);
      setConfettiKey((k) => k + 1);
      setCheer(`${item.name} is yours! 🎉`);
      await load();
    } else {
      playWrong();
      await load(); // refresh balance in case it changed elsewhere
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
            const affordable = (balance ?? 0) >= item.price;
            return (
              <div
                key={item.id}
                className={`card-fun flex flex-col items-center p-4 text-center transition ${
                  wearing ? "ring-4 ring-amber-300" : ""
                }`}
              >
                <div
                  className={`h-24 w-24 overflow-hidden rounded-3xl ${
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
                    {confirming === item.id
                      ? "Tap again to buy!"
                      : `⭐ ${item.price}`}
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

    </>
  );
}
