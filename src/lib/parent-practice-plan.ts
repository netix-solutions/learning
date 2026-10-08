import { LESSONS } from './lessons';
import { SKILL_TEACH, skillTitle } from './teaching';
import type { Grade, SkillProgress } from './types';

export type PlanSubject = { id: string; name: string; progress: SkillProgress[]; unavailable?: boolean };

// Reviewed topic matches only. An introductory lesson supports part of a skill;
// it is never substituted for a full skill assessment or an unrelated lesson.
export const SUPPORT_LESSONS: Record<string, string> = {
  'K.addsub': 'K-add',
  '1.addsub': '1-ten',
  '2.addsub': '2-place',
  '3.muldiv': '3-groups',
  '4.frac': '4-equivalent',
  '5.dec': '5-decimal',
  '1.phon': '1-short-vowels',
  '2.vocab': '2-prefix',
  '3.detail': '3-evidence',
};

export function parentPracticePlan(subjects: PlanSubject[], grade: Grade | null, now = Date.now()) {
  const recent = subjects.filter(s => !s.unavailable).flatMap(subject =>
    subject.progress.filter(p => {
      const date = p.last_practiced ? Date.parse(p.last_practiced) : NaN;
      return p.attempts > 0 && Number.isFinite(date) && date <= now && now - date <= 30 * 86400000;
    }).map(p => ({ ...p, subjectId: subject.id, subjectName: subject.name })),
  );
  // Recent support comes first; then skills still building. Do not manufacture
  // priorities from missing, old, or unknown-help-only evidence.
  const candidates = recent.filter(p => (p.state === 'support' || p.state === 'building') &&
    p.independent_attempts + p.supported_attempts > 0)
    .sort((a, b) => Number(b.state === 'support') - Number(a.state === 'support') ||
      Date.parse(b.last_practiced!) - Date.parse(a.last_practiced!) || a.skill.localeCompare(b.skill));
  const seen = new Set<string>();
  const steps = candidates.filter(p => {
    const key = `${p.subjectId}:${p.skill}`;
    if (seen.has(key)) return false;
    seen.add(key); return true;
  }).slice(0, 2).map(p => {
    const lesson = LESSONS.find(l => l.id === SUPPORT_LESSONS[p.skill] && l.grade === grade && l.subject === p.subjectId);
    return { ...p, title: skillTitle(p.skill), tip: SKILL_TEACH[p.skill]?.tip, lesson };
  });
  return { steps, hasRecentEvidence: recent.some(p => p.independent_attempts + p.supported_attempts > 0), incomplete: subjects.some(s => s.unavailable) };
}
