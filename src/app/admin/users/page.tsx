import { redirect } from "next/navigation";
import { getAdminUsers, isAdminAuthed, type AdminUser } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { Avatar } from "@/components/Avatar";
import { DeleteUserButton } from "@/components/DeleteUserButton";

export const metadata = { title: "Users · SummerSharp Admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const users = await getAdminUsers();
  const parents = users.filter((u) => u.role === "parent");
  const students = users.filter((u) => u.role === "student");

  return (
    <AdminShell active="users">
      <h1 className="font-display text-3xl font-bold text-slate-800">Users</h1>
      <p className="mt-1 text-slate-500">
        {users.length} total · {parents.length} parents · {students.length} students
      </p>

      <Section title="👨‍👩‍👧 Parents" empty="No parent accounts yet.">
        {parents.map((u) => (
          <ParentRow key={u.id} u={u} />
        ))}
      </Section>

      <Section title="🎒 Students" empty="No student accounts yet.">
        {students.map((u) => (
          <StudentRow key={u.id} u={u} />
        ))}
      </Section>
    </AdminShell>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.some(Boolean) && items.length > 0;
  return (
    <section className="mt-8">
      <h2 className="mb-3 font-display text-xl font-bold text-slate-800">
        {title}
      </h2>
      {hasItems ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {children}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
          {empty}
        </p>
      )}
    </section>
  );
}

function ParentRow({ u }: { u: AdminUser }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
        <Avatar id={u.avatar} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-bold text-slate-800">{u.display_name}</div>
        <div className="truncate text-sm text-slate-500">
          {u.email ?? "—"}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-6 text-center">
        <Cell label="Children" value={u.child_count} />
        <Cell label="Joined" value={fmtDate(u.created_at)} />
        <DeleteUserButton userId={u.id} name={u.display_name} />
      </div>
    </div>
  );
}

function StudentRow({ u }: { u: AdminUser }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0">
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl bg-amber-100">
        <Avatar id={u.avatar} className="h-full w-full" />
      </div>
      <div className="min-w-0">
        <div className="truncate font-bold text-slate-800">
          {u.display_name}{" "}
          <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-500">
            {u.username}
          </span>
        </div>
        <div className="truncate text-sm text-slate-500">
          Grade {u.grade ?? "—"}
          {u.parent_name ? ` · parent: ${u.parent_name}` : ""}
        </div>
      </div>
      <div className="ml-auto flex items-center gap-6 text-center">
        <Cell label="XP" value={u.xp} />
        <Cell label="Streak" value={`🔥${u.streak_count}`} />
        <Cell label="Answered" value={u.attempts} />
        <Cell label="Accuracy" value={`${u.accuracy}%`} />
        <Cell label="Active" value={u.last_active_date ? fmtDate(u.last_active_date) : "never"} />
        <DeleteUserButton userId={u.id} name={u.display_name} />
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="hidden sm:block">
      <div className="font-display text-sm font-bold text-slate-800">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
