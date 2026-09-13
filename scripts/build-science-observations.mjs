import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { observationNarration } from '../src/lib/science-observation.ts';
import { SCIENCE_OBSERVATIONS } from '../src/lib/content/science-observations.ts';
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const rows=SCIENCE_OBSERVATIONS.flatMap(activity=>activity.questions.map((q,i)=>{
 const h=createHash('sha256').update(`sunsharp:science-observation:v1:${activity.id}:${i}`).digest('hex');
 return {id:`${h.slice(0,8)}-${h.slice(8,12)}-4${h.slice(13,16)}-a${h.slice(17,20)}-${h.slice(20,32)}`,subject_id:'science',grade:activity.grade,difficulty:['K','1'].includes(activity.grade)?1:2,standard:null,skill:`${activity.grade}.observation`,prompt:`${observationNarration(activity.observation)} Question: ${q.prompt}`,choices:q.choices,answer_index:q.answer,explanation:q.explanation,xp:10,kind:'mcq',payload:{observation:activity.observation,observationQuestion:q.prompt}};
}));
const columns=Object.keys(rows[0]);
writeFileSync('supabase/migrations/20260913000022_science_observations.sql','-- Original illustrative observation tasks. Payloads contain evidence, never answer keys.\n-- Additive IDs preserve prior questions and student progress. Standards require item-level review.\ninsert into public.questions ('+columns.join(', ')+') values\n'+rows.map(r=>'('+columns.map(c=>r[c]===null?'NULL':typeof r[c]==='number'?r[c]:quote(typeof r[c]==='object'?JSON.stringify(r[c]):r[c])).join(', ')+')').join(',\n')+'\non conflict(id) do nothing;\n');
console.log(`${rows.length} science observation questions across six grades.`);
