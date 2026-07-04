"use client";

import { useEffect, useMemo, useState } from "react";
import { paddedDigits, type ParsedArithmetic } from "@/lib/math-parse";

/**
 * Animated, step-by-step math help. Given a parsed problem it plays the way a
 * teacher would work it on the board:
 *   - little numbers: counting dots that appear / get crossed out,
 *   - column + : place-value columns light up right-to-left, carries float up,
 *   - column − : borrowing shown with crossed digits and little helpers,
 *   - ×        : an array builds row by row with a running count,
 *   - ÷        : dots get dealt fairly into groups.
 * Auto-plays once, with Replay. Purely client-side and deterministic.
 */
export function AnimatedMath({ parsed }: { parsed: ParsedArithmetic }) {
  const mode = pickMode(parsed);
  if (mode === "dots") return <DotsPlay parsed={parsed} />;
  if (mode === "column") return <ColumnPlay parsed={parsed} />;
  if (mode === "groups") return <GroupsPlay parsed={parsed} />;
  if (mode === "share") return <SharePlay parsed={parsed} />;
  return null;
}

export function canAnimate(parsed: ParsedArithmetic | null): boolean {
  return parsed != null && pickMode(parsed) != null;
}

function pickMode(p: ParsedArithmetic): "dots" | "column" | "groups" | "share" | null {
  if (p.op === "×") {
    return p.operands.every((n) => n >= 1 && n <= 12) ? "groups" : null;
  }
  if (p.op === "÷") {
    const [a, b] = p.operands;
    return a <= 60 && b >= 2 && b <= 12 && p.answer <= 12 ? "share" : null;
  }
  // + / − : concrete dots while numbers are small, columns once they're not.
  if (p.operands.length === 2 && p.operands.every((n) => n <= 12) && p.answer <= 24) {
    return "dots";
  }
  if (p.operands.every((n) => n <= 999) && p.answer <= 9999) return "column";
  return null;
}

/** Shared chrome: caption + replay + step dots. */
function Player({
  steps,
  stepMs,
  children,
}: {
  steps: string[];
  stepMs: number;
  children: (step: number) => React.ReactNode;
}) {
  const [step, setStep] = useState(0);
  // Auto-play walks through once, but the moment the kid takes the controls
  // (Next / Replay) the pacing is theirs — slow readers shouldn't be rushed.
  const [manual, setManual] = useState(false);

  useEffect(() => {
    if (manual || step >= steps.length - 1) return;
    const t = setTimeout(() => setStep((s) => s + 1), stepMs);
    return () => clearTimeout(t);
  }, [step, steps.length, stepMs, manual]);

  const atEnd = step >= steps.length - 1;

  return (
    <div>
      {children(step)}
      <p key={step} className="animate-pop mt-3 min-h-10 text-center text-sm font-bold text-slate-600">
        {steps[step]}
      </p>
      <div className="mt-1 flex items-center justify-center gap-2">
        <div className="flex gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i <= step ? "bg-violet-400" : "bg-slate-200"}`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            setManual(true);
            setStep(0);
          }}
          className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200 hover:text-slate-700"
        >
          ↻ Replay
        </button>
        {!atEnd && (
          <button
            onClick={() => {
              setManual(true);
              setStep((s) => Math.min(s + 1, steps.length - 1));
            }}
            className="rounded-full bg-violet-500 px-3 py-1 text-xs font-extrabold text-white hover:bg-violet-600"
          >
            Next ▶
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- dots: concrete counting for small + / − -------------------------- */

function DotsPlay({ parsed }: { parsed: ParsedArithmetic }) {
  const [a, b] = parsed.operands;
  const add = parsed.op === "+";
  const steps = add
    ? [`Start with ${a}`, `Now add ${b} more`, `Count them all → ${parsed.answer}!`]
    : [`Start with ${a}`, `Take away ${b}`, `${parsed.answer} left!`];

  return (
    <Player steps={steps} stepMs={1800}>
      {(step) => (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: a }).map((_, i) => {
            const crossed = !add && step >= 1 && i >= a - b;
            return (
              <Dot
                key={`a${i}`}
                className={
                  crossed
                    ? "bg-slate-200 opacity-50 line-through"
                    : "bg-gradient-to-br from-sky-300 to-blue-500"
                }
                crossed={crossed}
                pulse={step === 2 && !crossed}
                delay={i * 60}
              />
            );
          })}
          {add &&
            step >= 1 &&
            Array.from({ length: b }).map((_, i) => (
              <Dot
                key={`b${i}`}
                className="bg-gradient-to-br from-amber-300 to-orange-500"
                pulse={step === 2}
                delay={i * 60}
              />
            ))}
          {step === 2 && (
            <span className="animate-pop ml-2 rounded-full bg-emerald-100 px-3 py-1 font-display text-2xl font-extrabold text-emerald-700">
              {parsed.answer}
            </span>
          )}
        </div>
      )}
    </Player>
  );
}

function Dot({
  className,
  crossed,
  pulse,
  delay,
}: {
  className: string;
  crossed?: boolean;
  pulse?: boolean;
  delay: number;
}) {
  return (
    <span
      className={`animate-pop relative grid h-7 w-7 place-items-center rounded-full ${className} ${
        pulse ? "animate-cheer" : ""
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {crossed && <span className="text-lg font-extrabold text-rose-500">✕</span>}
    </span>
  );
}

/* ---- column: place-value + with carries, − with borrowing --------------- */

type ColumnStep = {
  caption: string;
  activeCol: number | null; // 0 = ones (rightmost)
  carries: (number | null)[]; // shown above column i (LSB-first)
  tops: (number | null)[]; // replacement top digits after borrowing
  crossed: boolean[]; // original top digit crossed out
  borrowedIn: boolean[]; // little ¹ shown before the top digit
  revealed: number; // how many answer digits (from the right) are visible
  done: boolean;
};

const PLACE = ["ones", "tens", "hundreds", "thousands"];

function buildColumnSteps(p: ParsedArithmetic) {
  const width = Math.max(...[...p.operands, p.answer].map((n) => String(n).length));
  const digitsOf = (n: number) =>
    [...paddedDigits(n, width)].reverse().map((d) => (d === "" ? 0 : Number(d)));
  const rows = p.operands.map(digitsOf);

  const steps: ColumnStep[] = [];
  const blank = {
    carries: Array(width).fill(null) as (number | null)[],
    tops: Array(width).fill(null) as (number | null)[],
    crossed: Array(width).fill(false) as boolean[],
    borrowedIn: Array(width).fill(false) as boolean[],
  };
  const snap = () => ({
    carries: [...blank.carries],
    tops: [...blank.tops],
    crossed: [...blank.crossed],
    borrowedIn: [...blank.borrowedIn],
  });

  steps.push({
    caption: p.op === "+" ? "Line up the numbers, then add each column →" : "Line up the numbers, then subtract each column →",
    activeCol: null,
    ...snap(),
    revealed: 0,
    done: false,
  });

  if (p.op === "+") {
    let carry = 0;
    for (let c = 0; c < width; c++) {
      const parts = rows.map((r) => r[c]).filter((_, ri) => c < String(p.operands[ri]).length);
      const sum = parts.reduce((x, y) => x + y, 0) + carry;
      const out = Math.floor(sum / 10);
      const caption =
        `${parts.join(" + ")}${carry ? ` + ${carry} (carried)` : ""} = ${sum}` +
        (out ? ` — write ${sum % 10}, carry ${out}` : "") +
        ` (${PLACE[c]})`;
      carry = out;
      if (out && c + 1 < width) blank.carries[c + 1] = out;
      steps.push({ caption, activeCol: c, ...snap(), revealed: c + 1, done: false });
    }
  } else {
    const tops = [...rows[0]];
    const bottom = rows[1];
    for (let c = 0; c < width; c++) {
      let caption: string;
      if (tops[c] < bottom[c]) {
        // borrow, walking left across zeros if needed
        let j = c + 1;
        while (tops[j] === 0) {
          blank.crossed[j] = true;
          blank.tops[j] = 9;
          tops[j] = 9;
          j++;
        }
        blank.crossed[j] = true;
        blank.tops[j] = tops[j] - 1;
        tops[j] -= 1;
        tops[c] += 10;
        blank.borrowedIn[c] = true;
        caption = `${tops[c] - 10} is smaller than ${bottom[c]}, so borrow a ten → ${tops[c]} − ${bottom[c]} = ${tops[c] - bottom[c]} (${PLACE[c]})`;
      } else {
        caption = `${tops[c]} − ${bottom[c]} = ${tops[c] - bottom[c]} (${PLACE[c]})`;
      }
      tops[c] -= bottom[c];
      steps.push({ caption, activeCol: c, ...snap(), revealed: c + 1, done: false });
    }
  }

  steps.push({
    caption: `${p.operands.join(` ${p.op} `)} = ${p.answer} 🎉`,
    activeCol: null,
    ...snap(),
    revealed: width,
    done: true,
  });
  return { steps, width };
}

function ColumnPlay({ parsed }: { parsed: ParsedArithmetic }) {
  const { steps, width } = useMemo(() => buildColumnSteps(parsed), [parsed]);
  const answerDigits = paddedDigits(parsed.answer, width);

  return (
    <Player steps={steps.map((s) => s.caption)} stepMs={2400}>
      {(stepIdx) => {
        const s = steps[stepIdx];
        // column index in display order (0 = leftmost)
        const activeDisplay = s.activeCol == null ? null : width - 1 - s.activeCol;
        const colBg = (i: number) =>
          activeDisplay === i ? "rounded-lg bg-amber-100" : "";

        return (
          <div className="flex justify-center">
            <div className="inline-block">
              {/* carries / borrow replacements */}
              <div className="flex justify-end gap-1">
                <span className="w-7" />
                {Array.from({ length: width }).map((_, i) => {
                  const lsb = width - 1 - i;
                  const carry = s.carries[lsb];
                  const newTop = s.tops[lsb];
                  return (
                    <span
                      key={i}
                      className={`w-9 text-center font-display text-lg font-extrabold ${
                        carry != null ? "animate-pop text-orange-500" : "text-violet-500"
                      }`}
                    >
                      {carry ?? (newTop != null ? <span className="animate-pop inline-block">{newTop}</span> : "")}
                    </span>
                  );
                })}
              </div>
              {/* operand rows */}
              {parsed.operands.map((n, row) => {
                const last = row === parsed.operands.length - 1;
                return (
                  <div key={row} className="flex items-center justify-end gap-1">
                    <span className="w-7 text-right font-display text-3xl font-extrabold text-[var(--brand-blue)]">
                      {last ? parsed.op : ""}
                    </span>
                    {paddedDigits(n, width).map((d, i) => {
                      const lsb = width - 1 - i;
                      const crossedHere = row === 0 && s.crossed[lsb];
                      const borrowedHere = row === 0 && s.borrowedIn[lsb];
                      return (
                        <span
                          key={i}
                          className={`w-9 text-center font-display text-3xl font-extrabold tabular-nums ${colBg(i)} ${
                            crossedHere ? "text-slate-300 line-through" : "text-slate-800"
                          }`}
                        >
                          {borrowedHere && (
                            <span className="animate-pop align-super text-base text-violet-500">1</span>
                          )}
                          {d}
                        </span>
                      );
                    })}
                  </div>
                );
              })}
              <div className="mt-1 h-1 rounded-full bg-slate-700" style={{ marginLeft: "1.75rem" }} />
              {/* answer row */}
              <div className="flex justify-end gap-1 pt-1">
                <span className="w-7" />
                {answerDigits.map((d, i) => {
                  const lsb = width - 1 - i;
                  const shown = lsb < s.revealed && d !== "";
                  return (
                    <span
                      key={i}
                      className={`w-9 text-center font-display text-3xl font-extrabold tabular-nums ${colBg(i)} ${
                        s.done ? "animate-cheer text-emerald-600" : "text-emerald-600"
                      }`}
                    >
                      {shown ? <span className="animate-pop inline-block">{d}</span> : ""}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    </Player>
  );
}

/* ---- groups: multiplication array builds row by row --------------------- */

function GroupsPlay({ parsed }: { parsed: ParsedArithmetic }) {
  const [a, b] = parsed.operands;
  const steps = [
    `${a} × ${b} means ${a} groups of ${b}`,
    ...Array.from({ length: a }, (_, i) => `${i + 1} ${i === 0 ? "group" : "groups"} of ${b} → ${(i + 1) * b}`),
    `${a} × ${b} = ${parsed.answer} 🎉`,
  ];
  return (
    <Player steps={steps} stepMs={1400}>
      {(step) => {
        const rowsShown = Math.min(Math.max(step, 0), a);
        return (
          <div className="flex flex-col items-center gap-1.5">
            {Array.from({ length: rowsShown }).map((_, r) => (
              <div key={r} className="flex items-center gap-1.5">
                {Array.from({ length: b }).map((_, c) => (
                  <span
                    key={c}
                    className="animate-pop block h-5 w-5 rounded-full bg-gradient-to-br from-amber-300 to-orange-400"
                    style={{ animationDelay: `${c * 40}ms` }}
                  />
                ))}
                <span className="ml-1 w-8 text-sm font-extrabold text-slate-400">
                  {(r + 1) * b}
                </span>
              </div>
            ))}
          </div>
        );
      }}
    </Player>
  );
}

/* ---- share: division deals dots into groups ----------------------------- */

function SharePlay({ parsed }: { parsed: ParsedArithmetic }) {
  const [a, b] = parsed.operands;
  const per = parsed.answer;
  const steps = [
    `Share ${a} fairly between ${b} groups`,
    ...Array.from({ length: per }, (_, i) => `Give 1 to each group — that's ${(i + 1) * b} of ${a}`),
    `Each group gets ${per}. ${a} ÷ ${b} = ${per} 🎉`,
  ];
  return (
    <Player steps={steps} stepMs={1500}>
      {(step) => {
        const rounds = Math.min(Math.max(step, 0), per);
        return (
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: b }).map((_, g) => (
              <div
                key={g}
                className="flex min-h-12 min-w-12 flex-wrap items-center justify-center gap-1 rounded-2xl bg-white p-2 ring-2 ring-violet-200"
              >
                {Array.from({ length: rounds }).map((_, i) => (
                  <span
                    key={i}
                    className="animate-pop block h-4 w-4 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-500"
                    style={{ animationDelay: `${g * 50}ms` }}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      }}
    </Player>
  );
}
