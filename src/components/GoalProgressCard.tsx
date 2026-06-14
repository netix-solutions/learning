import type { GoalProgress } from "@/lib/goals";

/** Kid-facing "today's goal" card: a minutes ring + this week's day dots. */
export function GoalProgressCard({ p }: { p: GoalProgress }) {
  const pct = Math.min(100, Math.round((p.today_minutes / p.minutes_per_day) * 100));
  const size = 64;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct / 100);

  const message = p.week_met
    ? "Weekly goal smashed! 🏆"
    : p.today_met
      ? "Today's goal done! 🎉"
      : `${Math.max(0, p.minutes_per_day - p.today_minutes)} min to go today`;

  return (
    <section className="card-fun mt-5 flex items-center gap-4 p-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} stroke="currentColor" className="text-slate-100" />
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
            className={p.today_met ? "text-emerald-400" : "text-[var(--brand-orange)]"}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center leading-none">
          <span>
            <span className="block font-display text-base font-extrabold text-slate-800">
              {p.today_minutes}
            </span>
            <span className="block text-[0.55rem] font-bold uppercase text-slate-400">min</span>
          </span>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display text-lg font-bold text-slate-800">{message}</p>
        <p className="text-sm text-slate-500">
          Goal: {p.minutes_per_day} min a day, {p.days_per_week} day
          {p.days_per_week === 1 ? "" : "s"} a week
        </p>
        {/* Weekly day dots */}
        <div className="mt-2 flex items-center gap-1.5">
          {Array.from({ length: p.days_per_week }).map((_, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                i < p.week_goal_days
                  ? "bg-emerald-400"
                  : "bg-slate-200"
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold text-slate-400">
            {p.week_goal_days}/{p.days_per_week} this week
          </span>
        </div>
      </div>
    </section>
  );
}
