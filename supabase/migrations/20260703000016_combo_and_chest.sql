-- Two retention mechanics, both priced/awarded server-side so they can't be
-- gamed from the browser:
--
--   1. COMBO BONUS — consecutive correct answers pay escalating bonus points
--      (+2 for the 2nd in a row, +4, +6, +8, capped +10). Computed inside
--      record_attempt from the trailing run of correct attempts in the last
--      2 hours, so it survives page reloads but resets between sessions.
--
--   2. DAILY CHEST — practicing unlocks one treasure chest per day on the kid
--      home screen, worth a random 10–30 points plus a streak bonus (+2 per
--      streak day, capped +14). Variable daily reward = the comeback loop.

-- ---------------------------------------------------------------------------
-- Daily chest
-- ---------------------------------------------------------------------------

create table public.chest_claims (
  student_id uuid not null references public.profiles(id) on delete cascade,
  day        date not null default current_date,
  reward     integer not null,
  created_at timestamptz not null default now(),
  primary key (student_id, day)
);

alter table public.chest_claims enable row level security;

-- A student reads their own claims (the home page uses this to show chest
-- state); a parent can see their child's. Writes only via open_daily_chest.
create policy "read own chest claims"
  on public.chest_claims for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = chest_claims.student_id
    )
  );

create or replace function public.open_daily_chest()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_role   text;
  v_streak integer;
  v_reward integer;
  v_new_xp integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, streak_count into v_role, v_streak
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids have chests');
  end if;

  -- The chest unlocks by practicing: at least one attempt today.
  if not exists (select 1 from attempts
                 where student_id = v_uid and created_at >= current_date) then
    return jsonb_build_object('ok', false, 'error', 'practice first');
  end if;

  if exists (select 1 from chest_claims
             where student_id = v_uid and day = current_date) then
    return jsonb_build_object('ok', false, 'error', 'already opened today');
  end if;

  -- 10/15/20/25/30 at random, plus +2 per streak day (capped at +14).
  v_reward := 10 + 5 * floor(random() * 5)::int
              + least(coalesce(v_streak, 0), 7) * 2;

  insert into chest_claims (student_id, reward) values (v_uid, v_reward);
  update profiles set xp = xp + v_reward where id = v_uid
    returning xp into v_new_xp;

  return jsonb_build_object('ok', true, 'reward', v_reward, 'new_xp', v_new_xp);
end;
$$;
grant execute on function public.open_daily_chest() to authenticated;

-- ---------------------------------------------------------------------------
-- record_attempt v3: adds the combo bonus. Body identical to the
-- question-kinds version except for the v_combo/v_bonus block and the two
-- extra fields in the returned jsonb.
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
  v_combo integer := 0;            -- trailing correct answers before this one
  v_bonus integer := 0;
  v_today date := current_date;
  v_last date;
  v_streak integer;
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

  -- Combo: count the trailing run of correct answers in the last 2 hours
  -- (before this attempt). 2nd-in-a-row pays +2, then +4/+6/+8, capped +10.
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
    'combo',         v_combo + 1,        -- this answer's place in the run
    'combo_bonus',   v_bonus,
    'new_xp',        v_new_xp,
    'new_streak',    v_new_streak,
    'new_badges',    v_new_badges
  );
end;
$$;

grant execute on function public.record_attempt(uuid, jsonb) to authenticated;
