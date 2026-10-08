import { parentPracticePlan, type PlanSubject } from '@/lib/parent-practice-plan';
import type { Grade } from '@/lib/types';

export function ParentPracticePlan({ subjects, grade }: { subjects: PlanSubject[]; grade: Grade | null }) {
  const plan = parentPracticePlan(subjects, grade);
  return <section aria-labelledby="parent-plan-heading" className="mt-6 rounded-3xl border border-sky-200 bg-sky-50 p-5 sm:p-6">
    <p className="text-sm font-bold text-sky-800">A small next step</p>
    <h2 id="parent-plan-heading" className="mt-1 font-display text-2xl font-bold text-slate-800">Your next practice together</h2>
    <p className="mt-2 leading-relaxed text-slate-700">Pick one idea for a short, relaxed session. Let your child explain their thinking; help is part of learning.</p>
    {plan.incomplete && <p className="mt-3 text-sm font-semibold text-amber-900">Some subjects couldn’t load. These suggestions use only the details available.</p>}
    {plan.steps.length ? <ol className="mt-4 space-y-3">{plan.steps.map(step => <li key={`${step.subjectId}:${step.skill}`} className="rounded-2xl border border-sky-100 bg-white p-4">
      <p className="text-sm font-semibold text-slate-500">{step.subjectName} · {step.state === 'support' ? 'Start with help' : 'Keep building'}</p>
      <h3 className="mt-1 text-lg font-bold text-slate-800">{step.title}</h3>
      <p className="mt-2 leading-relaxed text-slate-700">{step.tip ?? 'Work through one example together. Ask your child to show or tell you how they found the answer.'}</p>
      {step.lesson && <p className="mt-3 rounded-xl bg-sky-50 p-3 text-sm leading-relaxed text-sky-900">In your child’s <strong>Lessons</strong>, choose <strong>“{step.lesson.title}”</strong> for a related introduction. Then return to Practice.</p>}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.state === 'support' ? 'Suggested because recent answers show repeated difficulty or help used.' : 'Suggested because this skill is still building independent evidence.'} Next time this skill appears, invite your child to try a fresh question before offering help.</p>
    </li>)}</ol> : <p className="mt-4 rounded-2xl bg-white p-4 leading-relaxed text-slate-700">{plan.hasRecentEvidence ? 'Keep the momentum: let your child choose a subject in Practice and explain one answer to you. Current details don’t identify a skill needing extra support.' : 'Start with a short Practice round in a subject your child enjoys. We need recent answers with a help record before suggesting a particular skill.'}</p>}
    <p className="mt-4 text-sm leading-relaxed text-slate-600">Based on available skill details practiced within the past 30 days. Success with help is useful practice; a fresh answer without help gives a clearer picture of independent learning.</p>
  </section>;
}
