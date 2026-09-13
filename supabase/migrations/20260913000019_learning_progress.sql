-- Instruction-first lesson progress. Student writes go through authenticated
-- server actions; only service_role may invoke these mutation functions.
-- There is deliberately no XP/mastery award for completing a lesson screen.
create table public.learning_runs (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null check (length(lesson_id) between 1 and 100),
  revision text not null check (revision ~ '^[0-9a-f]{64}$'),
  grade text not null check (grade in ('PK','K','1','2','3','4','5')),
  subject text not null check (subject in ('reading','math','science')),
  has_lab boolean not null default false,
  stage text not null default 'teach' check (stage in ('teach','explore','guided','transfer','reflect')),
  step smallint not null default 0 check (step between 0 and 2),
  lab_explored boolean not null default false,
  support_used boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);
create unique index learning_runs_open on public.learning_runs(student_id, lesson_id, revision) where completed_at is null;
create index learning_runs_student_time on public.learning_runs(student_id, updated_at desc);

create table public.learning_checks (
  run_id uuid not null references public.learning_runs(id) on delete cascade,
  stage text not null check (stage in ('guided','transfer')),
  choice smallint not null check (choice between 0 and 9),
  is_correct boolean not null,
  support_used boolean not null,
  explanation text not null,
  created_at timestamptz not null default now(),
  primary key (run_id, stage)
);
alter table public.learning_runs enable row level security;
alter table public.learning_checks enable row level security;
create policy learning_runs_read on public.learning_runs for select to authenticated using (
  student_id = auth.uid() or exists (
    select 1 from public.parent_child pc where pc.child_id = learning_runs.student_id and pc.parent_id = auth.uid()
  )
);
create policy learning_checks_read on public.learning_checks for select to authenticated using (
  exists (select 1 from public.learning_runs r where r.id = learning_checks.run_id)
);
revoke all on public.learning_runs, public.learning_checks from anon, authenticated;
grant select on public.learning_runs, public.learning_checks to authenticated;
grant all on public.learning_runs, public.learning_checks to service_role;

create function public.learning_snapshot(p_run uuid) returns jsonb language sql stable security definer set search_path = public as $$
  select to_jsonb(r) || jsonb_build_object('checks', coalesce((
    select jsonb_agg(to_jsonb(c) order by c.stage) from learning_checks c where c.run_id = r.id
  ), '[]'::jsonb)) from learning_runs r where r.id = p_run;
$$;

create function public.begin_learning_run(p_student uuid, p_lesson text, p_revision text, p_grade text, p_subject text, p_has_lab boolean)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if not exists (select 1 from profiles where id = p_student and role = 'student' and grade = p_grade) then
    raise exception 'student grade mismatch';
  end if;
  insert into learning_runs(student_id, lesson_id, revision, grade, subject, has_lab)
    values(p_student, p_lesson, p_revision, p_grade, p_subject, p_has_lab)
    on conflict(student_id, lesson_id, revision) where completed_at is null
    do update set updated_at = learning_runs.updated_at
    returning id into v_id;
  return learning_snapshot(v_id);
end;
$$;

-- Row locks make each checkpoint/answer atomic across devices. The first answer
-- for a stage is immutable; retries return it instead of overwriting evidence.
create function public.advance_learning_run(
  p_student uuid, p_run uuid, p_revision text, p_operation text,
  p_stage text default 'teach', p_step integer default 0,
  p_lab_explored boolean default false, p_support_used boolean default false,
  p_choice integer default null, p_correct boolean default null, p_explanation text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare r learning_runs; v_count integer;
begin
  select * into r from learning_runs where id = p_run and student_id = p_student for update;
  if not found then raise exception 'lesson not found'; end if;
  if r.revision <> p_revision then raise exception 'lesson updated; start again'; end if;
  if not exists (select 1 from profiles where id = p_student and role = 'student' and grade = r.grade) then
    raise exception 'student grade mismatch';
  end if;
  if r.completed_at is not null then
    if p_operation = 'complete' then return learning_snapshot(r.id); end if;
    raise exception 'lesson already completed';
  end if;
  select count(*) into v_count from learning_checks where run_id = r.id;
  if p_operation = 'checkpoint' then
    if p_stage not in ('teach','explore','guided','transfer','reflect') or p_step not between 0 and 2 then raise exception 'invalid checkpoint'; end if;
    if p_stage = 'explore' and not r.has_lab then raise exception 'no activity for this lesson'; end if;
    if p_stage in ('guided','transfer','reflect') and r.has_lab and not (r.lab_explored or p_lab_explored) then raise exception 'explore the activity first'; end if;
    if p_stage = 'transfer' and not exists(select 1 from learning_checks where run_id = r.id and stage = 'guided') then raise exception 'guided question first'; end if;
    if p_stage = 'reflect' and v_count <> 2 then raise exception 'finish both questions first'; end if;
    update learning_runs set stage = p_stage, step = p_step,
      lab_explored = lab_explored or p_lab_explored,
      support_used = support_used or p_support_used, updated_at = now() where id = r.id;
  elsif p_operation = 'answer' then
    if p_stage not in ('guided','transfer') then raise exception 'invalid check'; end if;
    if exists(select 1 from learning_checks where run_id = r.id and stage = p_stage) then return learning_snapshot(r.id); end if;
    if r.stage <> p_stage then raise exception 'open this question first'; end if;
    if p_choice is null or p_choice not between 0 and 9 or p_correct is null or p_explanation is null or length(p_explanation) = 0 then raise exception 'invalid answer'; end if;
    insert into learning_checks(run_id, stage, choice, is_correct, support_used, explanation)
      values(r.id, p_stage, p_choice, p_correct, r.support_used or p_support_used, p_explanation);
    update learning_runs set updated_at = now() where id = r.id;
  elsif p_operation = 'complete' then
    if r.stage <> 'reflect' or v_count <> 2 then raise exception 'finish the lesson first'; end if;
    update learning_runs set completed_at = now(), updated_at = now() where id = r.id;
  else raise exception 'invalid operation';
  end if;
  return learning_snapshot(r.id);
end;
$$;
revoke execute on function public.learning_snapshot(uuid) from public, anon, authenticated;
revoke execute on function public.begin_learning_run(uuid,text,text,text,text,boolean) from public, anon, authenticated;
revoke execute on function public.advance_learning_run(uuid,uuid,text,text,text,integer,boolean,boolean,integer,boolean,text) from public, anon, authenticated;
grant execute on function public.learning_snapshot(uuid) to service_role;
grant execute on function public.begin_learning_run(uuid,text,text,text,text,boolean) to service_role;
grant execute on function public.advance_learning_run(uuid,uuid,text,text,text,integer,boolean,boolean,integer,boolean,text) to service_role;
