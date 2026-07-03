-- Shop v2: a deterministic Daily Deal and a Mystery Box.
--
-- Daily Deal: one active avatar is ~half price each day, picked by hashing
-- the date so every replica computes the same item with no stored state.
-- Mystery Box: 100 points buys a random avatar the kid doesn't own yet —
-- always wins something, never a duplicate. Both are priced server-side
-- (SECURITY DEFINER) so the client can't tamper.

-- Today's deal: item + discounted price (~50%, rounded down to a 10, min 50).
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
  order by md5(current_date::text || id::text)
  limit 1
$$;

-- get_my_shop now also returns the deal so the client can show it.
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
  v_deal  record;
begin
  if v_uid is null then
    return jsonb_build_object('error', 'not signed in');
  end if;

  select xp into v_xp from profiles where id = v_uid;
  select coalesce(sum(price_paid), 0) into v_spent
    from item_purchases where student_id = v_uid;
  select * into v_deal from shop_daily_deal();

  return jsonb_build_object(
    'xp', coalesce(v_xp, 0),
    'balance', coalesce(v_xp, 0) - v_spent,
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

-- buy_shop_item now charges the deal price when the item is today's deal.
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
  v_deal    record;
  v_price   integer;
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

  select * into v_deal from shop_daily_deal();
  v_price := case when v_deal.item_id = v_item.id then v_deal.deal_price
                  else v_item.price end;

  select coalesce(sum(price_paid), 0) into v_spent
    from item_purchases where student_id = v_uid;

  if v_xp - v_spent < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_xp - v_spent);
  end if;

  insert into item_purchases (student_id, item_id, price_paid)
  values (v_uid, p_item, v_price);

  return jsonb_build_object(
    'ok', true,
    'balance', v_xp - v_spent - v_price,
    'price_paid', v_price,
    'item', jsonb_build_object('id', v_item.id, 'name', v_item.name,
                               'image_url', v_item.image_url)
  );
end;
$$;

-- Mystery Box: 100 points for a random unowned avatar. Row lock prevents
-- double-spends, same as buy_shop_item.
create or replace function public.buy_mystery_box()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := (select auth.uid());
  v_role  text;
  v_xp    integer;
  v_spent integer;
  v_item  shop_items%rowtype;
  v_price constant integer := 100;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  select role, xp into v_role, v_xp
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can shop');
  end if;

  select coalesce(sum(price_paid), 0) into v_spent
    from item_purchases where student_id = v_uid;
  if v_xp - v_spent < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_xp - v_spent);
  end if;

  select * into v_item
    from shop_items i
   where i.active and i.kind = 'avatar'
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
    'balance', v_xp - v_spent - v_price,
    'item', jsonb_build_object('id', v_item.id, 'name', v_item.name,
                               'image_url', v_item.image_url, 'price', v_item.price)
  );
end;
$$;
