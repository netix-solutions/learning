// Tiny sound-effect player built on the Web Audio API.
//
// Web Audio (rather than a pool of <audio> elements) gives us low latency and
// lets rapid taps overlap cleanly. The AudioContext is created lazily and
// resumed inside a user gesture, so we never fight the browser's autoplay
// policy. Everything is on-device and works offline in the PWA.

const SOURCES = {
  click: "/sounds/click.wav",
  correct: "/sounds/correct.wav",
  wrong: "/sounds/wrong.wav",
  quizStart: "/sounds/quiz-start.wav",
  tally: "/sounds/tally.wav",
} as const;

export type SoundName = keyof typeof SOURCES;

// Per-sound mixing so the celebratory cue isn't as loud as a tap, and the
// "wrong" tone stays gentle rather than harsh.
const VOLUMES: Record<SoundName, number> = {
  click: 0.35,
  correct: 0.55,
  wrong: 0.4,
  quizStart: 0.5,
  tally: 0.5,
};

let ctx: AudioContext | null = null;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};
const loading: Partial<Record<SoundName, Promise<void>>> = {};
let muted = false;

function supported() {
  return (
    typeof window !== "undefined" &&
    ("AudioContext" in window || "webkitAudioContext" in window)
  );
}

function getCtx(): AudioContext | null {
  if (!supported()) return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    ctx = new AC();
  }
  return ctx;
}

/** Fetch + decode a sound once. Safe to call repeatedly. */
function ensureLoaded(name: SoundName): Promise<void> {
  if (buffers[name]) return Promise.resolve();
  const existing = loading[name];
  if (existing) return existing;
  const audioCtx = getCtx();
  if (!audioCtx) return Promise.resolve();
  const p = fetch(SOURCES[name])
    .then((r) => r.arrayBuffer())
    .then((data) => audioCtx.decodeAudioData(data))
    .then((decoded) => {
      buffers[name] = decoded;
    })
    .catch(() => {
      // Network/codec failure: stay silent rather than throwing on every tap.
    });
  loading[name] = p;
  return p;
}

/** Warm up decoding ahead of first use (optional). */
export function preloadSounds(...names: SoundName[]) {
  for (const n of names.length ? names : (Object.keys(SOURCES) as SoundName[])) {
    void ensureLoaded(n);
  }
}

export function setMuted(value: boolean) {
  muted = value;
}

export function isMuted() {
  return muted;
}

/** Play a sound. Call from inside a user gesture (e.g. a click handler). */
export function playSound(name: SoundName, rate = 1) {
  if (muted) return;
  const audioCtx = getCtx();
  if (!audioCtx) return;
  // A gesture lets us resume a context the browser suspended on load.
  if (audioCtx.state === "suspended") void audioCtx.resume();

  const buffer = buffers[name];
  if (!buffer) {
    // Not decoded yet — kick off loading so the next plays have sound.
    void ensureLoaded(name);
    return;
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = rate;
  const gain = audioCtx.createGain();
  gain.gain.value = VOLUMES[name];
  source.connect(gain).connect(audioCtx.destination);
  source.start(0);
}

/** Convenience: the UI tap sound. */
export function playClick() {
  playSound("click");
}

/**
 * Convenience: the celebratory "correct answer" sound. Pass the current combo
 * (answers right in a row) and the pitch steps up with each one — a classic
 * game cue that makes a streak *feel* like a streak. Capped so it never gets
 * chipmunk-silly.
 */
export function playCorrect(combo = 0) {
  playSound("correct", Math.min(1 + combo * 0.06, 1.3));
}

/** Convenience: the gentle "wrong answer" sound. */
export function playWrong() {
  playSound("wrong");
}

/** Convenience: the musical reveal that opens a new quiz. */
export function playQuizStart() {
  playSound("quizStart");
}

/** Convenience: the "recharge" whir while the results-screen points tally up. */
export function playTally() {
  playSound("tally");
}
