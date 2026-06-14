import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { SignOutButton } from "@/components/SignOutButton";
import { RemoveChildButton } from "@/components/RemoveChildButton";
import { OpenChildButton } from "@/components/OpenChildButton";
import { AddChildForm } from "@/components/forms/AddChildForm";
import { xpLevel } from "@/components/XpBar";
import { gradeLabel, type ChildOverview } from "@/lib/types";

export default async function ParentDashboard() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "parent") redirect("/home");

  const { data } = await supabase.rpc("get_my_children");
  const children = (data as ChildOverview[]) ?? [];

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <BrandLogo href={null} />
        <SignOutButton />
      </header>

      <h1 className="font-display text-3xl font-bold text-slate-800">
        Hi, {profile.display_name}! 👋
      </h1>
      <p className="mt-1 text-slate-500">Here&apos;s how your learners are doing.</p>

      {children.length === 0 ? (
        <div className="card-fun mt-6 p-8 text-center">
          <div className="text-6xl">🎒</div>
          <h2 className="mt-3 font-display text-2xl font-bold text-slate-800">
            Add your first child
          </h2>
          <p className="mt-1 text-slate-500">
            Create a fun username and PIN so they can log in and start learning.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {children.map((c) => {
            const accuracy =
              c.total_attempts > 0
                ? Math.round((c.total_correct / c.total_attempts) * 100)
                : 0;
            return (
              <div key={c.id} className="card-fun p-5">
                <div className="flex items-center gap-4">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-amber-100 text-4xl ring-4 ring-white">
                    {c.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-2xl font-bold text-slate-800">
                      {c.display_name}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500">
                      {gradeLabel(c.grade)} · username:{" "}
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">
                        {c.username}
                      </span>
                    </p>
                  </div>
                  <div className="ml-auto text-center">
                    <div className={`text-3xl ${c.streak_count > 0 ? "" : "opacity-40"}`}>🔥</div>
                    <div className="font-display text-lg font-bold text-slate-700">
                      {c.streak_count}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <Stat label="Level" value={xpLevel(c.xp).level} />
                  <Stat label="Correct" value={c.total_correct} />
                  <Stat label="Accuracy" value={`${accuracy}%`} />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <OpenChildButton childId={c.id} name={c.display_name} />
                  <Link
                    href={`/parent/child/${c.id}`}
                    className="btn-pop bg-white px-4 py-2 text-sm font-bold text-[var(--brand-blue)] ring-2 ring-blue-100"
                  >
                    View progress →
                  </Link>
                  <span className="ml-auto">
                    <RemoveChildButton childId={c.id} name={c.display_name} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add child */}
      <section className="card-fun mt-8 p-6 sm:p-8">
        <h2 className="mb-1 font-display text-2xl font-bold text-slate-800">
          {children.length === 0 ? "Create a child login" : "Add another child"}
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          You manage your child&apos;s login — they sign in with just a username and PIN,
          no email needed.
        </p>
        <AddChildForm />
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 py-3">
      <div className="font-display text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
