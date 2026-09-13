-- Run against the local Supabase database with ON_ERROR_STOP=1.
-- Test identities and saved attempts are rolled back together.
begin;
insert into auth.users(id,email,raw_user_meta_data)
select ('00000000-0000-4000-8000-' || lpad((2400+n)::text,12,'0'))::uuid,
       'grade-quiz-' || n || '@example.invalid',
       jsonb_build_object('role','student','display_name','Isolated Grade Test','grade',g)
from unnest(array['K','1','2','3','4','5']) with ordinality as grades(g,n);
set local role authenticated;
do $$
declare g text; uid uuid; n int := 0; subject text; q record; first_id uuid; response jsonb; wrong_answer int; visible_count int;
begin
 foreach g in array array['K','1','2','3','4','5'] loop
  n := n + 1;
  uid := ('00000000-0000-4000-8000-' || lpad((2400+n)::text,12,'0'))::uuid;
  perform set_config('request.jwt.claim.sub',uid::text,true);
  if (select count(*) from public.attempts) <> 0 then raise exception 'New student can see another learner attempts'; end if;
  foreach subject in array array['math','reading','science'] loop
   visible_count := 0;
   for q in select * from public.get_adaptive_questions(subject,g,5) loop
    visible_count := visible_count+1;
    if q.grade <> g or q.subject_id <> subject then raise exception 'Wrong grade or subject in quiz'; end if;
    if to_jsonb(q) ? 'answer' or to_jsonb(q) ? 'answer_index' then raise exception 'Answer key in quiz response'; end if;
   end loop;
   if visible_count <> 5 then raise exception 'Incomplete subject quiz for grade %', g; end if;
  end loop;
  select id into first_id from public.get_adaptive_questions('science',g,20) where coalesce(kind,'mcq')='mcq' limit 1;
  if first_id is null then raise exception 'No MCQ test question for grade %',g; end if;
  response := public.record_attempt(first_id,'0'::jsonb);
  wrong_answer := ((response->>'correct_index')::int+1)%4;
  for i in 1..4 loop
   response := public.record_attempt(first_id,to_jsonb(wrong_answer));
   if (response->>'is_correct')::boolean then raise exception 'Wrong answer counted correct'; end if;
  end loop;
  if (select count(*) from public.attempts where student_id=uid) <> 5 then raise exception 'Five attempts not saved'; end if;
  if (select count(*) from public.attempts) <> 5 then raise exception 'Student can see another learner attempts'; end if;
  if (select count(*)/5 from public.attempts where student_id=uid) <> 1 then raise exception 'Practice flower boundary failed'; end if;
 end loop;
end $$;
rollback;
