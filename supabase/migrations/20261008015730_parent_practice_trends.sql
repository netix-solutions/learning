-- Aggregate only; question text and answer keys never leave this function.
-- The helper needs definer access because questions intentionally have no SELECT policy.
create schema if not exists sunsharp_private;
revoke all on schema sunsharp_private from public,anon;
grant usage on schema sunsharp_private to authenticated;
create or replace function sunsharp_private.practice_trends(p_student_id uuid)
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare result jsonb; current_grade text;
begin
 if auth.uid() is null or not coalesce(public.can_view_student(p_student_id),false) then
  raise exception 'not authorized to view this student' using errcode='42501';
 end if;
 select grade into current_grade from public.profiles where id=p_student_id and role='student';
 with first_answers as (
  select distinct on (a.question_id, (a.created_at>=now()-interval '14 days'))
   q.subject_id,q.skill,q.difficulty,a.is_correct,a.support_used,
   case when a.created_at>=now()-interval '14 days' then 'recent' else 'previous' end period
  from public.attempts a join public.questions q on q.id=a.question_id
  where a.student_id=p_student_id and q.grade=current_grade
   and a.created_at>=now()-interval '28 days' and a.created_at<now()
  order by a.question_id,(a.created_at>=now()-interval '14 days'),a.created_at,a.id
 ), totals as (
  select periods.period,count(f.period)::int questions,
   count(*) filter(where f.support_used=false)::int independent,
   count(*) filter(where f.support_used=false and f.is_correct)::int correct,
   count(*) filter(where f.support_used=true)::int helped,
   count(*) filter(where f.period is not null and f.support_used is null)::int unknown
  from (values ('previous'),('recent')) periods(period)
  left join first_answers f on f.period=periods.period group by periods.period
 ), skills as (
  select subject_id,skill,difficulty,
   count(*) filter(where period='previous' and support_used=false)::int previous_count,
   count(*) filter(where period='previous' and support_used=false and is_correct)::int previous_correct,
   count(*) filter(where period='recent' and support_used=false)::int recent_count,
   count(*) filter(where period='recent' and support_used=false and is_correct)::int recent_correct
  from first_answers where skill is not null group by subject_id,skill,difficulty
 )
 select jsonb_build_object('as_of',now(),'grade',current_grade,
  'periods',(select jsonb_agg(to_jsonb(t) order by t.period) from totals t),
  'skills',coalesce((select jsonb_agg(to_jsonb(s) order by subject_id,skill,difficulty) from skills s),'[]'::jsonb)) into result;
 return result;
end $$;
revoke all on function sunsharp_private.practice_trends(uuid) from public,anon;
grant execute on function sunsharp_private.practice_trends(uuid) to authenticated;
create or replace function public.get_practice_trends(p_student_id uuid)
returns jsonb language sql stable security invoker set search_path='' as $$
 select sunsharp_private.practice_trends(p_student_id);
$$;
revoke all on function public.get_practice_trends(uuid) from public,anon;
grant execute on function public.get_practice_trends(uuid) to authenticated;
