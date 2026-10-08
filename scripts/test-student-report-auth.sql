-- Run within BEGIN; all records are synthetic and rolled back.
insert into auth.users(id,email,raw_user_meta_data) values
 ('00000000-0000-4000-8000-000000004801','report-child@example.invalid','{"role":"student","grade":"3","display_name":"Report fixture"}'),
 ('00000000-0000-4000-8000-000000004802','report-parent@example.invalid','{"role":"parent","display_name":"Report parent"}'),
 ('00000000-0000-4000-8000-000000004803','report-other@example.invalid','{"role":"parent","display_name":"Unrelated parent"}');
insert into public.parent_child(parent_id,child_id) values ('00000000-0000-4000-8000-000000004802','00000000-0000-4000-8000-000000004801');
set local role authenticated;
do $$ declare uid text; forbidden boolean; begin
 foreach uid in array array['','00000000-0000-4000-8000-000000004803'] loop
  perform set_config('request.jwt.claim.sub',uid,true);
  if public.can_view_student('00000000-0000-4000-8000-000000004801') is distinct from false then raise exception 'Missing/unrelated identity not false';end if;
  if public.can_view_student(null) is distinct from false then raise exception 'Null target not false';end if;
  forbidden:=false;
  begin perform public.get_student_summary('00000000-0000-4000-8000-000000004801');exception when raise_exception then forbidden:=true;end;
  if not forbidden then raise exception 'Summary guard bypassed';end if;
  forbidden:=false;
  begin perform public.get_skill_mastery('00000000-0000-4000-8000-000000004801','reading','3');exception when raise_exception then forbidden:=true;end;
  if not forbidden then raise exception 'Mastery guard bypassed';end if;
  forbidden:=false;
  begin perform public.get_skill_progress('00000000-0000-4000-8000-000000004801','reading','3');exception when raise_exception then forbidden:=true;end;
  if not forbidden then raise exception 'Progress guard bypassed';end if;
 end loop;
 foreach uid in array array['00000000-0000-4000-8000-000000004801','00000000-0000-4000-8000-000000004802'] loop
  perform set_config('request.jwt.claim.sub',uid,true);
  if public.can_view_student('00000000-0000-4000-8000-000000004801') is distinct from true then raise exception 'Authorized viewer rejected';end if;
  if public.get_student_summary('00000000-0000-4000-8000-000000004801')#>>'{profile,id}'<>'00000000-0000-4000-8000-000000004801' then raise exception 'Summary access failed';end if;
  perform public.get_skill_mastery('00000000-0000-4000-8000-000000004801','reading','3');
  perform public.get_skill_progress('00000000-0000-4000-8000-000000004801','reading','3');
  perform public.get_practice_trends('00000000-0000-4000-8000-000000004801');
 end loop;
end $$;
set local role anon;
select set_config('request.jwt.claim.sub','',true);
do $$ begin
 begin perform public.get_student_summary('00000000-0000-4000-8000-000000004801');raise exception 'Anon summary exposed';exception when insufficient_privilege then null;end;
 begin perform public.get_skill_mastery('00000000-0000-4000-8000-000000004801','reading','3');raise exception 'Anon mastery exposed';exception when insufficient_privilege then null;end;
 begin perform public.can_view_student('00000000-0000-4000-8000-000000004801');raise exception 'Anon helper exposed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
