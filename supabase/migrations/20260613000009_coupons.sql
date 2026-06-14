-- Coupon codes: operator-issued perks redeemed by a parent account.
--
-- Two kinds the app handles natively (Stripe can't express either cleanly):
--   • free       — comp access for up to `max_kids` children, no card, no Stripe
--                  subscription. This is the friends-and-family / scholarship case.
--   • trial_days — a longer free trial (total days) applied at Stripe Checkout.
--
-- Pure %/$ discounts are intentionally NOT modelled here — Stripe Checkout already
-- has `allow_promotion_codes` on, so percentage/fixed discounts are created as
-- Stripe promotion codes in the dashboard and entered at checkout.
--
-- All access is server-side (service role / admin); the browser never reads or
-- writes these tables directly, so RLS is on with no client policies.

create table public.coupons (
  code            text primary key,            -- normalized lowercase, e.g. 'jacob'
  kind            text not null check (kind in ('free','trial_days')),
  description     text,
  max_kids        integer,                      -- 'free': children covered (null = unlimited)
  trial_days      integer,                      -- 'trial_days': total trial length in days
  active          boolean not null default true,
  max_redemptions integer,                      -- global cap (null = unlimited)
  redeemed_count  integer not null default 0,
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

create table public.coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null references public.coupons(code) on delete cascade,
  parent_id   uuid not null references public.profiles(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  unique (code, parent_id)                       -- a parent redeems a given code once
);
create index coupon_redemptions_parent_idx on public.coupon_redemptions(parent_id);

alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;

-- Atomically redeem a code for a parent: validates the code, enforces the global
-- cap and one-per-parent rule, records the redemption, and bumps the counter —
-- all under a row lock so concurrent redemptions can't oversell a limited code.
-- Returns a jsonb result: { ok, error?, kind?, max_kids?, trial_days? }.
create or replace function public.redeem_coupon(p_code text, p_parent uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := lower(trim(p_code));
  v_c    public.coupons%rowtype;
begin
  select * into v_c from public.coupons where code = v_code for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if not v_c.active then
    return jsonb_build_object('ok', false, 'error', 'inactive');
  end if;
  if v_c.expires_at is not null and v_c.expires_at < now() then
    return jsonb_build_object('ok', false, 'error', 'expired');
  end if;
  if v_c.max_redemptions is not null and v_c.redeemed_count >= v_c.max_redemptions then
    return jsonb_build_object('ok', false, 'error', 'exhausted');
  end if;

  if exists (
    select 1 from public.coupon_redemptions
    where code = v_code and parent_id = p_parent
  ) then
    return jsonb_build_object('ok', false, 'error', 'already_redeemed');
  end if;

  insert into public.coupon_redemptions (code, parent_id) values (v_code, p_parent);
  update public.coupons set redeemed_count = redeemed_count + 1 where code = v_code;

  return jsonb_build_object(
    'ok', true,
    'kind', v_c.kind,
    'max_kids', v_c.max_kids,
    'trial_days', v_c.trial_days
  );
end;
$$;

-- First coupon: free family plan for up to 4 kids.
insert into public.coupons (code, kind, description, max_kids)
values ('jacob', 'free', 'Free family plan — up to 4 kids', 4)
on conflict (code) do nothing;
