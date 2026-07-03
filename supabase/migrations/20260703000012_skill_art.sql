-- Per-skill AI-generated scene illustrations for practice questions.
--
-- One image per (subject, skill), generated through the Vercel AI Gateway
-- (scripts/generate-skill-art.mjs), stored in the public `art` bucket, and
-- human-reviewed in /admin/art before kids ever see it: RLS below only
-- exposes rows once status = 'approved'. Writes happen via service role only.

create table public.skill_art (
  id          uuid primary key default gen_random_uuid(),
  subject_id  text not null references public.subjects(id) on delete cascade,
  skill       text not null,
  image_url   text not null,
  -- The art-director sentence the image was painted from (kept for regenerate).
  art_prompt  text,
  -- What the automated vision check thought (surfaced to the human reviewer).
  review_note text,
  status      text not null default 'pending'
              check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  unique (subject_id, skill)
);

alter table public.skill_art enable row level security;

-- Kids/parents only ever see approved art. Pending/rejected rows are
-- invisible outside the service role (admin pages).
create policy "approved skill art readable"
  on public.skill_art for select
  using ((select auth.uid()) is not null and status = 'approved');
