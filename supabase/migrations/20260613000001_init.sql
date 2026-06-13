-- SummerSharp — schema for a Florida K-5 summer learning app.
--
-- Account model (COPPA-aware):
--   * Parents own accounts (real email + password).
--   * Parents provision child logins server-side (synthetic username email + PIN).
--   * parent_child links the two; RLS keys off it so a parent only sees their kids.
--   * XP / streaks / badges / answer-keys are written ONLY via SECURITY DEFINER
--     RPCs, never by the browser, so they can't be tampered with.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('parent', 'student')),
  display_name  text not null,
  username      text unique,                       -- students only; used for PIN login
  grade         text check (grade in ('K','1','2','3','4','5')),
  avatar        text not null default '🦊',
  xp            integer not null default 0,
  streak_count  integer not null default 0,
  last_active_date date,
  created_at    timestamptz not null default now()
);

create table public.parent_child (
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  child_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, child_id)
);
create index parent_child_parent_idx on public.parent_child(parent_id);
create index parent_child_child_idx  on public.parent_child(child_id);

create table public.subjects (
  id    text primary key,            -- 'math', 'reading', ...
  name  text not null,
  emoji text not null,
  color text not null,               -- tailwind-ish accent used by the UI
  sort  integer not null default 0
);

create table public.questions (
  id           uuid primary key default gen_random_uuid(),
  subject_id   text not null references public.subjects(id),
  grade        text not null check (grade in ('K','1','2','3','4','5')),
  difficulty   integer not null default 1,
  standard     text,                 -- Florida B.E.S.T. benchmark code (optional)
  prompt       text not null,
  choices      jsonb not null,       -- ["4","5","6","7"]
  answer_index integer not null,     -- index into choices
  explanation  text,
  xp           integer not null default 10,
  created_at   timestamptz not null default now()
);
create index questions_subject_grade_idx on public.questions(subject_id, grade);

create table public.attempts (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade,
  subject_id  text not null references public.subjects(id),
  selected_index integer not null,
  is_correct  boolean not null,
  xp_earned   integer not null default 0,
  created_at  timestamptz not null default now()
);
create index attempts_student_idx          on public.attempts(student_id);
create index attempts_student_correct_idx  on public.attempts(student_id, is_correct);
create index attempts_student_subject_idx  on public.attempts(student_id, subject_id);

create table public.badges (
  id          text primary key,
  name        text not null,
  description text not null,
  emoji       text not null,
  kind        text not null check (kind in ('total_correct','subject_correct','streak','xp')),
  threshold   integer not null,
  subject_id  text references public.subjects(id),
  sort        integer not null default 0
);

create table public.user_badges (
  student_id uuid not null references public.profiles(id) on delete cascade,
  badge_id   text not null references public.badges(id) on delete cascade,
  earned_at  timestamptz not null default now(),
  primary key (student_id, badge_id)
);

-- ---------------------------------------------------------------------------
-- New-user trigger: build a profile from auth metadata
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name, username, grade, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'parent'),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'grade',
    coalesce(new.raw_user_meta_data->>'avatar', '🦊')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.parent_child enable row level security;
alter table public.subjects     enable row level security;
alter table public.questions    enable row level security;
alter table public.attempts     enable row level security;
alter table public.badges       enable row level security;
alter table public.user_badges  enable row level security;

-- profiles: read self, or a child you are the parent of.
create policy "profiles read self"
  on public.profiles for select
  using (id = (select auth.uid()));

create policy "parent reads child profile"
  on public.profiles for select
  using (exists (
    select 1 from public.parent_child pc
    where pc.parent_id = (select auth.uid()) and pc.child_id = profiles.id
  ));

-- profiles: a user may update only their own row, and only safe columns
-- (column privileges below restrict which columns; RLS restricts which rows).
create policy "profiles update self"
  on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.profiles from authenticated;
grant  update (display_name, avatar) on public.profiles to authenticated;

-- parent_child: each side can read its own links (writes happen via service role).
create policy "read own parent links"
  on public.parent_child for select
  using (parent_id = (select auth.uid()) or child_id = (select auth.uid()));

-- subjects & badges: public reference data, readable by any signed-in user.
create policy "subjects readable" on public.subjects
  for select using ((select auth.uid()) is not null);
create policy "badges readable" on public.badges
  for select using ((select auth.uid()) is not null);

-- attempts: a student reads their own; a parent reads their child's.
create policy "read own attempts"
  on public.attempts for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = attempts.student_id
    )
  );

-- user_badges: same visibility as attempts.
create policy "read own badges"
  on public.user_badges for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = user_badges.student_id
    )
  );

-- Note: questions has RLS enabled but NO select policy. Answer keys are therefore
-- never directly readable; questions reach the client only via get_practice_questions().

-- ---------------------------------------------------------------------------
-- RPCs (all SECURITY DEFINER, owned by postgres → bypass RLS but self-authorize)
-- ---------------------------------------------------------------------------

-- Authorize: is the caller this student, or that student's parent?
create or replace function public.can_view_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = p_student_id
    );
$$;

-- Fetch a batch of practice questions WITHOUT the answer key.
create or replace function public.get_practice_questions(
  p_subject text,
  p_grade   text,
  p_count   integer default 5
)
returns table (
  id uuid, subject_id text, grade text, prompt text,
  choices jsonb, standard text, xp integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;

  return query
    select q.id, q.subject_id, q.grade, q.prompt, q.choices, q.standard, q.xp
    from public.questions q
    where q.subject_id = p_subject and q.grade = p_grade
    order by random()
    limit greatest(1, least(coalesce(p_count, 5), 20));
end;
$$;

-- Record an answer: grade it server-side, award XP / streak / badges atomically.
create or replace function public.record_attempt(
  p_question_id uuid,
  p_selected_index integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_q public.questions%rowtype;
  v_is_correct boolean;
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

  v_is_correct := (p_selected_index = v_q.answer_index);
  v_xp_earned  := case when v_is_correct then v_q.xp else 0 end;

  insert into public.attempts (student_id, question_id, subject_id, selected_index, is_correct, xp_earned)
  values (v_uid, v_q.id, v_q.subject_id, p_selected_index, v_is_correct, v_xp_earned);

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
    'correct_index', v_q.answer_index,
    'explanation',   v_q.explanation,
    'xp_earned',     v_xp_earned,
    'new_xp',        v_new_xp,
    'new_streak',    v_new_streak,
    'new_badges',    v_new_badges
  );
end;
$$;

-- Full progress summary for a student (used by both student home and parent view).
create or replace function public.get_student_summary(p_student_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile jsonb;
  v_totals jsonb;
  v_subjects jsonb;
  v_badges jsonb;
  v_recent jsonb;
begin
  if not public.can_view_student(p_student_id) then
    raise exception 'not authorized';
  end if;

  select to_jsonb(p) - 'username' into v_profile
    from (select id, role, display_name, grade, avatar, xp, streak_count,
                 last_active_date from public.profiles where id = p_student_id) p;

  select jsonb_build_object(
           'attempts', count(*),
           'correct',  count(*) filter (where is_correct),
           'accuracy', case when count(*) = 0 then 0
                       else round(100.0 * count(*) filter (where is_correct) / count(*)) end
         ) into v_totals
    from public.attempts where student_id = p_student_id;

  select coalesce(jsonb_agg(row), '[]'::jsonb) into v_subjects from (
    select jsonb_build_object(
             'subject_id', s.id, 'name', s.name, 'emoji', s.emoji, 'color', s.color,
             'attempts', count(a.id),
             'correct',  count(a.id) filter (where a.is_correct)
           ) as row
    from public.subjects s
    left join public.attempts a
      on a.subject_id = s.id and a.student_id = p_student_id
    group by s.id, s.name, s.emoji, s.color, s.sort
    order by s.sort
  ) t;

  select coalesce(jsonb_agg(row order by row->>'earned_at'), '[]'::jsonb) into v_badges from (
    select jsonb_build_object(
             'id', bd.id, 'name', bd.name, 'emoji', bd.emoji,
             'description', bd.description, 'earned_at', ub.earned_at
           ) as row
    from public.user_badges ub
    join public.badges bd on bd.id = ub.badge_id
    where ub.student_id = p_student_id
  ) t;

  select coalesce(jsonb_agg(row), '[]'::jsonb) into v_recent from (
    select jsonb_build_object(
             'subject_id', a.subject_id, 'is_correct', a.is_correct,
             'xp_earned', a.xp_earned, 'created_at', a.created_at
           ) as row
    from public.attempts a
    where a.student_id = p_student_id
    order by a.created_at desc
    limit 10
  ) t;

  return jsonb_build_object(
    'profile',  v_profile,
    'totals',   v_totals,
    'subjects', v_subjects,
    'badges',   v_badges,
    'recent',   v_recent
  );
end;
$$;

-- The signed-in parent's children with headline stats.
create or replace function public.get_my_children()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result jsonb;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select coalesce(jsonb_agg(row order by row->>'display_name'), '[]'::jsonb)
    into v_result from (
    select jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'username', p.username,
      'grade', p.grade,
      'avatar', p.avatar,
      'xp', p.xp,
      'streak_count', p.streak_count,
      'last_active_date', p.last_active_date,
      'total_attempts', (select count(*) from public.attempts a where a.student_id = p.id),
      'total_correct',  (select count(*) from public.attempts a where a.student_id = p.id and a.is_correct),
      'badge_count',    (select count(*) from public.user_badges ub where ub.student_id = p.id)
    ) as row
    from public.parent_child pc
    join public.profiles p on p.id = pc.child_id
    where pc.parent_id = v_uid
  ) t;

  return v_result;
end;
$$;

grant execute on function public.get_practice_questions(text, text, integer) to authenticated;
grant execute on function public.record_attempt(uuid, integer) to authenticated;
grant execute on function public.get_student_summary(uuid) to authenticated;
grant execute on function public.get_my_children() to authenticated;
grant execute on function public.can_view_student(uuid) to authenticated;
