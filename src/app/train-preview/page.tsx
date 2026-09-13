import { notFound } from 'next/navigation';
import { LearningRewards } from '@/components/LearningRewards';
import { gardenProgress } from '@/lib/garden';
import type { TrainState } from '@/lib/train';
import type { Grade } from '@/lib/types';
export default async function Page({searchParams}:{searchParams:Promise<{grade?:string}>}){
 if(process.env.NODE_ENV==='production')notFound();const {grade='K'}=await searchParams;if(!['K','1','2','3','4','5'].includes(grade))notFound();
 const state:TrainState={theme:'train',earned:30,spent:0,balance:30,cars:[],catalog:[{id:'passenger',name:'Sunny passenger car',price:5,sort:1},{id:'cargo',name:'Cargo car',price:8,sort:2},{id:'aquarium',name:'Aquarium car',price:10,sort:3},{id:'garden',name:'Garden car',price:10,sort:4},{id:'observatory',name:'Stargazer car',price:12,sort:5},{id:'caboose',name:'Cherry caboose',price:15,sort:6}]};
 return <main data-grade={grade} className="grade-home mx-auto w-full min-w-0 max-w-3xl px-4 py-6"><p className="text-sm text-slate-600">Train preview · sample tokens · no purchases saved</p><LearningRewards grade={grade as Grade} initialGarden={gardenProgress(30,0)} initialTrain={state} full preview/></main>;
}
