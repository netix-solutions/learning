// Shared read-aloud controller for the whole app.
//
// Primary path: high-quality ElevenLabs voices via our server route (/api/tts),
// which keeps the API key server-side. Fallback: the browser's built-in Web
// Speech API (on-device, free, offline) whenever ElevenLabs is unavailable —
// not configured, offline, rate-limited, or blocked by autoplay.
//
// One thing plays at a time across the app, so starting a new read stops the
// previous one. Components subscribe to know which id is currently playing.

type Listener = () => void;
const listeners = new Set<Listener>();
let currentId: string | null = null;

// ElevenLabs playback uses an <audio> element; the fallback uses speechSynthesis.
let currentAudio: HTMLAudioElement | null = null;
// Monotonic token: bumping it invalidates any in-flight fetch/playback so a
// newer request always wins the race.
let token = 0;

let voice: SpeechSynthesisVoice | null = null;

export function speechSupported(): boolean {
  // In the browser we always have a read-aloud path: ElevenLabs first, Web
  // Speech as fallback. So the listen button shows whenever we're client-side.
  return typeof window !== "undefined";
}

function webSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice() {
  if (!webSpeechSupported()) return;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|samantha|aria|jenny|zira/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
}

if (webSpeechSupported()) {
  pickVoice();
  // Voices load asynchronously in most browsers.
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function notify() {
  for (const l of listeners) l();
}

function setCurrent(id: string | null) {
  currentId = id;
  notify();
}

/**
 * Make question text read naturally aloud to a kid: speak fill-in-the-blank
 * gaps as "blank", voice math symbols as words, and drop emoji — so the engine
 * never reads the literal underscores, symbols, or icons.
 */
export function forSpeech(text: string): string {
  return text
    // Fill-in-the-blank markers (e.g. "Living things need ___ to grow", or
    // "7 ___ 17") — a teacher reads the gap as "blank", not "underscore".
    .replace(/_{2,}/g, " blank ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/−/g, " minus ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 minus $2")
    .replace(/\+/g, " plus ")
    .replace(/=/g, " equals ")
    .replace(/≠/g, " is not equal to ")
    .replace(/≤/g, " less than or equal to ")
    .replace(/≥/g, " greater than or equal to ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/(\d)\s*%/g, "$1 percent")
    .replace(/\$\s*(\d)/g, "$1 dollars")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, " ")
    // No awkward pause before punctuation (e.g. "blank ." -> "blank.").
    .replace(/\s+([.,!?;:])/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- Client-side audio cache (object URLs by spoken text) ------------------
// Avoids re-fetching ElevenLabs for text the kid replays (same question, etc.).
const CACHE_MAX = 40;
const audioCache = new Map<string, string>();
function cacheGet(text: string): string | undefined {
  const url = audioCache.get(text);
  if (url) {
    audioCache.delete(text);
    audioCache.set(text, url);
  }
  return url;
}
function cachePut(text: string, url: string) {
  audioCache.set(text, url);
  if (audioCache.size > CACHE_MAX) {
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) {
      const stale = audioCache.get(oldest);
      audioCache.delete(oldest);
      if (stale) URL.revokeObjectURL(stale);
    }
  }
}

/** Pause/cancel any current playback without touching the token or currentId. */
function haltPlayback() {
  if (currentAudio) {
    currentAudio.onended = currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio = null;
  }
  if (webSpeechSupported()) window.speechSynthesis.cancel();
}

async function playEleven(id: string, text: string, myToken: number): Promise<void> {
  let url = cacheGet(text);
  if (!url) {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`tts ${res.status}`);
    const blob = await res.blob();
    if (token !== myToken) return; // a newer request superseded us
    url = URL.createObjectURL(blob);
    cachePut(text, url);
  }
  if (token !== myToken) return;

  const audio = new Audio(url);
  currentAudio = audio;
  audio.onended = audio.onerror = () => {
    if (currentId === id) {
      currentAudio = null;
      setCurrent(null);
    }
  };
  // play() can reject (autoplay policy) — let the caller decide on fallback.
  await audio.play();
}

function webSpeak(id: string, text: string, myToken: number) {
  if (!webSpeechSupported()) {
    if (token === myToken) setCurrent(null);
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "en-US";
  u.rate = 0.95; // a touch slower for young readers
  u.pitch = 1.05;
  u.onend = u.onerror = () => {
    if (currentId === id) setCurrent(null);
  };
  if (token !== myToken) return;
  synth.speak(u);
}

export function speak(id: string, text: string) {
  if (typeof window === "undefined") return;
  haltPlayback();
  const cleaned = forSpeech(text);
  const myToken = ++token;
  if (!cleaned) {
    setCurrent(null);
    return;
  }
  // Optimistically mark active so the button reflects the tap during the fetch.
  setCurrent(id);

  playEleven(id, cleaned, myToken).catch(() => {
    // ElevenLabs failed (not configured, offline, rate-limited, autoplay
    // blocked…) — fall back to the on-device voice if this is still current.
    if (token === myToken) webSpeak(id, cleaned, myToken);
  });
}

export function stop() {
  haltPlayback();
  token++; // invalidate any in-flight fetch
  setCurrent(null);
}

export function speakingId(): string | null {
  return currentId;
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
