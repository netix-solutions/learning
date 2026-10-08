import {comparableSkills,trendDateRange,type PracticeTrends} from '@/lib/practice-trends';
import {skillTitle} from '@/lib/teaching';
export function ParentPracticeTrends({data,subjects}:{data:PracticeTrends|null;subjects:{subject_id:string;name:string}[]}) {
 const comparisons=data?comparableSkills(data):[];
 const names=new Map(subjects.map(s=>[s.subject_id,s.name]));
 return <section className="mt-8 rounded-3xl border border-sky-100 bg-white p-5 sm:p-6" aria-labelledby="practice-trends-heading">
  <p className="text-xs font-bold uppercase tracking-widest text-sky-800">A little progress, over time</p>
  <h2 id="practice-trends-heading" className="mt-2 font-display text-2xl font-bold text-slate-800">Practice over the past month</h2>
  {!data?<p role="status" className="mt-4 text-slate-700">The comparison couldn’t load. Refresh to try again. Your child’s saved practice is unchanged.</p>:<>
   <p className="mt-2 leading-relaxed text-slate-600">Two 14-day windows for your child’s current grade. Each question counts once per window, using its first answer.</p>
   <div className="mt-4 grid gap-3 sm:grid-cols-2">{(['previous','recent'] as const).map(period=>{
    const row=data.periods.find(p=>p.period===period);
    if(!row)return null;
    return <div key={period} className={`rounded-2xl border p-4 ${period==='recent'?'border-sky-200 bg-sky-50':'border-slate-200 bg-slate-50'}`}>
     <h3 className="font-bold text-slate-800">{period==='recent'?'Last 14 days':'Previous 14 days'}</h3>
     <p className="mt-1 text-sm text-slate-600">{trendDateRange(data.as_of,period)} · UTC</p>
     <p className="mt-3 text-2xl font-bold text-slate-900">{row.questions} <span className="text-base font-semibold">different questions</span></p>
     <dl className="mt-3 space-y-2 text-sm text-slate-700">
      <div className="flex justify-between gap-3"><dt>Independent correct</dt><dd className="text-right font-bold">{row.independent?`${row.correct} of ${row.independent}`:"Not yet recorded"}</dd></div>
      <div className="flex justify-between gap-3"><dt>With help</dt><dd className="font-bold">{row.helped}</dd></div>
      {row.unknown>0&&<div className="flex justify-between gap-3"><dt>Help not recorded</dt><dd className="font-bold">{row.unknown}</dd></div>}
     </dl>
    </div>;
   })}</div>
   <h3 className="mt-6 font-bold text-slate-800">Same skill, same challenge level</h3>
   <p className="mt-1 text-sm leading-relaxed text-slate-600">We compare independent answers only when each window has at least four different questions at the same level. Different questions can still vary in difficulty; these are practice snapshots, not test scores.</p>
   {!comparisons.length?<p className="mt-3 rounded-xl bg-slate-50 p-4 text-slate-700">Not enough matching practice yet. As your child returns to skills, comparisons will appear here.</p>:<details className="mt-3" open={comparisons.length<=3}>
    <summary className="min-h-11 cursor-pointer py-3 font-bold text-sky-800">{comparisons.length} skill-and-level comparison{comparisons.length===1?'':'s'}</summary>
    <div className="space-y-4">{comparisons.map(s=><article key={`${s.subject_id}:${s.skill}:${s.difficulty}`} className="rounded-2xl border border-slate-200 p-4">
     <p className="text-sm text-slate-600">{names.get(s.subject_id)??s.subject_id} · Level {s.difficulty}</p><h4 className="mt-1 font-bold text-slate-800">{skillTitle(s.skill)}</h4>
     <div className="mt-3 space-y-3">{[{label:'Previous 14 days',percent:s.previousPercent,correct:s.previous_correct,count:s.previous_count},{label:'Last 14 days',percent:s.recentPercent,correct:s.recent_correct,count:s.recent_count}].map((p,i)=><div key={p.label}>
      <div className="mb-1 flex flex-wrap justify-between gap-x-3 text-sm text-slate-700"><span>{p.label}</span><span className="font-bold">{p.correct}/{p.count} correct · {p.percent}%</span></div>
      <div aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${i?'bg-sky-600':'bg-slate-400'}`} style={{width:`${p.percent}%`}} /></div>
     </div>)}</div>
    </article>)}</div>
   </details>}
   {comparisons.length>0&&<p className="mt-4 text-sm leading-relaxed text-slate-600">A lower result may mean the questions were harder or your child needed a different approach. Use the skill notes below to choose what to practice together.</p>}
  </>}
 </section>;
}
