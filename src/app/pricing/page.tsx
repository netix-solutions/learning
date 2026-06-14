import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { BeachScene } from "@/components/BeachScene";
import { PriceCalculator } from "@/components/marketing/PriceCalculator";
import { TRIAL_DAYS } from "@/lib/billing";

export const metadata: Metadata = {
  title: "Pricing — SummerSharp",
  description:
    "One simple plan: $4/mo for your first kid, $2/mo for each additional kid. Everything included. Start with a 7-day free trial.",
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

const FAQ = [
  { q: "How does the price work?", a: "$4/month covers your first child. Each additional child is just $2/month more — so 2 kids is $6, 3 kids is $8, and so on. One bill, the whole family." },
  { q: "Is there really a free trial?", a: `Yes — every new family gets ${TRIAL_DAYS} days free. We don't charge until the trial ends, and you can cancel anytime with one click.` },
  { q: "Can I add or remove kids later?", a: "Anytime. Add a child whenever you like; the small extra seat is reflected on your next bill. Remove one and it comes right off." },
  { q: "Is it safe for my child?", a: "Yes. Kids log in with just a username and PIN — no email, no personal info, no ads, ever. Parents own and manage the account (COPPA-aware by design)." },
  { q: "How do I cancel?", a: "From your parent dashboard, open Plan & billing and manage your subscription through Stripe. No emails, no hoops." },
];

export default function PricingPage() {
  return (
    <>
      <MarketingNav />
      <BeachScene />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-4xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          <span className="animate-rise inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-slate-500 ring-1 ring-white">
            ☀️ One plan · everything included
          </span>
          <h1 className="animate-rise delay-1 mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
            Simple, <span className="shimmer-orange">sunny</span> pricing
          </h1>
          <p className="animate-rise delay-2 mx-auto mt-3 max-w-xl text-lg text-slate-600">
            <span className="font-bold text-slate-700">$4/mo</span> for your first
            kid, <span className="font-bold text-slate-700">$2/mo</span> for each
            extra. No tiers, no add-ons, no surprises.
          </p>
        </div>

        {/* Calculator */}
        <div className="animate-rise delay-3 mx-auto mt-10 max-w-md">
          <PriceCalculator />
        </div>

        {/* What's included */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Every plan includes everything
          </h2>
          <p className="mt-1 text-center text-slate-500">
            No premium tiers. One price unlocks it all.
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
          {["🔒 No ads, ever", "🛡️ COPPA-aware & private", "🚫 Cancel anytime", "💛 Made in Florida"].map(
            (t) => (
              <span
                key={t}
                className="rounded-full border border-white bg-white/70 px-4 py-2 backdrop-blur-sm"
              >
                {t}
              </span>
            ),
          )}
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            Questions, answered
          </h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            {FAQ.map((item) => (
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
              {TRIAL_DAYS} days free. Then ${"5"}/mo for one kid. Cancel anytime.
            </p>
            <Link
              href="/signup"
              className="btn-pop mt-5 inline-flex bg-white px-7 py-3 text-lg font-extrabold text-[var(--brand-blue)]"
            >
              Start free trial →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
