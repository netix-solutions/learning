// Tiny shared controller around the browser's built-in Web Speech API.
// On-device, free, private (nothing leaves the device), works offline in the PWA.
// One utterance plays at a time across the whole app, so tapping a new 🔊 stops
// whatever was reading. Components subscribe to know which id is currently speaking.

type Listener = () => void;
const listeners = new Set<Listener>();
let currentId: string | null = null;
let voice: SpeechSynthesisVoice | null = null;

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice() {
  if (!speechSupported()) return;
  const voices = window.speechSynthesis.getVoices();
  voice =
    voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|samantha|aria|jenny|zira/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null;
}

if (speechSupported()) {
  pickVoice();
  // Voices load asynchronously in most browsers.
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function notify() {
  for (const l of listeners) l();
}

/** Make text read naturally for kids: speak math symbols, drop emoji. */
export function forSpeech(text: string): string {
  return text
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/−/g, " minus ")
    .replace(/(\d)\s*-\s*(\d)/g, "$1 minus $2")
    .replace(/\+/g, " plus ")
    .replace(/=/g, " equals ")
    .replace(/</g, " less than ")
    .replace(/>/g, " greater than ")
    .replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function speak(id: string, text: string) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const cleaned = forSpeech(text);
  if (!cleaned) {
    currentId = null;
    notify();
    return;
  }
  const u = new SpeechSynthesisUtterance(cleaned);
  if (voice) u.voice = voice;
  u.lang = voice?.lang || "en-US";
  u.rate = 0.95; // a touch slower for young readers
  u.pitch = 1.05;
  u.onend = u.onerror = () => {
    if (currentId === id) {
      currentId = null;
      notify();
    }
  };
  currentId = id;
  notify();
  synth.speak(u);
}

export function stop() {
  if (speechSupported()) window.speechSynthesis.cancel();
  currentId = null;
  notify();
}

export function speakingId(): string | null {
  return currentId;
}

export function subscribe(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}
