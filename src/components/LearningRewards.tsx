'use client';
import { useEffect, useState } from 'react';
import { chooseRewardTheme, getMyTrain } from '@/app/actions/train';
import { LearningGarden } from '@/components/LearningGarden';
import { LearningDinosaurs } from '@/components/LearningDinosaurs';
import { LearningTrain } from '@/components/LearningTrain';
import type { GardenProgress } from '@/lib/garden';
import type { TrainState, RewardTheme } from '@/lib/train';
import type { Grade } from '@/lib/types';
export function LearningRewards({grade,initialGarden=null,initialTrain,full=false,preview=false}:{grade:Grade|null;initialGarden?:GardenProgress|null;initialTrain?:TrainState;full?:boolean;preview?:boolean}) {
 const [train,setTrain]=useState<TrainState|null>(initialTrain??null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [retry,setRetry]=useState(0);
 useEffect(()=>{if(initialTrain)return;let active=true;getMyTrain().then(data=>{if(active){setTrain(data);setError('');}}).catch(()=>{if(active)setError('Your rewards could not load. Please try again.');});return()=>{active=false;};},[initialTrain,retry]);
 async function choose(theme:RewardTheme){if(busy||!train)return;setBusy(true);setError('');try{setTrain(preview?{...train,theme}:await chooseRewardTheme(theme));}catch{setError('Your choice did not save. Please try again.');}finally{setBusy(false);}}
 return <div className="min-w-0"><div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Choose your reward theme"><span className="mr-2 font-bold text-slate-700">My rewards</span>{(['garden','train','dinosaurs'] as const).map(theme=><button key={theme} disabled={busy||!train} aria-pressed={train?.theme===theme} onClick={()=>choose(theme)} className={`min-h-12 rounded-xl border-2 px-4 py-3 font-bold ${train?.theme===theme?'border-sky-700 bg-sky-50 text-sky-900':'border-slate-200 bg-white text-slate-600'}`}>{theme==='garden'?'🌱 Garden':theme==='train'?'🚂 Train':'🦕 Dinosaurs'}</button>)}</div>
 {error&&<p role="alert" className="mt-3 rounded-xl bg-amber-50 p-3 text-slate-700">{error}{!train&&<button onClick={()=>setRetry(n=>n+1)} className="ml-2 min-h-12 font-bold underline">Retry</button>}</p>}
 {!train&&!error&&<p role="status" className="mt-4 text-slate-600">Opening your rewards…</p>}
 {train?.theme==='train'&&<LearningTrain key={train.theme} initial={train} grade={grade} full={full} preview={preview} onChange={setTrain}/>}
 {train?.theme==='dinosaurs'&&<LearningDinosaurs initial={train} full={full} preview={preview} onChange={setTrain}/>}
 {train?.theme==='garden'&&<LearningGarden grade={grade} initial={initialGarden} full={full}/>}
 {full&&train&&<p className="mt-4 text-sm text-slate-600">Switch themes any time. Your flowers, train cars, and dinosaurs stay saved. Trains and dinosaurs share your token balance.</p>}
 </div>;
}
