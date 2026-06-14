import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { BeachScene } from "@/components/BeachScene";

export const metadata: Metadata = {
  title: "About — SummerSharp",
  description:
    "SummerSharp keeps Florida K–5 kids sharp over the summer with fun, adaptive practice in math, reading, and science — built by Netix Solutions.",
};

const STEPS = [
  { emoji: "👪", title: "Grown-ups set it up", desc: "A parent creates the account and adds each child with a fun username and 4-digit PIN — no email or personal info from kids." },
  { emoji: "🎒", title: "Kids practice & play", desc: "Short, game-like rounds in math, reading, and science. Points, streaks, and badges keep them motivated." },
  { emoji: "📈", title: "You watch them grow", desc: "Your dashboard shows progress by subject, skill, and grade-level standard — so you always know how they're doing." },
];

const VALUES = [
  { emoji: "🛡️", title: "Safe & private", desc: "Kids never share an email or personal details. No ads, no tracking, ever. COPPA-aware by design." },
  { emoji: "🎯", title: "Actually adaptive", desc: "Questions adjust to each child and re-teach the moment they miss something — not just a wall of worksheets." },
  { emoji: "🌴", title: "Made for Florida", desc: "Every question is tagged to Florida's B.E.S.T. standards for K–5, so summer practice lines up with the school year." },
  { emoji: "😄", title: "Genuinely fun", desc: "Bright visuals, a friendly read-aloud voice, and rewards that make kids want to come back tomorrow." },
];

export default function AboutPage() {
  return (
    <>
      <MarketingNav />
      <BeachScene />

      <main className="relative z-10 mx-auto w-full min-w-0 max-w-4xl px-4 py-12 sm:py-16">
        {/* Hero */}
        <div className="text-center">
          <span className="animate-rise inline-block rounded-full bg-white/70 px-4 py-1.5 text-sm font-bold text-slate-500 ring-1 ring-white">
            🌞 Our mission
          </span>
          <h1 className="animate-rise delay-1 mt-4 font-display text-4xl font-extrabold tracking-tight text-slate-800 sm:text-6xl">
            Keep summer{" "}
            <span className="shimmer-orange">fun</span> —{" "}
            <br className="hidden sm:block" />
            and brains <span className="shimmer-blue">sharp</span>
          </h1>
          <p className="animate-rise delay-2 mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Over a long summer, kids can lose months of learning — the
            &ldquo;summer slide.&rdquo; SummerSharp turns a few minutes a day into
            a sunny habit that keeps Florida K–5 students ready for the next
            grade, without it ever feeling like homework.
          </p>
        </div>

        {/* Story */}
        <section className="animate-rise delay-3 mt-12">
          <div className="card-fun p-7 sm:p-9">
            <h2 className="font-display text-2xl font-bold text-slate-800">
              Why we built it
            </h2>
            <div className="mt-3 space-y-3 text-slate-600">
              <p>
                Parents kept telling us the same thing: they want their kids to
                stay sharp over the break, but printable worksheets are a chore
                and most apps are either babysitting or buried in ads.
              </p>
              <p>
                So we built the thing we wished existed — a bright, friendly app
                that&apos;s genuinely fun for kids and genuinely useful for
                parents. Every question is grounded in Florida&apos;s B.E.S.T.
                standards, the practice adapts to each child, and a parent
                dashboard shows exactly where they shine and where they need a
                little help.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            How it works
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="card-fun relative p-6 text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-blue)] px-3 py-0.5 text-xs font-bold text-white">
                  Step {i + 1}
                </div>
                <div className="mt-2 text-5xl">{s.emoji}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-800">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="mt-16">
          <h2 className="text-center font-display text-2xl font-bold text-slate-800 sm:text-3xl">
            What we believe
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="card-fun flex gap-4 p-5">
                <div className="text-4xl">{v.emoji}</div>
                <div>
                  <h3 className="font-display text-lg font-bold text-slate-800">
                    {v.title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Maker + CTA */}
        <section className="mt-16 text-center">
          <p className="text-slate-500">
            SummerSharp is designed and built by{" "}
            <a
              href="https://netixsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[var(--brand-blue)] hover:underline"
            >
              Netix Solutions, LLC
            </a>
            .
          </p>
          <Link
            href="/signup"
            className="btn-pop mt-5 inline-flex px-7 py-3 text-lg font-extrabold text-white"
            style={{ background: "linear-gradient(90deg, var(--brand-sun), var(--brand-orange))" }}
          >
            Try it free for a week →
          </Link>
        </section>
      </main>
    </>
  );
}
