import Link from "next/link";
import { RecordedNarration } from "@/components/LessonNarration";
import { HOME_NARRATION } from "@/lib/home-narration";
import type { Grade, Subject } from "@/lib/types";

const hints: Record<string, string> = {
  math: "Numbers & shapes", reading: "Words & stories", science: "How things work",
  geography: "Maps & places", history: "People & the past", civics: "People & rules", economics: "Money & choices",
};
function Voice({ name }: { name: string }) {
  const id = `home:${name}`;
  return HOME_NARRATION[id] ? <RecordedNarration id={id} text={HOME_NARRATION[id]} label={`Hear about ${name === "learn" ? "learning" : name}`} /> : null;
}

export function HomeLearningChoices({ grade, subjects }: { grade: Grade | null; subjects: Subject[] }) {
  const earlyReader = grade === "PK" || grade === "K" || grade === "1";
  const core = subjects.filter(s => ["math", "reading", "science"].includes(s.id));
  const more = subjects.filter(s => !["math", "reading", "science"].includes(s.id));
  function subjectCards(items: Subject[]) {
    return <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">{items.map(s => <div key={s.id} className="card-fun flex items-center gap-1 p-2">
      <Link href={`/practice/${s.id}`} className="min-w-0 flex-1 rounded-2xl p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
        <span aria-hidden="true" className="block text-4xl">{s.emoji}</span>
        <span className="mt-2 block text-lg font-bold text-slate-800">{s.name}</span>
        <span className="mt-1 block text-sm text-slate-600">{hints[s.id] ?? "Explore & practice"}</span>
      </Link>
      <Voice name={s.id} />
    </div>)}</div>;
  }
  return <section aria-label="Choose your learning" className="mt-5">
    <div className="mb-3 flex items-center gap-3">
      <RecordedNarration id="home:guide" text={HOME_NARRATION['home:guide']} label="Hear how to use this page" />
      <p className="text-base font-bold text-slate-700">Tap a speaker to listen</p>
    </div>
    <div className="flex items-center gap-2 rounded-3xl bg-sky-700 p-3 text-white shadow-sm">
      <Link href="/practice/daily" className="btn-pop flex min-h-28 min-w-0 flex-1 items-center gap-4 rounded-2xl p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        <span aria-hidden="true" className="text-5xl">🚀</span>
        <span><span className="block font-display text-2xl font-bold sm:text-3xl">Practice quizzes</span><span className="mt-1 block text-base">{earlyReader ? "Tap. Try. Have fun!" : "A mix of questions, just for you."}</span></span>
      </Link>
      <Voice name="practice" />
    </div>
    <h2 className="mb-3 mt-6 text-lg font-bold text-slate-700">Or practice a subject</h2>
    {subjectCards(core)}
    {more.length > 0 && <details className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
      <summary className="min-h-12 cursor-pointer rounded-xl p-3 text-base font-bold text-sky-800 focus-visible:outline-2 focus-visible:outline-sky-700">More subjects</summary>
      <div className="mt-2">{subjectCards(more)}</div>
    </details>}
    <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3">
      <Link href="/learn" className="flex min-h-20 min-w-0 flex-1 items-center gap-3 rounded-xl p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-700">
        <span aria-hidden="true" className="text-3xl">🧭</span>
        <span><span className="block text-lg font-bold text-slate-800">Learning lessons</span><span className="mt-1 block text-sm text-slate-600">{earlyReader ? "Watch. Listen. Try." : "Explore a new idea step by step."}</span></span>
      </Link>
      <Voice name="learn" />
    </div>
  </section>;
}
