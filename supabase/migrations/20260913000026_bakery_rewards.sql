-- Bakery purchases share the existing earned-token wallet and student row lock.
create table public.bakery_treats(id text primary key,name text not null,price integer not null check(price>0),sort integer not null);
insert into public.bakery_treats values ('donut','Sprinkle donut',5,1),('cupcake','Swirl cupcake',8,2),('cakepop','Chocolate cake pop',10,3),('cookie','Chocolate chip cookie',5,4),('croissant','Golden croissant',8,5),('macarons','Macaron stack',12,6);
create table public.bakery_purchases(id uuid primary key,student_id uuid not null references public.profiles(id) on delete cascade,treat_id text not null references public.bakery_treats(id),price_paid integer not null check(price_paid>0),created_at timestamptz not null default now());
create index bakery_purchases_student on public.bakery_purchases(student_id);
alter table public.bakery_treats enable row level security;
alter table public.bakery_purchases enable row level security;
create policy bakery_catalog_read on public.bakery_treats for select to authenticated using(true);
create policy own_bakery_purchases on public.bakery_purchases for select to authenticated using(student_id=auth.uid());
alter table public.reward_preferences drop constraint reward_preferences_theme_check;
alter table public.reward_preferences add constraint reward_preferences_theme_check check(theme in ('garden','train','dinosaurs','bakery'));
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) into earned;
 select (select coalesce(sum(price_paid),0) from train_purchases where student_id=u)+(select coalesce(sum(price_paid),0) from dinosaur_purchases where student_id=u) +(select coalesce(sum(price_paid),0) from bakery_purchases where student_id=u) into spent;
 return jsonb_build_object('theme',coalesce((select theme from reward_preferences where student_id=u),'garden'),
 'earned',earned,'spent',spent,'balance',greatest(0,earned-spent),
 'bakeryCatalog',(select jsonb_agg(to_jsonb(b) order by b.sort) from bakery_treats b),
 'treats',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'treatId',p.treat_id) order by p.created_at,p.id) from bakery_purchases p where p.student_id=u),'[]'::jsonb),
 'dinosaurCatalog',(select jsonb_agg(to_jsonb(d) order by d.sort) from dinosaurs d),
 'dinosaurs',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'dinosaurId',p.dinosaur_id) order by p.created_at,p.id) from dinosaur_purchases p where p.student_id=u),'[]'::jsonb),
 'catalog',(select jsonb_agg(to_jsonb(c) order by c.sort) from train_cars c),
 'cars',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'carId',p.car_id,'position',p.position) order by p.position,p.created_at,p.id) from train_purchases p where p.student_id=u),'[]'::jsonb));
end $$;
create or replace function public.set_reward_theme(p_theme text) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();
begin
 if p_theme not in ('garden','train','dinosaurs','bakery') or p_theme is null then raise exception 'Choose a reward theme'; end if;
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 insert into reward_preferences values(u,p_theme) on conflict(student_id) do update set theme=excluded.theme;
 return get_my_train();
end $$;
create function public.buy_bakery_treat(p_treat text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
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
 insert into bakery_purchases(id,student_id,treat_id,price_paid)
 values(p_request,u,car.id,car.price);
 return get_my_train();
end $$;

revoke all on function public.buy_bakery_treat(text,uuid) from public,anon;
grant execute on function public.buy_bakery_treat(text,uuid) to authenticated;
