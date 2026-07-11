import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar } from "@/components/Avatar";
import { SignOutButton } from "@/components/SignOutButton";
import { XpBar } from "@/components/XpBar";
import { GoalProgressCard } from "@/components/GoalProgressCard";
import { DailyChest } from "@/components/DailyChest";
import { QuestCard, type QuestStatus } from "@/components/QuestCard";
import { subjectTheme, type StudentSummary, type Subject } from "@/lib/types";
import type { GoalProgress } from "@/lib/goals";

type Badge = {
  id: string;
  name: string;
  description: string;
  emoji: string;
};

export default async function StudentHome() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");

  // The chest RPC and record_attempt use UTC current_date, so match it here.
  const todayUtc = new Date().toISOString().slice(0, 10);

  const [
    { data: summaryData },
    { data: subjects },
    { data: badges },
    { data: goalData },
    { data: chestClaim },
    { data: practicedToday },
    { data: questData },
  ] = await Promise.all([
    supabase.rpc("get_student_summary", { p_student_id: user.id }),
    // Only show subjects that have questions for this child's grade — e.g.
    // Pre-K shouldn't see civics, economics, geography, or history.
    supabase.rpc("get_grade_subjects", { p_grade: profile.grade }),
    supabase.from("badges").select("*").order("sort"),
    supabase.rpc("get_my_goal_progress"),
    supabase.from("chest_claims").select("reward").eq("day", todayUtc).maybeSingle(),
    supabase.from("attempts").select("id").gte("created_at", todayUtc).limit(1),
    supabase.rpc("weekly_quest_status"),
  ]);
  const quest = questData as QuestStatus | null;
  const shields = (profile as { streak_shields?: number }).streak_shields ?? 0;
  const goal = goalData as GoalProgress | null;
  const chestState = chestClaim
    ? ("opened" as const)
    : practicedToday?.length
      ? ("ready" as const)
      : ("locked" as const);

  const summary = summaryData as StudentSummary;
  const correctBySubject = new Map(
    summary.subjects.map((s) => [s.subject_id, s.correct]),
  );
  const earned = new Set(summary.badges.map((b) => b.id));
  const streak = profile.streak_count;

  const totalCorrect = summary.subjects.reduce((n, s) => n + s.correct, 0);

  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <BrandLogo href={null} />
        {/* "Grown-up" (switch to parent) lives in the kid footer, so the top
            bar just needs Sign out — keeps the logo from crowding on phones. */}
        <div className="flex shrink-0 items-center gap-2">
          <SignOutButton />
        </div>
      </header>

      {/* Identity hero — compact: avatar, name, XP bar, and a streak pill. Kept
          small on purpose so the big Play button below is the loudest thing on
          the screen. */}
      <section className="card-fun flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white sm:h-16 sm:w-16">
          <Avatar id={profile.avatar} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold text-slate-800 sm:text-2xl">
            Hi, {profile.display_name}!
          </h1>
          <div className="mt-1.5">
            <XpBar xp={profile.xp} />
          </div>
        </div>
        {/* Streak + shields */}
        <div
          className={`flex shrink-0 flex-col items-center rounded-2xl px-3 py-1.5 ${
            streak > 0 ? "bg-orange-50" : "bg-slate-50"
          }`}
        >
          <div className={`text-2xl ${streak > 0 ? "animate-float" : "opacity-40"}`}>🔥</div>
          <div className="font-display text-lg font-bold leading-none text-slate-800">
            {streak}
          </div>
          {shields > 0 && (
            <div className="mt-1 text-[0.65rem] font-extrabold text-sky-700">🛡️×{shields}</div>
          )}
        </div>
      </section>

      {/* ★ THE main action. One giant, unmistakable button that drops the kid
          straight into an adaptive mix — no choosing required. Everything else
          on the page is deliberately quieter than this. */}
      <Link
        href="/practice/daily"
        className="btn-pop group mt-5 flex items-center gap-4 px-6 py-6 text-white sm:py-7"
        style={{ background: "linear-gradient(100deg, var(--brand-orange), #ffb020)" }}
      >
        <span className="text-5xl transition-transform group-active:scale-90 sm:text-6xl">🚀</span>
        <span className="text-left">
          <span className="block font-display text-3xl font-extrabold leading-tight sm:text-4xl">
            Play!
          </span>
          <span className="block text-sm font-semibold text-white/90 sm:text-base">
            A fun mix, just for you
          </span>
        </span>
        <span className="ml-auto text-3xl opacity-80 transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>

      {/* Daily treasure chest — practicing unlocks it */}
      <DailyChest initialState={chestState} reward={chestClaim?.reward} />

      {/* Weekly quest */}
      {quest && !("error" in quest) && <QuestCard initial={quest} />}

      {/* Time goal set by a grown-up */}
      {goal && <GoalProgressCard p={goal} />}

      {/* ---- Secondary tier: choose a subject, collect cards, see badges ---- */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-slate-600">
        Or pick a subject 👇
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(subjects as Subject[]).map((s) => {
          const theme = subjectTheme(s.color);
          const correct = correctBySubject.get(s.id) ?? 0;
          return (
            <Link
              key={s.id}
              href={`/practice/${s.id}`}
              className={`btn-pop card-fun flex flex-col items-center gap-2 p-4 text-center ring-4 ${theme.ring}`}
            >
              <span
                className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-3xl shadow-inner`}
              >
                {s.emoji}
              </span>
              <span className="font-display text-base font-bold leading-tight text-slate-800">
                {s.name}
              </span>
              {/* Only show a count once there's something to celebrate — a brand
                  new kid shouldn't face a wall of "0 correct". */}
              {correct > 0 && (
                <span className="text-xs font-bold text-emerald-600">{correct} correct ⭐</span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sticker Book — spend points on surprise sticker packs & collect them all */}
      <Link
        href="/shop"
        className="btn-pop card-fun mt-4 flex items-center gap-4 p-4"
        style={{ background: "linear-gradient(120deg, #faf5ff, #eff6ff)" }}
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-200 to-fuchsia-200 text-2xl shadow-inner">
          🃏
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold text-slate-800">My Cards</span>
          <span className="text-sm font-semibold text-slate-500">Open packs &amp; collect them all! ✨</span>
        </span>
        <span className="ml-auto text-2xl text-slate-300">→</span>
      </Link>

      {/* Badges */}
      <h2 className="mb-3 mt-8 font-display text-lg font-bold text-slate-600">
        {earned.size > 0 ? (
          <>
            Your badges{" "}
            <span className="text-slate-400">
              ({earned.size}/{(badges as Badge[]).length})
            </span>
          </>
        ) : (
          <>Badges to unlock 🏅</>
        )}
      </h2>
      <section className="card-fun grid grid-cols-4 gap-3 p-4 sm:grid-cols-5">
        {(badges as Badge[]).map((b) => {
          const have = earned.has(b.id);
          return (
            <div
              key={b.id}
              title={b.description}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2.5 text-center ${
                have ? "bg-amber-50" : "bg-slate-50"
              }`}
            >
              <span className={`text-3xl ${have ? "" : "opacity-25 grayscale"}`}>
                {have ? b.emoji : "🔒"}
              </span>
              <span
                className={`text-[0.65rem] font-bold leading-tight ${
                  have ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {b.name}
              </span>
            </div>
          );
        })}
      </section>

      {/* Lifetime stats — only once the kid has actually done something, so the
          first-ever visit never shows "0 questions · 0% correct". */}
      {summary.totals.attempts > 0 && (
        <p className="mt-8 text-center text-sm font-semibold text-slate-400">
          {totalCorrect > 0 ? `${totalCorrect} answers right` : `${summary.totals.attempts} tried`} ·{" "}
          {summary.totals.accuracy}% correct 🎯
        </p>
      )}
    </main>
  );
}
