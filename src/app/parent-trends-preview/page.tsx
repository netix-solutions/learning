import {notFound} from 'next/navigation';
import {ParentPracticeTrends} from '@/components/ParentPracticeTrends';
import type {PracticeTrends} from '@/lib/practice-trends';
export default async function ParentTrendsPreview({searchParams}:{searchParams:Promise<{state?:string}>}) {
 if(process.env.NODE_ENV!=='development')notFound();
 const {state}=await searchParams;
 const empty=state==='empty';
 const data:PracticeTrends={as_of:'2026-10-08T02:00:00Z',grade:'3',periods:[
  {period:'previous',questions:empty?0:9,independent:empty?0:8,correct:empty?0:4,helped:empty?0:1,unknown:0},
  {period:'recent',questions:empty?0:12,independent:empty?0:8,correct:empty?0:7,helped:empty?0:3,unknown:empty?0:1},
 ],skills:empty?[]:[{subject_id:'reading',skill:'3.detail',difficulty:1,previous_count:8,previous_correct:4,recent_count:8,recent_correct:7}]};
 return <main id="main-content" className="mx-auto max-w-3xl px-4 py-6"><h1 className="font-bold">Parent trends · sample data</h1><ParentPracticeTrends data={state==='error'?null:data} subjects={[{subject_id:'reading',name:'Reading'}]}/></main>;
}
