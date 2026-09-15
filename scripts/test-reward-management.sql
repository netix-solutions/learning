begin;
insert into auth.users(id,email,raw_user_meta_data) values
('00000000-0000-4000-8000-000000003101','manage-test@example.invalid','{"role":"student","grade":"K","display_name":"Manage Test"}'),
('00000000-0000-4000-8000-000000003102','manage-other@example.invalid','{"role":"student","grade":"K","display_name":"Other"}');
insert into attempts(student_id,question_id,subject_id,selected_index,is_correct,xp_earned) select '00000000-0000-4000-8000-000000003101',q.id,q.subject_id,0,false,0 from (select * from questions where grade='K' limit 1) q cross join generate_series(1,100);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000003101',true);
select buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000003111')->>'balance';
select buy_train_car('coal','00000000-0000-4000-8000-000000003112')->>'balance';
select buy_dinosaur('triceratops','00000000-0000-4000-8000-000000003113')->>'balance';
select buy_bakery_treat('donut','00000000-0000-4000-8000-000000003114')->>'balance';
reset role;
update train_cars set price=99 where id='coal';
set local role authenticated;
do $$declare s jsonb;begin
 s:=sell_reward('train','00000000-0000-4000-8000-000000003112');
 if (s->>'balance')::int<>75 or jsonb_array_length(s->'cars')<>0 then raise exception 'Original-price refund failed';end if;
 s:=sell_reward('train','00000000-0000-4000-8000-000000003112');
 if (s->>'balance')::int<>75 then raise exception 'Double refund';end if;
 s:=buy_train_car('coal','00000000-0000-4000-8000-000000003112');
 if (s->>'balance')::int<>75 or jsonb_array_length(s->'cars')<>0 then raise exception 'Old purchase retry recreated item';end if;
 s:=sell_reward('engines','00000000-0000-4000-8000-000000003111');
 if s->>'activeEngine'<>'engine' or (s->>'balance')::int<>90 then raise exception 'Engine refund/fallback failed';end if;
 s:=buy_train_engine('passenger-engine','00000000-0000-4000-8000-000000003115');
 s:=sell_reward('engines','00000000-0000-4000-8000-000000003111');
 if s->>'activeEngine'<>'passenger-engine' or (s->>'balance')::int<>75 then raise exception 'Old refund affected repurchase';end if;
 s:=buy_dinosaur('stegosaurus','00000000-0000-4000-8000-000000003116');
 s:=move_reward('dinosaurs','00000000-0000-4000-8000-000000003116',-1);
 if s->'dinosaurs'->0->>'dinosaurId'<>'stegosaurus' then raise exception 'Dinosaur reorder failed';end if;
 s:=buy_bakery_treat('cupcake','00000000-0000-4000-8000-000000003117');
 s:=move_reward('bakery','00000000-0000-4000-8000-000000003117',-1);
 if s->'treats'->0->>'treatId'<>'cupcake' then raise exception 'Bakery reorder failed';end if;
 s:=sell_reward('dinosaurs','00000000-0000-4000-8000-000000003113');
 s:=sell_reward('bakery','00000000-0000-4000-8000-000000003114');
 if (s->>'balance')::int<>69 or jsonb_array_length(s->'dinosaurs')<>1 or jsonb_array_length(s->'treats')<>1 then raise exception 'Collection refunds failed';end if;
 begin perform move_reward('bakery','00000000-0000-4000-8000-000000003114',1);raise exception 'TEST FAIL move sold item';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000003102',true);
do $$begin
 begin perform sell_reward('engines','00000000-0000-4000-8000-000000003115');raise exception 'TEST FAIL refund another owner';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform move_reward('dinosaurs','00000000-0000-4000-8000-000000003116',1);raise exception 'TEST FAIL move another owner';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
 begin perform sell_reward('profiles','00000000-0000-4000-8000-000000003115');raise exception 'TEST FAIL invalid kind';exception when raise_exception then if SQLERRM like 'TEST FAIL%' then raise;end if;end;
end $$;
rollback;
