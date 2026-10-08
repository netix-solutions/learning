import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {readingDetailQuestions} from './reading-detail-content.mjs';
export function readingDetailSQL(rows) {
 const json='[\n'+rows.map(q=>'  '+JSON.stringify(q)).join(',\n')+'\n]';
 if(json.includes('$reading_detail$'))throw new Error('Invalid content delimiter');
 return `-- GENERATED from scripts/reading-detail-content.mjs. Preserve existing questions and history.
-- Run node scripts/validate-reading-detail.mjs before publishing.
-- Three grade-three scaffolds; partial supporting-details practice, not benchmark mastery.
with incoming as (
 select * from jsonb_to_recordset($reading_detail$${json}$reading_detail$::jsonb)
 as q(subject_id text, grade text, difficulty integer, skill text, standard text, prompt text,
 explanation text, xp integer, kind text, payload jsonb, answer jsonb, choices jsonb, answer_index integer)
)
insert into public.questions(subject_id,grade,difficulty,skill,standard,prompt,explanation,xp,kind,payload,answer,choices,answer_index)
select q.subject_id,q.grade,q.difficulty,q.skill,q.standard,q.prompt,q.explanation,q.xp,q.kind,q.payload,q.answer,q.choices,q.answer_index
from incoming q
where not exists(select 1 from public.questions existing where existing.subject_id=q.subject_id and existing.grade=q.grade and existing.prompt=q.prompt and existing.payload is not distinct from q.payload);
`;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const rows=readingDetailQuestions();const sql=readingDetailSQL(rows);
 writeFileSync('supabase/seeds/reading-detail.sql',sql);
 const migration=process.argv.indexOf('--migration');
 if(migration>=0){const path=process.argv[migration+1];if(!/^supabase\/migrations\/\d+_reading_detail_progression\.sql$/.test(path))throw new Error('Use a newly generated migration path');writeFileSync(path,sql);}
 console.log(`Generated ${rows.length} additive questions.`);
}
