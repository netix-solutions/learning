import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { isBillingOn } from "@/lib/settings";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { KidHomeView, type KidHomeData } from "@/components/KidHomeView";
import {
  formatCents,
  priceForKids,
  BASE_PRICE_CENTS,
  EXTRA_PRICE_CENTS,
  TRIAL_DAYS,
} from "@/lib/billing";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

// Structured data so search engines show SummerSharp as an app with ratings-
// ready rich results. Kept in sync with the marketing copy by hand.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SummerSharp",
  url: "https://summersharp.app",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  description:
    "A fun summer learning app for Florida K–5 students. Adaptive math, reading, and science practice with points, streaks, and badges — plus a parent dashboard.",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
  },
  offers: {
    "@type": "Offer",
    price: (BASE_PRICE_CENTS / 100).toFixed(2),
    priceCurrency: "USD",
  },
  publisher: {
    "@type": "Organization",
    name: "Netix Solutions, LLC",
    url: "https://netixsolutions.com",
  },
};

// The real kid home screen, rendered live in the hero with demo data — the
// most honest "screenshot" possible, and it never goes stale.
const DEMO_KID: KidHomeData = {
  name: "Sunny",
  avatar: "/shop/astro-cat.png",
  grade: "3",
  xp: 340,
  streak: 5,
  totals: { attempts: 120, correct: 98, accuracy: 82 },
  subjects: [
    { id: "math", name: "Math", emoji: "➕", color: "blue", attempts: 48, correct: 39 },
    { id: "reading", name: "Reading", emoji: "📚", color: "purple", attempts: 40, correct: 33 },
    { id: "science", name: "Science", emoji: "🔬", color: "green", attempts: 32, correct: 26 },
  ],
  badges: [
    { id: "b1", name: "First Steps", emoji: "🌱", description: "", earned: true },
    { id: "b2", name: "Streak x5", emoji: "🔥", description: "", earned: true },
    { id: "b3", name: "Math Whiz", emoji: "➕", description: "", earned: true },
    { id: "b4", name: "Bookworm", emoji: "📚", description: "", earned: false },
    { id: "b5", name: "Scientist", emoji: "🔬", description: "", earned: false },
  ],
};

// Real reward art from the avatar shop (public/shop/) — shown as the "why
// kids come back" strip. Duplicated in the marquee for a seamless loop.
const SHOP_AVATARS = [
  ["astro-cat", "Astro Cat"],
  ["dino-rex", "Dino Rex"],
  ["unicorn-sparkle", "Sparkle"],
  ["ninja-frog", "Ninja Frog"],
  ["surf-shark", "Surf Shark"],
  ["mermaid-star", "Mermaid Star"],
  ["robo-buddy", "Robo Buddy"],
  ["wizard-owl", "Wizard Owl"],
  ["pirate-parrot", "Pirate Parrot"],
  ["dragon-ember", "Ember"],
  ["space-pup", "Space Pup"],
  ["queen-bee", "Queen Bee"],
] as const;

const STATS = [
  { value: "13,000+", label: "practice questions" },
  { value: "7", label: "subjects, K–5" },
  { value: "100%", label: "Florida B.E.S.T. aligned" },
  { value: "0", label: "ads. Ever." },
];

const STEPS = [
  {
    emoji: "👪",
    title: "Grown-ups set it up",
    desc: "Add each kid with a fun username and a 4-digit PIN — no email or personal info from kids, ever.",
  },
  {
    emoji: "🎒",
    title: "Kids play a few minutes a day",
    desc: "Short, game-like rounds that adapt to your child and re-teach whatever they miss.",
  },
  {
    emoji: "📈",
    title: "You watch them grow",
    desc: "Your dashboard shows progress by subject, skill, and grade-level standard.",
  },
];

const FEATURES = [
  { emoji: "🎯", title: "Adapts to your kid", desc: "Practice adjusts to each child and re-teaches what they miss — not a wall of worksheets." },
  { emoji: "⭐", title: "Points, streaks & badges", desc: "Kids earn points and spend them on avatars in the reward shop. They'll ask to practice." },
  { emoji: "🧑‍🏫", title: "A tutor when they're stuck", desc: "Miss a question and a friendly AI tutor explains it step by step, in kid words." },
  { emoji: "🔊", title: "Reads aloud", desc: "A friendly voice reads questions for early readers — even Pre-K can play." },
  { emoji: "👪", title: "Parent dashboard", desc: "See progress by subject, skill, and Florida grade-level standard." },
  { emoji: "⏱️", title: "Healthy time goals", desc: "Set days/week and minutes/day; we email you when goals are met or slipping." },
];

export default async function Home() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  const billingOn = await isBillingOn();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />
      <MarketingNav />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-6xl px-5">
        {/* ---- Hero: promise + the real product ---------------------------- */}
        <section className="grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="text-center lg:text-left">
            <h1 className="animate-rise font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
              Keep their brain <span className="shimmer-orange">sunny</span> and{" "}
              <span className="shimmer-blue">sharp</span> all summer{" "}
              <span className="inline-block animate-wiggle">☀️</span>
            </h1>
            <p className="animate-rise delay-1 mx-auto mt-4 max-w-xl text-lg text-slate-600 lg:mx-0">
              Kids lose 2–3 months of learning over summer break. A few playful
              minutes a day of adaptive math, reading &amp; science — built on
              Florida&apos;s K–5 standards — keeps them ready for next grade.
            </p>

            {!billingOn && (
              <div className="animate-rise delay-2 mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-sm font-extrabold text-emerald-700">
                🎉 Free for a limited time — no card needed
              </div>
            )}

            <div className="animate-rise delay-3 mt-6 flex flex-col items-center gap-3 sm:flex-row lg:justify-start sm:justify-center">
              <Link
                href="/signup"
                className="btn-pop px-8 py-4 text-lg font-extrabold text-white"
                style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
              >
                {billingOn ? `Start ${TRIAL_DAYS}-day free trial →` : "Get started free →"}
              </Link>
              <span className="text-sm font-bold text-slate-500">
                Set up in 2 minutes · {billingOn ? "cancel anytime" : "no credit card"}
              </span>
            </div>

            <div className="animate-rise delay-4 mt-7 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              {["🌴 Florida B.E.S.T. K–5", "🔥 Daily streaks", "🛍️ Avatar reward shop", "📱 Works offline"].map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur-sm"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Live app preview in a tablet frame, with reward chips floating around it */}
          <div className="animate-rise delay-2 relative mx-auto w-full max-w-[360px]">
            <div className="device-bob relative">
              <div className="overflow-hidden rounded-[2.5rem] border-[10px] border-slate-800 bg-[#fef6ff] shadow-2xl shadow-sky-900/20">
                <div className="h-[480px] overflow-hidden">
                  <div
                    aria-hidden
                    className="pointer-events-none w-[600px] origin-top-left scale-[0.52] select-none p-5 sm:scale-[0.565]"
                  >
                    <KidHomeView data={DEMO_KID} />
                  </div>
                </div>
              </div>
              {/* fade the crop so it reads as a peek, not a cut */}
              <div className="pointer-events-none absolute inset-x-[10px] bottom-[10px] h-24 rounded-b-[2rem] bg-gradient-to-t from-[#fef6ff] to-transparent" />
            </div>

            <span className="animate-float absolute -left-4 top-10 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-amber-600 shadow-lg ring-2 ring-amber-100">
              +10 ⭐
            </span>
            <span className="animate-float absolute -right-3 top-32 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-orange-600 shadow-lg ring-2 ring-orange-100 [animation-delay:1.2s]">
              🔥 5-day streak!
            </span>
            <span className="animate-float absolute -left-6 bottom-24 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-violet-600 shadow-lg ring-2 ring-violet-100 [animation-delay:2.1s]">
              🏅 New badge!
            </span>
          </div>
        </section>

        {/* ---- True numbers ------------------------------------------------ */}
        <section className="animate-rise delay-4">
          <div className="card-fun grid grid-cols-2 gap-x-4 gap-y-6 p-6 sm:grid-cols-4 sm:p-7">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-3xl font-extrabold text-slate-800 sm:text-4xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Reward marquee: why kids come back tomorrow ------------------ */}
        <section className="py-14">
          <h2 className="text-center font-display text-3xl font-bold text-slate-800">
            Practice earns points.{" "}
            <span className="shimmer-orange">Points unlock these guys.</span>
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-slate-600">
            Every correct answer earns stars to spend in the avatar shop — plus a
            daily deal and a mystery box. Kids ask to practice.
          </p>
          <div className="marquee-mask mt-8 overflow-hidden">
            <div className="marquee-track gap-4 pr-4">
              {[...SHOP_AVATARS, ...SHOP_AVATARS].map(([slug, name], i) => (
                <div
                  key={`${slug}-${i}`}
                  className="flex w-28 shrink-0 flex-col items-center gap-2"
                  aria-hidden={i >= SHOP_AVATARS.length}
                >
                  <div className="h-24 w-24 overflow-hidden rounded-3xl shadow-md ring-4 ring-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/shop/${slug}.png`}
                      alt={name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- How it works ------------------------------------------------ */}
        <section className="py-8">
          <h2 className="text-center font-display text-3xl font-bold text-slate-800">
            Up and running before the sunscreen dries
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card-fun relative p-6 text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-blue)] px-3 py-0.5 text-xs font-bold text-white">
                  Step {i + 1}
                </div>
                <div className="mt-2 text-5xl">{s.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-800">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Features ----------------------------------------------------- */}
        <section className="py-12">
          <h2 className="text-center font-display text-3xl font-bold text-slate-800">
            Everything kids need to stay sharp
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-fun p-6 transition-transform hover:-translate-y-1">
                <div className="text-4xl">{f.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-800">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Pricing teaser (or "it's free" while billing is off) --------- */}
        <section className="py-8">
          {billingOn ? (
            <div
              className="card-fun mx-auto flex max-w-3xl flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left"
              style={{ background: "linear-gradient(120deg, #eef6ff, #fff7ed)" }}
            >
              <div className="flex-1">
                <h2 className="font-display text-3xl font-extrabold text-slate-800">
                  One simple price
                </h2>
                <p className="mt-2 text-slate-600">
                  {formatCents(BASE_PRICE_CENTS)}/mo for your first kid, just{" "}
                  {formatCents(EXTRA_PRICE_CENTS)}/mo for each additional kid.
                  Everything included.
                </p>
                <Link
                  href="/pricing"
                  className="btn-pop mt-4 inline-flex px-6 py-3 font-bold text-white"
                  style={{ background: "var(--brand-blue)" }}
                >
                  See full pricing →
                </Link>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
                {[1, 2, 3].map((k) => (
                  <div key={k} className="rounded-2xl bg-white/80 px-3 py-3 ring-2 ring-white">
                    <div className="font-display text-xl font-extrabold text-slate-800">
                      {formatCents(priceForKids(k))}
                    </div>
                    <div className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-400">
                      {k} {k === 1 ? "kid" : "kids"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="card-fun mx-auto max-w-3xl p-8 text-center"
              style={{ background: "linear-gradient(120deg, #ecfdf5, #fff7ed)" }}
            >
              <div className="text-5xl">🎉</div>
              <h2 className="mt-2 font-display text-3xl font-extrabold text-slate-800">
                Free for a limited time
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-slate-600">
                Every family gets <strong>everything</strong> — all subjects, all
                kids, the parent dashboard — completely free right now. No credit
                card, no trial countdown. Jump in while it lasts!
              </p>
            </div>
          )}
        </section>

        {/* ---- Trust strip + final CTA -------------------------------------- */}
        <section className="pb-4">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-semibold text-slate-600">
            {["🛡️ COPPA-aware & private", "🔒 No ads, ever", "🙈 Kids never share an email", "💛 Made in Florida"].map((t) => (
              <span key={t} className="rounded-full border border-white bg-white/70 px-4 py-2 backdrop-blur-sm">
                {t}
              </span>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div
            className="card-fun mx-auto max-w-3xl p-8 text-center text-white sm:p-10"
            style={{ background: "linear-gradient(120deg, var(--brand-blue), var(--brand-wave))" }}
          >
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              This summer, the slide is for the playground 🛝
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-white/90">
              {billingOn
                ? `${TRIAL_DAYS} days free, then ${formatCents(BASE_PRICE_CENTS)}/mo. Cancel anytime.`
                : "Free for a limited time — every subject, every kid, no credit card."}
            </p>
            <Link
              href="/signup"
              className="btn-pop mt-6 inline-flex bg-white px-8 py-4 text-lg font-extrabold text-[var(--brand-blue)]"
            >
              {billingOn ? "Start free trial →" : "Get started free →"}
            </Link>
          </div>
        </section>

        {/* ---- Returning users ---------------------------------------------- */}
        <section className="pb-12">
          <p className="text-center font-display text-lg font-bold text-slate-500">
            Already have an account? Jump back in 👇
          </p>
          <div className="mx-auto mt-5 grid max-w-2xl gap-5 sm:grid-cols-2">
            <Link
              href="/kids"
              className="btn-pop card-fun group flex flex-col items-center gap-2 px-6 py-8 text-center transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg]"
            >
              <span className="text-6xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-125 group-hover:-rotate-6">
                🎒
              </span>
              <span className="font-display text-2xl font-bold text-slate-800">
                I&apos;m a Kid
              </span>
              <span className="text-slate-500">Log in and start playing!</span>
            </Link>
            <Link
              href="/login"
              className="btn-pop card-fun group flex flex-col items-center gap-2 px-6 py-8 text-center transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-[1deg]"
            >
              <span className="text-6xl transition-transform duration-200 group-hover:-translate-y-1 group-hover:scale-125 group-hover:rotate-6">
                👋
              </span>
              <span className="font-display text-2xl font-bold text-slate-800">
                I&apos;m a Grown-Up
              </span>
              <span className="text-slate-500">Check on your learner.</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
