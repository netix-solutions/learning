-- Avatar shop: kids spend the points (xp) they earn on AI-generated avatars.
--
-- Money model: xp is the lifetime total (levels never go down). Spendable
-- balance = xp - sum(price_paid) over the kid's purchases. Purchases are
-- written ONLY via the buy_shop_item SECURITY DEFINER RPC so balances can't
-- be tampered with from the browser.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.shop_items (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null default 'avatar'
             check (kind in ('avatar', 'background', 'sticker')),
  slug       text not null unique,
  name       text not null,
  image_url  text not null,
  price      integer not null check (price >= 0),
  sort       integer not null default 100,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.item_purchases (
  student_id uuid not null references public.profiles(id) on delete cascade,
  -- restrict: deleting an item would silently refund every kid who bought it.
  -- Retire items by setting active = false instead.
  item_id    uuid not null references public.shop_items(id) on delete restrict,
  price_paid integer not null check (price_paid >= 0),
  created_at timestamptz not null default now(),
  primary key (student_id, item_id)
);
create index item_purchases_student_idx on public.item_purchases(student_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.shop_items     enable row level security;
alter table public.item_purchases enable row level security;

-- Catalog: signed-in users see active items, plus inactive ones they own
-- (so a retired avatar still shows on the shelf of kids who bought it).
create policy "shop items readable"
  on public.shop_items for select
  using (
    (select auth.uid()) is not null
    and (
      active
      or exists (
        select 1 from public.item_purchases ip
        where ip.item_id = shop_items.id
          and ip.student_id = (select auth.uid())
      )
    )
  );

-- Purchases: a student reads their own; a parent reads their child's.
-- No insert/update/delete policies — writes go through buy_shop_item only.
create policy "read own purchases"
  on public.item_purchases for select
  using (
    student_id = (select auth.uid())
    or exists (
      select 1 from public.parent_child pc
      where pc.parent_id = (select auth.uid()) and pc.child_id = item_purchases.student_id
    )
  );

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- The whole shop in one round trip: catalog + owned flags + spendable balance.
create or replace function public.get_my_shop()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_xp    integer;
  v_spent integer;
begin
  if v_uid is null then
    return jsonb_build_object('error', 'not signed in');
  end if;

  select xp into v_xp from profiles where id = v_uid;
  select coalesce(sum(price_paid), 0) into v_spent
    from item_purchases where student_id = v_uid;

  return jsonb_build_object(
    'xp', coalesce(v_xp, 0),
    'balance', coalesce(v_xp, 0) - v_spent,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'kind', i.kind,
        'slug', i.slug,
        'name', i.name,
        'image_url', i.image_url,
        'price', i.price,
        'owned', exists (
          select 1 from item_purchases ip
          where ip.item_id = i.id and ip.student_id = v_uid
        )
      ) order by i.sort, i.price, i.name)
      from shop_items i
      where i.active or exists (
        select 1 from item_purchases ip
        where ip.item_id = i.id and ip.student_id = v_uid
      )
    ), '[]'::jsonb)
  );
end;
$$;

-- Buy an item with points. Locks the profile row so two rapid taps can't
-- double-spend the same balance.
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
  v_spent   integer;
  v_item    shop_items%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, xp into v_role, v_xp
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can shop');
  end if;

  select * into v_item from shop_items where id = p_item and active;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'item not found');
  end if;

  if exists (select 1 from item_purchases
             where student_id = v_uid and item_id = p_item) then
    return jsonb_build_object('ok', false, 'error', 'already owned');
  end if;

  select coalesce(sum(price_paid), 0) into v_spent
    from item_purchases where student_id = v_uid;

  if v_xp - v_spent < v_item.price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_xp - v_spent);
  end if;

  insert into item_purchases (student_id, item_id, price_paid)
  values (v_uid, p_item, v_item.price);

  return jsonb_build_object(
    'ok', true,
    'balance', v_xp - v_spent - v_item.price,
    'item', jsonb_build_object('id', v_item.id, 'name', v_item.name,
                               'image_url', v_item.image_url)
  );
end;
$$;

-- Equip a purchased item as the kid's avatar (built-in SVG avatars are
-- equipped by writing profiles.avatar directly — kids already have that
-- column grant; this RPC is for bought items so ownership is enforced).
create or replace function public.equip_shop_item(p_item uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := (select auth.uid());
  v_url text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select i.image_url into v_url
    from item_purchases ip
    join shop_items i on i.id = ip.item_id
   where ip.student_id = v_uid and ip.item_id = p_item and i.kind = 'avatar';
  if v_url is null then
    return jsonb_build_object('ok', false, 'error', 'not owned');
  end if;

  update profiles set avatar = v_url where id = v_uid;
  return jsonb_build_object('ok', true, 'avatar', v_url);
end;
$$;
