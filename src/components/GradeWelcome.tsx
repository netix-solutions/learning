import { experienceFor } from '@/lib/grade-experience';
import { gradeLabel, type Grade } from '@/lib/types';
export function GradeWelcome({ grade }: { grade: Grade | null }) {
  const experience = experienceFor(grade);
  return <div className="mt-4 rounded-2xl border p-4" style={{ background: experience.pale, borderColor: `${experience.accent}30`, color: experience.accent }}>
    <p className="text-sm font-bold">{gradeLabel(grade)} · {experience.name}</p>
    <p className="mt-1 text-base">{experience.invitation}</p>
  </div>;
}
