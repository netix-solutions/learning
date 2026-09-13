// Uses the existing ElevenLabs account. No browser/OS speech is generated.
// Node 22.18+ required for native TypeScript stripping. --dry-run makes no API calls.
// Content-addressed assets and incremental manifest writes make reruns resumable.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { MATH_LABS } from '../src/lib/math-labs.ts';
import { HOME_NARRATION } from '../src/lib/home-narration.ts';
import { LESSONS } from '../src/lib/lessons.ts';
import { narrationFor, narrationId, NARRATION_SLOTS } from '../src/lib/lesson-narration.ts';
import { forSpeech } from '../src/lib/speech-text.ts';
import { VOICE_MODEL, VOICE_SETTINGS, VOICE_OUTPUT_FORMAT, DEFAULT_VOICE, MAX_SPEECH_CHARS } from '../src/lib/voice-config.ts';

try { process.loadEnvFile('.env.local'); } catch { /* CI may inject env directly. */ }
const dryRun = process.argv.includes('--dry-run');
const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE;
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!dryRun && !apiKey) throw new Error('ELEVENLABS_API_KEY is required.');
const manifestPath = 'src/lib/generated/lesson-audio.json';
let prior = { clips: {} };
try { prior = JSON.parse(await readFile(manifestPath, 'utf8')); } catch { /* First generation. */ }
const manifest = { version: 1, provider: 'ElevenLabs', modelId: VOICE_MODEL, voiceId, voiceSettings: VOICE_SETTINGS, outputFormat: VOICE_OUTPUT_FORMAT, clips: {} };
function makeJob(id, narration) {
  const text = forSpeech(narration);
  if (!text || text.length > MAX_SPEECH_CHARS) throw new Error(`Invalid narration length: ${id}`);
  const fingerprint = createHash('sha256').update(JSON.stringify({text,voiceId,model:VOICE_MODEL,settings:VOICE_SETTINGS,format:VOICE_OUTPUT_FORMAT})).digest('hex');
  return { id, text, fingerprint, url: `/audio/lessons/${fingerprint}.mp3` };
}
const jobs = [
  ...Object.entries(HOME_NARRATION).map(([id, text]) => makeJob(id, text)),
  ...LESSONS.flatMap(lesson => NARRATION_SLOTS.map(slot => makeJob(narrationId(lesson, slot), narrationFor(lesson, slot)))),
  ...Object.entries(MATH_LABS).map(([id, lab]) => makeJob(`${id}:explore`, lab.instruction)),
];
const pending = [];
for (const job of jobs) {
  const old = prior.clips[job.id];
  let reusable = false;
  if (old?.fingerprint === job.fingerprint && old.url === job.url) {
    try {
      const file = await readFile(`public${job.url}`);
      reusable = file.length === old.bytes && createHash('sha256').update(file).digest('hex') === old.sha256;
    } catch { /* Missing file needs regeneration. */ }
  }
  if (reusable) manifest.clips[job.id] = old;
  else pending.push(job);
}
console.log(JSON.stringify({clips:jobs.length,reused:jobs.length-pending.length,toGenerate:pending.length,characters:pending.reduce((n,j)=>n+j.text.length,0),dryRun}));
if (dryRun) process.exit(0);
await mkdir('public/audio/lessons', {recursive:true});
await mkdir('src/lib/generated', {recursive:true});
async function saveManifest() {
  await writeFile(`${manifestPath}.tmp`, JSON.stringify(manifest, null, 2)+'\n');
  await rename(`${manifestPath}.tmp`,manifestPath);
}
for (const [index, job] of pending.entries()) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=${VOICE_OUTPUT_FORMAT}`, {
    method:'POST', signal:AbortSignal.timeout(60_000),
    headers:{'xi-api-key':apiKey,'Content-Type':'application/json',Accept:'audio/mpeg'},
    body:JSON.stringify({text:job.text,model_id:VOICE_MODEL,voice_settings:VOICE_SETTINGS,seed:parseInt(job.fingerprint.slice(0,8),16)}),
  });
  if (!res.ok) {
    const detail = await res.json().catch(()=>({}));
    // Do not log provider response bodies or secrets. Completed files are kept.
    throw new Error(`ElevenLabs ${res.status} (${detail.detail?.status ?? 'request_failed'}) at ${job.id}; rerun to resume.`);
  }
  if (!res.headers.get('content-type')?.startsWith('audio/')) throw new Error(`Non-audio response for ${job.id}`);
  const audio = Buffer.from(await res.arrayBuffer());
  if (audio.length < 1000) throw new Error(`Empty/truncated audio for ${job.id}`);
  await writeFile(`public${job.url}.tmp`,audio);
  await rename(`public${job.url}.tmp`,`public${job.url}`);
  manifest.clips[job.id] = {...job,bytes:audio.length,sha256:createHash('sha256').update(audio).digest('hex')};
  await saveManifest();
  if ((index+1)%10===0 || index===pending.length-1) console.log(`Generated ${index+1}/${pending.length} clips`);
}
await saveManifest();
console.log('Lesson narration generation complete. Files are reusable and ready for playback review.');
