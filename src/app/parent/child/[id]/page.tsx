import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar } from "@/components/Avatar";
import { SignOutButton } from "@/components/SignOutButton";
import { XpBar } from "@/components/XpBar";
import { SkillBreakdown, type SubjectSkills } from "@/components/SkillBreakdown";
import { GradeStandards, type SubjectStanding } from "@/components/GradeStandards";
import { GoalForm } from "@/components/GoalForm";
import { createAdminClient } from "@/lib/supabase/admin";
import { DEFAULT_DAYS_PER_WEEK, DEFAULT_MINUTES_PER_DAY } from "@/lib/goals";
import { skillStanding } from "@/lib/teaching";
import {
  subjectTheme,
  gradeLabel,
  type SkillMastery,
  type StudentSummary,
} from "@/lib/types";

export default async function ChildDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "parent") redirect("/home");

  // RLS (can_view_student) blocks children that aren't this parent's.
  const { data, error } = await supabase.rpc("get_student_summary", {
    p_student_id: id,
  });
  if (error || !data) redirect("/parent");
  const s = data as StudentSummary;
  const emojiFor = new Map(s.subjects.map((x) => [x.subject_id, x.emoji]));

  // Per-skill mastery, one (already-authorized) RPC per subject, in parallel.
  // Skills the child hasn't touched are dropped so the breakdown stays focused.
  const grade = s.profile.grade;
  const skillsBySubject: SubjectSkills[] = grade
    ? await Promise.all(
        s.subjects.map(async (sub) => {
          const { data: rows } = await supabase.rpc("get_skill_mastery", {
            p_student_id: id,
            p_subject: sub.subject_id,
            p_grade: grade,
          });
          return {
            id: sub.subject_id,
            name: sub.name,
            emoji: sub.emoji,
            color: sub.color,
            skills: ((rows as SkillMastery[]) ?? []).filter((k) => k.attempts > 0),
          };
        }),
      )
    : [];

  // Pair each subject's progress with skill standings for the grade-goals view.
  const subjectStandings: SubjectStanding[] = s.subjects.map((sub) => {
    const sk = skillsBySubject.find((x) => x.id === sub.subject_id);
    const counts = (sk?.skills ?? []).reduce(
      (acc, m) => {
        const st = skillStanding(m);
        if (st === "strong") acc.strong += 1;
        else if (st === "focus") acc.focus += 1;
        return acc;
      },
      { strong: 0, focus: 0 },
    );
    return {
      id: sub.subject_id,
      name: sub.name,
      emoji: sub.emoji,
      color: sub.color,
      attempts: sub.attempts,
      correct: sub.correct,
      strong: counts.strong,
      focus: counts.focus,
    };
  });

  // Current time goal (if any) for the goal-setting form.
  const { data: goalRow } = await createAdminClient()
    .from("child_goals")
    .select("days_per_week, minutes_per_day")
    .eq("child_id", id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <BrandLogo href={null} />
        <SignOutButton />
      </header>

      <Link href="/parent" className="font-bold text-slate-500 hover:text-slate-700">
        ← All kids
      </Link>

      {/* Hero */}
      <section className="card-fun mt-3 p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white">
            <Avatar id={s.profile.avatar} className="h-full w-full" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-800">
              {s.profile.display_name}
            </h1>
            <p className="font-semibold text-slate-500">
              {gradeLabel(s.profile.grade)} · 🔥 {s.profile.streak_count} day streak
            </p>
          </div>
        </div>
        <div className="mt-5">
          <XpBar xp={s.profile.xp} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Questions" value={s.totals.attempts} />
          <Stat label="Correct" value={s.totals.correct} />
          <Stat label="Accuracy" value={`${s.totals.accuracy}%`} />
        </div>
      </section>

      {/* Time goal */}
      <div className="mt-6">
        <GoalForm
          childId={id}
          childName={s.profile.display_name}
          initialDays={goalRow?.days_per_week ?? DEFAULT_DAYS_PER_WEEK}
          initialMinutes={goalRow?.minutes_per_day ?? DEFAULT_MINUTES_PER_DAY}
        />
      </div>

      {/* Subjects */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">By subject</h2>
      <div className="space-y-3">
        {s.subjects.map((sub) => {
          const theme = subjectTheme(sub.color);
          const pct = sub.attempts > 0 ? Math.round((sub.correct / sub.attempts) * 100) : 0;
          return (
            <div key={sub.subject_id} className="card-fun p-4">
              <div className="mb-2 flex items-center justify-between font-bold text-slate-700">
                <span>
                  {sub.emoji} {sub.name}
                </span>
                <span className="text-sm text-slate-500">
                  {sub.attempts > 0 ? `${sub.correct}/${sub.attempts} correct` : "Not started"}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade-level standards explainer + how the child is doing in each */}
      <GradeStandards
        grade={s.profile.grade}
        childName={s.profile.display_name}
        subjects={subjectStandings}
      />

      {/* Skill breakdown — which subtopics they're strong/weak in + how to help */}
      <SkillBreakdown childName={s.profile.display_name} subjects={skillsBySubject} />

      {/* Badges */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Badges earned ({s.badges.length})
      </h2>
      {s.badges.length === 0 ? (
        <p className="card-fun p-5 text-slate-500">No badges yet — keep practicing! 🌱</p>
      ) : (
        <div className="card-fun grid grid-cols-3 gap-3 p-5 sm:grid-cols-4">
          {s.badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1 text-center" title={b.description}>
              <span className="text-4xl">{b.emoji}</span>
              <span className="text-xs font-bold text-slate-600">{b.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">Recent activity</h2>
      {s.recent.length === 0 ? (
        <p className="card-fun p-5 text-slate-500">Nothing yet today.</p>
      ) : (
        <div className="card-fun divide-y divide-slate-100 p-2">
          {s.recent.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <span className="text-2xl">{emojiFor.get(r.subject_id) ?? "📘"}</span>
              <span className="font-semibold text-slate-600">
                {r.is_correct ? "Correct" : "Tried"}
              </span>
              <span className="ml-auto text-sm font-bold text-slate-400">
                {r.is_correct ? `+${r.xp_earned} pts` : "—"} {r.is_correct ? "✅" : "❌"}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 py-3">
      <div className="font-display text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
