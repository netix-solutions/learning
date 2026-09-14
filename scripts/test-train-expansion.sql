begin;
insert into auth.users(id,email,raw_user_meta_data) values
('00000000-0000-4000-8000-000000002701','engine-test@example.invalid','{"role":"student","grade":"K","display_name":"Engine Test"}'),
('00000000-0000-4000-8000-000000002702','engine-other@example.invalid','{"role":"student","grade":"5","display_name":"Other"}');
insert into attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned)
select '00000000-0000-4000-8000-000000002701',q.id,q.subject_id,0,false,0 from (select * from questions where grade='K' limit 1) q cross join generate_series(1,100);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002701',true);
do $$declare s jsonb;begin
 s:=get_my_train();if (s->>'balance')::int<>100 or s->>'activeEngine'<>'engine' then raise exception 'Bad initial engine state';end if;
 s:=buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000002711');
 if (s->>'balance')::int<>85 or s->>'activeEngine'<>'passenger-engine' then raise exception 'Engine purchase failed';end if;
 s:=buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000002711');
 s:=buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000002712');
 if (s->>'balance')::int<>85 or jsonb_array_length(s->'engines')<>1 then raise exception 'Duplicate engine charged twice';end if;
 s:=buy_train_engine('bullet-engine','00000000-0000-4000-8000-000000002713');
 s:=buy_train_engine('diesel-engine','00000000-0000-4000-8000-000000002714');
 s:=buy_train_car('dining','00000000-0000-4000-8000-000000002715');
 s:=buy_train_car('sleeper','00000000-0000-4000-8000-000000002716');
 s:=buy_train_car('bullet-coach','00000000-0000-4000-8000-000000002717');
 if (s->>'balance')::int<>6 then raise exception 'Shared engine and car spend incorrect';end if;
 s:=buy_bakery_treat('donut','00000000-0000-4000-8000-000000002718');
 if (s->>'balance')::int<>1 then raise exception 'Bakery wallet ignored engines';end if;
 s:=choose_train_engine('engine');s:=choose_train_engine('passenger-engine');
 s:=move_train_car('00000000-0000-4000-8000-000000002717',-1);
 if s->'cars'->1->>'carId'<>'bullet-coach' or jsonb_array_length(s->'engines')<>3 or (s->>'balance')::int<>1 then raise exception 'Switch/reorder lost state';end if;
 s:=set_reward_theme('bakery');s:=set_reward_theme('train');if s->>'activeEngine'<>'passenger-engine' then raise exception 'Engine selection not persistent';end if;
 begin perform buy_train_car('tanker','00000000-0000-4000-8000-000000002719');raise exception 'TEST FAIL overspend';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform buy_train_engine('bullet-engine','00000000-0000-4000-8000-000000002711');raise exception 'TEST FAIL request reuse';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000002702',true);
do $$begin
 if exists(select 1 from train_engine_purchases) or exists(select 1 from train_engine_selections) then raise exception 'RLS leaked engine data';end if;
 begin perform choose_train_engine('bullet-engine');raise exception 'TEST FAIL unowned engine';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform buy_train_engine('bullet-engine','00000000-0000-4000-8000-000000002720');raise exception 'TEST FAIL engine overspend';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000002711');raise exception 'TEST FAIL stolen request';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
end $$;
rollback;
