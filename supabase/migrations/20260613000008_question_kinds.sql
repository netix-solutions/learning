-- Fun question types beyond plain multiple-choice: matching pairs, sequencing
-- ("put in order"), sort-into-buckets, this-or-that (true/false), and tap-the-word.
--
-- ONE generic answer model so everything else keeps working untouched: the
-- adaptive engine (round-robins by `skill`, type-agnostic), the XP / streak /
-- badge machinery, and "try one like it" all flow through the same path.
--
--   * payload (jsonb)  — PUBLIC, answer-free display data. Safe to send to the
--                        browser. Pre-shuffled so the items never appear in
--                        answer order. NULL for mcq/truefalse (they use `choices`).
--   * answer  (jsonb)  — the WITHHELD correct answer for the new kinds. Never
--                        returned by the public RPCs, exactly like `answer_index`
--                        has always been hidden for multiple-choice.
--
-- Answer encodings (what `answer` holds / what the client submits as p_answer):
--   mcq, truefalse — uses legacy answer_index. Client submits the chosen index.
--   tapword        — answer = {"index": N}.            Client submits tapped index.
--   order          — answer = [i,j,k,…] item indices in correct order.
--                    Client submits the item indices in the order it arranged them.
--   categorize     — answer = [b0,b1,…] bucket index per item (item order fixed).
--                    Client submits a bucket index per item.
--   match          — answer = [r0,r1,…] right-index paired to each left item.
--                    Client submits the right-index it matched to each left item.

alter table public.questions
  add column if not exists kind text not null default 'mcq'
    check (kind in ('mcq','truefalse','match','order','categorize','tapword')),
  add column if not exists payload jsonb,
  add column if not exists answer  jsonb;

-- The new kinds have no fixed choice list / single answer index — those live in
-- payload + answer instead. Relax the mcq-era NOT NULLs so they can be omitted.
alter table public.questions
  alter column choices      drop not null,
  alter column answer_index drop not null;

-- ---------------------------------------------------------------------------
-- Generic scorer. A second overload of record_attempt that takes the answer as
-- jsonb (a number for index-kinds, an array for the rest). The original
-- record_attempt(uuid, integer) stays so any in-flight client keeps working;
-- PostgREST disambiguates by the argument NAME the client sends (p_answer).
-- ---------------------------------------------------------------------------
create or replace function public.record_attempt(
  p_question_id uuid,
  p_answer      jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_q public.questions%rowtype;
  v_kind text;
  v_is_correct boolean;
  v_sel_index integer := -1;       -- stored in attempts; -1 = non-index answer
  v_correct jsonb;                 -- correct answer to reveal to the client
  v_xp_earned integer;
  v_today date := current_date;
  v_last date;
  v_streak integer;
  v_new_streak integer;
  v_new_xp integer;
  v_total_correct integer;
  v_subject_correct integer;
  v_new_badges jsonb := '[]'::jsonb;
  b record;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid and role = 'student') then
    raise exception 'only students can record attempts';
  end if;

  select * into v_q from public.questions where id = p_question_id;
  if not found then
    raise exception 'question not found';
  end if;

  v_kind := coalesce(v_q.kind, 'mcq');

  -- Score by kind, all-or-nothing. v_correct is what we hand back so the UI can
  -- light up the right answer once the attempt is locked in.
  if v_kind in ('mcq', 'truefalse') then
    v_sel_index  := coalesce((p_answer #>> '{}')::int, -1);
    v_is_correct := (v_sel_index = v_q.answer_index);
    v_correct    := to_jsonb(v_q.answer_index);
  elsif v_kind = 'tapword' then
    v_sel_index  := coalesce((p_answer #>> '{}')::int, -1);
    v_is_correct := (v_sel_index = (v_q.answer ->> 'index')::int);
    v_correct    := v_q.answer -> 'index';
  else
    -- match / order / categorize: structural array equality.
    v_is_correct := (p_answer = v_q.answer);
    v_correct    := v_q.answer;
  end if;

  v_xp_earned := case when v_is_correct then v_q.xp else 0 end;

  insert into public.attempts (student_id, question_id, subject_id, selected_index, is_correct, xp_earned)
  values (v_uid, v_q.id, v_q.subject_id, v_sel_index, v_is_correct, v_xp_earned);

  -- streak: +1 if last active yesterday, unchanged if already today, else reset to 1
  select last_active_date, streak_count into v_last, v_streak
    from public.profiles where id = v_uid;
  if v_last is null then
    v_new_streak := 1;
  elsif v_last = v_today then
    v_new_streak := v_streak;
  elsif v_last = v_today - 1 then
    v_new_streak := v_streak + 1;
  else
    v_new_streak := 1;
  end if;

  update public.profiles
    set xp = xp + v_xp_earned,
        streak_count = v_new_streak,
        last_active_date = v_today
    where id = v_uid
    returning xp into v_new_xp;

  select count(*) into v_total_correct
    from public.attempts where student_id = v_uid and is_correct;
  select count(*) into v_subject_correct
    from public.attempts where student_id = v_uid and is_correct and subject_id = v_q.subject_id;

  -- award any newly-earned badges
  for b in select * from public.badges loop
    if not exists (select 1 from public.user_badges
                   where student_id = v_uid and badge_id = b.id) then
      if (b.kind = 'total_correct'   and v_total_correct   >= b.threshold)
        or (b.kind = 'subject_correct' and b.subject_id = v_q.subject_id
                                       and v_subject_correct >= b.threshold)
        or (b.kind = 'streak'          and v_new_streak     >= b.threshold)
        or (b.kind = 'xp'              and v_new_xp         >= b.threshold)
      then
        insert into public.user_badges (student_id, badge_id) values (v_uid, b.id);
        v_new_badges := v_new_badges || jsonb_build_object(
          'id', b.id, 'name', b.name, 'emoji', b.emoji, 'description', b.description
        );
      end if;
    end if;
  end loop;

  return jsonb_build_object(
    'is_correct',    v_is_correct,
    'correct_index', v_q.answer_index,   -- mcq/truefalse compat
    'correct',       v_correct,          -- generic correct answer for new kinds
    'explanation',   v_q.explanation,
    'xp_earned',     v_xp_earned,
    'new_xp',        v_new_xp,
    'new_streak',    v_new_streak,
    'new_badges',    v_new_badges
  );
end;
$$;

grant execute on function public.record_attempt(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Surface kind + payload from the practice RPCs (answer stays hidden). The
-- return signature changes, so drop-then-recreate (CREATE OR REPLACE can't add
-- output columns). Bodies are unchanged except for the two extra columns.
-- ---------------------------------------------------------------------------
drop function if exists public.get_adaptive_questions(text, text, integer);
create function public.get_adaptive_questions(
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
  recent as (
    select distinct a.question_id
    from public.attempts a
    where a.student_id = v_uid and a.created_at > now() - interval '4 days'
  ),
  candidates as (
    select q.id, q.subject_id, q.grade, q.prompt, q.choices, q.standard, q.skill, q.xp,
           q.kind, q.payload,
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
  select c.id, c.subject_id, c.grade, c.prompt,
         coalesce(c.choices, '[]'::jsonb), c.standard, c.skill, c.xp, c.focus,
         c.kind, c.payload
  from candidates c
  order by c.p asc, c.rn_in_skill asc, c.seen asc, random()
  limit greatest(1, least(coalesce(p_count, 6), 20));
end;
$$;
grant execute on function public.get_adaptive_questions(text, text, integer) to authenticated;

drop function if exists public.get_skill_questions(text, text, text, integer);
create function public.get_skill_questions(
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
  with recent as (
    select a.question_id
    from public.attempts a
    where a.student_id = v_uid and a.created_at > now() - interval '1 day'
  )
  select q.id, q.subject_id, q.grade, q.prompt,
         coalesce(q.choices, '[]'::jsonb), q.standard, q.skill, q.xp,
         q.kind, q.payload
  from public.questions q
  where q.subject_id = p_subject and q.grade = p_grade and q.skill = p_skill
  order by (q.id in (select question_id from recent)) asc, random()
  limit greatest(1, least(coalesce(p_count, 1), 10));
end;
$$;
grant execute on function public.get_skill_questions(text, text, text, integer) to authenticated;

-- Demo questions for these kinds live in supabase/seeds/question-kinds.sql
-- (loaded after seed.sql, which creates the subjects they reference).
