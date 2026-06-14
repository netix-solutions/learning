"use client";

/**
 * A small, animated visual aid for a practice question. When we can infer a
 * manipulative from the prompt (multiplication groups, a number line, fraction
 * bars) we draw it; otherwise we show a friendly animated tutor mascot. Purely
 * presentational and deterministic — no data leaves the component.
 */
export function SkillVisual({
  prompt,
  skill,
  subject,
}: {
  prompt: string;
  skill?: string | null;
  subject: string;
}) {
  if (subject === "math") {
    const mult = prompt.match(/(\d+)\s*×\s*(\d+)/);
    if (mult) {
      const a = +mult[1];
      const b = +mult[2];
      if (a >= 1 && a <= 12 && b >= 1 && b <= 12) return <Groups rows={a} per={b} />;
    }
    const addsub = prompt.match(/(\d+)\s*([+\-])\s*(\d+)\s*=/);
    if (addsub) {
      const x = +addsub[1];
      const op = addsub[2] as "+" | "-";
      const y = +addsub[3];
      const end = op === "+" ? x + y : x - y;
      if (Math.max(x, y, end) <= 20 && end >= 0) return <NumberLine start={x} op={op} step={y} end={end} />;
    }
  }
  const frac = prompt.match(/\b(\d+)\/(\d+)\b/);
  if (frac && /frac|dec/.test(skill ?? "")) {
    const num = +frac[1];
    const den = +frac[2];
    if (den >= 2 && den <= 12 && num <= den) return <FractionBar num={num} den={den} />;
  }
  return <Mascot />;
}

function Groups({ rows, per }: { rows: number; per: number }) {
  return (
    <div>
      <div className="flex flex-col items-center gap-1.5">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-1.5">
            {Array.from({ length: per }).map((_, c) => (
              <span
                key={c}
                className="animate-pop block h-4 w-4 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 sm:h-5 sm:w-5"
                style={{ animationDelay: `${(r * per + c) * 35}ms` }}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        {rows} groups of {per} = {rows * per}
      </p>
    </div>
  );
}

function NumberLine({ start, op, step, end }: { start: number; op: "+" | "-"; step: number; end: number }) {
  const max = Math.max(start, end);
  const tiles = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <div>
      <div className="flex flex-wrap justify-center gap-1">
        {tiles.map((n) => {
          const isStart = n === start;
          const isEnd = n === end;
          return (
            <span
              key={n}
              className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                isEnd
                  ? "animate-pop bg-emerald-400 text-white"
                  : isStart
                    ? "bg-sky-400 text-white"
                    : "bg-white text-slate-400 ring-1 ring-slate-200"
              }`}
            >
              {n}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        Start at {start}, then {op === "+" ? "hop up" : "hop back"} {step} → {end}
      </p>
    </div>
  );
}

function FractionBar({ num, den }: { num: number; den: number }) {
  return (
    <div>
      <div className="mx-auto flex max-w-xs overflow-hidden rounded-xl ring-2 ring-white">
        {Array.from({ length: den }).map((_, i) => (
          <span
            key={i}
            className={`animate-pop h-10 flex-1 border-r border-white/70 last:border-r-0 ${
              i < num ? "bg-gradient-to-br from-fuchsia-400 to-purple-500" : "bg-slate-100"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        {num} out of {den} parts = {num}/{den}
      </p>
    </div>
  );
}

function Mascot() {
  return (
    <div className="grid place-items-center py-2">
      <div className="animate-float text-6xl">🧠</div>
      <div className="mt-1 flex gap-1">
        {["0ms", "150ms", "300ms"].map((d) => (
          <span
            key={d}
            className="animate-pop block h-2 w-2 rounded-full bg-violet-400"
            style={{ animationDelay: d }}
          />
        ))}
      </div>
    </div>
  );
}
