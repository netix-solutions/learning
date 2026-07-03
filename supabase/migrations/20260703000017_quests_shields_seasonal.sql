-- Engagement package: weekly quests, streak shields, seasonal (limited-time)
-- shop items, and a proper point-spends ledger so consumables can be sold
-- without touching xp (levels never go down; spendable balance =
-- xp - item purchases - point spends).

-- ---------------------------------------------------------------------------
-- Point-spends ledger (consumables like streak shields)
-- ---------------------------------------------------------------------------

create table public.point_spends (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  kind       text not null,
  amount     integer not null check (amount > 0),
  created_at timestamptz not null default now()
);
create index point_spends_student_idx on public.point_spends(student_id);

alter table public.point_spends enable row level security;
create policy "read own spends"
  on public.point_spends for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = point_spends.student_id
    )
  );

-- Single source of truth for "points already spent". SECURITY DEFINER because
-- it's called from other definer RPCs; not for direct client use.
create or replace function public.spent_points(p_uid uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select sum(price_paid) from item_purchases where student_id = p_uid), 0)
       + coalesce((select sum(amount) from point_spends where student_id = p_uid), 0);
$$;
revoke execute on function public.spent_points(uuid) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Streak shields (consumable: protects the streak across one missed day)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column streak_shields integer not null default 0;

create or replace function public.buy_streak_shield()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    text;
  v_xp      integer;
  v_shields integer;
  v_price   constant integer := 150;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, xp, streak_shields into v_role, v_xp, v_shields
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can shop');
  end if;
  if v_shields >= 2 then
    return jsonb_build_object('ok', false, 'error', 'you can hold 2 shields');
  end if;
  if v_xp - spent_points(v_uid) < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_xp - spent_points(v_uid));
  end if;

  insert into point_spends (student_id, kind, amount)
  values (v_uid, 'streak_shield', v_price);
  update profiles set streak_shields = streak_shields + 1 where id = v_uid
    returning streak_shields into v_shields;

  return jsonb_build_object('ok', true, 'shields', v_shields,
                            'balance', v_xp - spent_points(v_uid));
end;
$$;
grant execute on function public.buy_streak_shield() to authenticated;

-- ---------------------------------------------------------------------------
-- Weekly quest (deterministic per ISO week: rotate math → reading → science,
-- 20 correct answers in the subject, 150-point reward)
-- ---------------------------------------------------------------------------

create table public.quest_claims (
  student_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  reward     integer not null,
  created_at timestamptz not null default now(),
  primary key (student_id, week_start)
);

alter table public.quest_claims enable row level security;
create policy "read own quest claims"
  on public.quest_claims for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = quest_claims.student_id
    )
  );

create or replace function public.weekly_quest_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_week    date := date_trunc('week', now())::date;
  v_subject text;
  v_name    text;
  v_emoji   text;
  v_target  constant integer := 20;
  v_reward  constant integer := 150;
  v_progress integer;
  v_claimed boolean;
begin
  if v_uid is null then
    return jsonb_build_object('error', 'not signed in');
  end if;

  v_subject := (array['math', 'reading', 'science'])
               [1 + (extract(week from now())::int % 3)];
  select s.name, s.emoji into v_name, v_emoji from subjects s where s.id = v_subject;

  select count(*) into v_progress
    from attempts a
   where a.student_id = v_uid and a.subject_id = v_subject
     and a.is_correct and a.created_at >= v_week;

  v_claimed := exists (select 1 from quest_claims
                       where student_id = v_uid and week_start = v_week);

  return jsonb_build_object(
    'subject', v_subject,
    'subject_name', coalesce(v_name, initcap(v_subject)),
    'emoji', coalesce(v_emoji, '⭐'),
    'target', v_target,
    'progress', least(v_progress, v_target),
    'reward', v_reward,
    'claimed', v_claimed,
    'days_left', greatest(0, (v_week + 7) - current_date)
  );
end;
$$;
grant execute on function public.weekly_quest_status() to authenticated;

create or replace function public.claim_weekly_quest()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := (select auth.uid());
  v_role   text;
  v_status jsonb;
  v_new_xp integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;
  select role into v_role from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids have quests');
  end if;

  v_status := weekly_quest_status();
  if (v_status ->> 'claimed')::boolean then
    return jsonb_build_object('ok', false, 'error', 'already claimed');
  end if;
  if (v_status ->> 'progress')::int < (v_status ->> 'target')::int then
    return jsonb_build_object('ok', false, 'error', 'quest not finished',
                              'progress', v_status -> 'progress');
  end if;

  insert into quest_claims (student_id, week_start, reward)
  values (v_uid, date_trunc('week', now())::date, (v_status ->> 'reward')::int);
  update profiles set xp = xp + (v_status ->> 'reward')::int where id = v_uid
    returning xp into v_new_xp;

  return jsonb_build_object('ok', true, 'reward', (v_status ->> 'reward')::int,
                            'new_xp', v_new_xp);
end;
$$;
grant execute on function public.claim_weekly_quest() to authenticated;

-- ---------------------------------------------------------------------------
-- Seasonal / limited-time shop items
-- ---------------------------------------------------------------------------

alter table public.shop_items
  add column available_until timestamptz;

-- Daily deal never lands on an expired item.
create or replace function public.shop_daily_deal()
returns table (item_id uuid, deal_price integer)
language sql
stable
security definer
set search_path = public
as $$
  select id, greatest(50, (price / 2 / 10) * 10)
  from shop_items
  where active and kind = 'avatar'
    and (available_until is null or available_until > now())
  order by md5(current_date::text || id::text)
  limit 1
$$;

-- ---------------------------------------------------------------------------
-- get_my_shop v3: spends-aware balance, shields, limited-time visibility
-- ---------------------------------------------------------------------------

create or replace function public.get_my_shop()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_xp      integer;
  v_shields integer;
  v_deal    record;
begin
  if v_uid is null then
    return jsonb_build_object('error', 'not signed in');
  end if;

  select xp, streak_shields into v_xp, v_shields from profiles where id = v_uid;
  select * into v_deal from shop_daily_deal();

  return jsonb_build_object(
    'xp', coalesce(v_xp, 0),
    'balance', coalesce(v_xp, 0) - spent_points(v_uid),
    'shields', coalesce(v_shields, 0),
    'shield_price', 150,
    'deal', case when v_deal.item_id is null then null else
      jsonb_build_object('item_id', v_deal.item_id, 'deal_price', v_deal.deal_price)
    end,
    'mystery_price', 100,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'kind', i.kind,
        'slug', i.slug,
        'name', i.name,
        'image_url', i.image_url,
        'price', i.price,
        'available_until', i.available_until,
        'owned', exists (
          select 1 from item_purchases ip
          where ip.item_id = i.id and ip.student_id = v_uid
        )
      ) order by i.sort, i.price, i.name)
      from shop_items i
      where (i.active and (i.available_until is null or i.available_until > now()))
         or exists (
        select 1 from item_purchases ip
        where ip.item_id = i.id and ip.student_id = v_uid
      )
    ), '[]'::jsonb)
  );
end;
$$;

-- buy_shop_item v3: spends-aware balance + availability window
create or replace function public.buy_shop_item(p_item uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    text;
  v_xp      integer;
  v_item    shop_items%rowtype;
  v_deal    record;
  v_price   integer;
  v_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, xp into v_role, v_xp
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can shop');
  end if;

  select * into v_item from shop_items
   where id = p_item and active
     and (available_until is null or available_until > now());
  if not found then
    return jsonb_build_object('ok', false, 'error', 'item not found');
  end if;

  if exists (select 1 from item_purchases
             where student_id = v_uid and item_id = p_item) then
    return jsonb_build_object('ok', false, 'error', 'already owned');
  end if;

  select * into v_deal from shop_daily_deal();
  v_price := case when v_deal.item_id = v_item.id then v_deal.deal_price
                  else v_item.price end;

  v_balance := v_xp - spent_points(v_uid);
  if v_balance < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_balance);
  end if;

  insert into item_purchases (student_id, item_id, price_paid)
  values (v_uid, p_item, v_price);

  return jsonb_build_object(
    'ok', true,
    'balance', v_balance - v_price,
    'price_paid', v_price,
    'item', jsonb_build_object('id', v_item.id, 'name', v_item.name,
                               'image_url', v_item.image_url)
  );
end;
$$;

-- buy_mystery_box v2: spends-aware balance + never awards an expired item
create or replace function public.buy_mystery_box()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    text;
  v_xp      integer;
  v_item    shop_items%rowtype;
  v_price   constant integer := 100;
  v_balance integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, xp into v_role, v_xp
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can shop');
  end if;

  v_balance := v_xp - spent_points(v_uid);
  if v_balance < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_balance);
  end if;

  select * into v_item
    from shop_items i
   where i.active and i.kind = 'avatar'
     and (i.available_until is null or i.available_until > now())
     and not exists (select 1 from item_purchases ip
                     where ip.student_id = v_uid and ip.item_id = i.id)
   order by random()
   limit 1;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'you own every avatar!');
  end if;

  insert into item_purchases (student_id, item_id, price_paid)
  values (v_uid, v_item.id, v_price);

  return jsonb_build_object(
    'ok', true,
    'balance', v_balance - v_price,
    'item', jsonb_build_object('id', v_item.id, 'name', v_item.name,
                               'image_url', v_item.image_url, 'price', v_item.price)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- record_attempt v4: identical to v3 (combo bonus) plus streak-shield
-- consumption — a shield bridges exactly one missed day.
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

  select * into v_q from public.questions where id = p_question_id;
  if not found then
    raise exception 'question not found';
  end if;

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

  insert into public.attempts (student_id, question_id, subject_id, selected_index, is_correct, xp_earned)
  values (v_uid, v_q.id, v_q.subject_id, v_sel_index, v_is_correct, v_xp_earned);

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

  return jsonb_build_object(
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
end;
$$;

grant execute on function public.record_attempt(uuid, jsonb) to authenticated;
