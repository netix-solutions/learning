-- These explicit allowlists reflect actual callers, not a blanket revoke across
-- the catalog. PUBLIC revocation alone does not remove direct anon grants.
-- Browser features keep authenticated access and existing internal callers.
do $$ declare signature text; begin
 foreach signature in array array[
  'buy_mystery_box()','buy_shop_item(uuid)','buy_sticker_pack(text)',
  'buy_streak_shield()','claim_weekly_quest()','equip_shop_item(uuid)',
  'get_adaptive_questions(text,text,integer)','get_grade_subjects(text)',
  'get_my_children()','get_my_goal_progress()','get_my_shop()',
  'get_practice_questions(text,text,integer)','get_skill_questions(text,text,text,integer)',
  'get_sticker_book()','open_daily_chest()','record_activity(integer)',
  'record_attempt(uuid,jsonb)','record_attempt(uuid,integer)',
  'shop_daily_deal()','weekly_quest_status()'
 ] loop
  execute 'revoke all on function public.'||signature||' from public,anon';
  execute 'grant execute on function public.'||signature||' to authenticated,service_role';
 end loop;
end $$;
-- The authorized billing server action and goal cron use service_role. The
-- student's get_my_goal_progress definer wrapper still calls the internal helper.
revoke all on function public.goal_progress(uuid) from public,anon,authenticated;
revoke all on function public.redeem_coupon(text,uuid) from public,anon,authenticated;
grant execute on function public.goal_progress(uuid) to service_role;
grant execute on function public.redeem_coupon(text,uuid) to service_role;
-- A production support integration exists outside the historical seed. Keep its
-- trusted server access, but never allow public email/phone account lookup.
do $$ begin
 if to_regprocedure('public.support_ss_account(text,text)') is not null then
  revoke all on function public.support_ss_account(text,text) from public,anon,authenticated;
  grant execute on function public.support_ss_account(text,text) to service_role;
 end if;
end $$;
-- Trigger invocation does not require browser EXECUTE privileges.
revoke all on function public.handle_new_user() from public,anon,authenticated;
