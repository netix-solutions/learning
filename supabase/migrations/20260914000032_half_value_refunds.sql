-- Preserve refunds already completed; new sell-backs return half the original price.
alter table public.train_purchases add column refunded_tokens integer not null default 0 check(refunded_tokens>=0 and refunded_tokens<=price_paid);
update public.train_purchases set refunded_tokens=price_paid where sold_at is not null;
alter table public.train_engine_purchases add column refunded_tokens integer not null default 0 check(refunded_tokens>=0 and refunded_tokens<=price_paid);
update public.train_engine_purchases set refunded_tokens=price_paid where sold_at is not null;
alter table public.dinosaur_purchases add column refunded_tokens integer not null default 0 check(refunded_tokens>=0 and refunded_tokens<=price_paid);
update public.dinosaur_purchases set refunded_tokens=price_paid where sold_at is not null;
alter table public.bakery_purchases add column refunded_tokens integer not null default 0 check(refunded_tokens>=0 and refunded_tokens<=price_paid);
update public.bakery_purchases set refunded_tokens=price_paid where sold_at is not null;
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) -(select coalesce((select attempts+5*lessons from reward_reset_baselines where student_id=u),0)) into earned;
 earned:=greatest(0,earned);
 select (select coalesce(sum(price_paid-refunded_tokens),0) from train_purchases where student_id=u)+(select coalesce(sum(price_paid-refunded_tokens),0) from dinosaur_purchases where student_id=u) +(select coalesce(sum(price_paid-refunded_tokens),0) from bakery_purchases where student_id=u) +(select coalesce(sum(price_paid-refunded_tokens),0) from train_engine_purchases where student_id=u) into spent;
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

create or replace function public.sell_reward(p_kind text,p_purchase uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); tbl text; owner_id uuid; engine text;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required';end if;
 tbl:=case p_kind when 'train' then 'train_purchases' when 'engines' then 'train_engine_purchases' when 'dinosaurs' then 'dinosaur_purchases' when 'bakery' then 'bakery_purchases' else null end;
 if tbl is null then raise exception 'Choose a reward collection';end if;
 execute format('select student_id from public.%I where id=$1',tbl) into owner_id using p_purchase;
 if owner_id is distinct from u then raise exception 'That item is not yours';end if;
 execute format('update public.%I set sold_at=now(), refunded_tokens=price_paid/2 where id=$1 and student_id=$2 and sold_at is null',tbl) using p_purchase,u;
 if p_kind='engines' then
  select engine_id into engine from train_engine_purchases where id=p_purchase;
  -- A retry after repurchase must not unequip the newly purchased engine.
  if not exists(select 1 from train_engine_purchases where student_id=u and engine_id=engine and sold_at is null) then
   update train_engine_selections set engine_id='engine' where student_id=u and engine_id=engine;
  end if;
 end if;
 return get_my_train();
end $$;
