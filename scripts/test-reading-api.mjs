// Explicit opt-in: creates one isolated QA account, tests the local server, then
// deletes only that generated account (FK cascades remove its test telemetry).
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {books} from './books/catalog.mjs';
if(process.env.RUN_READING_LIVE_TEST!=='1')throw new Error('Set RUN_READING_LIVE_TEST=1 to run this isolated integration test.');
const base=process.env.READING_TEST_URL||'http://localhost:3001';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin=createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const email=`reading-qa-${randomUUID()}@example.invalid`,password=randomBytes(30).toString('base64url');let id;
try{
 const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{display_name:'Isolated Reading QA'}});assert.ifError(created.error);id=created.data.user.id;
 const profile=await admin.from('profiles').update({role:'student',grade:'2'}).eq('id',id);assert.ifError(profile.error);
 const jar=new Map();const client=createServerClient(url,key,{cookies:{getAll:()=>[...jar].map(([name,value])=>({name,value})),setAll:values=>values.forEach(({name,value})=>jar.set(name,value))}});
 const login=await client.auth.signInWithPassword({email,password});assert.ifError(login.error);
 const cookie=[...jar].map(([name,value])=>`${name}=${value}`).join('; ');
 const book=books.find(b=>b.id==='2-the-map-with-no-treasure');const sessionId=randomUUID();
 const post=async(body,expected=200,headers={})=>{const response=await fetch(`${base}/api/reading`,{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie,Origin:base,...headers},body:JSON.stringify({studentId:id,bookId:book.id,...body})});const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data;};
 const sync={action:'sync',sessionId,sequence:0,activeMs:0,listeningMs:0,page:0,complete:false};
 assert.equal((await post(sync)).progress.active_ms,0);
 await post({...sync,studentId:randomUUID()},409);
 await post(sync,403,{Origin:'https://unrelated.example'});
 await post({...sync,page:99},400);
 await post({action:'check',question:0,choice:0,supportUsed:false},409);
 await new Promise(resolve=>setTimeout(resolve,1100));
 const updated=await post({...sync,sequence:1,activeMs:1000,page:1});assert.equal(updated.progress.active_ms,1000);
 assert.equal((await post({...sync,sequence:1,activeMs:1000,page:1})).progress.active_ms,1000);
 const answer=book.questions[0].answer,wrong=(answer+1)%3;
 assert.equal((await post({action:'check',question:0,choice:wrong,supportUsed:true})).correct,false);
 assert.equal((await post({action:'check',question:0,choice:answer,supportUsed:false})).correct,true);
 const checks=await admin.from('reading_checks').select('is_correct,support_used').eq('student_id',id);assert.ifError(checks.error);assert.deepEqual(checks.data,[{is_correct:false,support_used:true}]);
 await post({...sync,sequence:2,activeMs:1000,page:3,complete:true});
 const saved=await client.from('reading_progress').select('page,completed_at').eq('student_id',id).single();assert.ifError(saved.error);assert.equal(saved.data.page,3);assert.ok(saved.data.completed_at);
 const unauthorized=await fetch(`${base}/api/reading`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sync)});assert.equal(unauthorized.status,401);
 const html=await fetch(`${base}/reading/${book.id}`,{headers:{Cookie:cookie}}).then(r=>r.text());assert.ok(html.includes(book.title));assert.ok(!html.includes(book.questions[0].explanation),'server answer leaked in initial book HTML');
 if(process.env.READING_TEST_VOICE==='1'){const voice=await fetch('https://sunsharp.app/api/tts',{method:'POST',headers:{'Content-Type':'application/json',Cookie:cookie},body:JSON.stringify({text:book.pages[0]})});assert.equal(voice.status,200);assert.ok(voice.headers.get('content-type')?.startsWith('audio/'));assert.ok((await voice.arrayBuffer()).byteLength>1000);console.log('ElevenLabs generated story-page narration successfully.');}
 console.log('Reading API passed: auth, origin, owner binding, page bounds, checkpoint gating, time/retry persistence, first-answer retention, bookmark/completion, and server-only answers.');
}finally{if(id){const removed=await admin.auth.admin.deleteUser(id);if(removed.error)throw new Error(`QA cleanup failed for ${id}: ${removed.error.message}`);console.log('Isolated QA account and telemetry removed.');}}
