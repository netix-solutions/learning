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
import { subjectTheme, gradeLabel, type StudentSummary, type Subject } from "@/lib/types";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-2">
        <BrandLogo href={null} />
        {/* "Grown-up" (switch to parent) lives in the kid footer, so the top
            bar just needs Sign out — keeps the logo from crowding on phones. */}
        <div className="flex shrink-0 items-center gap-2">
          <SignOutButton />
        </div>
      </header>

      {/* Hero */}
      <section className="card-fun relative overflow-hidden p-5 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white sm:h-20 sm:w-20">
            <Avatar id={profile.avatar} className="h-full w-full" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-2xl font-bold text-slate-800 sm:text-3xl">
              Hi, {profile.display_name}!
            </h1>
            <p className="truncate text-sm font-semibold text-slate-500 sm:text-base">
              {gradeLabel(profile.grade)} · Let&apos;s go! ☀️
            </p>
          </div>
          {/* Streak + shields: always visible (kids are mostly on phones). */}
          <div className="flex shrink-0 flex-col items-center">
            <div className={`text-3xl sm:text-4xl ${streak > 0 ? "animate-float" : "opacity-40"}`}>🔥</div>
            <div className="font-display text-xl font-bold text-slate-800 sm:text-2xl">{streak}</div>
            <div className="text-[0.6rem] font-bold uppercase text-slate-400 sm:text-xs">day streak</div>
            {shields > 0 && (
              <div className="mt-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-extrabold text-sky-700">
                🛡️ ×{shields}
              </div>
            )}
          </div>
        </div>
        <div className="mt-5">
          <XpBar xp={profile.xp} />
        </div>
      </section>

      {/* Daily treasure chest — practicing unlocks it */}
      <DailyChest initialState={chestState} reward={chestClaim?.reward} />

      {/* Weekly quest */}
      {quest && !("error" in quest) && <QuestCard initial={quest} />}

      {/* Time goal set by a grown-up */}
      {goal && <GoalProgressCard p={goal} />}

      {/* Daily challenge */}
      <Link
        href="/practice/daily"
        className="btn-pop mt-5 flex items-center gap-4 px-6 py-5 text-white"
        style={{
          background: "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))",
        }}
      >
        <span className="text-4xl">⭐</span>
        <span className="text-left">
          <span className="block font-display text-2xl font-bold">Daily Challenge</span>
          <span className="block text-white/90">A fresh mix of math, reading &amp; science!</span>
        </span>
        <span className="ml-auto text-3xl">→</span>
      </Link>

      {/* Avatar shop + collection album */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/shop" className="btn-pop card-fun flex items-center gap-3 p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-3xl shadow-inner">
            🛍️
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-bold text-slate-800">
              Avatar Shop
            </span>
            <span className="text-sm font-semibold text-slate-500">
              Spend your ⭐ points!
            </span>
          </span>
          <span className="ml-auto text-2xl text-slate-300">→</span>
        </Link>
        <Link href="/collection" className="btn-pop card-fun flex items-center gap-3 p-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky-100 to-violet-100 text-3xl shadow-inner">
            📖
          </span>
          <span className="min-w-0">
            <span className="block font-display text-xl font-bold text-slate-800">
              My Collection
            </span>
            <span className="text-sm font-semibold text-slate-500">
              Collect every avatar!
            </span>
          </span>
          <span className="ml-auto text-2xl text-slate-300">→</span>
        </Link>
      </div>

      {/* Subjects */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Pick a subject
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {(subjects as Subject[]).map((s) => {
          const theme = subjectTheme(s.color);
          return (
            <Link
              key={s.id}
              href={`/practice/${s.id}`}
              className={`btn-pop card-fun flex items-center gap-4 p-5 ring-4 ${theme.ring}`}
            >
              <span
                className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-4xl shadow-inner`}
              >
                {s.emoji}
              </span>
              <span>
                <span className="block font-display text-2xl font-bold text-slate-800">
                  {s.name}
                </span>
                <span className="font-semibold text-slate-500">
                  {correctBySubject.get(s.id) ?? 0} correct
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Badges */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Your badges{" "}
        <span className="text-slate-400">
          ({earned.size}/{(badges as Badge[]).length})
        </span>
      </h2>
      <section className="card-fun grid grid-cols-3 gap-3 p-5 sm:grid-cols-4">
        {(badges as Badge[]).map((b) => {
          const have = earned.has(b.id);
          return (
            <div
              key={b.id}
              title={b.description}
              className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center ${
                have ? "bg-amber-50" : "bg-slate-50"
              }`}
            >
              <span className={`text-4xl ${have ? "" : "opacity-25 grayscale"}`}>
                {have ? b.emoji : "🔒"}
              </span>
              <span
                className={`text-xs font-bold leading-tight ${
                  have ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {b.name}
              </span>
            </div>
          );
        })}
      </section>

      <p className="mt-8 text-center text-sm font-semibold text-slate-400">
        Answered {summary.totals.attempts} questions · {summary.totals.accuracy}% correct
        🎯
      </p>
    </main>
  );
}
