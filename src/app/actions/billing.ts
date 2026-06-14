"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { TRIAL_DAYS } from "@/lib/billing";

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function requireParent(): Promise<
  { parentId: string; email: string; name: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again." };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "parent")
    return { error: "Only a parent account can manage billing." };
  return { parentId: user.id, email: user.email ?? "", name: profile.display_name };
}

/**
 * Ensure a Stripe customer exists for this parent and is persisted on the
 * subscriptions row — so the webhook can always map a subscription back to a
 * parent (via this stored id AND the customer's parent_id metadata).
 */
async function ensureCustomer(
  parentId: string,
  email: string,
  name: string,
): Promise<string | null> {
  const stripe = getStripe();
  if (!stripe) return null;
  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("parent_id", parentId)
    .maybeSingle();
  if (sub?.stripe_customer_id) return sub.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { parent_id: parentId },
  });
  await admin.from("subscriptions").upsert(
    {
      parent_id: parentId,
      stripe_customer_id: customer.id,
      status: "free",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "parent_id" },
  );
  return customer.id;
}

/** Start a Stripe Checkout session for the subscription (quantity = kids). */
export async function startCheckout(): Promise<{ error: string } | undefined> {
  const auth = await requireParent();
  if ("error" in auth) return { error: auth.error };

  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_ID;
  if (!stripe || !priceId) return { error: "Billing isn't set up yet." };

  const admin = createAdminClient();
  const { count } = await admin
    .from("parent_child")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", auth.parentId);
  const kids = Math.max(1, count ?? 0);

  const customerId = await ensureCustomer(auth.parentId, auth.email, auth.name);
  if (!customerId) return { error: "Billing isn't set up yet." };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: kids }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { parent_id: auth.parentId },
    },
    metadata: { parent_id: auth.parentId },
    allow_promotion_codes: true,
    success_url: `${appUrl()}/parent/billing?status=success`,
    cancel_url: `${appUrl()}/parent/billing?status=cancel`,
  });

  if (!session.url) return { error: "Could not start checkout." };
  redirect(session.url);
}

/** Open the Stripe Billing Portal so a parent can manage/cancel their plan. */
export async function openBillingPortal(): Promise<{ error: string } | undefined> {
  const auth = await requireParent();
  if ("error" in auth) return { error: auth.error };

  const stripe = getStripe();
  if (!stripe) return { error: "Billing isn't set up yet." };

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("parent_id", auth.parentId)
    .maybeSingle();
  if (!sub?.stripe_customer_id) return { error: "No subscription to manage yet." };

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${appUrl()}/parent/billing`,
  });
  redirect(session.url);
}
