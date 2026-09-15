'use client';
import { RewardItemControls } from '@/components/RewardItemControls';
import { RewardReveal } from '@/components/RewardReveal';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { buyDinosaur } from '@/app/actions/train';
import { RecordedNarration } from '@/components/LessonNarration';
import { HOME_NARRATION } from '@/lib/home-narration';
import type { TrainState } from '@/lib/train';

export function LearningDinosaurs({ initial, full = false, preview = false, onChange }: { initial: TrainState; full?: boolean; preview?: boolean; onChange: (state: TrainState) => void }) {
  const [state, setState] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(0);
  const requests = useRef<Record<string, string>>({});
  const collection = state.dinosaurs ?? [];
  const pages = Math.max(1, Math.ceil(collection.length / 6));
  const shownPage = Math.min(page, pages - 1);
  async function buy(id: string) {
    if (busy) return;
    setBusy(true); setMessage('');
    const request = requests.current[id] ?? crypto.randomUUID();
    requests.current[id] = request;
    try {
      const item = state.dinosaurCatalog!.find(d => d.id === id)!;
      const next = preview ? { ...state, balance: state.balance - item.price, spent: state.spent + item.price, dinosaurs: [...collection, { id: request, dinosaurId: item.id, pricePaid:item.price }] } : await buyDinosaur(id, request);
      setState(next); onChange(next); delete requests.current[id];
      setPage(Math.floor(((next.dinosaurs?.length ?? 1) - 1) / 6));
      setMessage(`${item.name} joined your habitat!`);
    } catch { setMessage('Your purchase could not be confirmed. Tap the same buy button to retry safely.'); }
    finally { setBusy(false); }
  }
  return <section aria-label="My dinosaur habitat" className="mt-5 min-w-0 overflow-hidden rounded-3xl border border-emerald-200 bg-[#fffdf6] shadow-sm">
    <div className="flex items-start justify-between gap-3 p-5 sm:p-7"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Your prehistoric world</p><h2 className="mt-1 text-3xl font-bold text-slate-800">Dinosaur discovery</h2><p className="mt-2 text-slate-600">{collection.length ? `${collection.length} ${collection.length === 1 ? 'dinosaur' : 'dinosaurs'} collected` : 'Your habitat is ready.'}</p></div><div className="shrink-0 rounded-2xl bg-amber-100 px-4 py-3 text-center text-amber-950"><strong aria-label={`${state.balance} tokens`} className="block text-3xl tabular-nums">{state.balance}</strong><span className="text-sm font-bold">tokens</span></div></div>
    <div className="reward-scene-scroll" role="region" aria-label="Your collection. Tap an item to move or sell it." tabIndex={full?0:undefined}><div role={full?undefined:"img"} aria-label={`Dinosaur habitat with ${collection.slice(shownPage * 6, shownPage * 6 + 6).length} dinosaurs`} className={`relative isolate aspect-[2/1] overflow-hidden ${full?"reward-interactive-scene":""}`}>
      <Image src="/images/dinosaurs/habitat.webp" alt="" fill unoptimized loading="eager" sizes="(max-width: 768px) 100vw, 740px" className="object-cover" />
      {collection.slice(shownPage * 6, shownPage * 6 + 6).map((d, i) => <div key={d.id} data-collected-dinosaur className="absolute" style={{ left: `${3 + (i % 3) * 31}%`, bottom: full?(i < 3?'32%':'5%'):(i < 3?'24%':'2%'), width: '30%', height: full?'40%':'55%', zIndex: full?undefined:i < 3 ? 1 : 2 }}><Image src={`/images/dinosaurs/${d.dinosaurId}.webp`} alt="" fill sizes="(max-width: 768px) 32vw, 240px" className="pointer-events-none object-contain object-bottom" />{full&&<RewardItemControls state={state} kind="dinosaurs" purchase={d.id} preview={preview} busy={busy} onBusy={setBusy} onChange={next=>{setMessage('');setState(next);onChange(next);}} onMessage={setMessage}/>}</div>)}
      {!collection.length && <p className="absolute bottom-5 left-1/2 w-max max-w-[85%] -translate-x-1/2 rounded-xl bg-white/90 px-4 py-2 text-center text-sm font-bold text-emerald-950">Your first dinosaur costs 5 tokens</p>}
    </div></div>
    <div className="p-5 sm:p-7">
      {full&&collection.length>0&&<p className="mb-4 text-sm text-slate-600">Tap an item to show its move and sell buttons. Sell back for half the tokens you paid.</p>}
      {pages > 1 && <div className="mb-4 flex items-center justify-between gap-2"><button disabled={shownPage === 0} onClick={() => setPage(shownPage - 1)} className="min-h-12 rounded-xl bg-emerald-100 px-3 font-bold disabled:opacity-40">← Previous</button><span className="text-sm">Habitat {shownPage + 1} of {pages}</span><button disabled={shownPage === pages - 1} onClick={() => setPage(shownPage + 1)} className="min-h-12 rounded-xl bg-emerald-100 px-3 font-bold disabled:opacity-40">Next →</button></div>}
      <div className="flex items-center gap-3"><p className="flex-1 leading-relaxed text-slate-700">Try a question: <strong>1 token.</strong><br/>Finish a lesson: <strong>5 tokens.</strong><br/><span className="text-sm">Mistakes count, too. All reward shops share these tokens.</span></p><RecordedNarration id="home:dinosaurs" text={HOME_NARRATION['home:dinosaurs']} label="Hear how my dinosaurs work" /></div>
      {message && <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-900">{message}</p>}

      {!full ? <Link href="/dinosaurs" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-emerald-800 px-5 py-3 font-bold text-white">Visit my dinosaurs →</Link> : <><h3 className="mt-7 text-2xl font-bold text-slate-800">Choose your next dinosaur</h3><p className="mt-1 text-slate-600">Buy a dinosaur and it joins your habitat. Collect more than one of your favorites.</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">{(state.dinosaurCatalog ?? []).map(d => <div key={d.id} className="flex min-w-0 flex-col rounded-2xl border border-emerald-100 bg-white p-3"><RewardReveal owned={collection.some(p=>p.dinosaurId===d.id)}><div className="relative aspect-[3/2]"><Image src={`/images/dinosaurs/${d.id}.webp`} alt="" fill sizes="(max-width: 640px) 160px, 230px" className="object-contain" /></div></RewardReveal><h4 className="flex-1 break-words text-base font-bold text-slate-800">{d.name}</h4><p className="mt-2 font-bold text-amber-900">{d.price} tokens</p><button disabled={busy || state.balance < d.price} onClick={() => buy(d.id)} aria-label={`Buy ${d.name} for ${d.price} tokens`} className="mt-3 min-h-12 rounded-xl bg-emerald-800 px-2 py-3 font-bold text-white disabled:bg-slate-100 disabled:text-slate-500">{state.balance < d.price ? `${d.price - state.balance} more to go` : 'Buy dinosaur'}</button></div>)}</div><Link href="/practice/daily" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white">Practice for more tokens →</Link></>}
    </div>
  </section>;
}
