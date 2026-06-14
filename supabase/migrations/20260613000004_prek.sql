-- Pre-K (ages 3–4): allow the 'PK' grade on questions and student profiles.
alter table public.questions drop constraint questions_grade_check;
alter table public.questions
  add constraint questions_grade_check check (grade in ('PK', 'K', '1', '2', '3', '4', '5'));

alter table public.profiles drop constraint profiles_grade_check;
alter table public.profiles
  add constraint profiles_grade_check check (grade in ('PK', 'K', '1', '2', '3', '4', '5'));
