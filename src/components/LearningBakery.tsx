'use client';
import { RewardCollectionManager } from '@/components/RewardCollectionManager';
import { RewardReveal } from '@/components/RewardReveal';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buyBakeryTreat } from '@/app/actions/train';
import { RecordedNarration } from '@/components/LessonNarration';
import { HOME_NARRATION } from '@/lib/home-narration';
import type { TrainState } from '@/lib/train';

export function LearningBakery({ initial, full = false, preview = false, onChange }: { initial: TrainState; full?: boolean; preview?: boolean; onChange: (state: TrainState) => void }) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const requests = useRef<Record<string, string>>({});
  const collection = state.treats ?? [];
  const pages = Math.max(1, Math.ceil(collection.length / 6));
  const shownPage = Math.min(page, pages - 1);
  async function buy(id: string) {
    if (busy) return;
    setBusy(true); setMessage('');
    const request = requests.current[id] ?? crypto.randomUUID();
    requests.current[id] = request;
    try {
      const item = state.bakeryCatalog!.find(d => d.id === id)!;
      const next = preview ? { ...state, balance: state.balance - item.price, spent: state.spent + item.price, treats: [...collection, { id: request, treatId: item.id, pricePaid:item.price }] } : await buyBakeryTreat(id, request);
      setState(next); onChange(next); delete requests.current[id];
      setPage(Math.floor(((next.treats?.length ?? 1) - 1) / 6));
      setMessage(`${item.name} added to your bakery shelf!`);
    } catch { setMessage('Your purchase could not be confirmed. Tap the same buy button to retry safely.'); }
    finally { setBusy(false); }
  }
  return <section aria-label="My bakery shelf" className="mt-5 min-w-0 overflow-hidden rounded-3xl border border-rose-200 bg-[#fffaf4] shadow-sm">
    <div className="flex items-start justify-between gap-3 p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-widest text-rose-800">Fresh from your imagination</p><h2 className="mt-1 text-3xl font-bold text-slate-800">My little bakery</h2><p className="mt-2 text-slate-600">{collection.length ? `${collection.length} ${collection.length === 1 ? 'treat' : 'treats'} collected` : 'Your shelves are ready.'}</p></div><div className="shrink-0 rounded-2xl bg-amber-100 px-4 py-3 text-center text-amber-950"><strong aria-label={`${state.balance} tokens`} className="block text-3xl tabular-nums">{state.balance}</strong><span className="text-sm font-bold">tokens</span></div></div>
    <div role="img" aria-label={`Bakery display with ${collection.slice(shownPage * 6, shownPage * 6 + 6).length} treats`} className="relative isolate aspect-[3/2] overflow-hidden">
      <Image src="/images/bakery/bakery-shelf.webp" alt="" fill unoptimized loading="eager" sizes="(max-width: 768px) 100vw, 740px" className="object-cover" />
      {collection.slice(shownPage * 6, shownPage * 6 + 6).map((d, i) => <div key={d.id} data-collected-treat className="absolute" style={{ left: `${6 + (i % 3) * 31}%`, bottom: i < 3 ? '53%' : '19%', width: '26%', height: '36%', zIndex: i < 3 ? 1 : 2 }}><Image src={`/images/bakery/${d.treatId}.webp`} alt="" fill sizes="(max-width: 768px) 32vw, 240px" className="object-contain object-bottom" style={{transform:d.treatId==='croissant'?'translateY(9%)':undefined}} /></div>)}
      {!collection.length && <p className="absolute bottom-5 left-1/2 w-max max-w-[85%] -translate-x-1/2 rounded-xl bg-white/90 px-4 py-2 text-center text-sm font-bold text-rose-950">Your first donut costs 5 tokens</p>}
    </div>
    <div className="p-5 sm:p-7">
      {pages > 1 && <div className="mb-4 flex items-center justify-between gap-2"><button disabled={shownPage === 0} onClick={() => setPage(shownPage - 1)} className="min-h-12 rounded-xl bg-rose-100 px-3 font-bold disabled:opacity-40">← Previous</button><span className="text-sm">Display {shownPage + 1} of {pages}</span><button disabled={shownPage === pages - 1} onClick={() => setPage(shownPage + 1)} className="min-h-12 rounded-xl bg-rose-100 px-3 font-bold disabled:opacity-40">Next →</button></div>}
      <div className="flex items-center gap-3"><p className="flex-1 leading-relaxed text-slate-700">Try a question: <strong>1 token.</strong><br/>Finish a lesson: <strong>5 tokens.</strong><br/><span className="text-sm">Mistakes count, too. All reward shops share these tokens.</span></p><RecordedNarration id="home:bakery" text={HOME_NARRATION['home:bakery']} label="Hear how my bakery works" /></div>
      {message && <p role="status" className="mt-4 rounded-xl bg-rose-50 p-3 font-bold text-rose-900">{message}</p>}
      {full&&<RewardCollectionManager state={state} kind="bakery" preview={preview} busy={busy} onBusy={setBusy} onChange={next=>{setMessage('');setState(next);onChange(next);}}/>}
      {!full ? <Link href="/bakery" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-rose-800 px-5 py-3 font-bold text-white">Visit my bakery →</Link> : <><h3 className="mt-7 text-2xl font-bold text-slate-800">Pick something delicious</h3><p className="mt-1 text-slate-600">Choose a treat to add to your shelf. Collect your favorites again and again.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{(state.bakeryCatalog ?? []).map(d => <div key={d.id} className="flex min-w-0 flex-col rounded-2xl border border-rose-100 bg-white p-3"><RewardReveal owned={collection.some(p=>p.treatId===d.id)}><div className="relative aspect-[3/2]"><Image src={`/images/bakery/${d.id}.webp`} alt="" fill sizes="(max-width: 640px) 160px, 230px" className="object-contain" /></div></RewardReveal><h4 className="flex-1 break-words text-base font-bold text-slate-800">{d.name}</h4><p className="mt-2 font-bold text-amber-900">{d.price} tokens</p><button disabled={busy || state.balance < d.price} onClick={() => buy(d.id)} aria-label={`Buy ${d.name} for ${d.price} tokens`} className="mt-3 min-h-12 rounded-xl bg-rose-800 px-2 py-3 font-bold text-white disabled:bg-slate-100 disabled:text-slate-500">{state.balance < d.price ? `${d.price - state.balance} more to go` : 'Buy treat'}</button></div>)}</div><Link href="/practice/daily" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-rose-700 px-5 py-3 font-bold text-white">Practice for more tokens →</Link></>}
    </div>
  </section>;
}
