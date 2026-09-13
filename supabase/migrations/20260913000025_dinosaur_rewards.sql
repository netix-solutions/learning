-- All purchases share one earned-token balance and serialize on the student profile.
create table public.dinosaurs(id text primary key,name text not null,price integer not null check(price>0),sort integer not null);
insert into public.dinosaurs values ('triceratops','Triceratops',5,1),('stegosaurus','Stegosaurus',8,2),('brachiosaurus','Brachiosaurus',10,3),('parasaurolophus','Parasaurolophus',10,4),('ankylosaurus','Ankylosaurus',12,5),('tyrannosaurus','Tyrannosaurus',15,6);
create table public.dinosaur_purchases(id uuid primary key,student_id uuid not null references public.profiles(id) on delete cascade,dinosaur_id text not null references public.dinosaurs(id),price_paid integer not null check(price_paid>0),created_at timestamptz not null default now());
create index dinosaur_purchases_student on public.dinosaur_purchases(student_id);
alter table public.dinosaurs enable row level security;
alter table public.dinosaur_purchases enable row level security;
create policy dinosaur_catalog_read on public.dinosaurs for select to authenticated using(true);
create policy own_dinosaur_purchases on public.dinosaur_purchases for select to authenticated using(student_id=auth.uid());
alter table public.reward_preferences drop constraint reward_preferences_theme_check;
alter table public.reward_preferences add constraint reward_preferences_theme_check check(theme in ('garden','train','dinosaurs'));
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) into earned;
 select (select coalesce(sum(price_paid),0) from train_purchases where student_id=u)+(select coalesce(sum(price_paid),0) from dinosaur_purchases where student_id=u) into spent;
 return jsonb_build_object('theme',coalesce((select theme from reward_preferences where student_id=u),'garden'),
 'earned',earned,'spent',spent,'balance',greatest(0,earned-spent),
 'dinosaurCatalog',(select jsonb_agg(to_jsonb(d) order by d.sort) from dinosaurs d),
 'dinosaurs',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'dinosaurId',p.dinosaur_id) order by p.created_at,p.id) from dinosaur_purchases p where p.student_id=u),'[]'::jsonb),
 'catalog',(select jsonb_agg(to_jsonb(c) order by c.sort) from train_cars c),
 'cars',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'carId',p.car_id,'position',p.position) order by p.position,p.created_at,p.id) from train_purchases p where p.student_id=u),'[]'::jsonb));
end $$;
create or replace function public.set_reward_theme(p_theme text) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();
begin
 if p_theme not in ('garden','train','dinosaurs') or p_theme is null then raise exception 'Choose a reward theme'; end if;
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 insert into reward_preferences values(u,p_theme) on conflict(student_id) do update set theme=excluded.theme;
 return get_my_train();
end $$;
create function public.buy_dinosaur(p_car text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
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
 insert into dinosaur_purchases(id,student_id,dinosaur_id,price_paid)
 values(p_request,u,car.id,car.price);
 return get_my_train();
end $$;

revoke all on function public.buy_dinosaur(text,uuid) from public,anon;
grant execute on function public.buy_dinosaur(text,uuid) to authenticated;
