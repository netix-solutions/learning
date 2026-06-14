import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { InstallHint } from "@/components/InstallHint";

export default async function Home() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col items-center px-5 py-10">
      <BrandLogo variant="full" href={null} />

      <h1 className="mt-6 text-center font-display text-2xl font-semibold text-slate-700 sm:text-3xl">
        Keep your brain <span style={{ color: "var(--brand-orange)" }}>sunny</span> and{" "}
        <span style={{ color: "var(--brand-blue)" }}>sharp</span> all summer! ☀️
      </h1>
      <p className="mt-3 max-w-xl text-center text-lg text-slate-600">
        Fun daily math &amp; reading for Florida kids in grades K–5. Earn XP,
        build a streak, and unlock badges.
      </p>

      <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
        <Link
          href="/kids"
          className="btn-pop card-fun group flex flex-col items-center gap-2 px-6 py-8 text-center"
        >
          <span className="text-6xl transition-transform group-hover:scale-110">🎒</span>
          <span className="font-display text-2xl font-bold text-slate-800">
            I&apos;m a Kid
          </span>
          <span className="text-slate-500">Log in and start playing!</span>
        </Link>

        <Link
          href="/login"
          className="btn-pop card-fun group flex flex-col items-center gap-2 px-6 py-8 text-center"
        >
          <span className="text-6xl transition-transform group-hover:scale-110">👋</span>
          <span className="font-display text-2xl font-bold text-slate-800">
            I&apos;m a Grown-Up
          </span>
          <span className="text-slate-500">Check on your learner.</span>
        </Link>
      </div>

      <p className="mt-8 text-center text-slate-600">
        New here?{" "}
        <Link
          href="/signup"
          className="font-bold underline decoration-2 underline-offset-2"
          style={{ color: "var(--brand-blue)" }}
        >
          Create a free family account
        </Link>
      </p>

      <InstallHint />

      <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-slate-500">
        <span>🌴 Made for Florida B.E.S.T. K–5</span>
        <span>🔥 Daily streaks</span>
        <span>🏆 Badges to unlock</span>
        <span>👪 Parent dashboard</span>
      </div>
    </main>
  );
}
