-- Alternate rewards, funded only by saved learning. Purchases never change XP or garden history.
create table public.train_cars (
 id text primary key, name text not null, price integer not null check(price>0), sort integer not null
);
insert into public.train_cars values
 ('passenger','Sunny passenger car',5,1),('cargo','Cargo car',8,2),('aquarium','Aquarium car',10,3),
 ('garden','Garden car',10,4),('observatory','Stargazer car',12,5),('caboose','Cherry caboose',15,6);
create table public.reward_preferences (
 student_id uuid primary key references public.profiles(id) on delete cascade,
 theme text not null default 'garden' check(theme in ('garden','train'))
);
create table public.train_purchases (
 id uuid primary key, student_id uuid not null references public.profiles(id) on delete cascade,
 car_id text not null references public.train_cars(id), price_paid integer not null check(price_paid>0),
 position integer not null, created_at timestamptz not null default now()
);
create index train_purchases_student on public.train_purchases(student_id,position);
alter table public.train_cars enable row level security;
alter table public.reward_preferences enable row level security;
alter table public.train_purchases enable row level security;
create policy train_catalog_read on public.train_cars for select to authenticated using(true);
create policy own_reward_preferences on public.reward_preferences for select to authenticated using(student_id=auth.uid());
create policy own_train_purchases on public.train_purchases for select to authenticated using(student_id=auth.uid());
-- No browser write policies: all changes validate the signed-in student and serialize on that profile.
create function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) into earned;
 select coalesce(sum(price_paid),0) into spent from train_purchases where student_id=u;
 return jsonb_build_object('theme',coalesce((select theme from reward_preferences where student_id=u),'garden'),
 'earned',earned,'spent',spent,'balance',greatest(0,earned-spent),
 'catalog',(select jsonb_agg(to_jsonb(c) order by c.sort) from train_cars c),
 'cars',coalesce((select jsonb_agg(jsonb_build_object('id',p.id,'carId',p.car_id,'position',p.position) order by p.position,p.created_at,p.id) from train_purchases p where p.student_id=u),'[]'::jsonb));
end $$;
create function public.set_reward_theme(p_theme text) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid();
begin
 if p_theme not in ('garden','train') or p_theme is null then raise exception 'Choose garden or train'; end if;
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 insert into reward_preferences values(u,p_theme) on conflict(student_id) do update set theme=excluded.theme;
 return get_my_train();
end $$;
create function public.buy_train_car(p_car text,p_request uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); car train_cars%rowtype; previous train_purchases%rowtype; state jsonb;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_request is null then raise exception 'Purchase request required'; end if;
 select * into previous from train_purchases where id=p_request;
 if found then
  if previous.student_id<>u or previous.car_id<>p_car then raise exception 'Purchase request already used'; end if;
  return get_my_train();
 end if;
 select * into car from train_cars where id=p_car;
 if not found then raise exception 'Choose a train car'; end if;
 state:=get_my_train();
 if (state->>'balance')::bigint<car.price then raise exception 'Keep practicing to earn more tokens'; end if;
 insert into train_purchases(id,student_id,car_id,price_paid,position)
 values(p_request,u,car.id,car.price,(select coalesce(max(position),0)+1 from train_purchases where student_id=u));
 return get_my_train();
end $$;
create function public.move_train_car(p_purchase uuid,p_direction integer) returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); current_pos integer; neighbor uuid; neighbor_pos integer;
begin
 perform 1 from profiles where id=u and role='student' for update;
 if not found then raise exception 'Student sign-in required'; end if;
 if p_direction not in (-1,1) or p_direction is null then raise exception 'Choose a direction'; end if;
 select position into current_pos from train_purchases where id=p_purchase and student_id=u;
 if not found then raise exception 'That car is not in your train'; end if;
 select id,position into neighbor,neighbor_pos from train_purchases where student_id=u
 and case when p_direction=-1 then position<current_pos else position>current_pos end
 order by case when p_direction=-1 then -position else position end limit 1;
 if neighbor is not null then
  update train_purchases set position=case when id=p_purchase then neighbor_pos else current_pos end where student_id=u and id in(p_purchase,neighbor);
 end if;
 return get_my_train();
end $$;
revoke all on function public.get_my_train(),public.set_reward_theme(text),public.buy_train_car(text,uuid),public.move_train_car(uuid,integer) from public,anon;
grant execute on function public.get_my_train(),public.set_reward_theme(text),public.buy_train_car(text,uuid),public.move_train_car(uuid,integer) to authenticated;
