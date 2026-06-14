-- Only offer a subject for a grade if there are questions for it at that grade.
-- e.g. Pre-K has math / reading / science questions but no civics, economics,
-- geography, or history — so those cards should not appear on a Pre-K home page.
-- A null grade falls back to showing every subject.
create or replace function public.get_grade_subjects(p_grade text)
returns table (id text, name text, emoji text, color text, sort int)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.name, s.emoji, s.color, s.sort
  from public.subjects s
  where p_grade is null
     or exists (
       select 1 from public.questions q
       where q.subject_id = s.id and q.grade = p_grade
     )
  order by s.sort;
$$;
