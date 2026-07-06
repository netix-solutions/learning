"use client";

import { useState } from "react";
import { AnimatedMath, buildNarration } from "@/components/AnimatedMath";
import { speak, stop } from "@/lib/speech";
import type { ParsedArithmetic } from "@/lib/math-parse";

/**
 * Pre-answer math helper: shows the animated worked solution and reads a
 * friendly voiceover explaining each step. Opened from a "Teach me how" button
 * below a math problem, so a kid who's stuck can watch and listen instead of
 * guessing.
 *
 * The voiceover is started by the tap that opens this (and by "Play again"),
 * so iOS lets the audio play — both are real user gestures. The animation runs
 * on its own timers alongside.
 */
export function MathTeachMe({
  parsed,
  onClose,
}: {
  parsed: ParsedArithmetic;
  onClose: () => void;
}) {
  // Bumping the key remounts AnimatedMath so the animation restarts from step 1.
  const [playKey, setPlayKey] = useState(0);

  function playAgain() {
    speak("math-teach", buildNarration(parsed)); // inside a tap → iOS-safe
    setPlayKey((k) => k + 1);
  }

  function close() {
    stop();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4"
      onClick={close}
    >
      <div
        className="card-fun animate-pop flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center gap-2 border-b border-slate-100 p-4">
          <span className="animate-wiggle text-3xl">🧑‍🏫</span>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-slate-800">Let&apos;s solve it!</p>
            <p className="text-xs font-semibold text-slate-400">Watch and listen — you&apos;ve got this 💪</p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="rounded-full px-3 py-1 text-xl text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </header>

        <div className="overflow-y-auto overscroll-contain p-5">
          <div className="rounded-2xl bg-slate-50 p-4">
            <AnimatedMath key={playKey} parsed={parsed} />
          </div>
        </div>

        <footer className="flex flex-col gap-2 border-t border-slate-100 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4">
          <button
            onClick={playAgain}
            className="btn-pop w-full px-6 py-3 text-lg font-extrabold text-white"
            style={{ background: "linear-gradient(90deg, #8b5cf6, #d946ef)" }}
          >
            🔊 Play again
          </button>
          <button
            onClick={close}
            className="btn-pop w-full bg-white px-6 py-2.5 text-base text-slate-500 ring-2 ring-slate-200"
          >
            I&apos;m ready to try! 👍
          </button>
        </footer>
      </div>
    </div>
  );
}
