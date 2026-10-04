-- Track known support separately from legacy answers. Legacy NULL evidence is never
-- retroactively called independent. The unique request makes answer retries safe.
alter table public.attempts add column if not exists support_used boolean;
alter table public.attempts add column if not exists request_id uuid;
alter table public.attempts add column if not exists submitted_answer jsonb;
alter table public.attempts add column if not exists grading_result jsonb;
create unique index if not exists attempts_student_request_unique on public.attempts(student_id,request_id) where request_id is not null;
create index if not exists attempts_student_recent_idx on public.attempts(student_id,created_at desc);
CREATE OR REPLACE FUNCTION public.record_practice_attempt(p_question_id uuid, p_answer jsonb, p_support_used boolean, p_request_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := (select auth.uid());
  v_attempt_id uuid;
  v_previous public.attempts%rowtype;
  v_response jsonb;
  v_grade text;
  v_q public.questions%rowtype;
  v_kind text;
  v_is_correct boolean;
  v_sel_index integer := -1;       -- stored in attempts; -1 = non-index answer
  v_correct jsonb;                 -- correct answer to reveal to the client
  v_xp_earned integer;
  v_combo integer := 0;            -- trailing correct answers before this one
  v_bonus integer := 0;
  v_today date := current_date;
  v_last date;
  v_streak integer;
  v_shields integer;
  v_shield_used boolean := false;
  v_new_streak integer;
  v_new_xp integer;
  v_total_correct integer;
  v_subject_correct integer;
  v_new_badges jsonb := '[]'::jsonb;
  b record;
  r record;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;
  if not exists (select 1 from public.profiles where id = v_uid and role = 'student') then
    raise exception 'only students can record attempts';
  end if;

  if p_request_id is null or p_support_used is null then raise exception 'request and support state required'; end if;
  -- Serializes retries and reward/profile changes for this learner.
  select grade into v_grade from public.profiles where id=v_uid for update;
  select * into v_previous from public.attempts where student_id=v_uid and request_id=p_request_id;
  if found then
    if v_previous.question_id <> p_question_id or v_previous.submitted_answer is distinct from p_answer then
      raise exception 'request already used for a different answer';
    end if;
    return v_previous.grading_result;
  end if;
  select * into v_q from public.questions where id = p_question_id;
  if not found then
    raise exception 'question not found';
  end if;

  if v_q.grade <> v_grade then raise exception 'question grade mismatch'; end if;
  v_kind := coalesce(v_q.kind, 'mcq');

  if v_kind in ('mcq', 'truefalse') then
    v_sel_index  := coalesce((p_answer #>> '{}')::int, -1);
    v_is_correct := (v_sel_index = v_q.answer_index);
    v_correct    := to_jsonb(v_q.answer_index);
  elsif v_kind = 'tapword' then
    v_sel_index  := coalesce((p_answer #>> '{}')::int, -1);
    v_is_correct := (v_sel_index = (v_q.answer ->> 'index')::int);
    v_correct    := v_q.answer -> 'index';
  else
    v_is_correct := (p_answer = v_q.answer);
    v_correct    := v_q.answer;
  end if;

  -- Combo: trailing run of correct answers in the last 2 hours (before this
  -- attempt). 2nd-in-a-row pays +2, then +4/+6/+8, capped +10.
  if v_is_correct then
    for r in select a.is_correct from public.attempts a
             where a.student_id = v_uid and a.created_at > now() - interval '2 hours'
             order by a.created_at desc limit 5
    loop
      exit when not r.is_correct;
      v_combo := v_combo + 1;
    end loop;
    v_bonus := least(v_combo, 5) * 2;
  end if;

  v_xp_earned := case when v_is_correct then v_q.xp + v_bonus else 0 end;

  insert into public.attempts (student_id, question_id, subject_id, selected_index, is_correct, xp_earned, support_used, request_id, submitted_answer)
  values (v_uid, v_q.id, v_q.subject_id, v_sel_index, v_is_correct, v_xp_earned, p_support_used, p_request_id, p_answer) returning id into v_attempt_id;

  -- streak: +1 if last active yesterday; unchanged if already today; a streak
  -- shield bridges exactly one missed day; otherwise reset to 1.
  select last_active_date, streak_count, streak_shields
    into v_last, v_streak, v_shields
    from public.profiles where id = v_uid;
  if v_last is null then
    v_new_streak := 1;
  elsif v_last = v_today then
    v_new_streak := v_streak;
  elsif v_last = v_today - 1 then
    v_new_streak := v_streak + 1;
  elsif v_last = v_today - 2 and coalesce(v_shields, 0) > 0 then
    update public.profiles set streak_shields = streak_shields - 1
      where id = v_uid;
    v_shield_used := true;
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

  v_response := jsonb_build_object(
    'attempt_id', v_attempt_id,
    'support_used', p_support_used,
    'is_correct',    v_is_correct,
    'correct_index', v_q.answer_index,
    'correct',       v_correct,
    'explanation',   v_q.explanation,
    'xp_earned',     v_xp_earned,
    'combo',         v_combo + 1,
    'combo_bonus',   v_bonus,
    'shield_used',   v_shield_used,
    'new_xp',        v_new_xp,
    'new_streak',    v_new_streak,
    'new_badges',    v_new_badges
  );
  update public.attempts set grading_result=v_response where id=v_attempt_id;
  return v_response;
end;
 $function$;


-- Latest answer for each different question is evidence, not repeated guesses.
-- Within each difficulty level, four different known-independent answers and
-- at least 80% success unlock the next level. Two of the last three misses/helped answers
-- step back one level. No grade is changed by this function.
create or replace function public.get_skill_progress(p_student_id uuid,p_subject text,p_grade text)
returns table(skill text, attempts integer, independent_attempts integer, independent_correct integer,
 supported_attempts integer, unknown_support_attempts integer, recent_accuracy numeric,
 last_practiced timestamptz, target_difficulty integer, max_difficulty integer, state text)
language plpgsql stable security definer set search_path = public
as $$
begin
 if not public.can_view_student(p_student_id) then raise exception 'not authorized to view this student'; end if;
 return query
 with catalog as (
  select q.skill sk,min(q.difficulty) low,max(q.difficulty) high from public.questions q
  where q.subject_id=p_subject and q.grade=p_grade and q.skill is not null group by q.skill
 ), distinct_answers as (
  select distinct on(a.question_id) q.skill sk,q.difficulty level,a.is_correct,a.support_used,a.created_at,a.id
  from public.attempts a join public.questions q on q.id=a.question_id
  where a.student_id=p_student_id and q.subject_id=p_subject and q.grade=p_grade
   and a.created_at > now()-interval '90 days'
  order by a.question_id,a.created_at desc,a.id desc
 ), ranked as (
  select d.*, row_number() over(partition by d.sk order by d.created_at desc,d.id desc) rn,
   row_number() over(partition by d.sk,d.level order by d.created_at desc,d.id desc) level_rn
  from distinct_answers d
 ), recent as (
  select r.sk,count(*)::int n,count(*) filter(where r.support_used=false)::int independent,
   count(*) filter(where r.support_used=false and r.is_correct)::int correct,
   count(*) filter(where r.support_used=true)::int supported,
   count(*) filter(where r.support_used is null)::int unknown,
   max(r.created_at) practiced,
   count(*) filter(where r.rn<=3 and (not r.is_correct or r.support_used=true)) recovery,
   max(r.level) filter(where r.rn<=3) latest_level
  from ranked r where r.rn<=20 group by r.sk
 ), proven as (
  select r.sk,r.level from ranked r where r.level_rn<=12
  group by r.sk,r.level
  having count(*) filter(where r.support_used=false)>=4
   and count(*) filter(where r.support_used=false and r.is_correct)::numeric / nullif(count(*) filter(where r.support_used=false),0)>=.8
   and count(*) filter(where r.level_rn<=3 and (not r.is_correct or r.support_used is distinct from false))=0
 ), proof as (select p.sk,max(p.level) level from proven p group by p.sk)
 select c.sk,coalesce(r.n,0),coalesce(r.independent,0),coalesce(r.correct,0),coalesce(r.supported,0),coalesce(r.unknown,0),
  round(r.correct::numeric/nullif(r.independent,0),2),r.practiced,
  greatest(c.low,least(c.high,case when r.recovery>=2 then coalesce(r.latest_level,c.low)-1 else coalesce(p.level,c.low-1)+1 end)),c.high,
  case when r.n is null then 'not_started' when p.level>=c.high and coalesce(r.recovery,0)<2 then 'secure' when r.recovery>=2 then 'support' else 'building' end
 from catalog c left join recent r on r.sk=c.sk left join proof p on p.sk=c.sk;
end $$;

drop function if exists public.get_progressive_questions(text,text,integer,uuid[]);
create or replace function public.get_progressive_questions(p_subject text,p_grade text,p_count integer default 6,p_exclude uuid[] default '{}',p_skill text default null)
returns table(id uuid,subject_id text,grade text,prompt text,choices jsonb,standard text,skill text,xp integer,
 focus text,kind text,payload jsonb,difficulty integer,target_difficulty integer)
language plpgsql stable security definer set search_path=public
as $$
declare v_uid uuid := (select auth.uid());
begin
 if v_uid is null then raise exception 'not authenticated'; end if;
 if not exists(select 1 from public.profiles p where p.id=v_uid and p.role='student' and p.grade=p_grade) then raise exception 'student grade mismatch'; end if;
 return query
 with evidence as (select * from public.get_skill_progress(v_uid,p_subject,p_grade)),
 levels as (select q.skill,min(q.difficulty) low from public.questions q where q.subject_id=p_subject and q.grade=p_grade group by q.skill),
 seen as (select a.question_id,count(*) times_seen,max(a.created_at) last_seen from public.attempts a where a.student_id=v_uid group by a.question_id),
 candidates as (
  select q.*,coalesce(e.target_difficulty,q.difficulty) target,
   case when e.state='support' then 'review' when e.attempts=0 then 'new' when e.target_difficulty>l.low then 'stretch' else 'practice' end selected_focus,
   case when e.state='support' then 0 when e.attempts=0 then 1 when e.state='secure' then 3 else 2 end priority,
   coalesce(s.times_seen,0) seen_count,
   row_number() over(partition by q.skill order by abs(q.difficulty-coalesce(e.target_difficulty,q.difficulty)),coalesce(s.times_seen,0),s.last_seen nulls first,random()) skill_rank
  from public.questions q left join evidence e on e.skill=q.skill left join levels l on l.skill=q.skill left join seen s on s.question_id=q.id
  where q.subject_id=p_subject and q.grade=p_grade and not(q.id=any(coalesce(p_exclude,'{}'))) and (p_skill is null or q.skill=p_skill)
 )
 select c.id,c.subject_id,c.grade,c.prompt,coalesce(c.choices,'[]'::jsonb),c.standard,c.skill,c.xp,c.selected_focus,c.kind,c.payload,c.difficulty,c.target
 from candidates c order by (c.skill_rank-1)/2,abs(c.difficulty-c.target),c.priority,c.seen_count,random()
 limit greatest(1,least(coalesce(p_count,6),20));
end $$;

revoke all on function public.record_practice_attempt(uuid,jsonb,boolean,uuid) from public,anon;
revoke all on function public.get_skill_progress(uuid,text,text) from public,anon;
revoke all on function public.get_progressive_questions(text,text,integer,uuid[],text) from public,anon;
grant execute on function public.record_practice_attempt(uuid,jsonb,boolean,uuid) to authenticated;
grant execute on function public.get_skill_progress(uuid,text,text) to authenticated;
grant execute on function public.get_progressive_questions(text,text,integer,uuid[],text) to authenticated;
