-- Adaptive tutoring engine (Phase 1 — fully deterministic, no LLM).
--
-- Turns the practice loop from "random questions" into a tutor that tracks what each
-- child knows per skill and targets their weak spots with spaced review. Correctness
-- and grading remain entirely in record_attempt() — nothing here decides answers.

-- ---------------------------------------------------------------------------
-- Internal skill tag, DECOUPLED from the official B.E.S.T. standard.
--   * skill    — fine-grained, always populated for generated questions (e.g.
--                '3.muldiv', 'K.count'); drives adaptivity.
--   * standard — official Florida B.E.S.T. code for parent-facing display; may be
--                null where we won't fabricate a benchmark.
-- ---------------------------------------------------------------------------
alter table public.questions add column if not exists skill text;
create index if not exists questions_subject_grade_skill_idx
  on public.questions(subject_id, grade, skill);

-- ---------------------------------------------------------------------------
-- Per-student, per-skill mastery — computed on the fly from attempts (no
-- denormalized state to drift). Returns every skill in the grade's catalog,
-- including ones never attempted, so callers can show "not started" too.
--
-- Mastery rule (intentionally simple + explainable to a parent):
--   not_started : no attempts yet
--   mastered    : >= 4 attempts AND the 3 most recent were all correct
--   learning    : attempted but not yet mastered
-- (a recent miss is surfaced via last_correct so the selector can prioritize it)
-- ---------------------------------------------------------------------------
create or replace function public.get_skill_mastery(
  p_student_id uuid,
  p_subject    text,
  p_grade      text
)
returns table (
  skill          text,
  attempts       integer,
  correct        integer,
  accuracy       numeric,
  last_correct   boolean,
  last_practiced timestamptz,
  state          text
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  -- Same authorization model as get_student_summary: caller is the student or its parent.
  if not public.can_view_student(p_student_id) then
    raise exception 'not authorized to view this student';
  end if;

  return query
  with catalog as (
    select distinct q.skill
    from public.questions q
    where q.subject_id = p_subject and q.grade = p_grade and q.skill is not null
  ),
  ranked as (
    select q.skill as sk, a.is_correct, a.created_at,
           row_number() over (partition by q.skill order by a.created_at desc) as rn
    from public.attempts a
    join public.questions q on q.id = a.question_id
    where a.student_id = p_student_id
      and q.subject_id = p_subject and q.grade = p_grade
      and q.skill is not null
  ),
  agg as (
    select sk,
           count(*)::int                              as attempts,
           sum((is_correct)::int)::int                as correct,
           max(created_at)                            as last_practiced,
           bool_and(is_correct) filter (where rn <= 3) as last3_all_correct,
           bool_or(is_correct)  filter (where rn = 1)  as last_correct
    from ranked
    group by sk
  )
  select
    c.skill,
    coalesce(g.attempts, 0),
    coalesce(g.correct, 0),
    round(coalesce(g.correct, 0)::numeric / nullif(g.attempts, 0), 2),
    coalesce(g.last_correct, false),
    g.last_practiced,
    case
      when g.attempts is null                                          then 'not_started'
      when g.attempts >= 4 and coalesce(g.last3_all_correct, false)    then 'mastered'
      else                                                                  'learning'
    end
  from catalog c
  left join agg g on g.sk = c.skill;
end;
$$;

-- ---------------------------------------------------------------------------
-- Adaptive practice batch — replaces "order by random()" with skill-aware
-- selection. Still strips the answer key (graded only by record_attempt).
--
-- Priority (lower = served first):
--   1  struggling   — a 'learning' skill whose most recent attempt was wrong
--   2  new          — a skill not started yet (introduce it)
--   3  building      — a 'learning' skill, last attempt correct
--   4  review        — 'mastered' but not practiced in 3+ days (spaced repetition)
--   5  fresh         — recently mastered (lowest priority)
-- Within a priority, rn_in_skill round-robins across skills and prefers questions
-- the child hasn't seen in the last few days.
-- ---------------------------------------------------------------------------
create or replace function public.get_adaptive_questions(
  p_subject text,
  p_grade   text,
  p_count   integer default 6
)
returns table (
  id uuid, subject_id text, grade text, prompt text,
  choices jsonb, standard text, skill text, xp integer, focus text
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
  recent as (
    select distinct a.question_id
    from public.attempts a
    where a.student_id = v_uid and a.created_at > now() - interval '4 days'
  ),
  candidates as (
    select q.id, q.subject_id, q.grade, q.prompt, q.choices, q.standard, q.skill, q.xp,
           coalesce(pr.p, 3)            as p,
           coalesce(pr.focus, 'practice') as focus,
           (q.id in (select question_id from recent)) as seen,
           row_number() over (
             partition by q.skill
             order by (q.id in (select question_id from recent)) asc, random()
           ) as rn_in_skill
    from public.questions q
    left join prio pr on pr.skill = q.skill
    where q.subject_id = p_subject and q.grade = p_grade
  )
  select c.id, c.subject_id, c.grade, c.prompt, c.choices, c.standard, c.skill, c.xp, c.focus
  from candidates c
  order by c.p asc, c.rn_in_skill asc, c.seen asc, random()
  limit greatest(1, least(coalesce(p_count, 6), 20));
end;
$$;

grant execute on function public.get_skill_mastery(uuid, text, text) to authenticated;
grant execute on function public.get_adaptive_questions(text, text, integer) to authenticated;
