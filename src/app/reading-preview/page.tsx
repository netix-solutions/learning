import { notFound } from 'next/navigation';
import { ReadingPrompt } from '@/components/ReadingPrompt';
import { READING_STORIES } from '@/lib/content/reading-stories';
export default async function ReadingPreview({ searchParams }: { searchParams: Promise<{ grade?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { grade = 'K' } = await searchParams;
  const stories = READING_STORIES.filter(s=>s.grade===grade);
  return <main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
    <p className="mb-4 text-sm text-slate-700">Reading layout preview · no answers are saved</p>
    {stories.map(story=><section key={story.id} className="mb-8 rounded-3xl bg-white p-4 sm:p-8"><ReadingPrompt grade={story.grade} questionId={story.id} parts={{passage:story.passage,question:story.questions[0].prompt}} /><div className="mt-5 grid gap-3 sm:grid-cols-2">{story.questions[0].choices.map(c=><div key={c} className="min-h-14 rounded-2xl border-2 border-slate-200 p-4 text-lg">{c}</div>)}</div></section>)}
  </main>;
}
