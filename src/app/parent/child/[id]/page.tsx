import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { SignOutButton } from "@/components/SignOutButton";
import { XpBar } from "@/components/XpBar";
import { subjectTheme, type StudentSummary } from "@/lib/types";

export default async function ChildDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/login");
  if (profile?.role !== "parent") redirect("/home");

  // RLS (can_view_student) blocks children that aren't this parent's.
  const { data, error } = await supabase.rpc("get_student_summary", {
    p_student_id: id,
  });
  if (error || !data) redirect("/parent");
  const s = data as StudentSummary;
  const emojiFor = new Map(s.subjects.map((x) => [x.subject_id, x.emoji]));

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between">
        <BrandLogo href={null} />
        <SignOutButton />
      </header>

      <Link href="/parent" className="font-bold text-slate-500 hover:text-slate-700">
        ← All kids
      </Link>

      {/* Hero */}
      <section className="card-fun mt-3 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-amber-100 text-5xl ring-4 ring-white">
            {s.profile.avatar}
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-800">
              {s.profile.display_name}
            </h1>
            <p className="font-semibold text-slate-500">
              Grade {s.profile.grade} · 🔥 {s.profile.streak_count} day streak
            </p>
          </div>
        </div>
        <div className="mt-5">
          <XpBar xp={s.profile.xp} />
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Questions" value={s.totals.attempts} />
          <Stat label="Correct" value={s.totals.correct} />
          <Stat label="Accuracy" value={`${s.totals.accuracy}%`} />
        </div>
      </section>

      {/* Subjects */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">By subject</h2>
      <div className="space-y-3">
        {s.subjects.map((sub) => {
          const theme = subjectTheme(sub.color);
          const pct = sub.attempts > 0 ? Math.round((sub.correct / sub.attempts) * 100) : 0;
          return (
            <div key={sub.subject_id} className="card-fun p-4">
              <div className="mb-2 flex items-center justify-between font-bold text-slate-700">
                <span>
                  {sub.emoji} {sub.name}
                </span>
                <span className="text-sm text-slate-500">
                  {sub.attempts > 0 ? `${sub.correct}/${sub.attempts} correct` : "Not started"}
                </span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.gradient}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">
        Badges earned ({s.badges.length})
      </h2>
      {s.badges.length === 0 ? (
        <p className="card-fun p-5 text-slate-500">No badges yet — keep practicing! 🌱</p>
      ) : (
        <div className="card-fun grid grid-cols-3 gap-3 p-5 sm:grid-cols-4">
          {s.badges.map((b) => (
            <div key={b.id} className="flex flex-col items-center gap-1 text-center" title={b.description}>
              <span className="text-4xl">{b.emoji}</span>
              <span className="text-xs font-bold text-slate-600">{b.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-700">Recent activity</h2>
      {s.recent.length === 0 ? (
        <p className="card-fun p-5 text-slate-500">Nothing yet today.</p>
      ) : (
        <div className="card-fun divide-y divide-slate-100 p-2">
          {s.recent.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2">
              <span className="text-2xl">{emojiFor.get(r.subject_id) ?? "📘"}</span>
              <span className="font-semibold text-slate-600">
                {r.is_correct ? "Correct" : "Tried"}
              </span>
              <span className="ml-auto text-sm font-bold text-slate-400">
                {r.is_correct ? `+${r.xp_earned} XP` : "—"} {r.is_correct ? "✅" : "❌"}
              </span>
            </div>
          ))}
        </div>
      )}
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
