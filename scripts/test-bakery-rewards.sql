-- Saved-learning wallet, cross-shop spending, retry safety, isolation. Everything rolls back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('00000000-0000-4000-8000-000000002601','bakery-test@example.invalid','{"role":"student","grade":"K","display_name":"Bakery Test"}'),
('00000000-0000-4000-8000-000000002602','bakery-other@example.invalid','{"role":"student","grade":"5","display_name":"Other Bakery"}');
insert into attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned)
select '00000000-0000-4000-8000-000000002601',q.id,q.subject_id,0,false,0 from questions q where grade='K' limit 23;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002601',true);
do $$declare s jsonb;begin
 s:=get_my_train();if (s->>'balance')::int<>23 or jsonb_array_length(s->'bakeryCatalog')<>6 then raise exception 'Starting wallet or catalogue wrong';end if;
 perform buy_train_car('passenger','00000000-0000-4000-8000-000000002611');
 perform buy_dinosaur('triceratops','00000000-0000-4000-8000-000000002612');
 perform set_reward_theme('bakery');
 s:=buy_bakery_treat('cupcake','00000000-0000-4000-8000-000000002613');
 if (s->>'balance')::int<>5 or jsonb_array_length(s->'treats')<>1 then raise exception 'Cross-shop wallet wrong';end if;
 s:=buy_bakery_treat('cupcake','00000000-0000-4000-8000-000000002613');
 if (s->>'balance')::int<>5 or jsonb_array_length(s->'treats')<>1 then raise exception 'Retry charged twice';end if;
 s:=buy_bakery_treat('donut','00000000-0000-4000-8000-000000002614');
 if (s->>'balance')::int<>0 or jsonb_array_length(s->'treats')<>2 then raise exception 'Second purchase wrong';end if;
 begin perform buy_bakery_treat('donut','00000000-0000-4000-8000-000000002615');raise exception 'TEST FAIL: bakery overspend';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
 begin perform buy_train_car('passenger','00000000-0000-4000-8000-000000002615');raise exception 'TEST FAIL: train overspend';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
 begin perform buy_dinosaur('triceratops','00000000-0000-4000-8000-000000002615');raise exception 'TEST FAIL: dinosaur overspend';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
 begin perform buy_bakery_treat('cookie','00000000-0000-4000-8000-000000002613');raise exception 'TEST FAIL: request reused';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
 perform set_reward_theme('garden');perform set_reward_theme('train');perform set_reward_theme('dinosaurs');s:=set_reward_theme('bakery');
 if jsonb_array_length(s->'treats')<>2 or jsonb_array_length(s->'cars')<>1 or jsonb_array_length(s->'dinosaurs')<>1 or (s->>'balance')::int<>0 then raise exception 'Switching lost progress';end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002602',true);
do $$declare s jsonb;begin
 s:=get_my_train();if (s->>'balance')::int<>0 or jsonb_array_length(s->'treats')<>0 then raise exception 'Other student data leaked';end if;
 if exists(select 1 from bakery_purchases) then raise exception 'RLS leaks bakery purchases';end if;
 begin perform buy_bakery_treat('cupcake','00000000-0000-4000-8000-000000002613');raise exception 'TEST FAIL: other purchase replayed';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
end $$;
rollback;
