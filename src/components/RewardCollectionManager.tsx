'use client';
import { useState } from 'react';
import Image from 'next/image';
import { moveReward, sellReward } from '@/app/actions/train';
import type { RewardCollection, TrainState } from '@/lib/train';

type Item = { id:string; itemId:string; name:string; refund:number; image:string };
export function RewardCollectionManager({state,kind,preview=false,busy,onBusy,onChange}:{state:TrainState;kind:RewardCollection;preview?:boolean;busy:boolean;onBusy:(busy:boolean)=>void;onChange:(state:TrainState)=>void}) {
 const [confirm,setConfirm]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const items:Item[]=kind==='train'?state.cars.map(p=>({id:p.id,itemId:p.carId,name:state.catalog.find(c=>c.id===p.carId)?.name??'Train car',refund:p.pricePaid??state.catalog.find(c=>c.id===p.carId)?.price??0,image:`/images/train/${p.carId}.webp`}))
 :kind==='engines'?(state.enginePurchases??[]).map(p=>({id:p.id,itemId:p.engineId,name:state.engineCatalog?.find(c=>c.id===p.engineId)?.name??'Engine',refund:p.pricePaid,image:`/images/train/${p.engineId}.webp`}))
 :kind==='dinosaurs'?(state.dinosaurs??[]).map(p=>({id:p.id,itemId:p.dinosaurId,name:state.dinosaurCatalog?.find(c=>c.id===p.dinosaurId)?.name??'Dinosaur',refund:p.pricePaid??state.dinosaurCatalog?.find(c=>c.id===p.dinosaurId)?.price??0,image:`/images/dinosaurs/${p.dinosaurId}.webp`}))
 :(state.treats??[]).map(p=>({id:p.id,itemId:p.treatId,name:state.bakeryCatalog?.find(c=>c.id===p.treatId)?.name??'Treat',refund:p.pricePaid??state.bakeryCatalog?.find(c=>c.id===p.treatId)?.price??0,image:`/images/bakery/${p.treatId}.webp`}));
 async function act(item:Item,direction?:number){
  if(busy)return;onBusy(true);setMessage('');
  try{
   let next:TrainState;
   if(!preview)next=direction?await moveReward(kind,item.id,direction):await sellReward(kind,item.id);
   else{
    next={...state};
    const key=kind==='train'?'cars':kind==='engines'?'enginePurchases':kind==='dinosaurs'?'dinosaurs':'treats';
    const list=[...(state[key]??[])];const index=list.findIndex(p=>p.id===item.id);
    if(index<0)throw new Error('Item no longer owned');
    if(direction){if(index+direction<0||index+direction>=list.length)throw new Error('Invalid move');[list[index],list[index+direction]]=[list[index+direction],list[index]];}
    else {list.splice(index,1);next.balance+=item.refund;next.spent-=item.refund;}
    next={...next,[key]:list};
    if(kind==='engines'&&!direction){next.engines=state.engines?.filter(id=>id!==item.itemId);if(next.activeEngine===item.itemId)next.activeEngine='engine';}
   }
   onChange(next);setConfirm(null);setMessage(direction?'New order saved.':`${item.name} sold back. ${item.refund} tokens returned.`);
  }catch{setMessage('That change could not be confirmed. Please try again.');}finally{onBusy(false);}
 }
 if(!items.length&&!message)return null;
 return <details data-reward-collection={kind} className="reward-manager mt-5 rounded-2xl border border-slate-200 bg-white p-4" open>
  <summary className="min-h-11 cursor-pointer font-extrabold text-slate-800">{kind==='engines'?'Manage owned engines':'Arrange & sell back'} <span className="text-sm font-normal">({items.length})</span></summary>
  <p className="mb-4 text-sm text-slate-600">{kind==='engines'?'Selling your leading engine switches to the free steam engine.':'Use Earlier and Later to choose the order in your display.'} Sell back for all the tokens you paid.</p>
  <div className="grid gap-3">{items.map((item,index)=><div key={item.id} data-managed-item={item.id} className="rounded-xl border border-slate-200 p-3">
   <div className="flex items-center gap-3"><div className="relative h-14 w-20 shrink-0"><Image src={item.image} alt="" fill unoptimized className="object-contain"/></div><strong className="min-w-0 text-sm text-slate-800">{kind!=='engines'&&<span className="mr-2 text-slate-500">{index+1}.</span>}{item.name}</strong></div>
   <div className="mt-2 flex flex-wrap gap-2">{kind!=='engines'&&<><button aria-label={`Move ${item.name} ${index+1} earlier`} disabled={busy||index===0} onClick={()=>act(item,-1)} className="min-h-11 rounded-lg bg-sky-50 px-3 text-sm font-bold text-sky-900 disabled:opacity-40">← Earlier</button><button aria-label={`Move ${item.name} ${index+1} later`} disabled={busy||index===items.length-1} onClick={()=>act(item,1)} className="min-h-11 rounded-lg bg-sky-50 px-3 text-sm font-bold text-sky-900 disabled:opacity-40">Later →</button></>}
    <button disabled={busy} onClick={()=>setConfirm(confirm===item.id?null:item.id)} aria-expanded={confirm===item.id} aria-label={`Sell back ${item.name} ${index+1} for ${item.refund} tokens`} className="min-h-11 rounded-lg bg-amber-50 px-3 text-sm font-bold text-amber-950">Sell back · +{item.refund}</button></div>
   {confirm===item.id&&<div className="mt-3 rounded-xl bg-amber-50 p-3"><p className="text-sm text-amber-950">Return this {item.name.toLowerCase()} and get <strong>{item.refund} tokens</strong> back? You can buy it again later.</p><div className="mt-2 flex flex-wrap gap-2"><button disabled={busy} onClick={()=>act(item)} className="min-h-12 rounded-lg bg-amber-800 px-4 font-bold text-white">Yes, return for {item.refund} tokens</button><button disabled={busy} onClick={()=>setConfirm(null)} className="min-h-12 rounded-lg bg-white px-4 font-bold text-slate-700">Keep it</button></div></div>}
  </div>)}</div>
  {message&&<p role="status" className="mt-3 text-sm font-bold text-sky-900">{message}</p>}
 </details>;
}
