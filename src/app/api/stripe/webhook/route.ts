import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Node runtime: we verify the Stripe signature over the raw body and write the
// subscriptions table with the service-role key (bypasses RLS).
export const runtime = "nodejs";

function tsToIso(unix: number | null | undefined): string | null {
  return unix ? new Date(unix * 1000).toISOString() : null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Billing not configured.", { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature.", { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Invalid signature.", { status: 400 });
  }

  const admin = createAdminClient();

  // Resolve a subscription back to a parent: prefer metadata, then the
  // stripe_customer_id we persisted at checkout, then the customer's metadata.
  async function resolveParentId(
    sub: Stripe.Subscription,
  ): Promise<string | null> {
    if (sub.metadata?.parent_id) return sub.metadata.parent_id;
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer.id;
    const { data } = await admin
      .from("subscriptions")
      .select("parent_id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (data?.parent_id) return data.parent_id as string;
    try {
      const customer = await stripe!.customers.retrieve(customerId);
      if (!("deleted" in customer)) return customer.metadata?.parent_id ?? null;
    } catch {
      /* ignore */
    }
    return null;
  }

  async function syncSubscription(sub: Stripe.Subscription) {
    const parentId = await resolveParentId(sub);
    if (!parentId) {
      console.error("[stripe webhook] could not map subscription to a parent", sub.id);
      return;
    }
    const item = sub.items.data[0];
    // current_period_end lives on the subscription in older API versions and on
    // the item in newer ones — read whichever is present.
    const periodEnd =
      (sub as unknown as { current_period_end?: number }).current_period_end ??
      (item as unknown as { current_period_end?: number })?.current_period_end ??
      null;

    await admin.from("subscriptions").upsert(
      {
        parent_id: parentId,
        status: sub.status,
        stripe_customer_id:
          typeof sub.customer === "string" ? sub.customer : sub.customer.id,
        stripe_subscription_id: sub.id,
        stripe_price_id: item?.price?.id ?? null,
        seats: item?.quantity ?? 0,
        current_period_end: tsToIso(periodEnd),
        trial_end: tsToIso(sub.trial_end),
        cancel_at_period_end: sub.cancel_at_period_end ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "parent_id" },
    );
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id;
      if (subId) await syncSubscription(await stripe.subscriptions.retrieve(subId));
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
