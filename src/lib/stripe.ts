import "server-only";
import Stripe from "stripe";

// Lazily-constructed Stripe client. Returns null when STRIPE_SECRET_KEY is
// unset, so the app degrades gracefully (billing "not configured") instead of
// throwing at import time.
let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

/** True once both the secret key and the tiered price id are configured. */
export function stripeReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}
