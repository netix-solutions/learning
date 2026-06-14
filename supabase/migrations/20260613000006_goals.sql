-- Learning-time goals: parents set how many days/week and minutes/day they want
-- each kid practicing. We track real active minutes, compute weekly progress, and
-- (via a cron) email parents when a goal is met or about to be missed.
--
-- All day/week boundaries are computed in ET (Florida) in ONE place: goal_progress.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.child_goals (
  child_id        uuid primary key references public.profiles(id) on delete cascade,
  days_per_week   integer not null default 5 check (days_per_week between 1 and 7),
  minutes_per_day integer not null default 15 check (minutes_per_day between 1 and 240),
  updated_at      timestamptz not null default now()
);

create table public.daily_usage (
  child_id uuid not null references public.profiles(id) on delete cascade,
  day      date not null,                         -- ET calendar day
  seconds  integer not null default 0,
  primary key (child_id, day)
);
create index daily_usage_child_idx on public.daily_usage(child_id);

create table public.goal_notifications (
  child_id   uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  kind       text not null check (kind in ('met','reminder')),
  sent_at    timestamptz not null default now(),
  primary key (child_id, week_start, kind)        -- one email per kind per week
);

-- ---------------------------------------------------------------------------
-- RLS: parents read their kids' goals/usage; kids read their own. Writes happen
-- through SECURITY DEFINER RPCs / the service role only.
-- ---------------------------------------------------------------------------

alter table public.child_goals enable row level security;
alter table public.daily_usage enable row level security;
alter table public.goal_notifications enable row level security;

create policy "child_goals_select" on public.child_goals for select using (
  child_id = auth.uid()
  or exists (select 1 from public.parent_child pc
             where pc.child_id = child_goals.child_id and pc.parent_id = auth.uid())
);
create policy "daily_usage_select" on public.daily_usage for select using (
  child_id = auth.uid()
  or exists (select 1 from public.parent_child pc
             where pc.child_id = daily_usage.child_id and pc.parent_id = auth.uid())
);

-- ---------------------------------------------------------------------------
-- record_activity: a signed-in student adds active seconds to today's usage.
-- Capped per call and per day to keep an idle/abusive client from inflating it.
-- ---------------------------------------------------------------------------

create or replace function public.record_activity(p_seconds integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_day date := (now() at time zone 'America/New_York')::date;
  v_add integer := greatest(0, least(coalesce(p_seconds, 0), 120));
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'student') then
    return;
  end if;
  insert into daily_usage (child_id, day, seconds)
  values (auth.uid(), v_day, v_add)
  on conflict (child_id, day) do update
    set seconds = least(daily_usage.seconds + v_add, 86400);
end;
$$;

-- ---------------------------------------------------------------------------
-- goal_progress: the single source of truth for a child's goal status (ET).
-- Locked to server-side callers (service role / definer wrappers) so a parent
-- can't probe arbitrary child ids from the browser.
-- ---------------------------------------------------------------------------

create or replace function public.goal_progress(p_child uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_today date := (now() at time zone 'America/New_York')::date;
  v_dow   int  := extract(dow from v_today)::int;   -- 0=Sun .. 6=Sat
  v_wk    date := v_today - v_dow;                  -- Sunday start of week
  g       record;
  today_sec  int;
  goal_days  int;
begin
  select * into g from child_goals where child_id = p_child;
  if not found then return null; end if;

  select coalesce(seconds, 0) into today_sec
    from daily_usage where child_id = p_child and day = v_today;
  today_sec := coalesce(today_sec, 0);

  select count(*) into goal_days
    from daily_usage
    where child_id = p_child and day >= v_wk and day <= v_today
      and seconds >= g.minutes_per_day * 60;

  return jsonb_build_object(
    'minutes_per_day', g.minutes_per_day,
    'days_per_week',   g.days_per_week,
    'today_minutes',   floor(today_sec / 60.0)::int,
    'today_met',       today_sec >= g.minutes_per_day * 60,
    'week_goal_days',  goal_days,
    'week_met',        goal_days >= g.days_per_week,
    'week_start',      v_wk::text,
    'et_today',        v_today::text,
    'dow',             v_dow
  );
end;
$$;

-- Lock goal_progress to server-side callers only (service role + definer
-- wrappers). Revoking from PUBLIC is required — revoking only from anon/
-- authenticated would leave the default PUBLIC grant in place.
revoke execute on function public.goal_progress(uuid) from public;
grant execute on function public.goal_progress(uuid) to service_role;

create or replace function public.get_my_goal_progress()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'student') then
    return null;
  end if;
  return goal_progress(auth.uid());
end;
$$;
