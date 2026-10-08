-- The runner supplies progression_cases from the checked-in authored seed.
-- Everything, including test users, is rolled back. Never uses a real learner.
insert into auth.users(id,email,raw_user_meta_data)
select ('00000000-0000-4000-8000-'||lpad((4600+n)::text,12,'0'))::uuid,
 'reading-detail-stage-'||n||'@example.invalid',
 jsonb_build_object('role','student','display_name','Isolated Reading Test','grade',g)
from unnest(array['3']) with ordinality grades(g,n);
do $$
declare g text; uid uuid; n int:=0; sk text; stage int; q record; progress record; response jsonb; submitted jsonb; checked int:=0; selected_count int;
begin
 if(select count(*) from progression_cases)<>24 then raise exception 'Incomplete reading detail bank';end if;
 foreach g in array array['3'] loop
  n:=n+1;uid:=('00000000-0000-4000-8000-'||lpad((4600+n)::text,12,'0'))::uuid;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  for sk in select distinct skill from progression_cases where grade=g loop
   for stage in 1..3 loop
    select * into progress from public.get_skill_progress(uid,'reading',g) where skill=sk;
    if progress.target_difficulty<>stage then raise exception 'Wrong starting stage for %: % instead of %',sk,progress.target_difficulty,stage;end if;
    selected_count:=0;
    for q in select * from public.get_progressive_questions('reading',g,4,'{}',sk) loop
     selected_count:=selected_count+1;
     if q.difficulty<>stage then raise exception 'Selector failed stage % for %',stage,sk;end if;
     if to_jsonb(q)?'answer' or to_jsonb(q)?'answer_index' then raise exception 'Answer exposed';end if;
    end loop;
    if selected_count<>4 then raise exception 'Incomplete selection for % at stage %',sk,stage;end if;
    if(select count(*) from progression_cases where grade=g and skill=sk and difficulty=stage)<>8 then raise exception 'Missing authored stage';end if;
    for q in select * from progression_cases where grade=g and skill=sk and difficulty=stage order by prompt loop
     submitted:=case when q.kind='mcq' then to_jsonb(q.answer_index) else q.answer end;
     response:=public.record_practice_attempt(q.id,submitted,false,gen_random_uuid());
     if (response->>'is_correct')::boolean is distinct from true then raise exception 'Grading failed for %: %',sk,q.prompt;end if;
     update public.attempts set created_at=clock_timestamp() where id=(response->>'attempt_id')::uuid;
     checked:=checked+1;
    end loop;
   end loop;
   select * into progress from public.get_skill_progress(uid,'reading',g) where skill=sk;
   if progress.state<>'secure' or progress.target_difficulty<>3 then raise exception 'Completed independent stages not secure for %',sk;end if;
   -- Two different helped questions trigger recovery rather than more challenge.
   for q in select * from progression_cases where grade=g and skill=sk and difficulty=3 order by prompt limit 2 loop
    submitted:=case when q.kind='mcq' then to_jsonb(q.answer_index) else q.answer end;
    response:=public.record_practice_attempt(q.id,submitted,true,gen_random_uuid());
    update public.attempts set created_at=clock_timestamp() where id=(response->>'attempt_id')::uuid;
   end loop;
   select * into progress from public.get_skill_progress(uid,'reading',g) where skill=sk;
   if progress.state<>'support' or progress.target_difficulty<>2 then raise exception 'Recovery stage failed for %',sk;end if;
   selected_count:=0;
   for q in select * from public.get_progressive_questions('reading',g,4,'{}',sk) loop
    selected_count:=selected_count+1;
    if q.difficulty<>2 then raise exception 'Recovery selector failed for %',sk;end if;
   end loop;
   if selected_count<>4 then raise exception 'Incomplete recovery selection for %',sk;end if;
  end loop;
 end loop;
 if checked<>24 then raise exception 'Not every authored question graded';end if;
 raise notice '24 authored answers graded; the reading-detail skill advanced through stages 1/2/3 and recovered to stage 2.';
end $$;
rollback;
