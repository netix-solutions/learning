import { notFound } from 'next/navigation';
import { ScienceObservation } from '@/components/ScienceObservation';
import { SCIENCE_OBSERVATIONS } from '@/lib/content/science-observations';
export default async function SciencePreview({searchParams}:{searchParams:Promise<{grade?:string}>}) {
 if(process.env.NODE_ENV==='production')notFound();
 const {grade='K'}=await searchParams;
 const a=SCIENCE_OBSERVATIONS.find(a=>a.grade===grade);if(!a)notFound();
 return <main data-grade={grade} className="grade-quiz mx-auto w-full min-w-0 max-w-3xl px-4 py-6"><p className="text-sm">Science preview · sample records · no answers saved</p><ScienceObservation observation={a.observation} id={a.id}/><h1 className="mt-6 text-2xl font-bold text-slate-800">{a.questions[0].prompt}</h1><div className="mt-5 grid gap-3 sm:grid-cols-2">{a.questions[0].choices.map(c=><div key={c} className="rounded-xl border-2 border-slate-200 bg-white p-4 text-lg">{c}</div>)}</div></main>;
}
