import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { PriceCalculator } from "@/components/marketing/PriceCalculator";
import { isBillingOn } from "@/lib/settings";
import { TRIAL_DAYS, BASE_PRICE_CENTS, formatCents } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Pricing — SummerSharp",
  description:
    "Full access for every K–5 family. Simple, sunny pricing — and free for a limited time.",
};

const INCLUDED = [
  { emoji: "➕", title: "Math, Reading & Science", desc: "Thousands of K–5 questions tagged to Florida B.E.S.T." },
  { emoji: "🎯", title: "Adaptive practice", desc: "Questions adjust to each kid and re-teach what they miss." },
  { emoji: "🔊", title: "Read-aloud voice", desc: "A friendly voice reads questions to early readers." },
  { emoji: "⭐", title: "Points, streaks & badges", desc: "Game-like rewards that keep kids coming back." },
  { emoji: "👪", title: "Parent dashboard", desc: "See progress per subject, skill, and grade-level standard." },
  { emoji: "⏱️", title: "Time goals & alerts", desc: "Set days/week + minutes/day; we email you when goals are met or about to slip." },
  { emoji: "📱", title: "Installable app", desc: "Works on any phone or tablet, even offline." },
];

const FAQ_PAID = [
  { q: "How does the price work?", a: "$4/month covers your first child. Each additional child is just $2/month more — so 2 kids is $6, 3 kids is $8, and so on. One bill, the whole family." },
  { q: "Is there really a free trial?", a: `Yes — every new family gets ${TRIAL_DAYS} days free. We don't charge until the trial ends, and you can cancel anytime with one click.` },
  { q: "Can I add or remove kids later?", a: "Anytime. Add a child whenever you like; the small extra seat is reflected on your next bill. Remove one and it comes right off." },
  { q: "Is it safe for my child?", a: "Yes. Kids log in with just a username and PIN — no email, no personal info, no ads, ever. Parents own and manage the account (COPPA-aware by design)." },
  { q: "How do I cancel?", a: "From your parent dashboard, open Plan & billing and manage your subscription through Stripe. No emails, no hoops." },
];

const FAQ_FREE = [
  { q: "Is it really free?", a: "Yes — SummerSharp is completely free for a limited time. Every family gets full access to all subjects, all features, and the parent dashboard, with no credit card required." },
  { q: "Do I need to enter a card?", a: "Nope. No card, no trial countdown, no commitment. Just sign up and start learning." },
  { q: "Can I add more than one kid?", a: "Absolutely — add as many children as you like, all included while it's free." },
  { q: "Is it safe for my child?", a: "Yes. Kids log in with just a username and PIN — no email, no personal info, no ads, ever. Parents own and manage the account (COPPA-aware by design)." },
  { q: "What happens when it's no longer free?", a: "We'll give you plenty of notice. Pricing is simple — $4/mo for your first child and $2/mo per extra — and you'll only ever be charged if you choose to continue." },
];

export default async function PricingPage() {
  const billingOn = await isBillingOn();
  const faq = billingOn ? FAQ_PAID : FAQ_FREE;

  return (
    <>
      <MarketingNav />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-4xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          {billingOn ? (
            <>
              <span className="animate-rise inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-slate-500 ring-1 ring-white">
                ☀️ One plan · everything included
              </span>
              <h1 className="animate-rise delay-1 mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
                Simple, <span className="shimmer-orange">sunny</span> pricing
              </h1>
              <p className="animate-rise delay-2 mx-auto mt-3 max-w-xl text-lg text-slate-600">
                <span className="font-bold text-slate-700">$4/mo</span> for your
                first kid, <span className="font-bold text-slate-700">$2/mo</span>{" "}
                for each extra. No tiers, no add-ons, no surprises.
              </p>
            </>
          ) : (
            <>
              <span className="animate-rise inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-extrabold text-emerald-700">
                🎉 Free for a limited time
              </span>
              <h1 className="animate-rise delay-1 mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
                It&apos;s <span className="shimmer-orange">free</span> right now
              </h1>
              <p className="animate-rise delay-2 mx-auto mt-3 max-w-xl text-lg text-slate-600">
                Every family gets <span className="font-bold text-slate-700">full access</span>{" "}
                — all subjects, all kids, the parent dashboard — completely free.
                No credit card, no catch.
              </p>
            </>
          )}
        </div>

        {/* Plan: calculator (paid) or a big free card */}
        <div className="animate-rise delay-3 mx-auto mt-10 max-w-md">
          {billingOn ? (
            <PriceCalculator />
          ) : (
            <div className="card-fun overflow-hidden p-8 text-center">
              <div className="text-6xl">☀️</div>
              <div className="mt-3 font-display text-5xl font-extrabold text-slate-800">
                Free
              </div>
              <p className="mt-1 font-semibold text-emerald-600">
                for a limited time
              </p>
              <p className="mx-auto mt-3 max-w-xs text-slate-500">
                Everything included, for every kid on your account. No card needed.
              </p>
              <Link
                href="/signup"
                className="btn-pop mt-6 flex w-full items-center justify-center px-6 py-4 text-lg font-extrabold text-white"
                style={{ background: "linear-gradient(90deg, var(--brand-blue), var(--brand-wave))" }}
              >
                Get started free →
              </Link>
            </div>
          )}
        </div>

        {/* What's included */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            {billingOn ? "Every plan includes everything" : "Everything's included"}
          </h2>
          <p className="mt-1 text-center text-slate-500">
            {billingOn
              ? "No premium tiers. One price unlocks it all."
              : "No premium tiers. Free unlocks it all."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((f) => (
              <div key={f.title} className="card-fun p-5">
                <div className="text-3xl">{f.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-800">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust row */}
        <section className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-600">
          {(billingOn
            ? ["🔒 No ads, ever", "🛡️ COPPA-aware & private", "🚫 Cancel anytime", "💛 Made in Florida"]
            : ["🔒 No ads, ever", "🛡️ COPPA-aware & private", "💳 No credit card", "💛 Made in Florida"]
          ).map((t) => (
            <span
              key={t}
              className="rounded-full border border-white bg-white/70 px-4 py-2 backdrop-blur-sm"
            >
              {t}
            </span>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Questions, answered
          </h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            {faq.map((item) => (
              <details key={item.q} className="card-fun group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-bold text-slate-800 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span className="text-2xl text-slate-300 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-2 text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-16 text-center">
          <div
            className="card-fun mx-auto max-w-2xl p-8 text-white"
            style={{ background: "linear-gradient(120deg, var(--brand-blue), var(--brand-wave))" }}
          >
            <h2 className="font-display text-3xl font-extrabold">
              Keep their brain sharp all summer ☀️
            </h2>
            <p className="mt-2 text-white/90">
              {billingOn
                ? `${TRIAL_DAYS} days free. Then ${formatCents(BASE_PRICE_CENTS)}/mo for one kid. Cancel anytime.`
                : "Free for a limited time. No credit card needed."}
            </p>
            <Link
              href="/signup"
              className="btn-pop mt-5 inline-flex bg-white px-7 py-3 text-lg font-extrabold text-[var(--brand-blue)]"
            >
              {billingOn ? "Start free trial →" : "Get started free →"}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
