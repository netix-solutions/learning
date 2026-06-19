import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminStats, isAdminAuthed } from "@/lib/admin";
import { isBillingOn } from "@/lib/settings";
import { AdminShell } from "@/components/AdminShell";
import { BillingToggle } from "@/components/admin/BillingToggle";
import { subjectTheme } from "@/lib/types";

export const metadata = { title: "Dashboard · SummerSharp Admin" };
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const stats = await getAdminStats();
  const totalUsers = stats.parents + stats.students;
  const billingOn = await isBillingOn();

  return (
    <AdminShell active="dashboard">
      <h1 className="font-display text-3xl font-bold text-slate-800">
        Dashboard
      </h1>
      <p className="mt-1 text-slate-500">
        Live overview of accounts, learning activity, and content.
      </p>

      <BillingToggle enabled={billingOn} />

      {/* Headline metrics */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total users" value={totalUsers} accent="blue"
          sub={`${stats.parents} parents · ${stats.students} students`} />
        <StatCard label="New this week" value={stats.newUsers7d} accent="green"
          sub="signed up in last 7 days" />
        <StatCard label="Active today" value={stats.activeToday} accent="orange"
          sub="practiced today" />
        <StatCard label="Questions answered" value={stats.attempts.toLocaleString()} accent="purple"
          sub={`${stats.accuracy}% correct`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Correct answers" value={stats.correct.toLocaleString()} accent="green" />
        <StatCard label="Overall accuracy" value={`${stats.accuracy}%`} accent="blue" />
        <StatCard label="Questions in bank" value={stats.questions.toLocaleString()} accent="orange" />
        <StatCard label="Subjects" value={stats.subjects.length} accent="purple" />
      </div>

      {/* Subject breakdown */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-bold text-slate-800">
          By subject
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {stats.subjects.map((s) => {
            const theme = subjectTheme(s.color);
            const acc =
              s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;
            return (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${theme.gradient} text-2xl`}
                  >
                    {s.emoji}
                  </div>
                  <div>
                    <div className="font-display text-lg font-bold text-slate-800">
                      {s.name}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {s.questions.toLocaleString()} questions
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <div className={`font-display text-2xl font-bold ${theme.text}`}>
                      {acc}%
                    </div>
                    <div className="text-xs font-semibold text-slate-400">
                      accuracy
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-slate-500">
                  {s.attempts.toLocaleString()} attempts ·{" "}
                  {s.correct.toLocaleString()} correct
                </div>
              </div>
            );
          })}
          {stats.subjects.length === 0 && (
            <p className="text-slate-500">No subjects configured yet.</p>
          )}
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/admin/users"
          className="btn-pop inline-block bg-white px-5 py-2.5 text-sm font-bold text-[var(--brand-blue)] ring-2 ring-blue-100"
        >
          Manage users →
        </Link>
      </div>
    </AdminShell>
  );
}

const ACCENTS: Record<string, string> = {
  blue: "text-[var(--brand-blue)]",
  green: "text-emerald-600",
  orange: "text-orange-600",
  purple: "text-purple-600",
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: keyof typeof ACCENTS | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-1 font-display text-3xl font-bold ${ACCENTS[accent] ?? ACCENTS.blue}`}>
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}
