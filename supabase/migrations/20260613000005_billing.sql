-- Billing: one subscription row per PARENT account.
--
-- Payment always lives on the parent (never a child), matching the COPPA model.
-- Rows are written ONLY by the Stripe webhook via the service-role key (which
-- bypasses RLS); the browser can read its own row but never write it.

create table public.subscriptions (
  parent_id              uuid primary key references public.profiles(id) on delete cascade,
  status                 text not null default 'free'
                           check (status in (
                             'free','trialing','active','past_due',
                             'canceled','incomplete','incomplete_expired','unpaid'
                           )),
  stripe_customer_id     text unique,
  stripe_subscription_id text unique,
  stripe_price_id        text,
  seats                  integer not null default 0,   -- kids covered (subscription quantity)
  current_period_end     timestamptz,
  trial_end              timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

-- A parent may read their own subscription; no client writes (webhook only).
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = parent_id);
