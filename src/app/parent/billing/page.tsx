import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { BrandLogo } from "@/components/BrandLogo";
import { SignOutButton } from "@/components/SignOutButton";
import { BillingButtons } from "@/components/billing/BillingButtons";
import { SubscriptionActions } from "@/components/billing/SubscriptionActions";
import { RedeemCoupon } from "@/components/billing/RedeemCoupon";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { listInvoices } from "@/lib/billing-info";
import { getParentEntitlement } from "@/lib/entitlement";
import {
  priceForKids,
  formatCents,
  BASE_PRICE_CENTS,
  EXTRA_PRICE_CENTS,
  TRIAL_DAYS,
} from "@/lib/billing";
import { SupportCallout } from "@/components/SupportCallout";

export default async function BillingPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "parent") redirect("/home");

  const ent = await getParentEntitlement(user.id);
  const seats = Math.max(1, ent.kids);
  const price = priceForKids(seats);

  const admin = createAdminClient();
  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, current_period_end, cancel_at_period_end, seats, stripe_customer_id")
    .eq("parent_id", user.id)
    .maybeSingle();

  const invoices = await listInvoices(sub?.stripe_customer_id);

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const subscribed = ent.reason === "subscribed" || ent.reason === "trialing";

  return (
    <main className="mx-auto w-full min-w-0 max-w-2xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <BrandLogo href="/parent" />
        <SignOutButton />
      </header>

      <Link href="/parent" className="font-bold text-slate-500 hover:text-slate-700">
        ← Back
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-800">
        Plan &amp; billing
      </h1>

      {/* Pricing card — always shown so parents know what it costs. */}
      <section className="card-fun mt-5 p-6 text-center">
        <div className="text-5xl">☀️</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-slate-800">
          SummerSharp Family
        </h2>
        <p className="mt-1 text-slate-500">
          {formatCents(BASE_PRICE_CENTS)}/mo for your first kid ·{" "}
          {formatCents(EXTRA_PRICE_CENTS)}/mo per extra kid
        </p>

        <div className="mx-auto mt-5 max-w-xs rounded-2xl bg-slate-50 p-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-4xl font-extrabold text-slate-800">
              {formatCents(price)}
            </span>
            <span className="text-slate-500">/mo</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-500">
            for {seats} {seats === 1 ? "kid" : "kids"} on your account
          </p>
        </div>

        {/* State-specific call to action */}
        <div className="mt-6">
          {!ent.billingEnabled ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-800">
              <p className="font-display text-lg font-bold">
                Free for a limited time! 🎉
              </p>
              <p className="mt-1 text-sm">
                Enjoy everything at no cost — all subjects, all your kids, no card
                needed. When paid plans return, the price above is what it&apos;ll
                be, and we&apos;ll give you plenty of notice first.
              </p>
            </div>
          ) : ent.reason === "grandfathered" ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
              <p className="font-display text-lg font-bold">
                You&apos;re a founding family 💛
              </p>
              <p className="mt-1 text-sm">
                Thanks for being here early — your account stays free.
              </p>
            </div>
          ) : ent.reason === "coupon" ? (
            <div className="rounded-2xl bg-amber-50 p-4 text-amber-800">
              <p className="font-display text-lg font-bold">Free with your code 💛</p>
              <p className="mt-1 text-sm">
                A coupon is covering your plan
                {ent.kids ? ` for your ${ent.kids} ${ent.kids === 1 ? "kid" : "kids"}` : ""} — no charge.
              </p>
            </div>
          ) : subscribed ? (
            <>
              <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-emerald-800">
                <p className="font-display text-lg font-bold">
                  {ent.reason === "trialing" ? "Free trial active 🎈" : "You're subscribed ✅"}
                </p>
                <p className="mt-1 text-sm">
                  {sub?.cancel_at_period_end
                    ? `Your plan ends on ${periodEnd}.`
                    : periodEnd
                      ? `${ent.reason === "trialing" ? "Trial ends" : "Renews"} ${periodEnd}.`
                      : ""}
                </p>
              </div>
              <SubscriptionActions
                cancelScheduled={!!sub?.cancel_at_period_end}
                periodEndLabel={periodEnd}
              />
            </>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                Start with a {TRIAL_DAYS}-day free trial. Cancel anytime.
              </p>
              <BillingButtons mode="subscribe" />
            </>
          )}
        </div>
      </section>

      {/* Redeem a coupon — hidden once a comp is already in effect. */}
      {ent.billingEnabled && ent.reason !== "grandfathered" && ent.reason !== "coupon" && (
        <section className="mt-6">
          <RedeemCoupon />
        </section>
      )}

      {/* Invoice history — shown once there's a billing customer to have any. */}
      {sub?.stripe_customer_id && (
        <section className="mt-8">
          <h2 className="mb-3 font-display text-xl font-bold text-slate-700">
            Billing history
          </h2>
          <InvoiceList invoices={invoices} />
        </section>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        Billing is managed securely by Stripe. Payment lives on your parent
        account only.
      </p>

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-sm font-semibold text-slate-500">
          Questions about your plan? We&apos;re always here.
        </p>
        <SupportCallout variant="loud" showEmail />
      </div>
    </main>
  );
}
