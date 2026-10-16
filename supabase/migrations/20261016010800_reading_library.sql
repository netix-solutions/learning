-- Book telemetry is separate from quiz attempts: time is engagement, not mastery.
create table public.reading_progress (
 student_id uuid not null references public.profiles(id) on delete cascade,
 book_id text not null, revision text not null,
 page integer not null default 0 check(page>=0), furthest_page integer not null default 0 check(furthest_page>=0),
 active_ms bigint not null default 0 check(active_ms>=0), listening_ms bigint not null default 0 check(listening_ms>=0 and listening_ms<=active_ms),
 completed_at timestamptz, updated_at timestamptz not null default now(), primary key(student_id,book_id)
);
create table public.reading_sessions (
 id uuid primary key, student_id uuid not null references public.profiles(id) on delete cascade,
 book_id text not null, revision text not null, page_count integer not null check(page_count between 1 and 50),
 sequence integer not null default 0, reported_ms bigint not null default 0, reported_listening_ms bigint not null default 0,
 active_ms bigint not null default 0, listening_ms bigint not null default 0,
 started_at timestamptz not null default now(), synced_at timestamptz not null default now(),
 check(active_ms>=0 and listening_ms>=0 and listening_ms<=active_ms)
);
create index reading_sessions_student_started on public.reading_sessions(student_id,started_at desc);
create table public.reading_clock (
 student_id uuid primary key references public.profiles(id) on delete cascade,
 credited_at timestamptz not null default now()
);
create table public.reading_checks (
 student_id uuid not null references public.profiles(id) on delete cascade,
 book_id text not null, revision text not null, question_index integer not null check(question_index between 0 and 19),
 choice integer not null check(choice between 0 and 9), is_correct boolean not null, support_used boolean not null,
 created_at timestamptz not null default now(), primary key(student_id,book_id,revision,question_index)
);
alter table public.reading_progress enable row level security;
alter table public.reading_sessions enable row level security;
alter table public.reading_clock enable row level security;
alter table public.reading_checks enable row level security;
create policy reading_progress_view on public.reading_progress for select to authenticated using(public.can_view_student(student_id));
create policy reading_sessions_view on public.reading_sessions for select to authenticated using(public.can_view_student(student_id));
create policy reading_checks_view on public.reading_checks for select to authenticated using(public.can_view_student(student_id));
-- The clock is internal; there is intentionally no client policy.
revoke all on public.reading_progress,public.reading_sessions,public.reading_checks,public.reading_clock from anon,authenticated;
grant select on public.reading_progress,public.reading_sessions,public.reading_checks to authenticated;
grant all on public.reading_progress,public.reading_sessions,public.reading_checks,public.reading_clock to service_role;

-- Only the authenticated server route may call this transaction. No client can
-- supply another student, forge a book revision, or write its own time totals.
create function public.sync_reading_session(p_student uuid,p_session uuid,p_book text,p_revision text,p_pages integer,p_page integer,p_sequence integer,p_active bigint,p_listening bigint,p_complete boolean default false)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare s public.reading_sessions%rowtype; c public.reading_clock%rowtype; p public.reading_progress%rowtype; t timestamptz:=clock_timestamp(); delta bigint; heard bigint;
begin
 if not exists(select 1 from public.profiles where id=p_student and role='student') then raise exception 'student required';end if;
 if p_session is null or p_book is null or length(p_book)>100 or p_revision is null or p_pages is null or p_pages not between 1 and 50 or p_page is null or p_page<0 or p_page>=p_pages or p_sequence is null or p_sequence<0 or p_active is null or p_active<0 or p_active>86400000 or p_listening is null or p_listening<0 or p_listening>p_active or p_complete is null then raise exception 'invalid reading snapshot';end if;
 insert into public.reading_clock(student_id,credited_at) values(p_student,t) on conflict do nothing;
 select * into c from public.reading_clock where student_id=p_student for update;
 select * into s from public.reading_sessions where id=p_session for update;
 if not found then
  if p_active<>0 or p_sequence<>0 then raise exception 'open session first';end if;
  insert into public.reading_sessions(id,student_id,book_id,revision,page_count,started_at,synced_at) values(p_session,p_student,p_book,p_revision,p_pages,t,t) returning * into s;
 else
  if s.student_id<>p_student or s.book_id<>p_book or s.revision<>p_revision or s.page_count<>p_pages then raise exception 'session mismatch';end if;
 end if;
 insert into public.reading_progress(student_id,book_id,revision,page) values(p_student,p_book,p_revision,p_page) on conflict do nothing;
 if p_sequence>s.sequence then
  if p_active<s.reported_ms or p_listening<s.reported_listening_ms then raise exception 'time cannot go backwards';end if;
  -- Wall-clock cap, an inactivity cap, and a per-student lock prevent double
  -- counting retries, hidden-tab jumps, or simultaneous tabs/devices.
  delta:=least(p_active-s.reported_ms,120000,greatest(0,floor(extract(epoch from(t-greatest(s.synced_at,c.credited_at)))*1000)::bigint));
  heard:=least(delta,p_listening-s.reported_listening_ms);
  update public.reading_sessions set sequence=p_sequence,reported_ms=p_active,reported_listening_ms=p_listening,active_ms=active_ms+delta,listening_ms=listening_ms+heard,synced_at=t where id=p_session;
  if delta>0 then update public.reading_clock set credited_at=t where student_id=p_student;end if;
  update public.reading_progress set revision=p_revision,page=p_page,furthest_page=greatest(furthest_page,p_page),active_ms=active_ms+delta,listening_ms=listening_ms+heard,completed_at=case when p_complete and p_page=p_pages-1 then coalesce(completed_at,t) else completed_at end,updated_at=t where student_id=p_student and book_id=p_book;
 end if;
 select * into p from public.reading_progress where student_id=p_student and book_id=p_book;
 return to_jsonb(p);
end $$;
revoke all on function public.sync_reading_session(uuid,uuid,text,text,integer,integer,integer,bigint,bigint,boolean) from public,anon,authenticated;
grant execute on function public.sync_reading_session(uuid,uuid,text,text,integer,integer,integer,bigint,bigint,boolean) to service_role;
