"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Confetti } from "@/components/Confetti";
import { playCorrect, playTally } from "@/lib/sound";

export type QuestStatus = {
  subject: string;
  subject_name: string;
  emoji: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
  days_left: number;
};

/**
 * The weekly quest on the kid home: N correct answers in the week's featured
 * subject for a big point payout. Progress and payout are server-computed.
 */
export function QuestCard({ initial }: { initial: QuestStatus }) {
  const [status, setStatus] = useState(initial);
  const [claiming, setClaiming] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [justClaimed, setJustClaimed] = useState(false);

  const done = status.progress >= status.target;
  const pct = Math.round((status.progress / status.target) * 100);

  async function claim() {
    if (claiming || !done || status.claimed) return;
    setClaiming(true);
    playTally();
    const supabase = createClient();
    const { data } = await supabase.rpc("claim_weekly_quest");
    if ((data as { ok?: boolean } | null)?.ok) {
      setStatus((s) => ({ ...s, claimed: true }));
      setJustClaimed(true);
      playCorrect(3);
      setConfettiKey((k) => k + 1);
    }
    setClaiming(false);
  }

  return (
    <>
      <Confetti fire={confettiKey} />
      <div
        className={`card-fun mt-5 p-4 ${done && !status.claimed ? "ring-4 ring-emerald-200" : ""}`}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 text-2xl">
            {status.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-extrabold text-slate-800">
              Weekly Quest
            </p>
            <p className="truncate text-sm font-semibold text-slate-500">
              {status.claimed
                ? justClaimed
                  ? `+${status.reward} ⭐ collected! 🎉`
                  : `Done! New quest in ${status.days_left}d 🎉`
                : done
                  ? `Finished — collect your reward!`
                  : `${status.target} correct in ${status.subject_name}`}
            </p>
          </div>
          {status.claimed ? (
            <span className="shrink-0 text-2xl">✅</span>
          ) : done ? (
            <button
              onClick={claim}
              disabled={claiming}
              className="btn-pop animate-pop shrink-0 px-4 py-2.5 text-sm font-extrabold text-white"
              style={{ background: "linear-gradient(90deg, #10b981, #22c55e)" }}
            >
              {claiming ? "…" : `Collect ${status.reward} ⭐`}
            </button>
          ) : (
            <Link
              href={`/practice/${status.subject}`}
              className="btn-pop shrink-0 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 ring-2 ring-slate-200"
            >
              Go! →
            </Link>
          )}
        </div>
        {!status.claimed && (
          <>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs font-bold text-slate-400">
              <span>{status.progress}/{status.target} correct</span>
              <span>
                {status.reward} ⭐ · {status.days_left}
                {status.days_left === 1 ? " day" : " days"} left
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
