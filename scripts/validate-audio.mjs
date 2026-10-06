import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { createHash } from 'node:crypto';
const compile = file => ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function module(file, require, globals={}) { const exports={};vm.runInNewContext(compile(file),{exports,require,console,...globals});return exports; }
const assets=JSON.parse(fs.readFileSync('public/audio/licenses/asset-manifest.json'));
for(const asset of assets){const bytes=fs.readFileSync('public'+asset.file);assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assert(bytes.length>1000);if(asset.duration)assert(asset.duration<2,'Interaction cues must stay brief');}
assert.equal(assets.length,14);
const routes=module('src/lib/student-routes.ts',()=>{});
const music=module('src/lib/music.ts',name=>{assert.equal(name,'@/lib/student-routes');return routes;});
for(const path of ['/','/parent','/login','/music-credits'])assert.equal(music.musicFor(path,'bakery').length,0);
for(const theme of ['garden','train','dinosaurs','bakery'])for(const file of music.musicFor('/rewards',theme))assert(fs.existsSync(`public/music/${file}.m4a`));
assert.equal(music.musicFor('/practice/daily','bakery')[0],'bassa-island');
const settingsListeners=new Set();let settings={music:true,effects:true,theme:'garden'};
const settingsModule={audioSettings:()=>settings,serverAudioSettings:()=>settings,initializeAudioSettings(){},subscribeAudioSettings(fn){settingsListeners.add(fn);return()=>settingsListeners.delete(fn);},setAudioEnabled(kind,on){settings={...settings,[kind]:on};settingsListeners.forEach(fn=>fn());}};
let speech={status:'idle'};const speechListeners=new Set();
const speechModule={speechState:()=>speech,subscribe(fn){speechListeners.add(fn);return()=>speechListeners.delete(fn);}};
class Events { events=new Map();addEventListener(n,fn){if(!this.events.has(n))this.events.set(n,new Set());this.events.get(n).add(fn);}removeEventListener(n,fn){this.events.get(n)?.delete(fn);}emit(n){this.events.get(n)?.forEach(fn=>fn());} }
const doc=new Events();doc.hidden=false;const win=new Events();
let starts=0,stops=0,fetches=0,fail=false,time=1000;const gains=[];
class Context {
 state='suspended';currentTime=0;destination={};
 resume(){this.state='running';return Promise.resolve();}
 decodeAudioData(){return Promise.resolve({});}
 createGain(){const n={gain:{value:0,setTargetAtTime(v){this.value=v;}},connect(){return this;},disconnect(){}};gains.push(n);return n;}
 createBufferSource(){return{playbackRate:{},connect(n){return n;},start(){starts++;},stop(){stops++;this.onended?.();},disconnect(){}};}
 createMediaElementSource(){return{connect(n){return n;},disconnect(){}};}
}
win.AudioContext=Context;
const sound=module('src/lib/sound.ts',name=>name==='@/lib/audio-settings'?settingsModule:speechModule,{window:win,document:doc,performance:{now:()=>time},fetch:async()=>{fetches++;return{ok:!fail,arrayBuffer:async()=>new ArrayBuffer(1)};}});
const settle=()=>new Promise(resolve=>setImmediate(resolve));
sound.playSound('correct');await settle();assert.equal(starts,1,'First cold cue plays after decoding');
sound.playSound('correct');await settle();assert.equal(starts,1,'Repeated taps are debounced');
time+=300;sound.setMuted(true);assert(stops>0,'Mute stops active effects');sound.playSound('purchase');await settle();assert.equal(starts,1);
sound.setMuted(false);fail=true;sound.playSound('purchase');await settle();const failedFetches=fetches;
fail=false;time+=300;sound.playSound('purchase');await settle();assert.equal(fetches,failedFetches+1,'Failed loads can retry');assert.equal(starts,2);
doc.hidden=true;time+=300;sound.playSound('win');await settle();assert.equal(starts,2);doc.hidden=false;
// Exercise the actual background component effects with audio and lifecycle doubles.
class Audio extends Events { src='';paused=true;loop=false;play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}getAttribute(n){return n==='src'?this.src:null;}removeAttribute(){this.src='';}load(){} }
const audio=new Audio();const refs=[];const effects=[];let cursor=0,queue=[],path='/home';
const react={useRef(initial){const i=cursor++;return refs[i]??(refs[i]={current:initial});},useSyncExternalStore(_s,get){return get();},useEffect(fn,deps){const i=cursor++;if(!effects[i]||deps.some((d,j)=>d!==effects[i].deps[j]))queue.push(()=>{effects[i]?.cleanup?.();effects[i]={deps,cleanup:fn()};});}};
const bg=module('src/components/BackgroundMusic.tsx',name=>({'react':react,'react/jsx-runtime':{jsx(_type,props){props.ref.current=audio;return null;}},'next/navigation':{usePathname:()=>path},'@/lib/audio-settings':settingsModule,'@/lib/music':music,'@/lib/sound':sound,'@/lib/speech':speechModule}[name]),{window:win,document:doc});
function render(){cursor=0;queue=[];bg.BackgroundMusic();queue.forEach(fn=>fn());}
render();assert.equal(audio.src,'/music/life-of-riley.m4a');assert.equal(audio.paused,false);assert.equal(gains.at(-1).gain.value,.12);
speech={status:'playing'};speechListeners.forEach(fn=>fn());assert.equal(gains.at(-1).gain.value,.012,'Narration ducks music');
speech={status:'idle'};speechListeners.forEach(fn=>fn());assert.equal(gains.at(-1).gain.value,.12);
audio.emit('ended');assert.equal(audio.src,'/music/carefree.m4a');
settings={...settings,music:false};render();assert(audio.paused);win.emit('pointerdown');await settle();assert(audio.paused,'Muted player stays stopped after gestures');
settings={...settings,music:true,theme:'dinosaurs'};path='/rewards';render();assert.equal(audio.src,'/music/monkeys.m4a');
doc.hidden=true;doc.emit('visibilitychange');assert(audio.paused);doc.hidden=false;doc.emit('visibilitychange');assert(!audio.paused);
path='/practice/daily';render();assert.equal(audio.src,'/music/bassa-island.m4a');assert.equal(gains.at(-1).gain.value,.055);
path='/parent';render();assert(audio.paused);win.emit('keydown');await settle();assert(audio.paused,'Parent pages remain quiet');
for(const effect of effects)effect?.cleanup?.();assert.equal(speechListeners.size,0);
console.log('Audio: 14 licensed assets, first-play decoding, mute, retries, debounce, theme routing, rotation, narration ducking, quiet practice and lifecycle cleanup passed.');
