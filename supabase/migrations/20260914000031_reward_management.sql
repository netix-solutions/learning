-- Keep sold purchase records so retries cannot refund twice or recreate sold items.
alter table public.train_purchases add column sold_at timestamptz;
alter table public.train_engine_purchases add column sold_at timestamptz;
alter table public.dinosaur_purchases add column sold_at timestamptz;
alter table public.bakery_purchases add column sold_at timestamptz;
alter table public.dinosaur_purchases add column position bigint not null default 0;
with ranked as (select id,row_number() over(partition by student_id order by created_at,id) as n from public.dinosaur_purchases) update public.dinosaur_purchases p set position=r.n from ranked r where r.id=p.id;
alter table public.bakery_purchases add column position bigint not null default 0;
with ranked as (select id,row_number() over(partition by student_id order by created_at,id) as n from public.bakery_purchases) update public.bakery_purchases p set position=r.n from ranked r where r.id=p.id;
alter table public.train_engine_purchases drop constraint train_engine_purchases_student_id_engine_id_key;
create unique index one_owned_engine on public.train_engine_purchases(student_id,engine_id) where sold_at is null;
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) -(select coalesce((select attempts+5*lessons from reward_reset_baselines where student_id=u),0)) into earned;
 earned:=greatest(0,earned);
 select (select coalesce(sum(price_paid),0) from train_purchases where student_id=u and sold_at is null)+(select coalesce(sum(price_paid),0) from dinosaur_purchases where student_id=u and sold_at is null) +(select coalesce(sum(price_paid),0) from bakery_purchases where student_id=u and sold_at is null) +(select coalesce(sum(price_paid),0) from train_engine_purchases where student_id=u and sold_at is null) into spent;
 return jsonb_build_object('theme',coalesce((select theme from reward_preferences where student_id=u),'garden'),
 'earned',earned,'spent',spent,'balance',greatest(0,earned-spent),
 'activeEngine',coalesce((select engine_id from train_engine_selections where student_id=u),'engine'),
 'engineCatalog',(select jsonb_agg(to_jsonb(e) order by e.sort) from train_engines e),
 'engines',coalesce((select jsonb_agg(engine_id order by created_at,id) from train_engine_purchases where student_id=u and sold_at is null),'[]'::jsonb),
 'enginePurchases',coalesce((select jsonb_agg(jsonb_build_object('id',id,'engineId',engine_id,'pricePaid',price_paid) order by created_at,id) from train_engine_purchases where student_id=u and sold_at is null),'[]'::jsonb),
 'bakeryCatalog',(select jsonb_agg(to_jsonb(b) order by b.sort) from bakery_treats b),
 'treats',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'treatId',p.treat_id,'pricePaid',p.price_paid) order by p.position,p.created_at,p.id) from bakery_purchases p where p.student_id=u and p.sold_at is null),'[]'::jsonb),
 'dinosaurCatalog',(select jsonb_agg(to_jsonb(d) order by d.sort) from dinosaurs d),
 'dinosaurs',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'dinosaurId',p.dinosaur_id,'pricePaid',p.price_paid) order by p.position,p.created_at,p.id) from dinosaur_purchases p where p.student_id=u and p.sold_at is null),'[]'::jsonb),
 'catalog',(select jsonb_agg(to_jsonb(c) order by c.sort) from train_cars c),
 'cars',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'carId',p.car_id,'position',p.position,'pricePaid',p.price_paid) order by p.position,p.created_at,p.id) from train_purchases p where p.student_id=u and p.sold_at is null),'[]'::jsonb));
end $$;

create or replace function public.choose_train_engine(p_engine text) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_engine is null or (p_engine<>'engine' and not exists(select 1 from train_engine_purchases where student_id=u and engine_id=p_engine and sold_at is null)) then raise exception 'Unlock this engine first'; end if;
 insert into train_engine_selections values(u,p_engine) on conflict(student_id) do update set engine_id=excluded.engine_id;
 return get_my_train();
end $$;
create or replace function public.buy_train_engine(p_engine text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); item train_engines%rowtype; previous train_engine_purchases%rowtype; state jsonb;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_request is null then raise exception 'Purchase request required'; end if;
 select * into previous from train_engine_purchases where id=p_request;
 if found then
  if previous.student_id<>u or previous.engine_id<>p_engine then raise exception 'Purchase request already used'; end if;
  return get_my_train();
 end if;
 select * into item from train_engines where id=p_engine;
 if not found or item.price=0 then raise exception 'Choose an engine to unlock'; end if;
 if exists(select 1 from train_engine_purchases where student_id=u and engine_id=p_engine and sold_at is null) then return get_my_train(); end if;
 state:=get_my_train();
 if (state->>'balance')::bigint<item.price then raise exception 'Keep practicing to earn more tokens'; end if;
 insert into train_engine_purchases(id,student_id,engine_id,price_paid) values(p_request,u,item.id,item.price);
 return choose_train_engine(p_engine);
end $$;
create or replace function public.buy_dinosaur(p_car text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); car dinosaurs%rowtype; previous dinosaur_purchases%rowtype; state jsonb;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_request is null then raise exception 'Purchase request required'; end if;
 select * into previous from dinosaur_purchases where id=p_request;
 if found then
  if previous.student_id<>u or previous.dinosaur_id<>p_car then raise exception 'Purchase request already used'; end if;
  return get_my_train();
 end if;
 select * into car from dinosaurs where id=p_car;
 if not found then raise exception 'Choose a dinosaur'; end if;
 state:=get_my_train();
 if (state->>'balance')::bigint<car.price then raise exception 'Keep practicing to earn more tokens'; end if;
 insert into dinosaur_purchases(id,student_id,dinosaur_id,price_paid,position)
 values(p_request,u,car.id,car.price,(select coalesce(max(position),0)+1 from dinosaur_purchases where student_id=u));
 return get_my_train();
end $$;

create or replace function public.buy_bakery_treat(p_treat text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); car bakery_treats%rowtype; previous bakery_purchases%rowtype; state jsonb;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_request is null then raise exception 'Purchase request required'; end if;
 select * into previous from bakery_purchases where id=p_request;
 if found then
  if previous.student_id<>u or previous.treat_id<>p_treat then raise exception 'Purchase request already used'; end if;
  return get_my_train();
 end if;
 select * into car from bakery_treats where id=p_treat;
 if not found then raise exception 'Choose a bakery treat'; end if;
 state:=get_my_train();
 if (state->>'balance')::bigint<car.price then raise exception 'Keep practicing to earn more tokens'; end if;
 insert into bakery_purchases(id,student_id,treat_id,price_paid,position)
 values(p_request,u,car.id,car.price,(select coalesce(max(position),0)+1 from bakery_purchases where student_id=u));
 return get_my_train();
end $$;

create or replace function public.move_train_car(p_purchase uuid,p_direction integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); current_pos integer; neighbor uuid; neighbor_pos integer;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_direction not in (-1,1) or p_direction is null then raise exception 'Choose a direction'; end if;
 select position into current_pos from train_purchases where id=p_purchase and student_id=u and sold_at is null;
 if not found then raise exception 'That car is not in your train'; end if;
 select id,position into neighbor,neighbor_pos from train_purchases where student_id=u and sold_at is null
 and case when p_direction=-1 then position<current_pos else position>current_pos end
 order by case when p_direction=-1 then -position else position end limit 1;
 if neighbor is not null then
  update train_purchases set position=case when id=p_purchase then neighbor_pos else current_pos end where student_id=u and id in(p_purchase,neighbor);
 end if;
 return get_my_train();
end $$;

create function public.sell_reward(p_kind text,p_purchase uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); tbl text; owner_id uuid; engine text;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required';end if;
 tbl:=case p_kind when 'train' then 'train_purchases' when 'engines' then 'train_engine_purchases' when 'dinosaurs' then 'dinosaur_purchases' when 'bakery' then 'bakery_purchases' else null end;
 if tbl is null then raise exception 'Choose a reward collection';end if;
 execute format('select student_id from public.%I where id=$1',tbl) into owner_id using p_purchase;
 if owner_id is distinct from u then raise exception 'That item is not yours';end if;
 execute format('update public.%I set sold_at=now() where id=$1 and student_id=$2 and sold_at is null',tbl) using p_purchase,u;
 if p_kind='engines' then
  select engine_id into engine from train_engine_purchases where id=p_purchase;
  -- A retry after repurchase must not unequip the newly purchased engine.
  if not exists(select 1 from train_engine_purchases where student_id=u and engine_id=engine and sold_at is null) then
   update train_engine_selections set engine_id='engine' where student_id=u and engine_id=engine;
  end if;
 end if;
 return get_my_train();
end $$;
create function public.move_reward(p_kind text,p_purchase uuid,p_direction integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); tbl text; current_pos bigint; neighbor uuid; neighbor_pos bigint;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required';end if;
 if p_direction is null or p_direction not in(-1,1) then raise exception 'Choose a direction';end if;
 if p_kind='train' then return move_train_car(p_purchase,p_direction);end if;
 tbl:=case p_kind when 'dinosaurs' then 'dinosaur_purchases' when 'bakery' then 'bakery_purchases' else null end;
 if tbl is null then raise exception 'Choose a collection to arrange';end if;
 execute format('select position from public.%I where id=$1 and student_id=$2 and sold_at is null',tbl) into current_pos using p_purchase,u;
 if current_pos is null then raise exception 'That item is not yours';end if;
 execute format('select id,position from public.%I where student_id=$1 and sold_at is null and case when $2=-1 then position<$3 else position>$3 end order by case when $2=-1 then -position else position end limit 1',tbl) into neighbor,neighbor_pos using u,p_direction,current_pos;
 if neighbor is not null then
  execute format('update public.%I set position=case when id=$1 then $2 else $3 end where student_id=$4 and id in($1,$5)',tbl) using p_purchase,neighbor_pos,current_pos,u,neighbor;
 end if;
 return get_my_train();
end $$;
revoke all on function public.sell_reward(text,uuid),public.move_reward(text,uuid,integer) from public,anon;
grant execute on function public.sell_reward(text,uuid),public.move_reward(text,uuid,integer) to authenticated;
