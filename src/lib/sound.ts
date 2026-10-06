// Small, locally hosted CC0 cues. The context is also shared with background
// music so one user gesture unlocks the mix on iPad and other mobile browsers.
import { audioSettings, initializeAudioSettings, setAudioEnabled, subscribeAudioSettings } from '@/lib/audio-settings';
import { speechState } from '@/lib/speech';
const SOURCES = {
  click: '/sounds/ui-click.wav', correct: '/sounds/answer-correct.wav',
  wrong: '/sounds/answer-retry.wav', quizStart: '/sounds/round-start.wav',
  tally: '/sounds/reward-purchase.wav', purchase: '/sounds/reward-purchase.wav',
  win: '/sounds/round-win.wav', move: '/sounds/reward-move.wav', sell: '/sounds/reward-sell.wav',
} as const;
export type SoundName = keyof typeof SOURCES;
const VOLUMES: Record<SoundName, number> = { click: .12, correct: .32, wrong: .14, quizStart: .2, tally: .25, purchase: .3, win: .28, move: .16, sell: .2 };
let ctx: AudioContext | null = null;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};
const loading: Partial<Record<SoundName, Promise<AudioBuffer | undefined>>> = {};
const lastPlayed: Partial<Record<SoundName, number>> = {};
const active = new Set<AudioBufferSourceNode>();
let wired = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx || ctx.state === 'closed') ctx = new AC();
  return ctx;
}
export function unlockAudio() { const context = getAudioContext(); if (context?.state === 'suspended') void context.resume().catch(() => {}); }
function stopEffects() { active.forEach(source => { try { source.stop(); } catch { /* Already ended. */ } }); active.clear(); }
function wirePreferences() {
  initializeAudioSettings();
  if (wired || typeof window === 'undefined') return;
  wired = true;
  subscribeAudioSettings(() => { if (!audioSettings().effects) stopEffects(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopEffects(); });
}
async function ensureLoaded(name: SoundName): Promise<AudioBuffer | undefined> {
  if (buffers[name]) return buffers[name];
  if (loading[name]) return loading[name];
  const context = getAudioContext();
  if (!context) return;
  const promise = fetch(SOURCES[name]).then(response => {
    if (!response.ok) throw new Error('Sound unavailable');
    return response.arrayBuffer();
  }).then(data => context.decodeAudioData(data)).then(buffer => { buffers[name] = buffer; return buffer; }).catch(() => undefined).finally(() => { delete loading[name]; });
  loading[name] = promise;
  return promise;
}
export function preloadSounds(...names: SoundName[]) {
  wirePreferences();
  for (const name of names.length ? names : Object.keys(SOURCES) as SoundName[]) void ensureLoaded(name);
}
export function setMuted(value: boolean) { setAudioEnabled('effects', !value); }
export function isMuted() { return !audioSettings().effects; }
export function playSound(name: SoundName, rate = 1) {
  wirePreferences();
  if (isMuted() || document.hidden) return;
  const context = getAudioContext();
  if (!context) return;
  const resumed = context.state === 'suspended' ? context.resume().catch(() => {}) : Promise.resolve();
  const requested = performance.now();
  if (requested - (lastPlayed[name] ?? -Infinity) < (name === 'click' ? 70 : 250)) return;
  lastPlayed[name] = requested;
  const play = (buffer: AudioBuffer | undefined) => {
    // Never play a late network response over another screen or after muting.
    if (!buffer || isMuted() || document.hidden || performance.now() - requested > 1500 || context.state !== 'running') return;
    const source = context.createBufferSource();
    source.buffer = buffer; source.playbackRate.value = Math.max(.8, Math.min(rate, 1.3));
    const gain = context.createGain();
    gain.gain.value = VOLUMES[name] * (speechState().status === 'playing' ? .35 : 1);
    source.connect(gain).connect(context.destination);
    active.add(source);
    source.onended = () => { active.delete(source); source.disconnect(); gain.disconnect(); };
    source.start();
  };
  if (buffers[name] && context.state === 'running') play(buffers[name]);
  else void Promise.all([ensureLoaded(name), resumed]).then(([buffer]) => play(buffer));
}
export function playClick() { playSound('click'); }
export function playCorrect(combo = 0) { playSound('correct', Math.min(1 + combo * .04, 1.2)); }
export function playWrong() { playSound('wrong'); }
export function playQuizStart() { playSound('quizStart'); }
export function playTally() { playSound('tally'); }
