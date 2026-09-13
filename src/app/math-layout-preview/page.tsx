import { notFound } from 'next/navigation';
import { StackedProblem } from '@/components/StackedProblem';
import { parseArithmetic } from '@/lib/math-parse';

const samples = ['8 + 2 = ?', '17 - 8 = ?', '138 + 245 = ?', '144 ÷ 12 = ?', '9999 - 8888 = ?', '1440 ÷ 12 = ?'];
export default async function MathPreview({ searchParams }: { searchParams: Promise<{ grade?: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound();
  const { grade = 'K' } = await searchParams;
  const index = ['K', '1', '2', '3', '4', '5'].indexOf(grade);
  if (index < 0) notFound();
  const prompt = samples[index];
  return <main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6">
    <p>Math layout preview · no answers saved</p>
    <div className="mt-4 rounded-3xl bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1"><h1 className="sr-only">{prompt}</h1><StackedProblem parsed={parseArithmetic(prompt)!} /></div>
        <span aria-hidden="true" className="block h-12 w-12 shrink-0 rounded-full bg-sky-100" />
      </div>
    </div>
  </main>;
}
