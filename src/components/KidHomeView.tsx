import Link from "next/link";
import { xpLevel } from "@/components/XpBar";
import { subjectTheme, gradeLabel, type Grade } from "@/lib/types";

export type KidHomeData = {
  name: string;
  avatar: string;
  grade: Grade | null;
  xp: number;
  streak: number;
  totals: { attempts: number; correct: number; accuracy: number };
  subjects: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    attempts: number;
    correct: number;
  }[];
  badges: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    earned: boolean;
  }[];
};

/** A circular progress ring with centered content. */
function Ring({
  pct,
  size = 60,
  stroke = 6,
  trackClass = "text-white/25",
  fillClass = "text-white",
  children,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  trackClass?: string;
  fillClass?: string;
  children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke="currentColor" className={trackClass} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          className={fillClass}
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

function StatTile({
  emoji,
  value,
  label,
  className,
}: {
  emoji: string;
  value: string | number;
  label: string;
  className: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 ring-2 ring-white ${className}`}>
      <span className="text-2xl">{emoji}</span>
      <span className="min-w-0">
        <span className="block font-display text-xl font-extrabold leading-none text-slate-800">
          {value}
        </span>
        <span className="block text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </span>
    </div>
  );
}

/**
 * "Game HQ" kid home: a compact identity bar, a big Daily-Challenge quest hero
 * with a level ring, quick stat tiles, subject cards with progress rings, and a
 * scrollable trophy shelf. Presentational — the page supplies real or mock data.
 */
export function KidHomeView({ data }: { data: KidHomeData }) {
  const { level, into } = xpLevel(data.xp);
  const earnedCount = data.badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-5">
      {/* Identity bar */}
      <div className="flex items-center gap-3">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-100 text-3xl ring-4 ring-white">
          {data.avatar}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold text-slate-800">
            Hi, {data.name}!
          </h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-slate-500 ring-1 ring-white">
            ⭐ Level {level} · {gradeLabel(data.grade)}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-extrabold text-orange-700">
            <span className={data.streak > 0 ? "animate-float" : "opacity-40"}>🔥</span>
            {data.streak}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-extrabold text-amber-700">
            ⭐ {data.xp}
          </span>
        </div>
      </div>

      {/* Today's Quest hero */}
      <Link
        href="/practice/daily"
        className="btn-pop group flex items-center gap-4 p-5 text-white sm:p-6"
        style={{
          background: "linear-gradient(110deg, var(--brand-blue), var(--brand-wave))",
          borderRadius: "2rem",
        }}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-white/80">
            Today&apos;s Quest
          </span>
          <span className="mt-0.5 block font-display text-2xl font-extrabold sm:text-3xl">
            Daily Challenge ⭐
          </span>
          <span className="mt-0.5 block text-white/90">
            A fresh mix of math, reading &amp; science!
          </span>
          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-5 py-2 font-display font-extrabold text-[var(--brand-blue)] transition-transform group-hover:translate-x-0.5">
            Start <span aria-hidden>→</span>
          </span>
        </span>
        <Ring pct={into} size={84} stroke={8}>
          <span className="text-center leading-none">
            <span className="block font-display text-xl font-extrabold">{level}</span>
            <span className="block text-[0.6rem] font-bold uppercase tracking-wide text-white/80">
              level
            </span>
          </span>
        </Ring>
      </Link>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatTile emoji="🔥" value={data.streak} label="Day streak" className="bg-orange-50" />
        <StatTile emoji="⭐" value={data.xp} label="Points" className="bg-amber-50" />
        <StatTile emoji="🎯" value={`${data.totals.accuracy}%`} label="Correct" className="bg-emerald-50" />
      </div>

      {/* Subjects */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold text-slate-700">Pick a subject</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {data.subjects.map((s) => {
            const theme = subjectTheme(s.color);
            const pct = s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
            return (
              <Link
                key={s.id}
                href={`/practice/${s.id}`}
                className="btn-pop card-fun group flex items-center gap-3 p-4"
              >
                <span
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-3xl shadow-inner transition-transform group-hover:scale-110`}
                >
                  {s.emoji}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-bold text-slate-800">
                    {s.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">
                    {s.attempts > 0 ? `${s.correct} correct` : "Let's start!"}
                  </span>
                </span>
                <Ring
                  pct={pct}
                  size={46}
                  stroke={5}
                  trackClass="text-slate-100"
                  fillClass={theme.text}
                >
                  <span className="text-xs font-extrabold text-slate-600">
                    {s.attempts > 0 ? `${pct}%` : "★"}
                  </span>
                </Ring>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Trophy shelf */}
      <div>
        <h2 className="mb-3 font-display text-xl font-bold text-slate-700">
          Trophies{" "}
          <span className="text-slate-400">
            ({earnedCount}/{data.badges.length})
          </span>
        </h2>
        <div className="card-fun flex gap-3 overflow-x-auto p-4">
          {data.badges.map((b) => (
            <div
              key={b.id}
              title={b.description}
              className={`flex w-20 shrink-0 flex-col items-center gap-1 rounded-2xl p-2 text-center ${
                b.earned ? "bg-amber-50" : "bg-slate-50"
              }`}
            >
              <span className={`text-3xl ${b.earned ? "" : "opacity-25 grayscale"}`}>
                {b.earned ? b.emoji : "🔒"}
              </span>
              <span
                className={`text-[0.65rem] font-bold leading-tight ${
                  b.earned ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
