-- Run inside a transaction; all users, changes and telemetry roll back.
do $$
declare learner uuid:=gen_random_uuid(); sibling uuid:=gen_random_uuid(); parent uuid:=gen_random_uuid(); stranger uuid:=gen_random_uuid(); session_a uuid:=gen_random_uuid(); session_b uuid:=gen_random_uuid(); result jsonb; before_ms bigint; count_rows bigint; denied boolean;
begin
 insert into auth.users(id,email,raw_user_meta_data) values
 (learner,'reading-test-'||learner||'@example.invalid','{"display_name":"Reading QA"}'),
 (sibling,'reading-test-'||sibling||'@example.invalid','{"display_name":"Reading QA"}'),
 (parent,'reading-test-'||parent||'@example.invalid','{"display_name":"Reading QA"}'),
 (stranger,'reading-test-'||stranger||'@example.invalid','{"display_name":"Reading QA"}');
 update public.profiles set role='student',grade='2' where id in(learner,sibling,stranger);
 insert into public.parent_child(parent_id,child_id) values(parent,learner);
 assert not has_function_privilege('authenticated','public.sync_reading_session(uuid,uuid,text,text,integer,integer,integer,bigint,bigint,boolean)','EXECUTE'),'authenticated can call privileged timer';
 assert not has_function_privilege('anon','public.sync_reading_session(uuid,uuid,text,text,integer,integer,integer,bigint,bigint,boolean)','EXECUTE'),'anon can call timer';
 assert not has_table_privilege('authenticated','public.reading_progress','INSERT'),'client can forge totals';
 assert not has_table_privilege('authenticated','public.reading_clock','SELECT'),'internal clock exposed';
 assert not has_table_privilege('anon','public.reading_progress','SELECT'),'anonymous telemetry exposed';
 result:=public.sync_reading_session(learner,session_a,'test-book','v1',4,0,0,0,0,false);
 assert (result->>'active_ms')::bigint=0,'opening adds time';
 update public.reading_sessions set synced_at=clock_timestamp()-interval '10 seconds' where id=session_a;
 update public.reading_clock set credited_at=clock_timestamp()-interval '10 seconds' where student_id=learner;
 result:=public.sync_reading_session(learner,session_a,'test-book','v1',4,1,1,10000,3000,false);
 assert (result->>'active_ms')::bigint between 9990 and 10000,'elapsed credit wrong';
 assert (result->>'listening_ms')::bigint=3000,'listening credit wrong';
 before_ms:=(result->>'active_ms')::bigint;
 result:=public.sync_reading_session(learner,session_a,'test-book','v1',4,0,1,10000,3000,false);
 assert (result->>'active_ms')::bigint=before_ms and (result->>'page')::int=1,'duplicate changed progress';
 result:=public.sync_reading_session(learner,session_a,'test-book','v1',4,0,0,0,0,false);
 assert (result->>'active_ms')::bigint=before_ms and (result->>'page')::int=1,'stale snapshot changed progress';
 perform public.sync_reading_session(learner,session_b,'test-book','v1',4,1,0,0,0,false);
 update public.reading_sessions set synced_at=clock_timestamp()-interval '10 seconds' where id=session_b;
 result:=public.sync_reading_session(learner,session_b,'test-book','v1',4,1,1,10000,0,false);
 assert (result->>'active_ms')::bigint-before_ms<200,'two tabs double-counted the same ten seconds';
 denied:=false;begin perform public.sync_reading_session(sibling,session_a,'test-book','v1',4,0,2,11000,3000,false);exception when others then denied:=true;end;assert denied,'session owner mismatch allowed';
 denied:=false;begin perform public.sync_reading_session(learner,gen_random_uuid(),'test-book','v1',4,0,1,1000,0,false);exception when others then denied:=true;end;assert denied,'session started with invented time';
 denied:=false;begin perform public.sync_reading_session(learner,session_a,'test-book','v1',4,4,2,11000,3000,false);exception when others then denied:=true;end;assert denied,'out-of-range page accepted';
 denied:=false;begin perform public.sync_reading_session(learner,session_a,'test-book','v1',4,1,2,100,0,false);exception when others then denied:=true;end;assert denied,'time went backwards';
 update public.reading_sessions set synced_at=clock_timestamp()-interval '1 hour' where id=session_a;
 update public.reading_clock set credited_at=clock_timestamp()-interval '1 hour' where student_id=learner;
 select active_ms into before_ms from public.reading_progress where student_id=learner;
 result:=public.sync_reading_session(learner,session_a,'test-book','v1',4,3,3,3610000,3000,true);
 assert (result->>'active_ms')::bigint-before_ms=120000,'inactivity cap failed';
 assert result->>'completed_at' is not null and (result->>'furthest_page')::int=3,'completion not saved';
 insert into public.reading_checks(student_id,book_id,revision,question_index,choice,is_correct,support_used) values(learner,'test-book','v1',0,1,false,true);
 insert into public.reading_checks(student_id,book_id,revision,question_index,choice,is_correct,support_used) values(learner,'test-book','v1',0,0,true,false) on conflict do nothing;
 assert exists(select 1 from public.reading_checks where student_id=learner and not is_correct and support_used),'first answer overwritten';
 perform set_config('request.jwt.claims',json_build_object('sub',learner,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 select count(*) into count_rows from public.reading_progress;assert count_rows=1,'student cannot see own progress or sees unrelated rows';
 execute 'reset role';
 perform set_config('request.jwt.claims',json_build_object('sub',parent,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 select count(*) into count_rows from public.reading_checks;assert count_rows=1,'linked parent cannot see child answers';
 execute 'reset role';
 perform set_config('request.jwt.claims',json_build_object('sub',stranger,'role','authenticated')::text,true);
 execute 'set local role authenticated';
 select count(*) into count_rows from public.reading_progress;assert count_rows=0,'unrelated student can read progress';
 select count(*) into count_rows from public.reading_sessions;assert count_rows=0,'unrelated student can read sessions';
 select count(*) into count_rows from public.reading_checks;assert count_rows=0,'unrelated student can read answers';
 execute 'reset role';
end $$;
select 'Reading timing, idempotency, ownership, limits, first-answer retention and RLS checks passed' as result;
