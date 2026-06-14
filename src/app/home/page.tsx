import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { SignOutButton } from "@/components/SignOutButton";
import { SwitchToParentButton } from "@/components/SwitchToParentButton";
import { XpBar } from "@/components/XpBar";
import { subjectTheme, gradeLabel, type StudentSummary, type Subject } from "@/lib/types";

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

  const [{ data: summaryData }, { data: subjects }, { data: badges }] =
    await Promise.all([
      supabase.rpc("get_student_summary", { p_student_id: user.id }),
      supabase.from("subjects").select("*").order("sort"),
      supabase.from("badges").select("*").order("sort"),
    ]);

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
        <div className="flex items-center gap-2">
          <SwitchToParentButton />
          <SignOutButton />
        </div>
      </header>

      {/* Hero */}
      <section className="card-fun relative overflow-hidden p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-amber-100 text-5xl ring-4 ring-white">
            {profile.avatar}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-bold text-slate-800">
              Hi, {profile.display_name}!
            </h1>
            <p className="font-semibold text-slate-500">
              {gradeLabel(profile.grade)} · Let&apos;s stay sharp today ☀️
            </p>
          </div>
          <div className="ml-auto hidden text-center sm:block">
            <div className={`text-4xl ${streak > 0 ? "animate-float" : "opacity-40"}`}>🔥</div>
            <div className="font-display text-2xl font-bold text-slate-800">{streak}</div>
            <div className="text-xs font-bold uppercase text-slate-400">day streak</div>
          </div>
        </div>
        <div className="mt-5">
          <XpBar xp={profile.xp} />
        </div>
      </section>

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
