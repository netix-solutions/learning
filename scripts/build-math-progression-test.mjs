// Emit rollback-only SQL for psql or the Supabase SQL API. --include-content
// also checks additive insertion/idempotency without persisting it.
import {readFileSync} from 'node:fs';
const seed=readFileSync('supabase/seeds/math-progression.sql','utf8');
const cases=JSON.stringify(JSON.parse(seed.split('$math_progression$')[1]).map(q=>({grade:q.grade,prompt:q.prompt,payload:q.payload})));
let sql='begin;\n';
if(process.argv.includes('--include-content')){
 sql+=`create temp table previous_questions as select id,to_jsonb(q) row_data from public.questions q;\n${seed}
 create temp table after_first as select count(*) n from public.questions;\n${seed}
 do $$ begin
 if(select count(*) from public.questions)<>(select n from after_first) then raise exception 'Repeated content duplicated questions';end if;
 if exists(select 1 from previous_questions old left join public.questions q using(id) where to_jsonb(q) is distinct from old.row_data) then raise exception 'Existing questions changed';end if;
 end $$;\n`;
}
sql+=`create temp table progression_cases as select q.* from public.questions q join jsonb_to_recordset($cases$${cases}$cases$::jsonb) as source(grade text,prompt text,payload jsonb) on q.grade=source.grade and q.subject_id='math' and q.prompt=source.prompt and q.payload is not distinct from source.payload;\n`;
sql+=readFileSync('scripts/test-math-progression.sql','utf8');
process.stdout.write(sql);
