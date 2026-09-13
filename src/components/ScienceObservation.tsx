"use client";
import { useState } from 'react';
import type { ScienceObservation as Observation } from '@/lib/science-observation';
import { observationNarration } from '@/lib/science-observation';
import { SpeakButton } from '@/components/SpeakButton';
import manifest from '@/lib/generated/lesson-audio.json';
import { forSpeech } from '@/lib/speech-text';
const recordings = new Map(Object.entries(manifest.clips).filter(([id])=>id.startsWith('observation:')).map(([,clip])=>[clip.text,clip.url]));
function SymbolPicture({ symbol }: { symbol?: Observation['rows'][number]['symbol'] }) {
  return <svg aria-hidden="true" viewBox="0 0 100 80" className="mx-auto h-20 w-24">
    {symbol?.endsWith('ball') ? <><circle cx="50" cy="40" r="28" fill={symbol==='red-ball'?'#cb514a':'#3c79aa'} /><ellipse cx="40" cy="28" rx="10" ry="6" fill="#fff" opacity=".3" /></> : symbol==='sun' ? <><g stroke="#b07612" strokeWidth="4">{[0,45,90,135].map(a=><path key={a} d="M50 4V14 M50 66V76" transform={`rotate(${a} 50 40)`} />)}</g><circle cx="50" cy="40" r="20" fill="#efbe4d" /></> : <><path d="M20 45Q10 24 31 24Q38 6 58 18Q82 13 85 36Q91 47 74 49H27Z" fill="#94adbd" />{[30,50,70].map(x=><path key={x} d={`M${x} 56l-5 12`} stroke="#317fa1" strokeWidth="4" strokeLinecap="round" />)}</>}
  </svg>;
}
export function ScienceObservation({ observation, id }: { observation: Observation; id: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const narration = observationNarration(observation);
  const pictures = observation.format==='objects' || observation.format==='weather';
  return <section aria-label="Observation notes" className="my-5 min-w-0 max-w-full rounded-2xl border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3"><h2 className="text-xl font-bold text-slate-800">{observation.title}</h2><SpeakButton id={`observation-${id}`} text={narration} audioSrc={recordings.get(forSpeech(narration))} label="Hear the observation notes" /></div>
    <p className="mt-2 text-base leading-relaxed text-slate-700">{observation.context}</p>
    <p className="mb-3 mt-3 text-sm text-slate-600">Tap {pictures ? 'a picture' : 'a row'} to mark what you are looking at.</p>
    {pictures ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{observation.rows.map(row=><button key={row.label} aria-pressed={selected===row.label} onClick={()=>setSelected(selected===row.label?null:row.label)} className={`min-h-36 rounded-xl border-2 bg-white p-3 text-center ${selected===row.label?'border-sky-700 ring-2 ring-sky-200':'border-slate-200'}`}>
      <span className="block text-base font-bold text-slate-800">{row.label}</span><SymbolPicture symbol={row.symbol} /><span className="block text-sm text-slate-700">{row.values.join(' · ')}</span>
    </button>)}</div> : observation.format==='bars' ? <div className="space-y-3">{observation.rows.map(row=><button key={row.label} aria-pressed={selected===row.label} onClick={()=>setSelected(selected===row.label?null:row.label)} className={`block w-full rounded-xl border-2 bg-white p-3 text-left ${selected===row.label?'border-sky-700':'border-slate-200'}`}>
      <span className="flex justify-between gap-3 text-base font-bold text-slate-800"><span>{row.label}</span><span>{row.amount} {observation.unit}</span></span><span aria-hidden="true" className="mt-2 block h-7 rounded bg-slate-100"><span className="block h-full rounded bg-sky-700" style={{width:`${row.amount!/observation.scaleMax!*100}%`}} /></span>
    </button>)}<p className="text-sm text-slate-600">Bars start at 0 and use the same scale: 0–{observation.scaleMax} {observation.unit}.</p></div> : <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white" tabIndex={0} role="region" aria-label="Results table; scroll sideways if needed"><table className="w-full border-collapse text-left text-base text-slate-800"><thead className="bg-sky-100"><tr><th scope="col" className="p-3">Test</th>{observation.columns.map(c=><th key={c} scope="col" className="p-3">{c}</th>)}</tr></thead><tbody>{observation.rows.map(row=><tr key={row.label} className={`border-t border-slate-200 ${selected===row.label?'bg-sky-100':''}`}><th scope="row" className="p-1"><button onClick={()=>setSelected(selected===row.label?null:row.label)} aria-pressed={selected===row.label} className="min-h-12 w-full rounded-lg p-2 text-left font-bold">{row.label}</button></th>{row.values.map((value,i)=><td key={i} className="p-3">{value}</td>)}</tr>)}</tbody></table></div>}
    {observation.format==='table' && observation.columns.length>2 && <p className="mt-2 text-sm font-bold text-sky-800 sm:hidden">Swipe the table sideways to see every trial.</p>}
  </section>;
}
