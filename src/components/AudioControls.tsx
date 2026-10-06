'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { audioSettings, initializeAudioSettings, serverAudioSettings, setAudioEnabled, subscribeAudioSettings } from '@/lib/audio-settings';
import { unlockAudio } from '@/lib/sound';
export function AudioControls() {
  const settings = useSyncExternalStore(subscribeAudioSettings, audioSettings, serverAudioSettings);
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(initializeAudioSettings, []);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (menu.current && !menu.current.contains(event.target as Node)) menu.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menu.current?.open) {
        menu.current.open = false;
        menu.current.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  return <details ref={menu} className="audio-controls relative">
    <summary aria-label="Sound settings" className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 [&::-webkit-details-marker]:hidden">
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9v6h4l5 4V5L7 9H3zM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14"/></svg>
    </summary>
    <div className="absolute -right-16 top-14 sm:right-0 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
      <p className="px-2 py-1 font-bold">Sound settings</p>
      {(['music', 'effects'] as const).map(kind => <button key={kind} type="button" aria-pressed={settings[kind]} onClick={() => { unlockAudio(); setAudioEnabled(kind, !settings[kind]); }} className="mt-2 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 font-bold text-slate-800"><span>{kind === 'music' ? 'Music' : 'Sound effects'}</span><span className={settings[kind] ? 'text-emerald-700' : 'text-slate-500'}>{settings[kind] ? 'On' : 'Off'}</span></button>)}
      <Link onClick={() => { if (menu.current) menu.current.open = false; }} href="/music-credits" className="mt-2 flex min-h-11 items-center px-2 text-sm font-bold text-sky-800 underline">Music & sound credits</Link>
    </div>
  </details>;
}
