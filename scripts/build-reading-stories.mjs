import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { READING_STORIES } from '../src/lib/content/reading-stories.ts';
const quote = value => `'${String(value).replaceAll("'", "''")}'`;
const rows = READING_STORIES.flatMap(story => story.questions.map((q,index)=>{
  const hash=createHash('sha256').update(`sunsharp:reading-story:v1:${story.id}:${index}`).digest('hex');
  const id=`${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
  return {id,subject_id:'reading',grade:story.grade,difficulty:['K','1'].includes(story.grade)?1:2,standard:story.standard,skill:story.skill,prompt:`Read: "${story.passage}" ${q.prompt}`,choices:[...q.choices],answer_index:q.answer,explanation:q.explanation,xp:10,kind:'mcq'};
}));
const columns=Object.keys(rows[0]);
const sql='-- Original K–5 stories. Additive, deterministic IDs; existing questions and attempts are preserved.\n-- Selected-response practice addresses part of each benchmark; it does not prove fluency or mastery.\ninsert into public.questions ('+columns.join(', ')+') values\n'+rows.map(row=>'('+columns.map(c=>typeof row[c]==='number'?row[c]:quote(Array.isArray(row[c])?JSON.stringify(row[c]):row[c])).join(', ')+')').join(',\n')+'\non conflict (id) do nothing;\n';
writeFileSync('supabase/migrations/20260913000021_reading_stories.sql',sql);
console.log(`${rows.length} additive reading questions from ${READING_STORIES.length} original stories.`);
