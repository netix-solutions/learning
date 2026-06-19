-- Global app settings (a single row). For now just the master billing switch
-- the operator flips from /admin. Service-role only (no RLS policies) — the app
-- reads/writes it through the admin client; the entitlement layer falls back to
-- the BILLING_ENABLED env var if this table isn't present yet.
create table public.app_settings (
  id              text primary key default 'singleton' check (id = 'singleton'),
  billing_enabled boolean not null default false,
  updated_at      timestamptz not null default now()
);

insert into public.app_settings (id, billing_enabled)
values ('singleton', false)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;
-- No policies on purpose → only the service role (which bypasses RLS) can touch it.
