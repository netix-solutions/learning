-- Isolated local integration test. No test users, tokens, or cars survive rollback.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
('00000000-0000-4000-8000-000000002501','train-test@example.invalid','{"role":"student","grade":"K","display_name":"Train Test"}'),
('00000000-0000-4000-8000-000000002502','train-other@example.invalid','{"role":"student","grade":"5","display_name":"Other Train"}');
-- Saved attempts are the source of earned tokens, including incorrect ones.
insert into attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned)
select '00000000-0000-4000-8000-000000002501',q.id,q.subject_id,0,false,0 from questions q where grade='K' limit 18;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002501',true);
do $$declare s jsonb; a uuid:='00000000-0000-4000-8000-000000002511'; b uuid:='00000000-0000-4000-8000-000000002512';begin
 s:=get_my_train();if (s->>'balance')::int<>18 then raise exception 'Wrong starting balance';end if;
 perform set_reward_theme('train');
 s:=buy_train_car('passenger',a);if (s->>'balance')::int<>13 then raise exception 'Purchase balance wrong';end if;
 s:=buy_train_car('passenger',a);if (s->>'balance')::int<>13 or jsonb_array_length(s->'cars')<>1 then raise exception 'Retry charged twice';end if;
 s:=buy_train_car('cargo',b);if (s->>'balance')::int<>5 then raise exception 'Second balance wrong';end if;
 perform set_reward_theme('dinosaurs');
 s:=buy_dinosaur('triceratops','00000000-0000-4000-8000-000000002514');
 if (s->>'balance')::int<>0 or jsonb_array_length(s->'dinosaurs')<>1 then raise exception 'Shared balance wrong';end if;
 s:=buy_dinosaur('triceratops','00000000-0000-4000-8000-000000002514');
 if (s->>'balance')::int<>0 or jsonb_array_length(s->'dinosaurs')<>1 then raise exception 'Dinosaur retry charged twice';end if;
 begin perform buy_dinosaur('stegosaurus','00000000-0000-4000-8000-000000002515');raise exception 'TEST FAIL: dinosaur overspend allowed';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;

 begin perform buy_train_car('passenger','00000000-0000-4000-8000-000000002513');raise exception 'TEST FAIL: overspend allowed';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
 s:=move_train_car(b,-1);if s->'cars'->0->>'id'<>b::text then raise exception 'Car did not move';end if;
 perform set_reward_theme('garden');s:=set_reward_theme('train');if jsonb_array_length(s->'cars')<>2 or (s->>'balance')::int<>0 then raise exception 'Switching lost progress';end if;
 begin perform buy_train_car('caboose',a);raise exception 'TEST FAIL: request reused for other item';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002502',true);
do $$declare s jsonb;begin
 s:=get_my_train();if (s->>'balance')::int<>0 or jsonb_array_length(s->'cars')<>0 then raise exception 'Other student data leaked';end if;
 if exists(select 1 from dinosaur_purchases) then raise exception 'RLS leaks dinosaurs';end if;
 if exists(select 1 from train_purchases) then raise exception 'RLS leaks purchases';end if;
 begin perform move_train_car('00000000-0000-4000-8000-000000002511',1);raise exception 'TEST FAIL: other train editable';exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise;end if;end;
end $$;
rollback;
