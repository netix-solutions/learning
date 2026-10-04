import { notFound } from 'next/navigation';
import InteractionPreview from './Preview';
import {mathProgressionQuestions} from '../../../scripts/math-progression-content.mjs';
import type {PracticeQuestion} from '@/lib/types';
export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  const samples=mathProgressionQuestions().filter(q=>q.kind==='order'||q.kind==='match').map((q,i)=>({id:`math-sample-${i}`,subject_id:q.subject_id,grade:q.grade,prompt:q.prompt,choices:q.choices??[],kind:q.kind,payload:q.payload,standard:q.standard,skill:q.skill,xp:0,difficulty:q.difficulty} as PracticeQuestion));
  return <InteractionPreview samples={samples} />;
}
