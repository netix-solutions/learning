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
import { HomeLearningChoices } from "@/components/HomeLearningChoices";
import { type StudentSummary, type Subject } from "@/lib/types";
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
          <SignOutButton className="min-h-12" />
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

      <HomeLearningChoices grade={profile.grade} subjects={(subjects ?? []) as Subject[]} />

      {/* Daily treasure chest — practicing unlocks it */}
      <DailyChest initialState={chestState} reward={chestClaim?.reward} />

      {/* Weekly quest */}
      {quest && !("error" in quest) && <QuestCard initial={quest} />}

      {/* Time goal set by a grown-up */}
      {goal && <GoalProgressCard p={goal} />}

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

      <details className="card-fun mt-5 p-4">
        <summary className="min-h-12 cursor-pointer rounded-xl p-3 text-lg font-bold text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-700">
          My badges · {earned.size} earned
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(badges as Badge[]).map(b => <div key={b.id} className={`rounded-2xl p-3 ${earned.has(b.id) ? "bg-amber-50" : "bg-slate-50"}`}>
            <span aria-hidden="true" className="text-3xl">{earned.has(b.id) ? b.emoji : "🔒"}</span>
            <p className="mt-2 text-base font-bold text-slate-800">{b.name}</p>
            <p className="mt-1 text-sm text-slate-600">{earned.has(b.id) ? "Earned!" : b.description}</p>
          </div>)}
        </div>
      </details>

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
