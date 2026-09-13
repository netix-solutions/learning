// Exercise the real controller with a browser/audio test double. No API calls.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';
import { forSpeech } from '../src/lib/speech-text.ts';

const source = await readFile('src/lib/speech.ts','utf8');
const compiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
let fetchCount = 0;
let systemVoiceCalls = 0;
let fetchImpl = async () => new Response(new Blob(['mock mp3'],{type:'audio/mpeg'}),{headers:{'content-type':'audio/mpeg'}});
let playError = null;
const audios = [];
const revoked = [];
class MockAudio {
  constructor(src) { this.src=src; this.paused=false; audios.push(this); }
  play() { if(playError) return Promise.reject(playError); this.onplaying?.(); return Promise.resolve(); }
  pause() { this.paused=true; }
}
const exports = {};
vm.runInNewContext(compiled,{
  exports,
  require: name => { assert.equal(name,'@/lib/speech-text'); return {forSpeech}; },
  window:{setTimeout,clearTimeout,speechSynthesis:{speak(){systemVoiceCalls++;}}},
  Audio:MockAudio,
  URL:{createObjectURL:()=>`blob:clip-${fetchCount}`,revokeObjectURL:url=>revoked.push(url)},
  fetch:(...args)=>{fetchCount++; return fetchImpl(...args);},
  AbortController, Error, Set, Map,
});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const player=exports;
function waitStatus(expected) {
  if (player.speechState().status === expected) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { unsubscribe(); reject(new Error(`Expected ${expected}, got ${player.speechState().status}`)); }, 1500);
    const unsubscribe = player.subscribe(() => {
      if (player.speechState().status === expected) { clearTimeout(timer); unsubscribe(); resolve(); }
    });
  });
}
player.speak('recorded','Hello','/audio/lessons/test.mp3');
assert.equal(fetchCount,0,'Recorded clips must not invoke billed synthesis');
assert.equal(audios.at(-1).src,'/audio/lessons/test.mp3');
assert.equal(player.speechState().status,'playing');
const oldEnded=audios.at(-1).onended;
player.speak('recorded','New','/audio/lessons/new.mp3');
oldEnded();
assert.equal(player.speechState().status,'playing','A stale end event must not stop a newer clip with the same ID');
player.stop();
assert.equal(audios.at(-1).paused,true);
assert.equal(player.speakingId(),null);

fetchImpl=async()=>new Response('Unavailable',{status:503});
player.speak('network','Please read this');
await settle();
assert.equal(player.speechState().status,'error','Synthesis failures must show a retry state');
assert.equal(systemVoiceCalls,0,'Never fall back to system speech');
fetchImpl=async()=>new Response(new Blob(['mock mp3'],{type:'audio/mpeg'}),{headers:{'content-type':'audio/mpeg'}});
player.retrySpeech();
await waitStatus('playing');
assert.equal(player.speechState().status,'playing');
const fetched=fetchCount;
player.speak('replay','Please read this');
await settle();
assert.equal(fetchCount,fetched,'Replay uses the audio cache');
audios.at(-1).onerror();
assert.equal(player.speechState().status,'error');
assert.ok(revoked.length,'A broken dynamic clip must be removed from the cache');

let resolveFetch;
let pendingSignal;
fetchImpl=(_url,options)=>{pendingSignal=options.signal;return new Promise(resolve=>{resolveFetch=resolve;});};
player.speak('slow','Slow text');
player.speak('fast','Already recorded','/audio/lessons/fast.mp3');
assert.equal(pendingSignal.aborted,true,'Switching clips cancels the old synthesis request');
const countBefore=audios.length;
resolveFetch(new Response(new Blob(['stale'],{type:'audio/mpeg'}),{headers:{'content-type':'audio/mpeg'}}));
await settle();
assert.equal(audios.length,countBefore,'A stale response must not start audio');
assert.equal(player.speakingId(),'fast');

playError=new Error('blocked'); playError.name='NotAllowedError';
player.speak('blocked','Tap to read','/audio/lessons/blocked.mp3');
await settle();
assert.equal(player.speechState().status,'error');
assert.match(player.speechState().message,/Tap Retry/);
playError=null;
player.retrySpeech();
await waitStatus('playing');
assert.equal(player.speechState().status,'playing');
assert.equal(systemVoiceCalls,0);
player.stop();
assert.equal(forSpeech('3 × 4 = 12'), '3 times 4 equals 12');
assert.equal(forSpeech('7 ___ 17'), '7 blank 17');
assert.equal(forSpeech('1/2 ≠ 1/3'), '1 over 2 is not equal to 1 over 3');
console.log('Speech checks passed: recorded playback, cache/retry, errors, autoplay, cancellation, stale events, math normalization, and no system voice fallback.');
