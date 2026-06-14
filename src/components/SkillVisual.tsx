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
    // shapes — only when the prompt actually names one (don't spoil "which shape…")
    if (/shape/.test(skill ?? "")) {
      const sm = prompt.match(/\b(triangle|square|rectangle|pentagon|hexagon|octagon)\b/);
      if (sm) return <Shape name={sm[1]} />;
    }
    // counting — a trailing run of one repeated emoji ("How many 🍎? 🍎🍎🍎")
    if (/^How many/.test(prompt)) {
      const tail = prompt.trim().split(/\s+/).pop() ?? "";
      const chars = [...tail];
      if (chars.length >= 2 && chars.every((c) => c === chars[0]))
        return <CountDots n={chars.length} emoji={chars[0]} />;
    }
    // rectangle area / perimeter — draw the unit grid
    const rect = prompt.match(/rectangle is (\d+) cm by (\d+) cm\.\s*What is its (area|perimeter)/);
    if (rect) {
      const l = +rect[1];
      const w = +rect[2];
      if (l >= 1 && l <= 12 && w >= 1 && w <= 12)
        return <RectGrid l={l} w={w} mode={rect[3] as "area" | "perimeter"} />;
    }
    // division — q equal groups of b make a
    const div = prompt.match(/(\d+)\s*÷\s*(\d+)\s*=/);
    if (div) {
      const a = +div[1];
      const b = +div[2];
      if (b >= 1 && b <= 12 && a % b === 0 && a / b <= 12) return <Groups rows={a / b} per={b} />;
    }
    // arrays — "R rows of C"
    const arr = prompt.match(/(\d+)\s*rows of\s*(\d+)/);
    if (arr) {
      const r = +arr[1];
      const c = +arr[2];
      if (r >= 1 && r <= 12 && c >= 1 && c <= 12) return <Groups rows={r} per={c} />;
    }
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

function RectGrid({ l, w, mode }: { l: number; w: number; mode: "area" | "perimeter" }) {
  return (
    <div>
      <div className="mx-auto flex w-fit flex-col gap-0.5">
        {Array.from({ length: w }).map((_, r) => (
          <div key={r} className="flex gap-0.5">
            {Array.from({ length: l }).map((_, c) => {
              const edge = r === 0 || r === w - 1 || c === 0 || c === l - 1;
              const lit = mode === "area" || edge;
              return (
                <span
                  key={c}
                  className={`animate-pop block h-4 w-4 rounded-[3px] sm:h-5 sm:w-5 ${
                    lit
                      ? "bg-gradient-to-br from-emerald-300 to-green-500"
                      : "bg-emerald-50 ring-1 ring-emerald-100"
                  }`}
                  style={{ animationDelay: `${(r * l + c) * 25}ms` }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        {mode === "area"
          ? `${l} × ${w} = ${l * w} squares inside`
          : `2 × (${l} + ${w}) = ${2 * (l + w)} cm around the edge`}
      </p>
    </div>
  );
}

function CountDots({ n, emoji }: { n: number; emoji: string }) {
  return (
    <div>
      <div className="mx-auto flex max-w-xs flex-wrap justify-center gap-1.5">
        {Array.from({ length: n }).map((_, i) => (
          <span
            key={i}
            className="animate-pop text-2xl leading-none"
            style={{ animationDelay: `${i * 70}ms` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-sm font-bold text-slate-500">
        Count them one by one → {n}
      </p>
    </div>
  );
}

// Regular-polygon points (centered in a 100×100 box), flat side down.
function polygon(sides: number, r = 42, cx = 50, cy = 52) {
  const start = -Math.PI / 2 + (sides % 2 === 0 ? Math.PI / sides : 0);
  return Array.from({ length: sides }, (_, i) => {
    const a = start + (i * 2 * Math.PI) / sides;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

function Shape({ name }: { name: string }) {
  const sides: Record<string, number> = {
    triangle: 3, square: 4, pentagon: 5, hexagon: 6, octagon: 8,
  };
  return (
    <div className="grid place-items-center py-1">
      <svg viewBox="0 0 100 100" className="animate-pop h-28 w-28">
        {name === "rectangle" ? (
          <rect x="14" y="28" width="72" height="44" rx="4" className="animate-sway"
            fill="url(#shapeGrad)" stroke="#7c3aed" strokeWidth="3" style={{ transformOrigin: "center" }} />
        ) : (
          <polygon points={polygon(sides[name] ?? 4)} className="animate-sway"
            fill="url(#shapeGrad)" stroke="#7c3aed" strokeWidth="3" style={{ transformOrigin: "center" }} />
        )}
        <defs>
          <linearGradient id="shapeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>
      <p className="text-center text-sm font-bold text-slate-500">
        A {name} has {name === "rectangle" ? 4 : sides[name] ?? "?"} sides
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
