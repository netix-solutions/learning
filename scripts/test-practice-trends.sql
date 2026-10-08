-- Run inside BEGIN after the migration; rollback includes every synthetic row.
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000004701','trend-child@example.invalid','{"role":"student","grade":"3","display_name":"Trend fixture"}'),
 ('00000000-0000-4000-8000-000000004702','trend-parent@example.invalid','{"role":"parent","display_name":"Trend parent"}'),
 ('00000000-0000-4000-8000-000000004703','trend-other@example.invalid','{"role":"parent","display_name":"Other parent"}');
insert into public.parent_child(parent_id,child_id) values ('00000000-0000-4000-8000-000000004702','00000000-0000-4000-8000-000000004701');
do $$ declare r jsonb; begin
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004702',true);
 r:=public.get_practice_trends('00000000-0000-4000-8000-000000004701');
 if jsonb_array_length(r->'skills')<>0 or exists(select 1 from jsonb_array_elements(r->'periods') p where (p->>'questions')::int<>0) then raise exception 'Empty data failed';end if;
end $$;
create temp table trend_questions as select id,row_number() over(order by id) n from public.questions where grade='3' and skill='3.detail' and difficulty=1 limit 8;
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,created_at,support_used)
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,n<=2,0,now()-interval '20 days',false from trend_questions where n<=4
union all
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-interval '5 days',false from trend_questions where n<=4
union all
-- Later retries must not replace the first answers.
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-interval '19 days',false from trend_questions where n<=4
union all
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-interval '1 day',true from trend_questions where n=5
union all
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-interval '1 day',null from trend_questions where n=6
union all
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()+interval '1 day',false from trend_questions where n=7
union all
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-interval '29 days',false from trend_questions where n=8;
-- Wrong-grade history must not enter the current-grade comparison.
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,created_at,support_used)
select '00000000-0000-4000-8000-000000004701'::uuid,id,subject_id,0,true,0,now()-interval '1 day',false from public.questions where grade='2' limit 1;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004702',true);
do $$ declare r jsonb; t jsonb; begin
 r:=public.get_practice_trends('00000000-0000-4000-8000-000000004701');
 select value into t from jsonb_array_elements(r->'periods') where value->>'period'='previous';
 if t->>'questions'<>'4' or t->>'correct'<>'2' then raise exception 'Previous window or retry dedupe failed: %',t;end if;
 select value into t from jsonb_array_elements(r->'periods') where value->>'period'='recent';
 if t->>'questions'<>'6' or t->>'independent'<>'4' or t->>'correct'<>'4' or t->>'helped'<>'1' or t->>'unknown'<>'1' then raise exception 'Recent window/support/grade bounds failed: %',t;end if;
 if jsonb_array_length(r->'skills')<>1 or r#>>'{skills,0,previous_count}'<>'4' or r#>>'{skills,0,recent_count}'<>'4' then raise exception 'Skill level aggregation failed: %',r;end if;
 if has_function_privilege('anon','public.get_practice_trends(uuid)','execute') or has_function_privilege('anon','sunsharp_private.practice_trends(uuid)','execute') then raise exception 'Anonymous execute exposed';end if;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004703',true);
 begin
  perform public.get_practice_trends('00000000-0000-4000-8000-000000004701');raise exception 'Unrelated parent could read';
 exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub','',true);
 begin
  perform public.get_practice_trends('00000000-0000-4000-8000-000000004701');raise exception 'Missing identity could read';
 exception when insufficient_privilege then null;end;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004701',true);
 if public.get_practice_trends('00000000-0000-4000-8000-000000004701')->>'grade'<>'3' then raise exception 'Own access failed';end if;
end $$;
reset role;
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,created_at,support_used)
select '00000000-0000-4000-8000-000000004701'::uuid,id,'reading',0,true,0,now()-case when n=7 then interval '14 days' else interval '28 days' end,false from trend_questions where n in (7,8);
insert into public.attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned,created_at,support_used)
select '00000000-0000-4000-8000-000000004701',id,'reading',0,true,0,now()-interval '1 day',false from public.questions where grade='3' and skill='3.detail' and difficulty=2 limit 1;
set local role authenticated;
do $$ declare r jsonb;t jsonb;begin
 r:=public.get_practice_trends('00000000-0000-4000-8000-000000004701');
 select value into t from jsonb_array_elements(r->'periods') where value->>'period'='previous';
 if t->>'questions'<>'5' then raise exception '28-day boundary failed';end if;
 select value into t from jsonb_array_elements(r->'periods') where value->>'period'='recent';
 if t->>'questions'<>'8' then raise exception '14-day boundary failed';end if;
 if jsonb_array_length(r->'skills')<>2 then raise exception 'Challenge levels merged';end if;
 if r::text ~ 'answer_index|question_id|selected_index|submitted_answer' then raise exception 'Raw answer data leaked';end if;
end $$;
reset role;
rollback;
