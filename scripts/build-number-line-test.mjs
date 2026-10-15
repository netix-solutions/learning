// Run with `supabase db query --linked --file /tmp/number-line-test.sql`.
// Every schema/content/test-user change is rolled back, including on failure.
import {readFileSync} from 'node:fs';
const migration=readFileSync('supabase/migrations/20261015010052_number_line_rescue.sql','utf8');
const seed=readFileSync('supabase/seeds/number-line.sql','utf8');
process.stdout.write(`begin;
set local statement_timeout = '30s';
set local lock_timeout = '3s';
create temp table previous_questions as select id,to_jsonb(q) row_data from public.questions q;
${migration}
create temp table after_first as select count(*) n from public.questions;
${seed}
do $$ begin
 if (select count(*) from public.questions)<>(select n from after_first) then raise exception 'Duplicate content on rerun';end if;
 if exists(select 1 from previous_questions old left join public.questions q using(id) where to_jsonb(q) is distinct from old.row_data) then raise exception 'Existing questions changed';end if;
end $$;
insert into auth.users(id,email,raw_user_meta_data)
select ('00000000-0000-4000-8000-'||lpad((4600+n)::text,12,'0'))::uuid,
 'numberline-test-'||n||'@example.invalid',
 jsonb_build_object('role','student','display_name','Isolated Number Line Test','grade',g)
from unnest(array['1','2']) with ordinality grades(g,n);
do $$
declare g text;uid uuid;sk text;stage int;q record;progress record;response jsonb;retry jsonb;request uuid;checked int:=0;selected_count int;count_before int;
begin
 if(select count(*) from public.questions where kind='numberline')<>72 then raise exception 'Incomplete number-line bank';end if;
 foreach g in array array['1','2'] loop
  uid:=('00000000-0000-4000-8000-'||lpad((4600+g::int)::text,12,'0'))::uuid;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  sk:=g||'.numberline';
  for stage in 1..3 loop
   select * into progress from public.get_skill_progress(uid,'math',g) where skill=sk;
   if progress.target_difficulty is distinct from stage then raise exception 'Wrong stage for %',sk;end if;
   selected_count:=0;
   for q in select * from public.get_progressive_questions('math',g,7,'{}',sk) loop
    selected_count:=selected_count+1;
    if q.grade<>g or q.skill<>sk or q.kind<>'numberline' or q.difficulty<>stage then raise exception 'Incorrect game selection';end if;
    if to_jsonb(q)?'answer' or to_jsonb(q)?'answer_index' then raise exception 'Answer exposed before submission';end if;
   end loop;
   if selected_count<>7 then raise exception 'Incomplete game round';end if;
   for q in select * from public.questions where skill=sk and difficulty=stage order by prompt loop
    request:=gen_random_uuid();
    response:=public.record_practice_attempt(q.id,q.answer,false,request);
    if (response->>'is_correct')::boolean is distinct from true or response->'correct' is distinct from q.answer then raise exception 'Incorrect scoring';end if;
    if (response->>'xp_earned')::int<10 then raise exception 'Correct answer did not earn credit';end if;
    select count(*) into count_before from public.attempts where student_id=uid;
    retry:=public.record_practice_attempt(q.id,q.answer,false,request);
    if retry is distinct from response or (select count(*) from public.attempts where student_id=uid)<>count_before then raise exception 'Retry duplicated an attempt';end if;
    update public.attempts set created_at=clock_timestamp() where id=(response->>'attempt_id')::uuid;
    checked:=checked+1;
   end loop;
  end loop;
  select * into progress from public.get_skill_progress(uid,'math',g) where skill=sk;
  if progress.state<>'secure' then raise exception 'Progress did not reach secure';end if;
  select * into q from public.questions where skill=sk and difficulty=3 order by prompt limit 1;
  response:=public.record_practice_attempt(q.id,jsonb_build_array(-(q.answer->>0)::int,(q.answer->>1)::int),false,gen_random_uuid());
  if (response->>'is_correct')::boolean is distinct from false or (response->>'xp_earned')::int<>0 then raise exception 'Wrong direction rewarded';end if;
  response:=public.record_practice_attempt(q.id,jsonb_build_array((q.answer->>0)::int,(q.answer->>1)::int+1),false,gen_random_uuid());
  if (response->>'is_correct')::boolean is distinct from false then raise exception 'Wrong distance accepted';end if;
  response:=public.record_practice_attempt(q.id,'[1]'::jsonb,false,gen_random_uuid());
  if (response->>'is_correct')::boolean is distinct from false then raise exception 'Incomplete answer accepted';end if;
  response:=public.record_practice_attempt(q.id,q.answer,true,gen_random_uuid());
  if not exists(select 1 from public.attempts where id=(response->>'attempt_id')::uuid and support_used=true) then raise exception 'Hint use not recorded';end if;
 end loop;
 if checked<>72 then raise exception 'Not every question was graded';end if;
end $$;
rollback;
select 'PASS: 72 questions; selection, scoring, rewards, idempotency, progression, wrong answers, and hints. All changes rolled back.' result;
`);
