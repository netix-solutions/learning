-- Rollback-only integration: no real learner data is modified.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000003301','progress-test@example.invalid','{"role":"student","display_name":"Progress Test","grade":"2"}'),
 ('00000000-0000-4000-8000-000000003302','progress-other@example.invalid','{"role":"student","display_name":"Other Test","grade":"2"}'),
 ('00000000-0000-4000-8000-000000003303','progress-sql-parent@example.invalid','{"role":"parent","display_name":"Parent Test"}');
insert into public.parent_child values('00000000-0000-4000-8000-000000003303','00000000-0000-4000-8000-000000003301');
insert into public.subjects(id,name,emoji,color,sort) values('progress-test','Progress Test','test','blue',999);
insert into public.questions(id,subject_id,grade,difficulty,skill,prompt,choices,answer_index,xp)
select ('00000000-0000-4000-9000-'||lpad(n::text,12,'0'))::uuid,'progress-test','2',case when n<=8 then 1 else 2 end,'2.test','Test question '||n,'["yes","no"]',0,10 from generate_series(1,16)n;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000003301',true);
do $$
declare r jsonb; retry jsonb; req uuid:=gen_random_uuid(); q uuid:='00000000-0000-4000-9000-000000000001'; s uuid:='00000000-0000-4000-8000-000000003301'; p record;
begin
 select * into p from public.get_skill_progress(s,'progress-test','2');
 if p.target_difficulty<>1 or p.state<>'not_started' then raise exception 'Incorrect starting challenge'; end if;
 r:=public.record_practice_attempt(q,'0',false,req);retry:=public.record_practice_attempt(q,'0',false,req);
 if r<>retry or (select count(*) from public.attempts where student_id=s)<>1 then raise exception 'Retry duplicated answer/reward'; end if;
 if (select xp from public.profiles where id=s)<>(r->>'new_xp')::int then raise exception 'Retry awarded twice'; end if;
 begin perform public.record_practice_attempt(q,'1',false,req);raise exception 'TEST FAIL reused request accepted';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 for i in 1..5 loop perform public.record_practice_attempt(q,'0',false,gen_random_uuid());end loop;
 select * into p from public.get_skill_progress(s,'progress-test','2');
 if p.independent_attempts<>1 or p.target_difficulty<>1 then raise exception 'Repeats forged mastery';end if;
 -- Supported success must not unlock a harder level.
 for i in 2..5 loop perform public.record_practice_attempt(('00000000-0000-4000-9000-'||lpad(i::text,12,'0'))::uuid,'0',true,gen_random_uuid());end loop;
 select * into p from public.get_skill_progress(s,'progress-test','2');
 if p.target_difficulty<>1 or p.supported_attempts<>4 then raise exception 'Supported success promoted difficulty';end if;
end $$;
-- A distinct chronological history; unknown support remains explicitly unknown.
delete from public.attempts where student_id='00000000-0000-4000-8000-000000003301';
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,support_used,created_at)
select '00000000-0000-4000-8000-000000003301',('00000000-0000-4000-9000-'||lpad(n::text,12,'0'))::uuid,'progress-test',0,true,10,false,now()-interval '1 hour'+n*interval '1 minute' from generate_series(1,4)n;
do $$ declare p record;q record; begin
 select * into p from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');
 if p.target_difficulty<>2 then raise exception 'Independent evidence did not increase challenge';end if;
 for q in select * from public.get_progressive_questions('progress-test','2',4,array['00000000-0000-4000-9000-000000000009'::uuid]) loop
  if q.difficulty<>2 or q.focus<>'stretch' or q.id='00000000-0000-4000-9000-000000000009' then raise exception 'Incorrect level or exclusion';end if;
  if to_jsonb(q)?'answer' or to_jsonb(q)?'answer_index' then raise exception 'Answer leaked';end if;
 end loop;
end $$;
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,support_used,created_at)
select '00000000-0000-4000-8000-000000003301',('00000000-0000-4000-9000-'||lpad(n::text,12,'0'))::uuid,'progress-test',1,false,0,false,now()-interval '10 minutes'+n*interval '10 seconds' from generate_series(9,10)n;
do $$ declare p record;begin
 select * into p from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');
 if p.target_difficulty<>1 or p.state<>'support' then raise exception 'Two misses did not scaffold difficulty';end if;
end $$;
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,support_used,created_at)
values ('00000000-0000-4000-8000-000000003301','00000000-0000-4000-9000-000000000005','progress-test',0,true,10,false,now()-interval '1 minute');
do $$ declare p record;begin
 select * into p from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');
 if p.target_difficulty<>1 then raise exception 'One success escalated recovery too soon';end if;
end $$;
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,support_used,created_at)
values ('00000000-0000-4000-8000-000000003301','00000000-0000-4000-9000-000000000006','progress-test',0,true,10,false,now()-interval '30 seconds');
do $$ declare p record;begin
 select * into p from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');
 if p.target_difficulty<>2 then raise exception 'Recovery did not resume a useful challenge';end if;
end $$;
delete from public.attempts where student_id='00000000-0000-4000-8000-000000003301';
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,created_at)
select '00000000-0000-4000-8000-000000003301',('00000000-0000-4000-9000-'||lpad(n::text,12,'0'))::uuid,'progress-test',0,true,10,now()-n*interval '1 minute' from generate_series(1,6)n;
do $$ declare p record;begin
 select * into p from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');
 if p.target_difficulty<>1 or p.independent_attempts<>0 or p.unknown_support_attempts<>6 then raise exception 'Legacy answers claimed independent';end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000003302',true);
do $$ begin
 begin perform public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2');raise exception 'TEST FAIL other learner read evidence';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform public.get_progressive_questions('progress-test','5',2);raise exception 'TEST FAIL wrong grade allowed';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 if has_function_privilege('anon','public.record_practice_attempt(uuid,jsonb,boolean,uuid)','EXECUTE') then raise exception 'Anonymous grading access';end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000003303',true);
do $$ begin
 if (select count(*) from public.get_skill_progress('00000000-0000-4000-8000-000000003301','progress-test','2'))<>1 then raise exception 'Linked parent cannot read progress';end if;
 begin perform public.record_practice_attempt('00000000-0000-4000-9000-000000000001','0',false,gen_random_uuid());raise exception 'TEST FAIL parent graded';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
end $$;
reset role;
-- Exercise the actual authored bank for every K–5 grade and subject, not only
-- synthetic fixtures. Answer keys are read here by postgres solely for testing.
insert into auth.users(id,email,raw_user_meta_data)
select ('00000000-0000-4000-8000-'||lpad((3400+n)::text,12,'0'))::uuid,
 'progress-bank-'||n||'@example.invalid',
 jsonb_build_object('role','student','display_name','Isolated Bank Test','grade',g)
from unnest(array['K','1','2','3','4','5']) with ordinality grades(g,n);
do $$
declare g text; uid uuid; n int:=0; sub text; available int; returned int; q record; result jsonb; answer jsonb; tested int:=0;
begin
 foreach g in array array['K','1','2','3','4','5'] loop
  n:=n+1; uid:=('00000000-0000-4000-8000-'||lpad((3400+n)::text,12,'0'))::uuid;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  for sub in select distinct subject_id from public.questions where grade=g loop
   select count(*) into available from public.questions where grade=g and subject_id=sub;
   select count(*) into returned from public.get_progressive_questions(sub,g,20);
   if returned<>least(20,available) then raise exception 'Incomplete bank selection for grade % subject %',g,sub;end if;
   for q in select * from public.get_progressive_questions(sub,g,20) loop
    if q.grade<>g or q.subject_id<>sub then raise exception 'Grade/subject boundary failed';end if;
    if to_jsonb(q)?'answer' or to_jsonb(q)?'answer_index' then raise exception 'Bank answer leaked';end if;
   end loop;
  end loop;
  for q in select distinct on(coalesce(kind,'mcq')) * from public.questions where grade=g order by coalesce(kind,'mcq'),id loop
   answer:=case when coalesce(q.kind,'mcq') in ('mcq','truefalse') then to_jsonb(q.answer_index) when q.kind='tapword' then q.answer->'index' else q.answer end;
   result:=public.record_practice_attempt(q.id,answer,false,gen_random_uuid());
   if (result->>'is_correct')::boolean is distinct from true then raise exception 'Correct % answer failed for grade %',q.kind,g;end if;
   answer:=case when coalesce(q.kind,'mcq') in ('mcq','truefalse','tapword') then '-999'::jsonb else '{"isolated_test_wrong":true}'::jsonb end;
   result:=public.record_practice_attempt(q.id,answer,true,gen_random_uuid());
   if (result->>'is_correct')::boolean is distinct from false then raise exception 'Incorrect % answer accepted for grade %',q.kind,g;end if;
   if (result->>'support_used')::boolean is distinct from true then raise exception 'Help flag lost';end if;
   tested:=tested+1;
  end loop;
  for sub in select distinct subject_id from public.questions where grade=g loop
   for q in select * from public.get_progressive_questions(sub,g,20) loop
    if q.focus='stretch' and q.target_difficulty<=(select min(difficulty) from public.questions where grade=g and subject_id=sub and skill=q.skill) then
     raise exception 'Starting level mislabeled as stretch';
    end if;
   end loop;
  end loop;
 end loop;
 raise notice 'Actual bank: all K–5 subjects selected; % grade/format combinations graded both correctly and incorrectly',tested;
end $$;
rollback;
