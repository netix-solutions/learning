-- Local integration test. Everything, including test identities, is rolled back.
begin;
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000001901','lesson-test-1@example.invalid','{"role":"student","display_name":"Test Learner","grade":"2"}'),
 ('00000000-0000-4000-8000-000000001902','lesson-test-2@example.invalid','{"role":"student","display_name":"Other Learner","grade":"2"}'),
 ('00000000-0000-4000-8000-000000001903','lesson-test-parent@example.invalid','{"role":"parent","display_name":"Test Parent"}');
insert into public.parent_child(parent_id,child_id) values ('00000000-0000-4000-8000-000000001903','00000000-0000-4000-8000-000000001901');
do $$
declare s uuid := '00000000-0000-4000-8000-000000001901'; r jsonb; id uuid; result jsonb;
begin
 r := public.begin_learning_run(s,'2-place',repeat('a',64),'2','math',true); id := (r->>'id')::uuid;
 perform public.advance_learning_run(s,id,repeat('a',64),'checkpoint','teach',1);
 r := public.begin_learning_run(s,'2-place',repeat('a',64),'2','math',true);
 if (r->>'id')::uuid <> id or (r->>'step')::int <> 1 then raise exception 'Resume did not preserve the run and step'; end if;
 begin
  perform public.advance_learning_run(s,id,repeat('a',64),'checkpoint','guided');
  raise exception 'TEST FAIL: activity gate bypassed';
 exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise; end if; end;
 begin
  perform public.advance_learning_run(s,id,repeat('a',64),'complete','reflect');
  raise exception 'TEST FAIL: completion gate bypassed';
 exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise; end if; end;
 perform public.advance_learning_run(s,id,repeat('a',64),'checkpoint','guided',2,true);
 perform public.advance_learning_run(s,id,repeat('a',64),'answer','guided',2,true,false,0,false,'Try regrouping.');
 result := public.advance_learning_run(s,id,repeat('a',64),'answer','guided',2,true,false,1,true,'Changed answer.');
 if (result->'checks'->0->>'is_correct')::boolean then raise exception 'First answer was overwritten'; end if;
 perform public.advance_learning_run(s,id,repeat('a',64),'checkpoint','transfer',2,true,true);
 perform public.advance_learning_run(s,id,repeat('a',64),'answer','transfer',2,true,false,2,true,'54 is correct.');
 if not (select support_used from public.learning_checks where run_id=id and stage='transfer') then raise exception 'Help flag was lost'; end if;
 perform public.advance_learning_run(s,id,repeat('a',64),'checkpoint','reflect',2,true);
 result := public.advance_learning_run(s,id,repeat('a',64),'complete','reflect');
 if result->>'completed_at' is null then raise exception 'Completion not saved'; end if;
 if public.advance_learning_run(s,id,repeat('a',64),'complete','reflect')->>'completed_at' <> result->>'completed_at' then raise exception 'Repeated completion changed evidence'; end if;
 begin
  perform public.advance_learning_run('00000000-0000-4000-8000-000000001902',id,repeat('a',64),'complete','reflect');
  raise exception 'TEST FAIL: ownership bypassed';
 exception when raise_exception then if SQLERRM like 'TEST FAIL:%' then raise; end if; end;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000001902',true);
do $$ begin
 if exists(select 1 from public.learning_runs) then raise exception 'Other student can see runs'; end if;
 if exists(select 1 from public.learning_checks) then raise exception 'Other student can see answers'; end if;
 if has_function_privilege('authenticated','public.begin_learning_run(uuid,text,text,text,text,boolean)','EXECUTE') then raise exception 'Browser can call privileged writer'; end if;
 if has_function_privilege('authenticated','public.advance_learning_run(uuid,uuid,text,text,text,integer,boolean,boolean,integer,boolean,text)','EXECUTE') then raise exception 'Browser can forge answers'; end if;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000001903',true);
do $$ begin
 if (select count(*) from public.learning_runs) <> 1 then raise exception 'Parent cannot read linked child'; end if;
 if (select count(*) from public.learning_checks) <> 2 then raise exception 'Parent cannot read linked checks'; end if;
end $$;
rollback;
