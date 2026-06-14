-- "Try one like it" support: fetch fresh questions of a single skill (without the
-- answer key) so a kid can immediately re-practice a skill they just missed.
-- Same security model as the other practice RPCs.
create or replace function public.get_skill_questions(
  p_subject text,
  p_grade   text,
  p_skill   text,
  p_count   integer default 1
)
returns table (
  id uuid, subject_id text, grade text, prompt text,
  choices jsonb, standard text, skill text, xp integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  return query
  with recent as (
    select a.question_id
    from public.attempts a
    where a.student_id = v_uid and a.created_at > now() - interval '1 day'
  )
  select q.id, q.subject_id, q.grade, q.prompt, q.choices, q.standard, q.skill, q.xp
  from public.questions q
  where q.subject_id = p_subject and q.grade = p_grade and q.skill = p_skill
  order by (q.id in (select question_id from recent)) asc, random()  -- prefer unseen
  limit greatest(1, least(coalesce(p_count, 1), 10));
end;
$$;

grant execute on function public.get_skill_questions(text, text, text, integer) to authenticated;
