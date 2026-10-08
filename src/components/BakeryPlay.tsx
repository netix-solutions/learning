'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { RecordedNarration } from '@/components/LessonNarration';
import { HOME_NARRATION } from '@/lib/home-narration';
import { speechState, stop } from '@/lib/speech';
import { addToBakeryTray, bakeryOrderMatches, bakeryOrders, bakeryStock, TRAY_LIMIT, type BakeryStock } from '@/lib/bakery-play';
import type { BakeryTreatId, TrainState } from '@/lib/train';

export function BakeryPlay({ state }: { state: TrainState }) {
  const [open, setOpen] = useState(false);
  const launch = useRef<HTMLButtonElement>(null);
  const stock = bakeryStock(state);
  function close() { setOpen(false); requestAnimationFrame(() => launch.current?.focus({ preventScroll: true })); }
  return <div data-silent-click className="mx-5 mt-5 rounded-2xl bg-rose-50 p-4 sm:mx-7">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-xl font-bold text-rose-950">Your bakery is open!</h3><p className="mt-1 text-sm text-slate-700">{stock.length ? 'Fill picture orders with treats from your shelf.' : 'Collect your first treat to play bakery.'}</p></div><button ref={launch} disabled={!stock.length} onClick={() => setOpen(true)} className="min-h-12 rounded-2xl bg-rose-800 px-5 py-3 font-bold text-white disabled:bg-rose-100 disabled:text-rose-800">Play bakery</button></div>
    {open && <BakeryDialog stock={stock} onClose={close} />}
  </div>;
}

function BakeryDialog({ stock, onClose }: { stock: BakeryStock[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const primary = useRef<HTMLButtonElement>(null);
  const firstTreat = useRef<HTMLButtonElement>(null);
  const [round, setRound] = useState(0);
  const [index, setIndex] = useState(0);
  const [tray, setTray] = useState<BakeryTreatId[]>([]);
  const [served, setServed] = useState(false);
  const [message, setMessage] = useState('Tap shelf treats to fill your tray.');
  const orders = bakeryOrders(stock, round);
  const order = orders[index] ?? [];
  const finished = served && index === orders.length - 1;
  const name = (id: BakeryTreatId) => stock.find(item => item.id === id)?.name ?? id;
  useEffect(() => {
    const element = dialog.current; element?.showModal();
    return () => { element?.close(); if (speechState().id === 'bakery:play') stop(); };
  }, []);
  function add(id: BakeryTreatId) {
    setTray(current => addToBakeryTray(current, id, stock));
    setMessage('Match every picture. Tap tray treats to put them back.');
  }
  function action() {
    if (speechState().id === 'bakery:play') stop();
    if (served) {
      if (finished) { setRound(round + 1); setIndex(0); } else setIndex(index + 1);
      setTray([]); setServed(false); setMessage('A new order! Your shelf is full again.');
      requestAnimationFrame(() => firstTreat.current?.focus({ preventScroll: true })); return;
    }
    if (!bakeryOrderMatches(order, tray)) { setMessage('Not quite yet. Match each picture, then serve again.'); return; }
    setServed(true); setMessage(index === orders.length - 1 ? 'Three happy orders! Thank you, baker!' : 'Just right! Your order is ready.');
    requestAnimationFrame(() => primary.current?.focus({ preventScroll: true }));
  }
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="bakery-play-title" data-silent-click className="bakery-play-dialog m-auto w-[calc(100%_-_1rem)] max-w-xl overflow-y-auto rounded-3xl border-0 bg-[#fffaf4] p-0 text-slate-800 shadow-2xl">
    <div aria-hidden="true" className="bakery-play-awning h-4" />
    <header className="flex items-center justify-between gap-2 px-4 py-2"><div><h2 id="bakery-play-title" className="font-display text-2xl font-bold text-rose-950">Little bakery</h2><p className="text-sm text-slate-600">Order {index + 1} of 3</p></div><div className="flex items-center gap-2"><RecordedNarration id="bakery:play" text={HOME_NARRATION['bakery:play']} label="Hear how to play bakery" /><button onClick={onClose} aria-label="Close bakery play" className="min-h-12 rounded-full bg-white px-3 font-bold text-slate-700">Close</button></div></header>
    <div className="px-4 pb-4">
      <section aria-label="Picture order" className="rounded-lg border-2 border-dashed border-rose-200 bg-white p-2 text-center"><h3 className="text-sm font-bold text-rose-900">Please pack these treats</h3><div className="flex min-h-14 items-center justify-center gap-2">{order.map((id, slot) => <TreatPicture key={`${index}-${slot}`} id={id} label={name(id)} />)}</div></section>
      <section aria-label="Your tray" className={`mt-2 rounded-2xl border-4 p-2 ${served ? 'border-emerald-600 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><h3 className="text-center text-sm font-bold text-amber-950">{served ? 'Packed with care!' : 'Your tray · tap a treat to put it back'}</h3><div className="mt-1 flex min-h-14 items-center justify-center gap-2">{tray.length ? tray.map((id, slot) => <button key={slot} disabled={served} onClick={() => { setTray(current => current.filter((_, i) => i !== slot)); setMessage('Treat put back. Keep matching the order.'); }} aria-label={`Put back ${name(id)} from tray position ${slot + 1}`} className="bakery-tray-treat rounded-xl bg-white shadow-sm disabled:bg-transparent"><TreatPicture id={id} /></button>) : <p className="text-sm text-amber-900">Your treats go here</p>}</div></section>
      <fieldset disabled={served} className="mt-2"><legend className="text-sm font-bold text-slate-700">Your shelf</legend><div className="mt-1 grid grid-cols-3 gap-2">{stock.map((item, stockIndex) => {
        const left = item.count - tray.filter(id => id === item.id).length;
        return <button key={item.id} ref={stockIndex === 0 ? firstTreat : undefined} disabled={!left || tray.length >= TRAY_LIMIT} onClick={() => add(item.id)} aria-label={`Add ${item.name}. ${left} available`} className="relative flex min-h-20 flex-col items-center justify-center rounded-xl border border-rose-200 bg-white px-1 pb-1 disabled:bg-stone-100 disabled:opacity-50"><TreatPicture id={item.id} /><span className="absolute right-1 top-1 rounded-full bg-rose-100 px-2 text-xs font-bold text-rose-950">{left}</span><span className="text-xs font-semibold leading-tight">{item.name}</span></button>;
      })}</div></fieldset>
      <p role="status" className="my-2 min-h-10 text-center text-sm font-semibold leading-5 text-rose-950">{message}</p>
      <button ref={primary} onClick={action} disabled={!tray.length && !served} className="min-h-12 w-full rounded-2xl bg-rose-800 px-4 py-3 text-lg font-bold text-white disabled:bg-rose-100 disabled:text-rose-800">{finished ? 'Play again' : served ? 'Next order' : 'Serve order'}</button>
      <p className="mt-2 text-center text-xs text-slate-600">Pretend play. Your treats and tokens stay yours.</p>
    </div>
  </dialog>;
}
function TreatPicture({ id, label }: { id: BakeryTreatId; label?: string }) {
  return <span className="relative block h-12 w-12 shrink-0"><Image src={`/images/bakery/${id}.webp`} alt={label ?? ''} fill sizes="48px" className="object-contain" /></span>;
}
