-- SQL NULL must never let IF NOT can_view_student(...) skip rejection.
create or replace function public.can_view_student(p_student_id uuid)
returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and p_student_id is not null and (
  p_student_id=auth.uid() or exists (
   select 1 from public.parent_child pc where pc.parent_id=auth.uid() and pc.child_id=p_student_id
  )
 );
$$;
-- These are signed-in student/parent reports, not public API data.
revoke all on function public.can_view_student(uuid) from public,anon;
revoke all on function public.get_student_summary(uuid) from public,anon;
revoke all on function public.get_skill_mastery(uuid,text,text) from public,anon;
grant execute on function public.can_view_student(uuid) to authenticated;
grant execute on function public.get_student_summary(uuid) to authenticated;
grant execute on function public.get_skill_mastery(uuid,text,text) to authenticated;
