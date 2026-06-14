import "server-only";

import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Read-only Stripe billing data shared by the parent billing page and the
// admin billing area. Subscription *state* (status, seats, period end, cancel
// flag) is read from our own `subscriptions` table — kept in sync by the
// webhook and our cancel/resume actions — so we only reach into Stripe for the
// invoice history, which we never persist.

export type InvoiceLine = {
  id: string;
  number: string | null;
  createdIso: string;
  amountCents: number;
  currency: string;
  status: string;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

/**
 * Past invoices for a Stripe customer, newest first. Returns [] when Stripe
 * isn't configured or the lookup fails, so a billing page never hard-crashes
 * on the invoice section.
 */
export async function listInvoices(
  customerId: string | null | undefined,
  limit = 12,
): Promise<InvoiceLine[]> {
  const stripe = getStripe();
  if (!stripe || !customerId) return [];

  try {
    const res = await stripe.invoices.list({ customer: customerId, limit });
    return res.data.map((i) => ({
      id: i.id ?? i.number ?? "",
      number: i.number ?? null,
      createdIso: new Date(i.created * 1000).toISOString(),
      // `total` is the billed amount in the smallest currency unit (cents).
      amountCents: i.total,
      currency: (i.currency ?? "usd").toUpperCase(),
      status: i.status ?? "unknown",
      hostedUrl: i.hosted_invoice_url ?? null,
      pdfUrl: i.invoice_pdf ?? null,
    }));
  } catch (err) {
    console.error("[billing] could not list invoices", err);
    return [];
  }
}

/**
 * Flip `cancel_at_period_end` on a parent's Stripe subscription and mirror it
 * onto the subscriptions row immediately (the webhook also syncs it, but that
 * doesn't fire in local dev) so billing pages reflect the change at once.
 *
 * This is a privileged mutation keyed by `parentId`, NOT a server action — it
 * lives here (server-only, never exported from a "use server" module) so the
 * caller is always responsible for authorizing the parentId first: the parent
 * action proves ownership, the admin action proves an admin session.
 */
export async function setSubscriptionCancel(
  parentId: string,
  cancelAtPeriodEnd: boolean,
): Promise<{ error: string } | undefined> {
  const stripe = getStripe();
  if (!stripe) return { error: "Billing isn't set up yet." };

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("stripe_subscription_id")
    .eq("parent_id", parentId)
    .maybeSingle();

  const subId = sub?.stripe_subscription_id;
  if (!subId) return { error: "No active subscription to update." };

  try {
    await stripe.subscriptions.update(subId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
  } catch (err) {
    console.error("[billing] could not update cancellation", err);
    return { error: "Could not update the subscription. Please try again." };
  }

  await admin
    .from("subscriptions")
    .update({
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("parent_id", parentId);

  return undefined;
}
