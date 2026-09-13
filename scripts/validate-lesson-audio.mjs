import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { HOME_NARRATION } from '../src/lib/home-narration.ts';
import { READING_STORIES } from '../src/lib/content/reading-stories.ts';
import { LESSONS } from '../src/lib/lessons.ts';
import { MATH_LABS } from '../src/lib/math-labs.ts';
import { narrationFor, narrationId, NARRATION_SLOTS } from '../src/lib/lesson-narration.ts';
import { forSpeech } from '../src/lib/speech-text.ts';
import { VOICE_MODEL, VOICE_SETTINGS, VOICE_OUTPUT_FORMAT } from '../src/lib/voice-config.ts';

const manifest=JSON.parse(await readFile('src/lib/generated/lesson-audio.json','utf8'));
const expected=[
  ...READING_STORIES.flatMap(story => [{id:`reading:${story.id}:passage`,text:forSpeech(story.passage)}, ...story.questions.map((q,i)=>({id:`reading:${story.id}:q${i}`,text:forSpeech(q.prompt)}))]),
  ...Object.entries(HOME_NARRATION).map(([id,text])=>({id,text:forSpeech(text)})),
  ...LESSONS.flatMap(lesson=>NARRATION_SLOTS.map(slot=>({id:narrationId(lesson,slot),text:forSpeech(narrationFor(lesson,slot))}))),
  ...Object.entries(MATH_LABS).map(([id,lab])=>({id:`${id}:explore`,text:forSpeech(lab.instruction)})),
];
assert.equal(manifest.provider,'ElevenLabs');
assert.equal(manifest.modelId,VOICE_MODEL);
assert.deepEqual(manifest.voiceSettings,VOICE_SETTINGS);
assert.equal(manifest.outputFormat,VOICE_OUTPUT_FORMAT);
assert.equal(Object.keys(manifest.clips).length,expected.length);
let bytes=0;
let seconds=0;
const inspect=process.argv.includes('--inspect-audio');
if(inspect && process.platform!=='darwin') throw new Error('--inspect-audio uses the macOS audio-file inspector.');
for(const {id,text} of expected) {
  const clip=manifest.clips[id];
  assert.ok(clip,`${id}: missing generated clip`);
  assert.equal(clip.text,text,`${id}: narration is stale`);
  const fingerprint=createHash('sha256').update(JSON.stringify({text,voiceId:manifest.voiceId,model:VOICE_MODEL,settings:VOICE_SETTINGS,format:VOICE_OUTPUT_FORMAT})).digest('hex');
  assert.equal(clip.fingerprint,fingerprint,`${id}: voice or script changed`);
  assert.equal(clip.url,`/audio/lessons/${fingerprint}.mp3`);
  const file=await readFile(`public${clip.url}`);
  assert.equal(file.length,clip.bytes);
  assert.equal(createHash('sha256').update(file).digest('hex'),clip.sha256,`${id}: corrupted file`);
  assert.ok(file.subarray(0,3).toString()==='ID3' || (file[0]===255 && (file[1]&224)===224),`${id}: not an MP3`);
  bytes+=file.length;
  if(inspect) {
    const info=execFileSync('/usr/bin/afinfo',[`public${clip.url}`],{encoding:'utf8'});
    const duration=Number(info.match(/estimated duration:\s*([\d.]+)/)?.[1]);
    assert.ok(Number.isFinite(duration) && duration>0.25 && duration<120,`${id}: invalid audio duration`);
    assert.match(info,/44100 Hz, .mp3/,`${id}: unexpected output format`);
    seconds+=duration;
  }
}
console.log(JSON.stringify({validatedClips:expected.length,bytes,...(inspect?{inspectedAudioFiles:expected.length,totalMinutes:Math.round(seconds/60*10)/10}:{})}));
