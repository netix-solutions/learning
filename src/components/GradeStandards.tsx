import { standardsFor } from "@/lib/standards";
import { gradeLabel, subjectTheme, type Grade } from "@/lib/types";

export type SubjectStanding = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  attempts: number;
  correct: number;
  strong: number; // # of attempted skills the child is strong in
  focus: number; // # of attempted skills needing practice
};

type Verdict = { label: string; chip: string; bar: string };

/** Translate a subject's numbers into a friendly, parent-readable verdict. */
function verdictFor(s: SubjectStanding): Verdict {
  if (s.attempts === 0)
    return {
      label: "Not started yet",
      chip: "bg-slate-100 text-slate-500 ring-slate-200",
      bar: "bg-slate-300",
    };
  const pct = Math.round((s.correct / s.attempts) * 100);
  if (pct >= 80)
    return {
      label: "On track 🎉",
      chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      bar: "bg-emerald-400",
    };
  if (pct >= 60)
    return {
      label: "Building 🌱",
      chip: "bg-amber-50 text-amber-700 ring-amber-100",
      bar: "bg-amber-400",
    };
  return {
    label: "Needs practice 🎯",
    chip: "bg-orange-50 text-orange-700 ring-orange-100",
    bar: "bg-orange-400",
  };
}

/**
 * Parent-facing "grade-level goals" section. For the child's grade, it explains
 * what kids are expected to learn in each subject (aligned to Florida's B.E.S.T.
 * domains) and pairs each with a plain-language read on how this child is doing.
 */
export function GradeStandards({
  grade,
  childName,
  subjects,
}: {
  grade: Grade | null;
  childName: string;
  subjects: SubjectStanding[];
}) {
  if (!grade) return null;
  const withStandards = subjects.filter((s) => standardsFor(grade, s.id));
  if (withStandards.length === 0) return null;

  return (
    <section>
      <h2 className="mb-1 mt-8 font-display text-xl font-bold text-slate-700">
        {gradeLabel(grade)} goals — and how {childName} is doing
      </h2>
      <p className="mb-3 text-sm text-slate-500">
        Here&apos;s what kids are expected to learn in {gradeLabel(grade)}, with a
        simple read on where {childName} stands in each. These goals follow
        Florida&apos;s B.E.S.T. standards.
      </p>

      <div className="space-y-4">
        {withStandards.map((s) => {
          const std = standardsFor(grade, s.id)!;
          const theme = subjectTheme(s.color);
          const verdict = verdictFor(s);
          const pct =
            s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;

          return (
            <div key={s.id} className="card-fun p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`font-display text-lg font-bold ${theme.text}`}>
                  {s.emoji} {s.name}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${verdict.chip}`}
                >
                  {verdict.label}
                </span>
                {s.attempts > 0 && (
                  <span className="ml-auto text-sm font-semibold text-slate-400">
                    {pct}% correct
                  </span>
                )}
              </div>

              {/* Progress toward the grade's expectations, by accuracy so far. */}
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${verdict.bar} transition-[width] duration-500`}
                  style={{ width: `${s.attempts > 0 ? pct : 0}%` }}
                />
              </div>

              {s.attempts > 0 && (s.strong > 0 || s.focus > 0) && (
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {s.strong > 0 && <span className="text-emerald-600">{s.strong} skill{s.strong === 1 ? "" : "s"} strong</span>}
                  {s.strong > 0 && s.focus > 0 && " · "}
                  {s.focus > 0 && <span className="text-orange-600">{s.focus} to practice</span>}
                </p>
              )}

              <p className="mt-4 mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                What kids learn in {gradeLabel(grade)}
              </p>
              <p className="mb-3 text-sm text-slate-500">{std.summary}</p>
              <ul className="space-y-1.5">
                {std.goals.map((g) => (
                  <li key={g.area} className="flex gap-2 text-sm text-slate-600">
                    <span className="mt-0.5 shrink-0 text-slate-300" aria-hidden>
                      ◆
                    </span>
                    <span>
                      <span className="font-semibold text-slate-700">{g.area}:</span>{" "}
                      {g.can}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
