-- Fix question repetition (reported: a grade-2 kid saw the same question 6x
-- while 139-1668 questions existed for his grade).
--
-- Two root causes in get_adaptive_questions:
--   1. The final ORDER BY put priority class first, so a single "weak" skill
--      could fill the whole round from its ~25-question pool.
--   2. "Seen" was a binary 4-day flag used as a late tiebreak, so once a
--      skill's pool was touched, repeats were served freely — even while
--      hundreds of never-seen questions existed in other skills.
--
-- New selection:
--   * rn_in_skill orders each skill's questions by lifetime times_seen, then
--     oldest-seen first, then random.
--   * Bands of 2 per skill guarantee a round mixes skills: band 0 holds the
--     2 best questions of EVERY skill, band 1 the next 2, and so on.
--   * Within a band, never-seen questions ALWAYS beat seen ones, then the
--     adaptive priority (weak skill > new skill > learning > stale mastered)
--     breaks ties. Adaptivity is preserved among fresh questions; repeats
--     only happen when the grade's pool is genuinely exhausted.

create or replace function public.get_adaptive_questions(
  p_subject text,
  p_grade   text,
  p_count   integer default 6
)
returns table (
  id uuid, subject_id text, grade text, prompt text,
  choices jsonb, standard text, skill text, xp integer, focus text,
  kind text, payload jsonb
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
  with mastery as (
    select * from public.get_skill_mastery(v_uid, p_subject, p_grade)
  ),
  prio as (
    select
      m.skill,
      case
        when m.state = 'learning' and not m.last_correct and m.attempts > 0 then 1
        when m.state = 'not_started'                                        then 2
        when m.state = 'learning'                                           then 3
        when m.state = 'mastered'
             and (m.last_practiced is null
                  or m.last_practiced < now() - interval '3 days')          then 4
        else                                                                     5
      end as p,
      case
        when m.state = 'learning' and not m.last_correct and m.attempts > 0 then 'review'
        when m.state = 'not_started'                                        then 'new'
        when m.state = 'mastered'                                           then 'review'
        else                                                                     'practice'
      end as focus
    from mastery m
  ),
  seen as (
    select a.question_id,
           count(*)          as times_seen,
           max(a.created_at) as last_seen
    from public.attempts a
    where a.student_id = v_uid
    group by a.question_id
  ),
  candidates as (
    select q.id, q.subject_id, q.grade, q.prompt, q.choices, q.standard, q.skill, q.xp,
           q.kind, q.payload,
           coalesce(pr.p, 3)              as p,
           coalesce(pr.focus, 'practice') as focus,
           coalesce(s.times_seen, 0)      as times_seen,
           row_number() over (
             partition by q.skill
             order by coalesce(s.times_seen, 0) asc,
                      s.last_seen asc nulls first,
                      random()
           ) as rn_in_skill
    from public.questions q
    left join prio pr on pr.skill = q.skill
    left join seen s  on s.question_id = q.id
    where q.subject_id = p_subject and q.grade = p_grade
  )
  select c.id, c.subject_id, c.grade, c.prompt,
         coalesce(c.choices, '[]'::jsonb), c.standard, c.skill, c.xp, c.focus,
         c.kind, c.payload
  from candidates c
  order by
    (c.rn_in_skill - 1) / 2 asc,   -- skill-diversity bands (≤2 per skill/band)
    (c.times_seen > 0) asc,        -- never-seen always beats any repeat
    c.p asc,                       -- then the adaptive priority
    c.times_seen asc,              -- least-repeated among unavoidable repeats
    random()
  limit greatest(1, least(coalesce(p_count, 6), 20));
end;
$$;
grant execute on function public.get_adaptive_questions(text, text, integer) to authenticated;

-- "Try one like it" (same skill, after a miss): prefer the least-practiced
-- question of the skill over its lifetime, not just a 1-day window.
create or replace function public.get_skill_questions(
  p_subject text,
  p_grade   text,
  p_skill   text,
  p_count   integer default 1
)
returns table (
  id uuid, subject_id text, grade text, prompt text,
  choices jsonb, standard text, skill text, xp integer,
  kind text, payload jsonb
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
  with seen as (
    select a.question_id,
           count(*)          as times_seen,
           max(a.created_at) as last_seen
    from public.attempts a
    where a.student_id = v_uid
    group by a.question_id
  )
  select q.id, q.subject_id, q.grade, q.prompt,
         coalesce(q.choices, '[]'::jsonb), q.standard, q.skill, q.xp,
         q.kind, q.payload
  from public.questions q
  left join seen s on s.question_id = q.id
  where q.subject_id = p_subject and q.grade = p_grade and q.skill = p_skill
  order by coalesce(s.times_seen, 0) asc,
           s.last_seen asc nulls first,
           random()
  limit greatest(1, least(coalesce(p_count, 1), 10));
end;
$$;
grant execute on function public.get_skill_questions(text, text, text, integer) to authenticated;
