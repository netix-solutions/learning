-- Allow several art variants per (subject, skill) so a kid doesn't see the
-- same banner on every question of a skill. The client picks a stable variant
-- per question (hash of question id), so a given question always looks the same.

alter table public.skill_art
  drop constraint skill_art_subject_id_skill_key;

create index skill_art_subject_skill_idx
  on public.skill_art (subject_id, skill);
