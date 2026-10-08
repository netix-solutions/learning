'use client';
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import Image from 'next/image';
import {TrainArt} from '@/components/TrainArt';
import {RecordedNarration} from '@/components/LessonNarration';
import {HOME_NARRATION} from '@/lib/home-narration';
import {speechState,stop} from '@/lib/speech';
import {advanceRide,RIDE_DURATION,RIDE_STATIONS,rideVehicles,type RidePhase} from '@/lib/train-ride';
import type {TrainState} from '@/lib/train';
const motionQuery='(prefers-reduced-motion: reduce)';
function subscribeMotion(callback:()=>void){const query=window.matchMedia(motionQuery);query.addEventListener('change',callback);return()=>query.removeEventListener('change',callback);}
function reducedSnapshot(){return window.matchMedia(motionQuery).matches;}

/** Free imaginative play with this collection; never writes rewards or learning evidence. */
export function TrainRide({state}:{state:TrainState}) {
 const [open,setOpen]=useState(false);const launch=useRef<HTMLButtonElement>(null);
 function close(){setOpen(false);requestAnimationFrame(()=>launch.current?.focus({preventScroll:true}));}
 return <div data-silent-click className="mx-5 mt-5 rounded-2xl bg-sky-50 p-4 sm:mx-7">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-display text-xl font-bold text-sky-950">Your train. Your adventure.</h3><p className="mt-1 text-sm text-slate-700">Pick a station and take your collection for a ride.</p></div><button ref={launch} onClick={()=>setOpen(true)} className="min-h-12 rounded-2xl bg-sky-800 px-5 py-3 font-bold text-white">Take a ride</button></div>
  {open&&<RideDialog state={state} onClose={close}/>}
 </div>;
}
function RideDialog({state,onClose}:{state:TrainState;onClose:()=>void}) {
 const dialog=useRef<HTMLDialogElement>(null);const primary=useRef<HTMLButtonElement>(null);
 const [stationId,setStationId]=useState<string>('meadow');const [phase,setPhase]=useState<RidePhase>('ready');
 const [elapsed,setElapsed]=useState(0);const elapsedRef=useRef(0);
 const systemReduced=useSyncExternalStore(subscribeMotion,reducedSnapshot,()=>true);
 const [stillPictures,setStillPictures]=useState(false);const reduced=systemReduced||stillPictures;
 const station=RIDE_STATIONS.find(s=>s.id===stationId)!;const vehicles=rideVehicles(state);
 useEffect(()=>{const element=dialog.current;element?.showModal();return()=>{element?.close();if(speechState().id==='train:ride')stop();};},[]);
 useEffect(()=>{
  if(phase!=='riding'||reduced)return;
  let last=performance.now();
  const timer=window.setInterval(()=>{
   if(document.hidden)return;
   const now=performance.now();elapsedRef.current=advanceRide(elapsedRef.current,now-last);last=now;setElapsed(elapsedRef.current);
   if(elapsedRef.current>=RIDE_DURATION){setPhase('arrived');requestAnimationFrame(()=>primary.current?.focus({preventScroll:true}));}
  },100);
  return()=>window.clearInterval(timer);
 },[phase,reduced]);
 useEffect(()=>{const hide=()=>{if(document.hidden)setPhase(p=>p==='riding'?'paused':p);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
 function reset(id=stationId){setStationId(id);setPhase('ready');elapsedRef.current=0;setElapsed(0);}
 function action(){
  if(speechState().id==='train:ride')stop();
  if(phase==='arrived'){reset();return;}
  if(phase==='riding'){if(reduced){setPhase('arrived');setElapsed(RIDE_DURATION);}else setPhase('paused');return;}
  setPhase('riding');
 }
 const message=phase==='arrived'?`Hello, ${station.arrival}!`:phase==='riding'?`On our way to ${station.name}!`:phase==='paused'?'Taking a little break.':`Next stop: ${station.arrival}`;
 return <dialog ref={dialog} onCancel={onClose} aria-labelledby="train-ride-title" data-silent-click className="train-ride-dialog m-auto w-[calc(100%_-_1rem)] max-w-3xl overflow-y-auto rounded-3xl border-0 bg-[#fffdf6] p-0 text-slate-800 shadow-2xl">
  <header className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6"><h2 id="train-ride-title" className="font-display text-2xl font-bold">Take a ride</h2><button onClick={onClose} aria-label="Close train ride" className="min-h-12 min-w-12 rounded-full bg-slate-100 px-4 font-bold text-slate-700">Close</button></header>
  <div className="train-ride-scene relative isolate overflow-hidden" data-phase={phase} data-still={reduced} style={{backgroundColor:station.sky}}>
   <Image src="/images/dinosaurs/railway.webp" alt="" fill sizes="768px" className="train-ride-landscape object-cover" style={{animationPlayState:phase==='riding'&&!reduced?'running':'paused'}}/>
   <div className="absolute inset-0" style={{background:station.tint}}/>
   {stationId==='starlight'&&<div aria-hidden="true" className="absolute inset-x-8 top-3 flex justify-around text-xl text-amber-100"><span>✦</span><span>⋆</span><span>✦</span><span>⋆</span><span>✦</span></div>}
   <div className="relative mx-auto mt-4 w-fit max-w-[90%] rounded-lg border-4 border-white bg-sky-950 px-5 py-2 text-center font-bold text-white shadow-lg">{station.arrival}</div>
   <div className="train-ride-vehicles absolute z-20 inset-x-0 flex gap-0 overflow-x-auto px-4 pb-3" tabIndex={0} role="region" aria-label="Your riding train. Scroll sideways to see every car.">
    {vehicles.map(v=><div key={v.id} className="w-36 shrink-0 sm:w-48" role="img" aria-label={v.name}><TrainArt kind={v.kind}/></div>)}
   </div>
  </div>
  <div className="px-4 pb-4 sm:px-6 sm:pb-6">
   <p role="status" className="mt-3 text-center text-lg font-bold text-sky-950">{message}</p>
   <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-sky-100"><div className="h-full rounded-full bg-sky-700" style={{width:`${elapsed/RIDE_DURATION*100}%`}}/></div>
   <fieldset disabled={phase==='riding'||phase==='paused'} className="mt-3"><legend className="text-sm font-bold text-slate-700">Choose a station</legend><div className="mt-2 grid grid-cols-3 gap-2">{RIDE_STATIONS.map((s,index)=><button key={s.id} onClick={()=>reset(s.id)} aria-pressed={stationId===s.id} className={`flex min-h-14 flex-col items-center justify-center rounded-xl border-2 px-1 py-2 text-sm font-bold disabled:opacity-60 ${stationId===s.id?'border-sky-800 bg-sky-50 text-sky-950':'border-slate-200 bg-white text-slate-700'}`}><StationIcon index={index}/>{s.name}</button>)}</div></fieldset>
   <div className="mt-3 flex items-center gap-2"><button ref={primary} autoFocus onClick={action} className="min-h-12 flex-1 rounded-2xl bg-sky-800 px-4 py-3 text-lg font-bold text-white">{phase==='arrived'?'Ride again':phase==='riding'?(reduced?'Arrive at station':'Pause'):phase==='paused'?'Keep going':'Go!'}</button><RecordedNarration id="train:ride" text={HOME_NARRATION['train:ride']} label="Hear how to take a ride"/></div>
   <label className="mt-1 flex min-h-11 cursor-pointer items-center justify-center gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={reduced} disabled={systemReduced} onChange={e=>setStillPictures(e.target.checked)} className="h-4 w-4 accent-sky-800"/>Still pictures{systemReduced?" (device setting)":""}</label>
   <p className="text-center text-xs leading-relaxed text-slate-600">{reduced?'Still-picture mode. Tap Go, then Arrive at station.':'Free play with your own train. No tokens needed.'}</p>
  </div>
 </dialog>;
}
function StationIcon({index}:{index:number}) {return <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{index===0?<><path d="M12 21v-9M12 17c-5 0-7-3-7-5 4 0 7 1 7 5M12 14c5 0 7-3 7-5-4 0-7 1-7 5"/><circle cx="12" cy="5" r="3"/></>:index===1?<><path d="m2 20 8-15 7 15H2Zm12-5 4-7 5 12h-6M7 11l3 2 3-2"/></>:<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>}</svg>;}
