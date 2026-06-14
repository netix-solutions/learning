import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

// Keep the Stripe subscription quantity (= number of kids) in sync after a
// parent adds or removes a child. Per the product decision, changes "bill next
// cycle" — proration_behavior: "none" means no mid-cycle charge; the new seat
// count is reflected on the next invoice. Safe to call always: it no-ops unless
// Stripe is configured and the parent has an updatable subscription.
export async function syncSubscriptionSeats(parentId: string): Promise<void> {
  const stripe = getStripe();
  if (!stripe) return;

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id, status")
    .eq("parent_id", parentId)
    .maybeSingle();

  if (
    !sub?.stripe_subscription_id ||
    !["active", "trialing", "past_due"].includes(sub.status)
  ) {
    return;
  }

  const { count } = await admin
    .from("parent_child")
    .select("*", { count: "exact", head: true })
    .eq("parent_id", parentId);
  const seats = Math.max(1, count ?? 0);

  const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
  const item = stripeSub.items.data[0];
  if (!item || item.quantity === seats) return;

  await stripe.subscriptions.update(sub.stripe_subscription_id, {
    items: [{ id: item.id, quantity: seats }],
    proration_behavior: "none",
  });
  // The customer.subscription.updated webhook will persist the new seat count.
}
