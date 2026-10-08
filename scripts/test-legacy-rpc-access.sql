-- The runner supplies BEGIN (and optionally the migration); everything rolls back.
-- Local Supabase image 17.6.1.106 has a documented permission-error SIGSEGV:
-- https://github.com/supabase/postgres/issues/2112 . On that image only, SET LOCAL
-- sunsharp_test.catalog_only='true' skips denied calls while still checking exact
-- privileges and executing every allowed path. Production runs MUST omit it.
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000004901','rpc-child@example.invalid','{"role":"student","grade":"3","display_name":"RPC child fixture"}'),
 ('00000000-0000-4000-8000-000000004902','rpc-parent@example.invalid','{"role":"parent","display_name":"RPC parent fixture"}');
insert into public.parent_child(parent_id,child_id) values ('00000000-0000-4000-8000-000000004902','00000000-0000-4000-8000-000000004901');
insert into public.child_goals(child_id,days_per_week,minutes_per_day) values ('00000000-0000-4000-8000-000000004901',3,15);
insert into public.coupons(code,kind,max_kids,max_redemptions) values ('isolated-rpc-access-test','free',1,1);
-- Verify the privilege matrix independently of the migration allowlist.
do $$ declare f regprocedure; begin
 if current_setting('sunsharp_test.catalog_only',true)='true' then raise notice 'LOCAL IMAGE WORKAROUND: denied calls skipped; privilege assertions remain active';end if;
 for f in select p.oid::regprocedure from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef loop
  if has_function_privilege('anon',f,'execute') then raise exception 'Anon definer executable: %',f;end if;
 end loop;
 foreach f in array array['public.goal_progress(uuid)'::regprocedure,'public.redeem_coupon(text,uuid)'::regprocedure] loop
  if has_function_privilege('authenticated',f,'execute') or not has_function_privilege('service_role',f,'execute') then raise exception 'Wrong server helper privileges: %',f;end if;
 end loop;
 if to_regprocedure('public.support_ss_account(text,text)') is not null then
  if has_function_privilege('authenticated','public.support_ss_account(text,text)','execute') or not has_function_privilege('service_role','public.support_ss_account(text,text)','execute') then raise exception 'Wrong support privileges';end if;
 end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004901',true);
do $$ declare q record;result jsonb;begin
 -- Student wrapper retains access to its own goal; direct arbitrary-ID helper doesn't.
 perform public.record_activity(30);
 result:=public.get_my_goal_progress();
 if result->>'minutes_per_day'<>'15' or result->>'today_met'<>'false' then raise exception 'Student goal wrapper failed';end if;
 if (select count(*) from public.get_grade_subjects('3'))=0 then raise exception 'Subjects unavailable';end if;
 select * into q from public.get_practice_questions('math','3',1);
 if q.id is null then raise exception 'Questions unavailable';end if;
 perform public.record_attempt(q.id,0);
 perform public.record_attempt(q.id,'0'::jsonb);
 if (select count(*) from public.get_adaptive_questions('math','3',2))<>2 then raise exception 'Adaptive unavailable';end if;
 if (select count(*) from public.get_skill_questions('reading','3','3.detail',1))<>1 then raise exception 'Skill question unavailable';end if;
 if public.get_my_shop() ? 'error' or public.get_sticker_book() ? 'error' then raise exception 'Own shop unavailable';end if;
 if public.weekly_quest_status() ? 'error' then raise exception 'Own quest unavailable';end if;
 -- No owned item and insufficient balance are normal authenticated outcomes.
 if public.equip_shop_item('00000000-0000-4000-8000-000000000000')->>'error'<>'not owned' then raise exception 'Equip path failed';end if;
 if public.buy_streak_shield()->>'error'<>'not enough points' then raise exception 'Purchase path failed';end if;
 if current_setting('sunsharp_test.catalog_only',true) is distinct from 'true' then
 begin perform public.goal_progress('00000000-0000-4000-8000-000000004901');raise exception 'Direct child goal exposed';exception when insufficient_privilege then null;end;
 begin perform public.redeem_coupon('isolated-rpc-access-test','00000000-0000-4000-8000-000000004902');raise exception 'Direct coupon redemption exposed';exception when insufficient_privilege then null;end;
 if to_regprocedure('public.support_ss_account(text,text)') is not null then
  begin execute 'select * from public.support_ss_account(''rpc-parent@example.invalid'','''')';raise exception 'Direct support lookup exposed';exception when insufficient_privilege then null;end;
 end if;
 end if;
 perform set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000004902',true);
 if jsonb_array_length(public.get_my_children())<>1 then raise exception 'Parent children unavailable';end if;
end $$;
set local role service_role;
select set_config('request.jwt.claim.sub','',true);
do $$ declare r jsonb;found_fixture boolean;begin
 r:=public.goal_progress('00000000-0000-4000-8000-000000004901');
 if r->>'days_per_week'<>'3' then raise exception 'Goal cron path failed';end if;
 r:=public.redeem_coupon('isolated-rpc-access-test','00000000-0000-4000-8000-000000004902');
 if r->>'ok'<>'true' or r->>'max_kids'<>'1' then raise exception 'Authorized server redemption failed: %',r;end if;
 if to_regprocedure('public.support_ss_account(text,text)') is not null then
  execute 'select exists(select 1 from public.support_ss_account(''rpc-parent@example.invalid'','''') where name=''RPC parent fixture'')' into found_fixture;
  if not found_fixture then raise exception 'Server support lookup failed';end if;
 end if;
end $$;
set local role anon;
do $$ begin
 if current_setting('sunsharp_test.catalog_only',true) is distinct from 'true' then
 begin perform public.goal_progress('00000000-0000-4000-8000-000000004901');raise exception 'Anon goal exposed';exception when insufficient_privilege then null;end;
 begin perform public.redeem_coupon('isolated-rpc-access-test','00000000-0000-4000-8000-000000004902');raise exception 'Anon coupon exposed';exception when insufficient_privilege then null;end;
 begin perform public.get_my_children();raise exception 'Anon children exposed';exception when insufficient_privilege then null;end;
 begin perform public.get_practice_questions('math','3',1);raise exception 'Anon practice exposed';exception when insufficient_privilege then null;end;
 if to_regprocedure('public.support_ss_account(text,text)') is not null then
  begin execute 'select * from public.support_ss_account(''rpc-parent@example.invalid'','''')';raise exception 'Anon support exposed';exception when insufficient_privilege then null;end;
 end if;
 end if;
end $$;
reset role;
rollback;
