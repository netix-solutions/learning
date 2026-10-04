import { SKILL_TEACH, skillTitle } from '@/lib/teaching';
import type { SkillProgress } from '@/lib/types';

export type EvidenceSubject = { id:string; name:string; progress:SkillProgress[]; unavailable?:boolean };
export function PracticeEvidence({subjects}:{subjects:EvidenceSubject[]}) {
  const practiced=subjects.flatMap(subject=>subject.progress.filter(p=>p.attempts>0).map(p=>({...p,subject:subject.name})));
  const secure=practiced.filter(p=>p.state==='secure');
  const support=practiced.filter(p=>p.state==='support');
  const unavailable=subjects.filter(subject=>subject.unavailable);
  return <section className="mt-8" aria-labelledby="practice-evidence-heading">
    <h2 id="practice-evidence-heading" className="font-display text-2xl font-bold text-slate-800">How your child is learning</h2>
    <p className="mt-2 text-slate-600">Recent practice separates success on different questions from practice with help. Older answers without a help record stay unclassified.</p>
    {unavailable.length>0&&<p role="status" className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">Practice details for {unavailable.map(subject=>subject.name).join(', ')} couldn’t load. Refresh this page to try again. Missing details don’t mean your child hasn’t practiced.</p>}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-bold text-emerald-900">Growing strengths</h3><p className="mt-1 text-emerald-900">{secure.length?secure.slice(0,3).map(p=>skillTitle(p.skill)).join(', '):unavailable.length?'Some practice details are unavailable. We’ll identify strengths when those details load.':'More independent practice will help us identify secure skills.'}</p></div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-bold text-amber-900">A little extra support</h3><p className="mt-1 text-amber-900">{support.length?support.slice(0,3).map(p=>skillTitle(p.skill)).join(', '):unavailable.length?'Some practice details are unavailable, so this summary is incomplete.':'No repeated recent struggles in the available practice evidence.'}</p><p className="mt-2 text-sm text-amber-900">Try a short lesson together, then return to a fresh question.</p></div>
    </div>
    {!practiced.length?(!unavailable.length&&<p className="mt-4 rounded-2xl bg-white p-5 text-slate-600">After your child practices, you’ll see the skills they are building here.</p>):<div className="mt-4 space-y-3">{practiced.sort((a,b)=>(a.state==='support'?0:1)-(b.state==='support'?0:1)).map(p=><article key={`${p.subject}:${p.skill}`} className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-500">{p.subject}</p><h3 className="mt-1 font-bold text-slate-800">{skillTitle(p.skill)}</h3></div><span className={`rounded-full px-3 py-1 text-sm font-bold ${p.state==='secure'?'bg-emerald-50 text-emerald-800':p.state==='support'?'bg-amber-50 text-amber-900':'bg-sky-50 text-sky-800'}`}>{p.state==='secure'?'Secure at this level':p.state==='support'?'Practice with support':'Building confidence'}</span></div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3"><div><dt className="text-sm text-slate-600">Independent success</dt><dd className="font-bold text-slate-800">{p.independent_attempts?`${p.independent_correct} of ${p.independent_attempts}`:'Not enough evidence yet'}</dd></div><div><dt className="text-sm text-slate-600">Different questions with help</dt><dd className="font-bold text-slate-800">{p.supported_attempts}</dd></div><div><dt className="text-sm text-slate-600">Next challenge</dt><dd className="font-bold text-slate-800">Level {p.target_difficulty} of {p.max_difficulty}</dd></div></dl>
      {p.unknown_support_attempts>0&&<p className="mt-3 text-sm text-slate-500">{p.unknown_support_attempts} older question{p.unknown_support_attempts===1?'':'s'} have no help record.</p>}
      {SKILL_TEACH[p.skill]&&<details className="mt-3 border-t border-slate-100 pt-2"><summary className="min-h-11 cursor-pointer py-3 font-bold text-sky-800">A way to help at home</summary><p className="pb-3 leading-relaxed text-slate-600">{SKILL_TEACH[p.skill].tip}</p></details>}
    </article>)}</div>}
    <p className="mt-3 text-sm text-slate-500">Uses the latest answer to each different question, up to 20 per skill in the past 90 days. Challenge levels describe this question bank, not a grade change or a test score.</p>
  </section>;
}
