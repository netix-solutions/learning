import { notFound } from 'next/navigation';
import { PracticeClient } from '@/app/practice/[subject]/PracticeClient';
import type { Grade } from '@/lib/types';
export default async function Page({searchParams}: {searchParams: Promise<{grade?: string}>}) {
  if(process.env.NODE_ENV === 'production') notFound();
  const {grade = 'K'} = await searchParams;
  if(!['K','1','2','3','4','5'].includes(grade)) notFound();
  return <PracticeClient grade={grade as Grade} studentId="isolated-quiz-preview" subject={{id:'daily',name:'Practice quizzes',emoji:'⭐',color:'blue',sort:0}} />;
}
