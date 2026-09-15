'use client';
import { useEffect, useRef, useState } from 'react';
import { moveReward, sellReward } from '@/app/actions/train';
import type { RewardCollection, TrainState } from '@/lib/train';

type Item = { id:string; itemId:string; name:string; refund:number; image:string };
export function RewardItemControls({state,kind,purchase,preview=false,busy,onBusy,onChange,onMessage}:{state:TrainState;kind:RewardCollection;purchase:string;preview?:boolean;busy:boolean;onBusy:(busy:boolean)=>void;onChange:(state:TrainState)=>void;onMessage:(message:string)=>void}) {
 const [open,setOpen]=useState(false);
 const [confirm,setConfirm]=useState<string|null>(null);
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const dismiss=(event:Event)=>{if(!root.current?.contains(event.target as Node)){setOpen(false);setConfirm(null);}};
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);setConfirm(null);root.current?.querySelector<HTMLButtonElement>('.reward-item-select')?.focus();}};
  document.addEventListener('pointerdown',dismiss);document.addEventListener('focusin',dismiss);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('focusin',dismiss);document.removeEventListener('keydown',escape);};
 },[open]);
 const setMessage=onMessage;
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
 for(const item of items)item.refund=Math.floor(item.refund/2);
 const index=items.findIndex(item=>item.id===purchase);
 const item=items[index];
 if(!item)return null;
 return <div ref={root} className={`reward-item-controls ${open?"is-open":""}`} data-item-controls={purchase} role="group" aria-label={`Controls for ${item.name} ${index+1}`}>
  <button className="reward-item-select" aria-label={`Select ${item.name} ${index+1}`} aria-expanded={open} onClick={()=>{setOpen(!open);setConfirm(null);}} />
  {open&&<div className="reward-item-toolbar">{confirm===item.id?<div className="reward-item-confirm"><span>Sell for 50%: <strong>{item.refund}</strong> tokens?</span><div><button disabled={busy} aria-label={`Confirm sell ${item.name} for ${item.refund} tokens`} onClick={()=>act(item)} className="reward-confirm-yes">✓</button><button disabled={busy} aria-label={`Keep ${item.name}`} onClick={()=>setConfirm(null)}>✕</button></div></div>:<>
   {kind!=='engines'&&<button aria-label={`Move ${item.name} ${index+1} earlier`} title="Move earlier" disabled={busy||index===0} onClick={()=>act(item,-1)}>←</button>}
   <button disabled={busy} onClick={()=>setConfirm(item.id)} aria-label={`Sell back ${item.name} ${index+1} for ${item.refund} tokens`} title={`Sell back for ${item.refund} tokens`} className="reward-item-sell"><svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/><path d="M12 8v8m3-6c-1-2-6-2-6 0s6 2 6 4-5 2-6 0"/></svg><span>+{item.refund}</span></button>
   {kind!=='engines'&&<button aria-label={`Move ${item.name} ${index+1} later`} title="Move later" disabled={busy||index===items.length-1} onClick={()=>act(item,1)}>→</button>}
  </>}</div>}
 </div>;
}
