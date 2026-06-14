import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import {
  formatCents,
  priceForKids,
  BASE_PRICE_CENTS,
  EXTRA_PRICE_CENTS,
  TRIAL_DAYS,
} from "@/lib/billing";

const FEATURES = [
  { emoji: "➕", title: "Math, Reading & Science", desc: "Thousands of K–5 questions, tagged to Florida B.E.S.T. standards." },
  { emoji: "🎯", title: "Adapts to your kid", desc: "Practice adjusts to each child and re-teaches what they miss." },
  { emoji: "⭐", title: "Points, streaks & badges", desc: "Game-like rewards that make kids want to come back tomorrow." },
  { emoji: "🔊", title: "Reads aloud", desc: "A friendly voice reads questions for early readers." },
  { emoji: "👪", title: "Parent dashboard", desc: "See progress by subject, skill, and grade-level standard." },
  { emoji: "⏱️", title: "Healthy time goals", desc: "Set days/week + minutes/day; we email you when goals are met or slipping." },
  { emoji: "🛡️", title: "Safe & ad-free", desc: "Kids use a username + PIN. No email, no ads, no tracking." },
];

const PILLS = [
  "🌴 Florida B.E.S.T. K–5",
  "🔥 Daily streaks",
  "🏆 Badges to unlock",
  "📱 Works offline",
];

export default async function Home() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <>
      <MarketingNav />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-5xl px-5">
        {/* Hero */}
        <section className="flex flex-col items-center py-12 text-center sm:py-16">
          <div className="animate-rise">
            <BrandLogo variant="full" href={null} />
          </div>
          <h1 className="animate-rise delay-1 mt-6 max-w-3xl font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
            Keep their brain <span className="shimmer-orange">sunny</span> and{" "}
            <span className="shimmer-blue">sharp</span> all summer{" "}
            <span className="inline-block animate-wiggle">☀️</span>
          </h1>
          <p className="animate-rise delay-2 mt-4 max-w-xl text-lg text-slate-600">
            Fun, adaptive math, reading &amp; science for Florida kids in grades
            K–5. A few playful minutes a day beats the summer slide.
          </p>

          <div className="animate-rise delay-3 mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="btn-pop px-8 py-4 text-lg font-extrabold text-white"
              style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
            >
              Start {TRIAL_DAYS}-day free trial →
            </Link>
            <Link
              href="/pricing"
              className="btn-pop bg-white px-8 py-4 text-lg font-bold text-slate-700 ring-2 ring-slate-200"
            >
              See pricing
            </Link>
          </div>

          <div className="animate-rise delay-4 mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {PILLS.map((p) => (
              <span
                key={p}
                className="rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-600 backdrop-blur-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="py-8">
          <h2 className="text-center font-display text-3xl font-bold text-slate-800">
            Everything kids need to stay sharp
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="card-fun p-6 transition-transform hover:-translate-y-1"
              >
                <div className="text-4xl">{f.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-800">
                  {f.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing teaser */}
        <section className="py-12">
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
        </section>

        {/* Returning users */}
        <section className="py-8">
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
