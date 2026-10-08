import { notFound } from 'next/navigation';
import { ParentPracticePlan } from '@/components/ParentPracticePlan';
import type { SkillProgress } from '@/lib/types';
export default function ParentPlanPreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  const row: SkillProgress = { skill:'2.addsub', attempts:6, independent_attempts:4, independent_correct:2, supported_attempts:2, unknown_support_attempts:0, recent_accuracy:0.5, last_practiced:new Date().toISOString(), target_difficulty:1, max_difficulty:3, state:'support' };
  return <main id="main-content" className="mx-auto max-w-3xl px-4 py-6"><h1 className="text-xl font-bold">Parent plan preview · sample evidence</h1><ParentPracticePlan grade="2" subjects={[{id:'math',name:'Math',progress:[row]},{id:'reading',name:'Reading',progress:[{...row,skill:'2.vocab',state:'building'}]}]} /></main>;
}
