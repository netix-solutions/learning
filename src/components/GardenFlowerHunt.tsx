'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { RecordedNarration } from '@/components/LessonNarration';
import { speechState, stop } from '@/lib/speech';
import { HOME_NARRATION } from '@/lib/home-narration';
import { kindsInPatch } from '@/lib/garden-flowers';

/** Optional play with owned flowers. No attempts, mastery or tokens are written. */
export function GardenFlowerHunt({ flowers }: { flowers: number }) {
  const kinds = kindsInPatch(flowers);
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState(0);
  const [found, setFound] = useState(false);
  const [message, setMessage] = useState('');
  const continueButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const target = kinds[round];
  const complete = playing && round >= kinds.length;
  const narrationId = target ? `garden-hunt:${target.id}` : null;
  useEffect(() => () => { if (narrationId && speechState().id === narrationId) stop(); }, [narrationId, playing]);
  function focusPrompt() { requestAnimationFrame(() => heading.current?.focus({ preventScroll: true })); }
  function start() { setRound(0); setFound(false); setMessage(''); setPlaying(true); focusPrompt(); }
  function next() { setRound(n => n + 1); setFound(false); setMessage(''); focusPrompt(); }
  if (!kinds.length) return null;
  return <section data-silent-click aria-label="Flower hunt" className="mx-5 mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 sm:mx-7 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm font-bold text-emerald-800">Play in your garden</p><h3 ref={heading} tabIndex={-1} className="mt-1 rounded font-display text-xl font-bold text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700">{complete ? 'Every kind found!' : playing ? `Find the ${target.name.toLowerCase()}` : 'Flower hunt'}</h3></div>
      {playing && !complete && <RecordedNarration id={`garden-hunt:${target.id}`} text={HOME_NARRATION[`garden-hunt:${target.id}`]} label="Hear which flower to find" />}
    </div>
    {!playing ? <><p className="mt-2 leading-relaxed text-slate-700">Look closely and match the flowers growing in this patch.</p><button onClick={start} className="mt-4 min-h-12 rounded-2xl bg-emerald-800 px-5 py-3 font-bold text-white">Play flower hunt</button></> : complete ? <><p role="status" className="mt-3 text-lg font-bold text-emerald-900">You found {kinds.length === 1 ? 'the flower kind in this patch' : `all ${kinds.length} flower kinds in this patch`}.</p><p className="mt-2 text-slate-700">{kinds.length < 5 ? 'Keep practicing to grow more kinds to explore.' : 'Take a look at your garden. Can you name the flowers now?'}</p><button onClick={start} className="mt-4 min-h-12 rounded-2xl bg-emerald-800 px-5 py-3 font-bold text-white">Play again</button></> : <>
      <div className="mt-3 flex items-center gap-4"><div className="relative h-24 w-24 shrink-0 rounded-2xl bg-white"><Image src={`/images/garden/${target.id}.webp`} alt={target.name} fill sizes="96px" className="object-contain p-2" /></div><div><p className="font-bold text-emerald-900">{round + Number(found)} of {kinds.length} kinds found</p><p className="mt-1 text-sm text-slate-600">Choose the matching picture below.</p></div></div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">{kinds.map(flower => <button key={flower.id} aria-label={`Choose ${flower.name}`} disabled={found} onClick={() => {
        const correct = flower.id === target.id;
        setFound(correct);
        if (correct) {
          if (speechState().id === narrationId) stop();
          requestAnimationFrame(() => continueButton.current?.focus({ preventScroll: true }));
        }
        setMessage(correct ? `You found the ${flower.name.toLowerCase()}!` : `That’s the ${flower.name.toLowerCase()}. Look for the ${target.name.toLowerCase()}.`);
      }} className={`min-h-28 rounded-2xl border-2 bg-white p-1.5 text-[13px] font-bold sm:text-sm text-slate-800 disabled:opacity-80 ${found && flower.id === target.id ? 'border-emerald-700 ring-2 ring-emerald-200' : 'border-white hover:border-emerald-300'}`}><span className="relative block h-16"><Image src={`/images/garden/${flower.id}.webp`} alt="" fill sizes="96px" className="object-contain" /></span><span className="mt-1 block break-words">{flower.name}</span></button>)}</div>
      <p role="status" className="mt-3 min-h-6 font-bold text-emerald-900">{message}</p>
      {found && <button ref={continueButton} onClick={next} className="mt-2 min-h-12 rounded-2xl bg-emerald-800 px-5 py-3 font-bold text-white">{round + 1 === kinds.length ? 'Finish exploring' : 'Find another flower'}</button>}
      <button onClick={() => { setPlaying(false); setMessage(''); focusPrompt(); }} className="mt-2 min-h-12 px-4 py-3 font-bold text-emerald-900 underline">Stop playing</button>
    </>}
    <p className="mt-4 text-sm text-slate-600">Just for fun—no tokens here. Practice grows your garden.</p>
  </section>;
}
