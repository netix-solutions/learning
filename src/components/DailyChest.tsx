"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Confetti } from "@/components/Confetti";
import { CountUp } from "@/components/CountUp";
import { playCorrect, playTally } from "@/lib/sound";

type Phase = "locked" | "ready" | "opening" | "opened";

/**
 * The daily treasure chest on the kid home: practicing unlocks it, opening it
 * pays a random point reward (server-side RPC — the client can't cheat it).
 * One per day; the variable payout is the come-back-tomorrow hook.
 */
export function DailyChest({
  initialState,
  reward: initialReward,
}: {
  initialState: "locked" | "ready" | "opened";
  reward?: number;
}) {
  const [phase, setPhase] = useState<Phase>(initialState);
  const [reward, setReward] = useState(initialReward ?? 0);
  const [confettiKey, setConfettiKey] = useState(0);

  async function open() {
    if (phase !== "ready") return;
    setPhase("opening");
    playTally();
    const supabase = createClient();
    // Let the rumble build suspense while the RPC runs.
    const [res] = await Promise.all([
      supabase.rpc("open_daily_chest"),
      new Promise((r) => setTimeout(r, 1300)),
    ]);
    const r = res.data as { ok?: boolean; reward?: number } | null;
    if (r?.ok && r.reward) {
      setReward(r.reward);
      setPhase("opened");
      playCorrect(3);
      setConfettiKey((k) => k + 1);
    } else {
      // Already claimed elsewhere / not eligible — settle quietly.
      setPhase("opened");
    }
  }

  if (phase === "locked") {
    return (
      <Link
        href="/practice/daily"
        className="card-fun mt-5 flex items-center gap-3 p-4 opacity-80 transition-opacity hover:opacity-100"
      >
        <span className="text-3xl grayscale">🎁</span>
        <span className="min-w-0 flex-1">
          <span className="block font-display font-bold text-slate-700">
            Daily treasure chest
          </span>
          <span className="text-sm font-semibold text-slate-500">
            Play a round to unlock it! 🔒
          </span>
        </span>
        <span className="text-2xl text-slate-300">→</span>
      </Link>
    );
  }

  if (phase === "opened") {
    return (
      <>
        <Confetti fire={confettiKey} />
        <div className="card-fun mt-5 flex items-center gap-3 bg-amber-50/80 p-4">
          <span className="text-3xl">🎉</span>
          <span className="min-w-0 flex-1">
            <span className="block font-display font-bold text-slate-800">
              {reward > 0 ? (
                <>
                  Today&apos;s chest: +<CountUp value={reward} durationMs={900} /> ⭐
                </>
              ) : (
                "Today's chest is open!"
              )}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              A new one appears tomorrow — keep the streak going! 🔥
            </span>
          </span>
        </div>
      </>
    );
  }

  // ready / opening
  return (
    <button
      onClick={open}
      disabled={phase === "opening"}
      className="btn-pop card-fun mt-5 flex w-full items-center gap-3 p-4 text-left ring-4 ring-amber-200"
      style={{ background: "linear-gradient(120deg, #fffbeb, #fff7ed)" }}
    >
      <span
        className={`text-4xl ${phase === "opening" ? "gift-rumble" : "animate-float"}`}
      >
        🎁
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-extrabold text-slate-800">
          {phase === "opening" ? "Opening…" : "Your daily chest is ready!"}
        </span>
        <span className="text-sm font-semibold text-amber-700">
          {phase === "opening"
            ? "Something shiny is in there…"
            : "Tap to open — there are points inside 👀"}
        </span>
      </span>
      {phase === "ready" && <span className="animate-pop text-2xl">✨</span>}
    </button>
  );
}
