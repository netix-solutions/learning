// Verifies offline fallback and shared-device cache isolation without a real account.
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const handlers = {}, puts = [], deleted = [];
let offline = false, status = 200, installed = [];
const cached = new Response('cached art');
const fallback = new Response('offline counting game');
const cache = {
  addAll: async assets => { installed = assets; },
  match: async request => request.url?.includes('/images/') ? cached : undefined,
  put: async (request) => { puts.push(request.url); },
};
vm.runInNewContext(fs.readFileSync('public/sw.js','utf8'), {
  URL, self:{location:{origin:'https://sunsharp.app'},addEventListener:(name, handler)=>{handlers[name]=handler;},skipWaiting:async()=>{},clients:{claim:async()=>{}}},
  caches:{open:async()=>cache,match:async()=>fallback,keys:async()=>['sunsharp-v5','sunsharp-v6','another-app'],delete:async key=>{deleted.push(key);}},
  fetch:async()=>{if(offline)throw new Error('offline');return new Response('network',{status});},
});
async function request(path, mode='cors', method='GET') {
  const waits=[];let response;
  handlers.fetch({request:{url:path.startsWith('http')?path:'https://sunsharp.app'+path,mode,method},respondWith:promise=>{response=promise;},waitUntil:promise=>waits.push(promise)});
  const result=await response;await Promise.all(waits);return result;
}
(async()=>{
  const installWaits=[];handlers.install({waitUntil:p=>installWaits.push(p)});await Promise.all(installWaits);
  assert(installed.includes('/offline.html'));assert(installed.some(path=>path.endsWith('.mp3')));
  for(const asset of installed)if(asset!='/manifest.webmanifest')assert(fs.existsSync('public'+asset),'missing offline shell asset '+asset);
  const waits=[];handlers.activate({waitUntil:p=>waits.push(p)});await Promise.all(waits);assert.deepEqual(deleted,['sunsharp-v5','sunsharp-v6']);
  assert.equal(await (await request('/home','navigate')).text(),'network');assert.equal(puts.length,0);
  offline=true;assert.equal(await (await request('/home','navigate')).text(),'offline counting game');assert.equal(puts.length,0);
  assert.equal(await request('https://example.supabase.co/rest/v1/attempts'),undefined);
  assert.equal(await request('/api/teach'),undefined);assert.equal(await request('/private-child.png'),undefined);assert.equal(await request('/practice/daily','cors','POST'),undefined);
  offline=false;assert.equal(await (await request('/images/train/coal.webp')).text(),'cached art');assert.equal(puts.length,1);
  status=404;await request('/images/train/missing.webp');assert.equal(puts.length,1,'failed responses must not enter cache');
  console.log('PWA: offline fallback, private-page isolation, API bypass, owned-cache cleanup and safe static refresh passed.');
})().catch(error=>{console.error(error);process.exit(1);});
