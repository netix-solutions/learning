import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { VOICE_MODEL, VOICE_SETTINGS, DEFAULT_VOICE, VOICE_OUTPUT_FORMAT, MAX_SPEECH_CHARS } from "@/lib/voice-config";
import { forSpeech } from "@/lib/speech-text";

// Node runtime: we hold a secret key and call ElevenLabs server-side so the
// key never reaches the browser.
export const runtime = "nodejs";
export const maxDuration = 30;

const ELEVEN_API = "https://api.elevenlabs.io/v1/text-to-speech";
// Coarse per-student burst guard (in-memory, per serverless instance), matching
// the /api/teach pattern — enough to stop a kid hammering a billed endpoint.
const hits = new Map<string, number[]>();
const LIMIT = 40;
const WINDOW_MS = 60_000;
function rateLimited(id: string): boolean {
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > LIMIT;
}

// Tiny in-memory LRU of synthesized audio. The same question/explanation gets
// read aloud many times, so caching cuts both latency and ElevenLabs cost.
const CACHE_MAX = 200;
const cache = new Map<string, Buffer>();
function cacheGet(key: string): Buffer | undefined {
  const v = cache.get(key);
  if (v) {
    cache.delete(key); // refresh recency
    cache.set(key, v);
  }
  return v;
}
function cacheSet(key: string, value: Buffer) {
  cache.set(key, value);
  if (cache.size > CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
}

export async function POST(req: Request) {
  // 1. Must be signed in — keeps the billed endpoint off the open internet.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Please sign in first.", { status: 401 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    // The client offers retry/read-on, never the operating system voice.
    return new Response("Voice not configured.", { status: 503 });
  }

  if (rateLimited(user.id))
    return new Response("Slow down a little — try again soon.", { status: 429 });

  // 2. Validate input.
  const body = (await req.json().catch(() => ({}))) as { text?: string };
  if (typeof body.text !== "string" || !body.text.trim()) return new Response("Missing text.", { status: 400 });
  if (body.text.length > MAX_SPEECH_CHARS) return new Response("Text is too long to read in one clip.", { status: 413 });
  const text = forSpeech(body.text);
  if (!text) return new Response("Missing text.", { status: 400 });

  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
  const cacheKey = createHash("sha1")
    .update(JSON.stringify({ model: VOICE_MODEL, voiceId, settings: VOICE_SETTINGS, text }))
    .digest("hex");

  // 3. Serve from cache when we can.
  const cached = cacheGet(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=86400",
        "X-Cache": "HIT",
      },
    });
  }

  // 4. Synthesize with ElevenLabs.
  let upstream: globalThis.Response;
  try {
    upstream = await fetch(`${ELEVEN_API}/${encodeURIComponent(voiceId)}?output_format=${VOICE_OUTPUT_FORMAT}`, {
      method: "POST",
      signal: AbortSignal.timeout(22_000),
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: VOICE_MODEL,
        voice_settings: VOICE_SETTINGS,
      }),
    });
  } catch {
    return new Response("Voice service unreachable.", { status: 502 });
  }

  if (!upstream.ok) {
    // Do not log provider response bodies or credentials.
    console.error("[tts] ElevenLabs error", upstream.status);
    return new Response("Voice service error.", { status: 502 });
  }

  if (!upstream.headers.get("content-type")?.startsWith("audio/")) {
    return new Response("Invalid voice response.", { status: 502 });
  }
  const audio = Buffer.from(await upstream.arrayBuffer());
  if (!audio.length) return new Response("Empty voice response.", { status: 502 });
  cacheSet(cacheKey, audio);

  return new Response(new Uint8Array(audio), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "private, max-age=86400",
      "X-Cache": "MISS",
    },
  });
}
