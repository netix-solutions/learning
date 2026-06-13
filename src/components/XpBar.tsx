/** Level math: every 100 XP is a new level. */
export function xpLevel(xp: number) {
  const level = Math.floor(xp / 100) + 1;
  const into = xp % 100;
  return { level, into, toNext: 100 - into };
}

export function XpBar({ xp }: { xp: number }) {
  const { level, into } = xpLevel(xp);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-baseline justify-between font-bold text-slate-700">
        <span className="font-display text-lg">Level {level}</span>
        <span className="text-sm text-slate-500">{into} / 100 XP</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-white/70 ring-2 ring-white">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${into}%`,
            background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))",
          }}
        />
      </div>
    </div>
  );
}
