"use client";

import { useState } from "react";
import type {
  AttemptResult,
  PracticeQuestion,
  SubmittedAnswer,
} from "@/lib/types";

/**
 * Renderers for the non-multiple-choice question kinds. Each one manages its own
 * little interaction, then calls `onSubmit` with the normalized answer (see
 * SubmittedAnswer). Once `result` arrives they switch to a read-only review that
 * lights up what was right and reveals the correct answer on a miss.
 *
 * The plain "mcq" grid still lives in PracticeClient; everything here is the fun
 * stuff: match, order, categorize, tap-the-word, and this-or-that.
 */
type Props = {
  question: PracticeQuestion;
  result: AttemptResult | null;
  submitting: boolean;
  onSubmit: (answer: SubmittedAnswer) => void;
};

// Distinct, kid-friendly colors for matched pairs / placed slots.
const PAIR_COLORS = [
  "bg-sky-100 text-sky-700 border-sky-300",
  "bg-amber-100 text-amber-700 border-amber-300",
  "bg-emerald-100 text-emerald-700 border-emerald-300",
  "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300",
  "bg-rose-100 text-rose-700 border-rose-300",
];

function CheckButton({
  ready,
  submitting,
  onClick,
}: {
  ready: boolean;
  submitting: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!ready || submitting}
      className="btn-pop mt-6 w-full px-6 py-4 text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      style={{ background: "var(--brand-blue)" }}
    >
      {submitting ? "Checking…" : ready ? "Check it! ✅" : "Finish your answer…"}
    </button>
  );
}

// ===========================================================================
// THIS OR THAT (true/false) — two big snappy buttons.
// ===========================================================================
export function TrueFalseQuestion({ question, result, submitting, onSubmit }: Props) {
  const [picked, setPicked] = useState<number | null>(null);
  const correct = typeof result?.correct === "number" ? result.correct : null;

  return (
    <div className="mt-6 grid grid-cols-2 gap-4">
      {question.choices.map((label, i) => {
        let cls = "border-slate-200 bg-white hover:border-[var(--brand-blue)] hover:bg-blue-50";
        if (result) {
          if (i === correct) cls = "border-emerald-400 bg-emerald-50 text-emerald-800 answer-correct";
          else if (i === picked) cls = "border-red-400 bg-red-50 text-red-700";
          else cls = "border-slate-200 bg-white opacity-50";
        }
        const isTrue = /^t/i.test(label);
        return (
          <button
            key={i}
            disabled={!!result || submitting}
            onClick={() => {
              setPicked(i);
              onSubmit(i);
            }}
            className={`grid min-h-28 place-items-center rounded-3xl border-4 px-3 py-6 text-2xl font-bold transition ${cls}`}
          >
            <span className="text-5xl">{isTrue ? "✅" : "❌"}</span>
            <span className="mt-1">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ===========================================================================
// TAP THE WORD — tap a word inside the sentence.
// ===========================================================================
export function TapWordQuestion({ question, result, submitting, onSubmit }: Props) {
  const tokens = question.payload?.tokens ?? [];
  const [picked, setPicked] = useState<number | null>(null);
  const correct = typeof result?.correct === "number" ? result.correct : null;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-3 text-2xl leading-relaxed">
      {tokens.map((tok, i) => {
        let cls = "border-transparent bg-slate-100 hover:bg-blue-100 hover:border-blue-300";
        if (result) {
          if (i === correct) cls = "border-emerald-400 bg-emerald-100 text-emerald-800";
          else if (i === picked) cls = "border-red-400 bg-red-100 text-red-700";
          else cls = "border-transparent bg-slate-100 opacity-60";
        }
        return (
          <button
            key={i}
            disabled={!!result || submitting}
            onClick={() => {
              setPicked(i);
              onSubmit(i);
            }}
            className={`rounded-xl border-2 px-3 py-1.5 font-bold transition ${cls}`}
          >
            {tok}
            {result && i === correct && <span className="ml-1">✅</span>}
          </button>
        );
      })}
    </div>
  );
}

// ===========================================================================
// PUT IN ORDER — tap items from the pool to build the sequence.
// ===========================================================================
export function OrderQuestion({ question, result, submitting, onSubmit }: Props) {
  const items = question.payload?.items ?? [];
  const label = question.payload?.label;
  const [placed, setPlaced] = useState<number[]>([]);
  const correct = Array.isArray(result?.correct) ? result!.correct : null;

  const inPool = items.map((_, i) => i).filter((i) => !placed.includes(i));
  const ready = placed.length === items.length && items.length > 0;

  return (
    <div className="mt-6">
      {label && (
        <p className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-slate-400">
          {label}
        </p>
      )}

      {/* The sequence the kid is building. */}
      <div className="flex min-h-20 flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-3">
        {placed.length === 0 && (
          <span className="text-slate-400">Tap below to add them in order…</span>
        )}
        {placed.map((itemIdx, pos) => {
          let cls = "border-slate-200 bg-white";
          if (result && correct) {
            cls =
              itemIdx === correct[pos]
                ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                : "border-red-400 bg-red-50 text-red-700";
          }
          return (
            <button
              key={itemIdx}
              disabled={!!result || submitting}
              onClick={() => setPlaced((p) => p.filter((x) => x !== itemIdx))}
              className={`flex items-center gap-1 rounded-xl border-2 px-3 py-2 text-lg font-bold transition ${cls}`}
            >
              <span className="text-xs text-slate-400">{pos + 1}.</span>
              {items[itemIdx]}
            </button>
          );
        })}
      </div>

      {/* Remaining pool. */}
      {inPool.length > 0 && !result && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {inPool.map((i) => (
            <button
              key={i}
              disabled={submitting}
              onClick={() => setPlaced((p) => [...p, i])}
              className="btn-pop rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-lg font-bold text-slate-700"
            >
              {items[i]}
            </button>
          ))}
        </div>
      )}

      {/* Reveal the right order on a miss. */}
      {result && !result.is_correct && correct && (
        <p className="mt-3 text-center text-sm font-bold text-slate-500">
          Correct order: {correct.map((i) => items[i]).join(" → ")}
        </p>
      )}

      {!result && <CheckButton ready={ready} submitting={submitting} onClick={() => onSubmit(placed)} />}
    </div>
  );
}

// ===========================================================================
// SORT INTO BUCKETS — pick a bucket for each item.
// ===========================================================================
export function CategorizeQuestion({ question, result, submitting, onSubmit }: Props) {
  const buckets = question.payload?.buckets ?? [];
  const items = question.payload?.items ?? [];
  const [assign, setAssign] = useState<(number | null)[]>(() => items.map(() => null));
  const correct = Array.isArray(result?.correct) ? result!.correct : null;

  const ready = assign.every((a) => a !== null) && items.length > 0;

  return (
    <div className="mt-6 space-y-3">
      {items.map((item, i) => {
        const chosen = assign[i];
        const isRight = result && correct ? chosen === correct[i] : null;
        return (
          <div
            key={i}
            className={`rounded-2xl border-2 p-3 transition ${
              isRight === true
                ? "border-emerald-300 bg-emerald-50"
                : isRight === false
                  ? "border-red-300 bg-red-50"
                  : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-2 flex items-center gap-2 text-lg font-bold text-slate-700">
              <span>{item}</span>
              {isRight === true && <span className="ml-auto">✅</span>}
              {isRight === false && (
                <span className="ml-auto text-sm font-bold text-red-600">
                  → {buckets[correct![i]]}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {buckets.map((b, bi) => {
                const selected = chosen === bi;
                let cls = "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-300";
                if (selected) cls = "border-[var(--brand-blue)] bg-blue-50 text-blue-700";
                if (result && selected)
                  cls =
                    isRight === true
                      ? "border-emerald-400 bg-emerald-100 text-emerald-800"
                      : "border-red-400 bg-red-100 text-red-700";
                return (
                  <button
                    key={bi}
                    disabled={!!result || submitting}
                    onClick={() =>
                      setAssign((a) => a.map((v, idx) => (idx === i ? bi : v)))
                    }
                    className={`rounded-xl border-2 px-4 py-2 text-base font-bold transition ${cls}`}
                  >
                    {b}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!result && (
        <CheckButton
          ready={ready}
          submitting={submitting}
          onClick={() => onSubmit(assign.map((a) => a ?? -1))}
        />
      )}
    </div>
  );
}

// ===========================================================================
// MATCH PAIRS — tap a left item, then its partner on the right.
// ===========================================================================
export function MatchQuestion({ question, result, submitting, onSubmit }: Props) {
  const left = question.payload?.left ?? [];
  const right = question.payload?.right ?? [];
  const [pairing, setPairing] = useState<(number | null)[]>(() => left.map(() => null));
  const [activeLeft, setActiveLeft] = useState<number | null>(null);
  const correct = Array.isArray(result?.correct) ? result!.correct : null;

  const ready = pairing.every((p) => p !== null) && left.length > 0;
  const usedRight = (j: number) => pairing.includes(j);
  const pairOf = (j: number) => pairing.findIndex((p) => p === j); // left index paired to right j

  function tapLeft(i: number) {
    if (result) return;
    if (pairing[i] !== null) {
      // un-pair
      setPairing((p) => p.map((v, idx) => (idx === i ? null : v)));
      setActiveLeft(null);
    } else {
      setActiveLeft((cur) => (cur === i ? null : i));
    }
  }

  function tapRight(j: number) {
    if (result || activeLeft === null || usedRight(j)) return;
    const li = activeLeft;
    setPairing((p) => p.map((v, idx) => (idx === li ? j : v)));
    setActiveLeft(null);
  }

  function leftClasses(i: number) {
    if (result && correct) {
      return pairing[i] === correct[i]
        ? "border-emerald-400 bg-emerald-50 text-emerald-800"
        : "border-red-400 bg-red-50 text-red-700";
    }
    if (activeLeft === i) return "border-[var(--brand-blue)] bg-blue-50 ring-2 ring-blue-200";
    if (pairing[i] !== null) return PAIR_COLORS[i % PAIR_COLORS.length];
    return "border-slate-200 bg-white hover:border-blue-300";
  }

  function rightClasses(j: number) {
    const owner = pairOf(j);
    if (result && correct) {
      // green if this right cell sits at its correct partner
      const correctOwner = correct.findIndex((c) => c === j);
      if (owner === correctOwner && owner !== -1)
        return "border-emerald-400 bg-emerald-50 text-emerald-800";
      if (owner !== -1) return "border-red-400 bg-red-50 text-red-700";
      return "border-slate-200 bg-white opacity-60";
    }
    if (owner !== -1) return PAIR_COLORS[owner % PAIR_COLORS.length];
    if (activeLeft !== null) return "border-slate-200 bg-white hover:border-blue-300 cursor-pointer";
    return "border-slate-200 bg-white opacity-70";
  }

  return (
    <div className="mt-6">
      <p className="mb-3 text-center text-sm font-bold text-slate-400">
        {activeLeft !== null ? "Now tap its partner →" : "Tap one, then its partner."}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {left.map((item, i) => (
            <button
              key={i}
              disabled={!!result || submitting}
              onClick={() => tapLeft(i)}
              className={`flex w-full items-center gap-2 rounded-2xl border-2 px-3 py-3 text-left text-lg font-bold transition ${leftClasses(i)}`}
            >
              {pairing[i] !== null && !result && (
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/70 text-xs">
                  {pairing.filter((p, idx) => idx <= i && p !== null).length}
                </span>
              )}
              <span>{item}</span>
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {right.map((item, j) => {
            const owner = pairOf(j);
            return (
              <button
                key={j}
                disabled={!!result || submitting}
                onClick={() => tapRight(j)}
                className={`flex w-full items-center gap-2 rounded-2xl border-2 px-3 py-3 text-left text-lg font-bold transition ${rightClasses(j)}`}
              >
                {owner !== -1 && !result && (
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/70 text-xs">
                    {pairing.filter((p, idx) => idx <= owner && p !== null).length}
                  </span>
                )}
                <span>{item}</span>
              </button>
            );
          })}
        </div>
      </div>

      {result && !result.is_correct && correct && (
        <div className="mt-3 rounded-xl bg-white/70 p-3 text-sm font-bold text-slate-600">
          Correct matches:
          <ul className="mt-1 font-medium text-slate-500">
            {left.map((item, i) => (
              <li key={i}>
                {item} → {right[correct[i]]}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!result && (
        <CheckButton
          ready={ready}
          submitting={submitting}
          onClick={() => onSubmit(pairing.map((p) => p ?? -1))}
        />
      )}
    </div>
  );
}
