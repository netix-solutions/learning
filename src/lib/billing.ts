// Pricing model for SummerSharp subscriptions.
//
// $4/mo for the first kid, +$2/mo for each additional kid. This maps to a
// single Stripe "graduated tiered" recurring price billed per seat (seat = kid):
//   tier 1 (up to 1 unit):  flat_amount = 400   ($4)
//   tier 2 (up to inf):     unit_amount = 200   ($2 each)
// with subscription quantity = number of kids. See scripts/setup-stripe-price.
//
// Billing always lives on the PARENT account — never on a child record — in
// keeping with the app's COPPA posture.

export const BASE_PRICE_CENTS = 400; // first kid
export const EXTRA_PRICE_CENTS = 200; // each additional kid
export const TRIAL_DAYS = 7;

/** Monthly price (in cents) for a given number of kids. */
export function priceForKids(kids: number): number {
  if (kids <= 0) return 0;
  return BASE_PRICE_CENTS + EXTRA_PRICE_CENTS * (kids - 1);
}

/** "$5.00" / "$7.00" … */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Human summary of what a parent would pay, e.g. "$7.00/mo for 2 kids". */
export function priceSummary(kids: number): string {
  const seats = Math.max(1, kids);
  return `${formatCents(priceForKids(seats))}/mo for ${seats} ${seats === 1 ? "kid" : "kids"}`;
}

// Stripe subscription statuses that grant access.
export const ACTIVE_STATUSES = ["active", "trialing"] as const;
