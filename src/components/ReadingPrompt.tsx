import manifest from '@/lib/generated/lesson-audio.json';
import { forSpeech } from '@/lib/speech-text';
import type { Grade } from '@/lib/types';
import type { ReadingPrompt as ReadingPromptParts } from '@/lib/reading-prompt';
import { SpeakButton } from '@/components/SpeakButton';
const recordings = new Map(Object.entries(manifest.clips).filter(([id]) => id.startsWith('reading:')).map(([,clip]) => [clip.text, clip.url]));
export function ReadingPrompt({ parts, grade, questionId }: { parts: ReadingPromptParts; grade: Grade; questionId: string }) {
  const early = grade === 'PK' || grade === 'K' || grade === '1';
  return <div className="min-w-0">
    <section aria-label="Reading passage" className="mb-6 rounded-2xl border border-amber-200 bg-[#fffdf4] p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-base font-bold text-amber-900">{early ? 'Read or listen' : 'Read the passage'}</h2><SpeakButton id={`passage-${questionId}`} text={parts.passage} audioSrc={recordings.get(forSpeech(parts.passage))} label="Listen to the passage" /></div>
      {parts.passage.split(/\n\s*\n/).map((paragraph, i) => <p key={i} className={`mt-3 whitespace-pre-line break-words font-normal leading-[1.8] text-slate-800 ${early ? 'text-2xl' : grade === '2' ? 'text-xl' : 'text-lg sm:text-xl'}`}>{paragraph}</p>)}
    </section>
    <div className="flex items-start gap-3"><h1 className="min-w-0 flex-1 text-2xl font-bold leading-relaxed text-slate-800">{parts.question}</h1><SpeakButton id={`q-${questionId}`} text={parts.question} audioSrc={recordings.get(forSpeech(parts.question))} label="Read the question" /></div>
  </div>;
}
