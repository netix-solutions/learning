'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { RewardDiscovery } from '@/lib/reward-discovery';

const THEMES = {
  train: { backdrop: '/images/dinosaurs/railway.webp', color: '#075985', action: 'All aboard!' },
  dinosaurs: { backdrop: '/images/dinosaurs/habitat.webp', color: '#166534', action: 'A new adventure!' },
  bakery: { backdrop: '/images/bakery/bakery-shelf.webp', color: '#9f1239', action: 'Fresh for your shelf!' },
};
export function RewardDiscoveryDialog({ discovery, onClose, onVisit }: { discovery: RewardDiscovery; onClose: () => void; onVisit: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const theme = THEMES[discovery.theme];
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); };
  }, []);
  return <dialog ref={dialog} onCancel={onClose} aria-labelledby="reward-discovery-title" aria-describedby="reward-discovery-description" className="reward-discovery-dialog m-auto w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-[2rem] border-0 bg-white p-0 text-slate-800 shadow-2xl">
    <div className="reward-discovery-stage relative isolate overflow-hidden" style={{ backgroundColor: theme.color }}>
      <Image src={theme.backdrop} alt="" fill sizes="448px" className="object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      <p className="relative pt-5 text-center text-lg font-extrabold text-white">{discovery.firstOfKind ? 'New discovery!' : 'Another favorite!'}</p>
      <div className="reward-discovery-art relative mx-auto h-40 w-[85%] sm:h-48"><Image src={discovery.image} alt="" fill priority sizes="380px" className="object-contain drop-shadow-xl" /></div>
      <p className="relative pb-4 text-center font-bold text-white">{theme.action}</p>
    </div>
    <div className="p-5 text-center sm:p-6">
      <h2 id="reward-discovery-title" className="font-display text-2xl font-extrabold">{discovery.name}</h2>
      <p id="reward-discovery-description" className="mt-2 text-slate-600">It’s in your collection. You have <strong>{discovery.balance} tokens</strong> left.</p>
      <p className="mt-4 text-sm font-bold text-slate-700">{discovery.unique} of {discovery.total} {discovery.collectionLabel} in your collection</p>
      <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${discovery.total ? discovery.unique / discovery.total * 100 : 0}%`, backgroundColor: theme.color }} /></div>
      <button autoFocus onClick={onVisit} className="mt-5 min-h-12 w-full rounded-2xl px-4 py-3 font-bold text-white" style={{ backgroundColor: theme.color }}>{discovery.destination}</button>
      <button onClick={onClose} className="mt-2 min-h-12 w-full rounded-2xl px-4 py-3 font-bold text-slate-600 hover:bg-slate-50">Keep shopping</button>
    </div>
  </dialog>;
}
