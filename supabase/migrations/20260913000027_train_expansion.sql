-- Engines are permanent unlocks; cars remain repeatable, reorderable purchases.
create table public.train_engines(id text primary key,name text not null,price integer not null check(price>=0),sort integer not null);
insert into public.train_engines values ('engine','Classic steam engine',0,0),('passenger-engine','Passenger engine',15,1),('bullet-engine','Bullet train engine',25,2),('diesel-engine','Cargo diesel engine',20,3);
insert into public.train_cars values ('dining','Dining car',10,7),('sleeper','Sleeper car',12,8),('bullet-coach','Bullet train coach',12,9),('tanker','Tanker car',8,10),('log-flatcar','Log flatcar',8,11);
create table public.train_engine_purchases(id uuid primary key,student_id uuid not null references public.profiles(id) on delete cascade,engine_id text not null references public.train_engines(id),price_paid integer not null check(price_paid>0),created_at timestamptz not null default now(),unique(student_id,engine_id));
create table public.train_engine_selections(student_id uuid primary key references public.profiles(id) on delete cascade,engine_id text not null references public.train_engines(id));
alter table public.train_engines enable row level security;
alter table public.train_engine_purchases enable row level security;
alter table public.train_engine_selections enable row level security;
create policy engine_catalog_read on public.train_engines for select to authenticated using(true);
create policy own_engine_purchases on public.train_engine_purchases for select to authenticated using(student_id=auth.uid());
create policy own_engine_selection on public.train_engine_selections for select to authenticated using(student_id=auth.uid());
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) into earned;
 select (select coalesce(sum(price_paid),0) from train_purchases where student_id=u)+(select coalesce(sum(price_paid),0) from dinosaur_purchases where student_id=u) +(select coalesce(sum(price_paid),0) from bakery_purchases where student_id=u) +(select coalesce(sum(price_paid),0) from train_engine_purchases where student_id=u) into spent;
 return jsonb_build_object('theme',coalesce((select theme from reward_preferences where student_id=u),'garden'),
 'earned',earned,'spent',spent,'balance',greatest(0,earned-spent),
 'activeEngine',coalesce((select engine_id from train_engine_selections where student_id=u),'engine'),
 'engineCatalog',(select jsonb_agg(to_jsonb(e) order by e.sort) from train_engines e),
 'engines',coalesce((select jsonb_agg(engine_id order by created_at,id) from train_engine_purchases where student_id=u),'[]'::jsonb),
 'bakeryCatalog',(select jsonb_agg(to_jsonb(b) order by b.sort) from bakery_treats b),
 'treats',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'treatId',p.treat_id) order by p.created_at,p.id) from bakery_purchases p where p.student_id=u),'[]'::jsonb),
 'dinosaurCatalog',(select jsonb_agg(to_jsonb(d) order by d.sort) from dinosaurs d),
 'dinosaurs',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'dinosaurId',p.dinosaur_id) order by p.created_at,p.id) from dinosaur_purchases p where p.student_id=u),'[]'::jsonb),
 'catalog',(select jsonb_agg(to_jsonb(c) order by c.sort) from train_cars c),
 'cars',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'carId',p.car_id,'position',p.position) order by p.position,p.created_at,p.id) from train_purchases p where p.student_id=u),'[]'::jsonb));
end $$;

create function public.choose_train_engine(p_engine text) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_engine is null or (p_engine<>'engine' and not exists(select 1 from train_engine_purchases where student_id=u and engine_id=p_engine)) then raise exception 'Unlock this engine first'; end if;
 insert into train_engine_selections values(u,p_engine) on conflict(student_id) do update set engine_id=excluded.engine_id;
 return get_my_train();
end $$;
create function public.buy_train_engine(p_engine text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
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
 if exists(select 1 from train_engine_purchases where student_id=u and engine_id=p_engine) then return get_my_train(); end if;
 state:=get_my_train();
 if (state->>'balance')::bigint<item.price then raise exception 'Keep practicing to earn more tokens'; end if;
 insert into train_engine_purchases(id,student_id,engine_id,price_paid) values(p_request,u,item.id,item.price);
 return choose_train_engine(p_engine);
end $$;
revoke all on function public.choose_train_engine(text),public.buy_train_engine(text,uuid) from public,anon;
grant execute on function public.choose_train_engine(text),public.buy_train_engine(text,uuid) to authenticated;
