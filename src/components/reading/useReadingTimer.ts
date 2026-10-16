'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {speechState,stop} from '@/lib/speech';
import {readingTick,READING_IDLE_MS} from '@/lib/books/timing';
import type {ReadingSnapshot} from '@/lib/books/types';

type Clock={sessionId:string;sequence:number;activeMs:number;listeningMs:number;page:number;complete:boolean;opened:boolean;running:boolean;last:number;interaction:number};
export function useReadingTimer(studentId:string,bookId:string,initialPage:number,preview:boolean){
 const clock=useRef<Clock>({sessionId:'',sequence:0,activeMs:0,listeningMs:0,page:initialPage,complete:false,opened:false,running:false,last:0,interaction:0});
 const [elapsed,setElapsed]=useState(0),[running,setRunning]=useState(false),[starting,setStarting]=useState(false);
 const [status,setStatus]=useState('Start the timer when you’re ready.'),[pauseReason,setPauseReason]=useState('');
 const mounted=useRef(true),chain=useRef<Promise<boolean>>(Promise.resolve(true));
 const key=`sunsharp:reading-outbox:${studentId}`;
 const outbox=useCallback(()=>{try{const value=JSON.parse(localStorage.getItem(key)||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?Object.fromEntries(Object.entries(value).filter(([,item])=>item&&typeof item==='object'&&'sessionId' in item&&'bookId' in item&&'sequence' in item)) as Record<string,ReadingSnapshot>:{};}catch{return {}; }},[key]);
 const remember=useCallback((snapshot:ReadingSnapshot)=>{try{const pending=outbox();pending[snapshot.sessionId]=snapshot;localStorage.setItem(key,JSON.stringify(pending));return true;}catch{return false;}},[key,outbox]);
 const send=useCallback(async(snapshot:ReadingSnapshot)=>{
  if(preview){try{localStorage.setItem(`sunsharp:book-preview:${bookId}`,JSON.stringify(snapshot));}catch{}return true;}
  try{
   const response=await fetch('/api/reading',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...snapshot,studentId}),keepalive:true});
   if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Your time could not sync.');}
   const pending=outbox();if(pending[snapshot.sessionId]?.sequence<=snapshot.sequence){delete pending[snapshot.sessionId];try{localStorage.setItem(key,JSON.stringify(pending));}catch{}}
   if(mounted.current)setStatus(Object.keys(pending).length?'Some reading time is waiting to sync.':'Reading time saved');return true;
  }catch(error){if(mounted.current)setStatus(`${error instanceof Error?error.message:'Could not connect.'} Saved on this device when storage is available; retry to sync.`);return false;}
 },[bookId,key,outbox,preview,studentId]);
 const snapshot=useCallback(()=>{const c=clock.current;return {action:'sync',sessionId:c.sessionId,bookId,sequence:c.sequence,activeMs:Math.floor(c.activeMs),listeningMs:Math.floor(c.listeningMs),page:c.page,complete:c.complete} as ReadingSnapshot;},[bookId]);
 const tick=useCallback(()=>{const c=clock.current,now=performance.now();const delta=readingTick(now-c.last,!document.hidden,now-c.interaction,c.running);c.last=now;c.activeMs+=delta;if(speechState().status==='playing'&&speechState().id?.startsWith(`book:${bookId}:`))c.listeningMs+=delta;if(mounted.current)setElapsed(c.activeMs);},[bookId]);
 const flush=useCallback((page?:number,complete=false)=>{
  tick();const c=clock.current;if(page!==undefined)c.page=page;c.complete=c.complete||complete;
  if(!c.opened)return Promise.resolve(false);
  c.sequence++;const next=snapshot();const saved=preview||remember(next);
  if(!saved&&mounted.current)setStatus('Device storage is unavailable. Keep this book open until time syncs.');
  chain.current=chain.current.catch(()=>false).then(()=>send(next));return chain.current;
 },[preview,remember,send,snapshot,tick]);
 const pause=useCallback((reason='Timer paused')=>{tick();clock.current.running=false;stop();if(mounted.current){setRunning(false);setPauseReason(reason);}return flush();},[flush,tick]);
 const start=useCallback(async()=>{
  if(clock.current.running)return true;
  setStarting(true);const c=clock.current;
  if(!c.sessionId)c.sessionId=crypto.randomUUID();
  if(!c.opened){const opened=await send(snapshot());if(!opened){setStarting(false);return false;}c.opened=true;}
  if(!mounted.current||document.hidden){setStarting(false);return false;}
  c.running=true;c.last=performance.now();c.interaction=c.last;setRunning(true);setPauseReason('');setStarting(false);return true;
 },[send,snapshot]);
 const retry=useCallback(async()=>{let ok=true;for(const pending of Object.values(outbox())){if(!(await send(pending)))ok=false;}return ok;},[outbox,send]);
 useEffect(()=>{
  mounted.current=true;const c=clock.current;
  const interact=()=>{c.interaction=performance.now();};
  const visibility=()=>{if(document.hidden)void pause('Paused while you were away.');};
  const leaving=()=>{void pause('Timer paused');};
  const online=()=>{void retry();};
  const timer=setInterval(()=>{tick();if(c.running&&performance.now()-c.interaction>=READING_IDLE_MS)void pause('Still reading? Tap Resume to keep timing.');},1000);
  const saver=setInterval(()=>{if(c.running)void flush();},15000);
  for(const event of ['pointerdown','keydown','scroll'])window.addEventListener(event,interact,{passive:true,capture:true});
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',leaving);window.addEventListener('online',online);const replay=setTimeout(online,0);
  return()=>{mounted.current=false;void pause();clearTimeout(replay);clearInterval(timer);clearInterval(saver);for(const event of ['pointerdown','keydown','scroll'])window.removeEventListener(event,interact,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',leaving);window.removeEventListener('online',online);};
 },[flush,pause,retry,tick]);
 return {elapsed,running,starting,status,pauseReason,start,pause,flush,retry};
}
