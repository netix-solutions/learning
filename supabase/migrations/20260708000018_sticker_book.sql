-- Sticker Book: reframe the reward shop around collecting stickers in themed
-- albums and opening surprise sticker packs — far more fun/collectible than a
-- static avatar grid, and easier (buy a pack → stickers land in your book).
--
-- Reuses the existing economy backbone: shop_items are the stickers,
-- item_purchases are owned stickers, point_spends charges the pack, and
-- spent_points() keeps the balance consistent (pack stickers are recorded at
-- price_paid = 0 because the pack itself is the charge).
--
-- The old avatar-grid shop / mystery box are simply no longer surfaced; their
-- functions stay in place so nothing breaks.

-- ---------------------------------------------------------------------------
-- Sticker metadata on shop_items
-- ---------------------------------------------------------------------------

alter table public.shop_items
  add column if not exists collection text,
  add column if not exists rarity text;

-- Group the 29 existing items into themed albums.
update public.shop_items set collection = 'ocean' where slug in
  ('mermaid-star','pete-pelican','shelly-turtle','ollie-octopus','sandy-crab',
   'dottie-dolphin','surf-shark','manny-manatee','snorkel-puppy','sunny-seaturtle');
update public.shop_items set collection = 'animals' where slug in
  ('bella-butterfly','gecko-splash','slither-sam','ninja-frog','luna-sloth',
   'rascal-raccoon','gator-gus','queen-bee','flo-flamingo','florida-panther');
update public.shop_items set collection = 'spacemagic' where slug in
  ('astro-cat','robo-buddy','space-pup','unicorn-sparkle','wizard-owl',
   'dragon-ember','popsicle-yeti','pirate-parrot','dino-rex');

-- Rarity from price: ≤200 common, 250 rare, 300 epic, ≥400 shiny (the grail).
update public.shop_items set rarity =
  case when price >= 400 then 'shiny'
       when price >= 300 then 'epic'
       when price >= 250 then 'rare'
       else 'common' end
  where kind = 'avatar';

-- Anything without a collection yet (future items) falls into 'extras'.
update public.shop_items set collection = 'extras' where collection is null;
update public.shop_items set rarity = 'common' where rarity is null;

-- ---------------------------------------------------------------------------
-- get_sticker_book: everything the book UI needs in one call
-- ---------------------------------------------------------------------------

create or replace function public.get_sticker_book()
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
  v_fav     text;
begin
  if v_uid is null then
    return jsonb_build_object('error', 'not signed in');
  end if;

  select xp, streak_shields, avatar
    into v_xp, v_shields, v_fav
    from profiles where id = v_uid;

  return jsonb_build_object(
    'xp', coalesce(v_xp, 0),
    'balance', coalesce(v_xp, 0) - spent_points(v_uid),
    'shields', coalesce(v_shields, 0),
    'shield_price', 150,
    'favorite', v_fav,
    'pack', jsonb_build_object('key', 'starter', 'price', 75, 'count', 3),
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', i.id,
        'slug', i.slug,
        'name', i.name,
        'image_url', i.image_url,
        'collection', i.collection,
        'rarity', i.rarity,
        'price', i.price,
        'available_until', i.available_until,
        'owned', exists (
          select 1 from item_purchases ip
          where ip.item_id = i.id and ip.student_id = v_uid
        )
      ) order by i.collection, i.price, i.name)
      from shop_items i
      where i.kind = 'avatar'
        and ((i.active and (i.available_until is null or i.available_until > now()))
             or exists (select 1 from item_purchases ip
                        where ip.item_id = i.id and ip.student_id = v_uid))
    ), '[]'::jsonb)
  );
end;
$$;
grant execute on function public.get_sticker_book() to authenticated;

-- ---------------------------------------------------------------------------
-- buy_sticker_pack: charge points, award random UNOWNED stickers (no dupes,
-- weighted so shinies stay rare). One tier for now (75 pts → 3 stickers).
-- ---------------------------------------------------------------------------

create or replace function public.buy_sticker_pack(p_pack text default 'starter')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := (select auth.uid());
  v_role    text;
  v_xp      integer;
  v_balance integer;
  v_avail   integer;
  v_awarded jsonb;
  v_price   constant integer := 75;
  v_count   constant integer := 3;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'not signed in');
  end if;

  -- Lock the profile row so two fast taps can't double-spend.
  select role, xp into v_role, v_xp
    from profiles where id = v_uid for update;
  if v_role is distinct from 'student' then
    return jsonb_build_object('ok', false, 'error', 'only kids can open packs');
  end if;

  -- Anything left to collect?
  select count(*) into v_avail
    from shop_items i
   where i.kind = 'avatar' and i.active
     and (i.available_until is null or i.available_until > now())
     and not exists (select 1 from item_purchases ip
                     where ip.item_id = i.id and ip.student_id = v_uid);
  if v_avail = 0 then
    return jsonb_build_object('ok', false, 'error', 'You collected them all! 🎉');
  end if;

  v_balance := v_xp - spent_points(v_uid);
  if v_balance < v_price then
    return jsonb_build_object('ok', false, 'error', 'not enough points',
                              'balance', v_balance);
  end if;

  -- Pick, award, and charge atomically. `picked` is MATERIALIZED so its
  -- random() ordering is evaluated once and shared by both writes.
  with pool as (
    select i.id, i.name, i.image_url, i.rarity, i.collection,
           case i.rarity
             when 'common' then 60 when 'rare' then 25
             when 'epic'   then 12 when 'shiny' then 3 else 20 end as w
    from shop_items i
    where i.kind = 'avatar' and i.active
      and (i.available_until is null or i.available_until > now())
      and not exists (select 1 from item_purchases ip
                      where ip.item_id = i.id and ip.student_id = v_uid)
  ),
  picked as materialized (
    -- Efraimidis–Spirakis weighted sampling without replacement.
    select id, name, image_url, rarity, collection
    from pool order by power(random(), 1.0 / w) desc limit v_count
  ),
  ins as (
    insert into item_purchases (student_id, item_id, price_paid)
    select v_uid, id, 0 from picked
  ),
  chg as (
    insert into point_spends (student_id, kind, amount)
    values (v_uid, 'sticker_pack', v_price)
  )
  select jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'image_url', image_url,
    'rarity', rarity, 'collection', collection
  )) into v_awarded from picked;

  return jsonb_build_object(
    'ok', true,
    'balance', v_xp - spent_points(v_uid),
    'awarded', coalesce(v_awarded, '[]'::jsonb)
  );
end;
$$;
grant execute on function public.buy_sticker_pack(text) to authenticated;
