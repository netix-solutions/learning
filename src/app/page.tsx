import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { InstallHint } from "@/components/InstallHint";
import { BeachScene } from "@/components/BeachScene";

const PILLS = [
  { emoji: "🌴", label: "Made for Florida B.E.S.T. K–5" },
  { emoji: "🔥", label: "Daily streaks" },
  { emoji: "🏆", label: "Badges to unlock" },
  { emoji: "👪", label: "Parent dashboard" },
];

export default async function Home() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-5xl flex-col items-center px-5 py-10">
      <BeachScene />

      {/* Content sits above the decorative beach layer. */}
      <div className="relative z-10 flex w-full flex-col items-center">
        <div className="animate-rise">
          <BrandLogo variant="full" href={null} />
        </div>

        <h1 className="animate-rise delay-1 mt-6 text-center font-display text-2xl font-semibold text-slate-700 sm:text-3xl">
          Keep your brain <span className="shimmer-orange">sunny</span> and{" "}
          <span className="shimmer-blue">sharp</span> all summer!{" "}
          <span className="inline-block animate-wiggle">☀️</span>
        </h1>
        <p className="animate-rise delay-2 mt-3 max-w-xl text-center text-lg text-slate-600">
          Fun daily math &amp; reading for Florida kids in grades K–5. Earn XP,
          build a streak, and unlock badges.
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          <Link
            href="/kids"
            className="btn-pop card-fun group animate-rise delay-3 flex flex-col items-center gap-2 px-6 py-8 text-center transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-[-1deg]"
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
            className="btn-pop card-fun group animate-rise delay-4 flex flex-col items-center gap-2 px-6 py-8 text-center transition-transform duration-200 hover:-translate-y-1.5 hover:rotate-[1deg]"
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

        <p className="animate-rise delay-5 mt-8 text-center text-slate-600">
          New here?{" "}
          <Link
            href="/signup"
            className="font-bold underline decoration-2 underline-offset-2 transition-colors hover:text-[var(--brand-orange)]"
            style={{ color: "var(--brand-blue)" }}
          >
            Create a free family account
          </Link>
        </p>

        <div className="animate-rise delay-5">
          <InstallHint />
        </div>

        <div className="animate-rise delay-6 mt-12 flex flex-wrap items-center justify-center gap-3">
          {PILLS.map((p) => (
            <span
              key={p.label}
              className="flex items-center gap-1.5 rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-sm transition-transform hover:-translate-y-0.5 hover:bg-white"
            >
              <span className="text-base">{p.emoji}</span>
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
