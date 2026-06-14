import { SKILL_TEACH, skillStanding, skillTitle, type SkillStanding } from "@/lib/teaching";
import { subjectTheme, type SkillMastery } from "@/lib/types";

export type SubjectSkills = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  skills: SkillMastery[]; // only skills the child has attempted
};

const STANDING: Record<
  SkillStanding,
  { label: string; order: number; dot: string; chip: string }
> = {
  focus: {
    label: "Needs practice",
    order: 0,
    dot: "bg-orange-400",
    chip: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  building: {
    label: "Getting there",
    order: 1,
    dot: "bg-amber-400",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  strong: {
    label: "Doing great",
    order: 2,
    dot: "bg-emerald-400",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
};

type Row = SkillMastery & { standing: SkillStanding; title: string; pct: number };

function shape(skills: SkillMastery[]): Row[] {
  return skills
    .map((m) => ({
      ...m,
      standing: skillStanding(m),
      title: skillTitle(m.skill),
      pct: m.attempts > 0 ? Math.round((m.correct / m.attempts) * 100) : 0,
    }))
    .sort(
      (a, b) =>
        STANDING[a.standing].order - STANDING[b.standing].order ||
        a.pct - b.pct ||
        b.attempts - a.attempts,
    );
}

/**
 * Parent-facing, per-skill breakdown that calls out exactly which subtopics a
 * child is strong or weak in, with an expandable "how to help at home" tip for
 * each. Pure presentation — data comes from get_skill_mastery (per subject).
 */
export function SkillBreakdown({
  childName,
  subjects,
}: {
  childName: string;
  subjects: SubjectSkills[];
}) {
  const withData = subjects.filter((s) => s.skills.length > 0);
  if (withData.length === 0) return null;

  // Top-of-section callout: the subtopics that most need attention right now.
  const focus = withData
    .flatMap((s) => shape(s.skills).map((r) => ({ r, subject: s })))
    .filter(({ r }) => r.standing === "focus")
    .slice(0, 5);

  return (
    <section>
      <h2 className="mb-1 mt-8 font-display text-xl font-bold text-slate-700">
        Skills &amp; how to help
      </h2>
      <p className="mb-3 text-sm text-slate-500">
        A closer look at the specific subtopics behind each subject. Tap any skill
        for a simple way to help at home.
      </p>

      {focus.length > 0 && (
        <div className="card-fun mb-4 border-l-4 border-orange-300 p-4">
          <p className="font-bold text-slate-700">
            🎯 Right now, {childName} could use a little help with:
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {focus.map(({ r, subject }) => (
              <span
                key={`${subject.id}-${r.skill}`}
                className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700 ring-1 ring-orange-100"
              >
                {subject.emoji} {r.title}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {withData.map((s) => {
          const theme = subjectTheme(s.color);
          const rows = shape(s.skills);
          return (
            <div key={s.id} className="card-fun p-4">
              <div className={`mb-2 font-bold ${theme.text}`}>
                {s.emoji} {s.name}
              </div>
              <div className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <SkillRow
                    key={r.skill}
                    row={r}
                    childName={childName}
                    subjectName={s.name}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SkillRow({
  row,
  childName,
  subjectName,
}: {
  row: Row;
  childName: string;
  subjectName: string;
}) {
  const st = STANDING[row.standing];
  const teach = SKILL_TEACH[row.skill];

  return (
    <details className="group py-2">
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${st.dot}`} aria-hidden />
        <span className="font-semibold text-slate-700">{row.title}</span>
        <span
          className={`hidden rounded-full px-2 py-0.5 text-xs font-bold ring-1 sm:inline ${st.chip}`}
        >
          {st.label}
        </span>
        <span className="ml-auto text-sm font-semibold text-slate-400">
          {row.correct}/{row.attempts} correct
        </span>
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="mt-2 space-y-2 pl-6 text-sm text-slate-600">
        {teach && (
          <p>
            💡 <span className="font-bold text-slate-700">How to help at home:</span>{" "}
            {teach.tip}
          </p>
        )}
        <p className="text-slate-500">
          🔁 When {childName} practices {subjectName}, SummerSharp automatically adds
          extra questions on this skill until it clicks.
        </p>
      </div>
    </details>
  );
}
