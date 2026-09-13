// Shared ElevenLabs playback. Recorded lesson clips play immediately; other
// text uses the server route. Never substitute the operating system voice.
import { forSpeech } from "@/lib/speech-text";
export { forSpeech } from "@/lib/speech-text";

type Listener = () => void;
export type SpeechState = { id: string | null; status: "idle" | "loading" | "playing" | "error"; message: string | null };
const IDLE: SpeechState = { id: null, status: "idle", message: null };
let state: SpeechState = IDLE;
const listeners = new Set<Listener>();
let currentAudio: HTMLAudioElement | null = null;
let pending: AbortController | null = null;
let token = 0;
let lastRequest: { id: string; text: string; audioSrc?: string } | null = null;

export function speechSupported(): boolean { return typeof window !== "undefined"; }
export function speechState(): SpeechState { return state; }
export function serverSpeechState(): SpeechState { return IDLE; }
export function speakingId(): string | null { return state.status === "loading" || state.status === "playing" ? state.id : null; }
export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function publish(next: SpeechState) { state = next; for (const listener of listeners) listener(); }

const audioCache = new Map<string, string>();
const CACHE_MAX = 40;
function cacheGet(text: string): string | undefined {
  const url = audioCache.get(text);
  if (url) { audioCache.delete(text); audioCache.set(text, url); }
  return url;
}
function cachePut(text: string, url: string) {
  audioCache.set(text, url);
  if (audioCache.size > CACHE_MAX) {
    const key = audioCache.keys().next().value;
    if (key !== undefined) {
      const old = audioCache.get(key);
      audioCache.delete(key);
      if (old) URL.revokeObjectURL(old);
    }
  }
}
function invalidateCache(text: string) {
  const url = audioCache.get(text);
  if (url) URL.revokeObjectURL(url);
  audioCache.delete(text);
}
function haltPlayback() {
  pending?.abort();
  pending = null;
  if (currentAudio) {
    currentAudio.onended = currentAudio.onerror = currentAudio.onplaying = null;
    currentAudio.pause();
    currentAudio = null;
  }
}

function fail(id: string, myToken: number, message: string) {
  if (token !== myToken) return;
  haltPlayback();
  publish({ id, status: "error", message });
}

async function playEleven(id: string, text: string, myToken: number, audioSrc?: string) {
  let url = audioSrc ?? cacheGet(text);
  if (!url) {
    const controller = new AbortController();
    pending = controller;
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    try {
      const res = await fetch("/api/tts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }), signal: controller.signal,
      });
      if (!res.ok) throw new Error("Voice service unavailable");
      const blob = await res.blob();
      if (token !== myToken) return;
      if (!blob.size || !blob.type.startsWith("audio/")) throw new Error("Invalid audio");
      url = URL.createObjectURL(blob);
      cachePut(text, url);
    } finally {
      window.clearTimeout(timeout);
      if (pending === controller) pending = null;
    }
  }
  if (token !== myToken) return;
  const audio = new Audio(url);
  currentAudio = audio;
  audio.onplaying = () => {
    if (token === myToken) publish({ id, status: "playing", message: null });
  };
  audio.onended = () => {
    if (token !== myToken) return;
    currentAudio = null;
    publish(IDLE);
  };
  audio.onerror = () => {
    if (token !== myToken) return;
    if (!audioSrc) invalidateCache(text);
    fail(id, myToken, "The voice could not load. Tap Retry voice to try again.");
  };
  // For a recorded or cached clip, play() runs inside the user's tap, before
  // any await. If autoplay is blocked, Retry voice is another real gesture.
  await audio.play();
}

export function speak(id: string, text: string, audioSrc?: string) {
  if (!speechSupported()) return;
  haltPlayback();
  const myToken = ++token;
  const cleaned = forSpeech(text);
  if (!cleaned) { publish(IDLE); return; }
  lastRequest = { id, text: cleaned, audioSrc };
  publish({ id, status: "loading", message: null });
  void playEleven(id, cleaned, myToken, audioSrc).catch((error: unknown) => {
    const blocked = error instanceof Error && error.name === "NotAllowedError";
    fail(id, myToken, blocked ? "Tap Retry voice to start the narration." : "The voice is unavailable right now. Tap Retry voice, or keep reading.");
  });
}
export function retrySpeech() {
  if (lastRequest) speak(lastRequest.id, lastRequest.text, lastRequest.audioSrc);
}
export function stop() {
  ++token;
  haltPlayback();
  lastRequest = null;
  publish(IDLE);
}
