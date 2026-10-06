'use client';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { audioSettings, initializeAudioSettings, serverAudioSettings, subscribeAudioSettings } from '@/lib/audio-settings';
import { musicFor } from '@/lib/music';
import { getAudioContext } from '@/lib/sound';
import { speechState, subscribe as subscribeSpeech } from '@/lib/speech';

/** One player survives navigation. A Web Audio gain controls iOS volume too. */
export function BackgroundMusic() {
  const path = usePathname();
  const settings = useSyncExternalStore(subscribeAudioSettings, audioSettings, serverAudioSettings);
  const player = useRef<HTMLAudioElement | null>(null);
  const playlist = musicFor(path, settings.theme).join(',');
  const quiet = path?.startsWith('/practice') || path?.startsWith('/learn') || path?.includes('preview');
  useEffect(initializeAudioSettings, []);
  useEffect(() => {
    const audio = player.current;
    if (!audio) return;
    return () => { audio.pause(); audio.removeAttribute('src'); audio.load(); };
  }, []);
  useEffect(() => {
    const audio = player.current;
    if (!audio) return;
    const tracks = playlist ? playlist.split(',') : [];
    if (!settings.music || !tracks.length) { audio.pause(); return; }
    let disposed = false;
    let index = 0;
    let gain: GainNode | null = null;
    // Reuse a media source across effects: a media element may only be connected once.
    const context = getAudioContext();
    if (!context) return;
    let connection = connections.get(audio);
    if (!connection) {
      const source = context.createMediaElementSource(audio);
      const node = context.createGain();
      node.gain.value = 0;
      source.connect(node).connect(context.destination);
      connection = { source, gain: node };
      connections.set(audio, connection);
    }
    gain = connection.gain;
    const mix = () => {
      const speaking = ['loading', 'playing'].includes(speechState().status);
      gain!.gain.setTargetAtTime(speaking ? 0.012 : quiet ? 0.055 : 0.12, context.currentTime, 0.12);
    };
    const start = () => {
      if (disposed || document.hidden) return;
      // Only resume a context here after a user gesture; initial play may be blocked.
      if (context.state !== 'running') return;
      mix();
      void audio.play().catch(() => { /* A later gesture can retry. */ });
    };
    const gesture = () => { void context.resume().then(start).catch(() => {}); };
    const visibility = () => { if (document.hidden) audio.pause(); else start(); };
    const load = () => {
      const src = `/music/${tracks[index]}.m4a`;
      if (audio.getAttribute('src') !== src) audio.src = src;
      audio.loop = tracks.length === 1;
      start();
    };
    const ended = () => { index = (index + 1) % tracks.length; load(); };
    const unsubscribe = subscribeSpeech(mix);
    mix(); load();
    window.addEventListener('pointerdown', gesture);
    window.addEventListener('keydown', gesture);
    document.addEventListener('visibilitychange', visibility);
    audio.addEventListener('ended', ended);
    return () => {
      disposed = true; audio.pause(); unsubscribe();
      window.removeEventListener('pointerdown', gesture);
      window.removeEventListener('keydown', gesture);
      document.removeEventListener('visibilitychange', visibility);
      audio.removeEventListener('ended', ended);
    };
  }, [playlist, settings.music, quiet]);
  return <audio ref={player} preload="none" aria-hidden="true" data-background-music />;
}
const connections = new WeakMap<HTMLAudioElement, { source: MediaElementAudioSourceNode; gain: GainNode }>();
