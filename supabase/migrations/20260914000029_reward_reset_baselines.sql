-- Preserve learning history while permitting an administrative reward restart.
create table public.reward_reset_baselines (
 student_id uuid primary key references public.profiles(id) on delete cascade,
 attempts bigint not null check(attempts>=0), lessons bigint not null check(lessons>=0),
 reset_at timestamptz not null default now()
);
alter table public.reward_reset_baselines enable row level security;
create policy own_reward_baseline on public.reward_reset_baselines for select to authenticated using(student_id=auth.uid());
-- Only privileged administrators may change a baseline; no browser write policies.
create or replace function public.get_my_train() returns jsonb language plpgsql security definer set search_path=public as $$
declare u uuid:=auth.uid(); earned bigint; spent bigint;
begin
 if not exists(select 1 from profiles where id=u and role='student') then raise exception 'Student sign-in required'; end if;
 select (select count(*) from attempts where student_id=u)+5*(select count(*) from learning_runs where student_id=u and completed_at is not null) -(select coalesce((select attempts+5*lessons from reward_reset_baselines where student_id=u),0)) into earned;
 earned:=greatest(0,earned);
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

