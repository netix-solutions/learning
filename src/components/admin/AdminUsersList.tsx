"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin";
import { adminSetParentPhone } from "@/app/actions/admin";
import { Avatar } from "@/components/Avatar";
import { DeleteUserButton } from "@/components/DeleteUserButton";

type SortDir = "asc" | "desc";
type SortType = "num" | "date" | "text";
type SortOption = {
  key: string;
  label: string;
  type: SortType;
  get: (u: AdminUser) => number | string | null;
};

const PARENT_SORTS: SortOption[] = [
  { key: "joined", label: "Joined", type: "date", get: (u) => u.created_at },
  { key: "last_login", label: "Last login", type: "date", get: (u) => u.last_sign_in_at },
  { key: "children", label: "Children", type: "num", get: (u) => u.child_count },
  { key: "family_time", label: "Family time", type: "num", get: (u) => u.family_minutes },
  { key: "family_xp", label: "Family XP", type: "num", get: (u) => u.family_xp },
  { key: "name", label: "Name", type: "text", get: (u) => u.display_name },
];

const STUDENT_SORTS: SortOption[] = [
  { key: "joined", label: "Joined", type: "date", get: (u) => u.created_at },
  { key: "time", label: "Time on app", type: "num", get: (u) => u.total_minutes },
  { key: "days", label: "Days on", type: "num", get: (u) => u.active_days },
  { key: "xp", label: "XP", type: "num", get: (u) => u.xp },
  { key: "streak", label: "Streak", type: "num", get: (u) => u.streak_count },
  { key: "answered", label: "Answered", type: "num", get: (u) => u.attempts },
  { key: "accuracy", label: "Accuracy", type: "num", get: (u) => u.accuracy },
  { key: "active", label: "Last active", type: "date", get: (u) => u.last_active_date },
  { key: "last_login", label: "Last login", type: "date", get: (u) => u.last_sign_in_at },
  { key: "name", label: "Name", type: "text", get: (u) => u.display_name },
];

function compare(a: AdminUser, b: AdminUser, opt: SortOption, dir: SortDir) {
  const mult = dir === "asc" ? 1 : -1;
  if (opt.type === "text") {
    return mult * String(opt.get(a) ?? "").localeCompare(String(opt.get(b) ?? ""));
  }
  // num + date both reduce to a number; nulls/empties sort to the bottom.
  const toNum = (v: number | string | null) => {
    if (v == null) return -Infinity;
    return opt.type === "date" ? new Date(v).getTime() : Number(v);
  };
  const av = toNum(opt.get(a));
  const bv = toNum(opt.get(b));
  if (av === bv) return 0;
  return mult * (av < bv ? -1 : 1);
}

function useSorted(rows: AdminUser[], options: SortOption[]) {
  const [key, setKey] = useState(options[0].key);
  const [dir, setDir] = useState<SortDir>("desc");
  const opt = options.find((o) => o.key === key) ?? options[0];
  const sorted = useMemo(
    () => [...rows].sort((a, b) => compare(a, b, opt, dir)),
    [rows, opt, dir],
  );
  return { sorted, key, setKey, dir, setDir };
}

function SortControl({
  options,
  value,
  onValue,
  dir,
  onDir,
}: {
  options: SortOption[];
  value: string;
  onValue: (k: string) => void;
  dir: SortDir;
  onDir: (d: SortDir) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Sort
      </label>
      <select
        value={value}
        onChange={(e) => onValue(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-semibold text-slate-700"
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onDir(dir === "asc" ? "desc" : "asc")}
        aria-label={dir === "asc" ? "Ascending" : "Descending"}
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-bold text-slate-600 hover:bg-slate-50"
      >
        {dir === "asc" ? "↑" : "↓"}
      </button>
    </div>
  );
}

/** Match a user against a search query by name, email, phone, or username. */
function matches(u: AdminUser, q: string, qDigits: string) {
  if (!q) return true;
  const hay = `${u.display_name} ${u.email ?? ""} ${u.username ?? ""}`.toLowerCase();
  if (hay.includes(q)) return true;
  // Phone match ignores formatting so a dialed number finds the family.
  if (qDigits && u.phone) return u.phone.replace(/\D/g, "").includes(qDigits);
  return false;
}

export function AdminUsersList({
  parents,
  students,
}: {
  parents: AdminUser[];
  students: AdminUser[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const qDigits = query.replace(/\D/g, "");

  const filteredParents = useMemo(
    () => parents.filter((u) => matches(u, q, qDigits)),
    [parents, q, qDigits],
  );
  const filteredStudents = useMemo(
    () => students.filter((u) => matches(u, q, qDigits)),
    [students, q, qDigits],
  );

  const p = useSorted(filteredParents, PARENT_SORTS);
  const s = useSorted(filteredStudents, STUDENT_SORTS);

  return (
    <>
      <div className="mt-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, or username…"
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-slate-700 outline-none focus:border-[var(--brand-blue)]"
        />
      </div>

      <Section
        title="👨‍👩‍👧 Parents"
        empty={q ? "No parents match your search." : "No parent accounts yet."}
        count={p.sorted.length}
        control={
          <SortControl
            options={PARENT_SORTS}
            value={p.key}
            onValue={p.setKey}
            dir={p.dir}
            onDir={p.setDir}
          />
        }
      >
        {p.sorted.map((u) => (
          <ParentRow key={u.id} u={u} />
        ))}
      </Section>

      <Section
        title="🎒 Students"
        empty={q ? "No students match your search." : "No student accounts yet."}
        count={s.sorted.length}
        control={
          <SortControl
            options={STUDENT_SORTS}
            value={s.key}
            onValue={s.setKey}
            dir={s.dir}
            onDir={s.setDir}
          />
        }
      >
        {s.sorted.map((u) => (
          <StudentRow key={u.id} u={u} />
        ))}
      </Section>
    </>
  );
}

function Section({
  title,
  empty,
  count,
  control,
  children,
}: {
  title: string;
  empty: string;
  count: number;
  control: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-slate-800">{title}</h2>
        {count > 0 && control}
      </div>
      {count > 0 ? (
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
        <div className="truncate text-sm text-slate-500">{u.email ?? "—"}</div>
        <PhoneEditor parentId={u.id} phone={u.phone} />
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-center">
        <Cell label="Children" value={u.child_count} />
        <Cell label="Family time" value={fmtMinutes(u.family_minutes)} />
        <Cell label="Family XP" value={u.family_xp} />
        <Cell label="Last login" value={u.last_sign_in_at ? fmtDate(u.last_sign_in_at) : "never"} />
        <Cell label="Joined" value={fmtDate(u.created_at)} />
        <Link
          href={`/admin/billing/${u.id}`}
          className="text-xs font-bold text-[var(--brand-blue)] hover:underline"
        >
          Billing
        </Link>
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
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-5 gap-y-2 text-center">
        <Cell label="Time" value={fmtMinutes(u.total_minutes)} />
        <Cell label="Days on" value={u.active_days} />
        <Cell label="XP" value={u.xp} />
        <Cell label="Streak" value={`🔥${u.streak_count}`} />
        <Cell label="Answered" value={u.attempts} />
        <Cell label="Accuracy" value={`${u.accuracy}%`} />
        <Cell label="Active" value={u.last_active_date ? fmtDate(u.last_active_date) : "never"} />
        <Cell label="Last login" value={u.last_sign_in_at ? fmtDate(u.last_sign_in_at) : "never"} />
        <DeleteUserButton userId={u.id} name={u.display_name} />
      </div>
    </div>
  );
}

/** Inline phone display + operator editor for a parent row. */
function PhoneEditor({ parentId, phone }: { parentId: string; phone: string | null }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(phone ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setErr(null);
    const res = await adminSetParentPhone(parentId, value);
    setSaving(false);
    if (res.error) {
      setErr(res.error);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-sm">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          type="tel"
          inputMode="tel"
          placeholder="(813) 555-1234"
          autoFocus
          className="w-40 rounded-lg border border-slate-300 px-2 py-1 outline-none focus:border-[var(--brand-blue)]"
        />
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-[var(--brand-blue)] px-2 py-1 text-xs font-bold text-white disabled:opacity-50"
        >
          {saving ? "…" : "Save"}
        </button>
        <button
          onClick={() => {
            setEditing(false);
            setValue(phone ?? "");
            setErr(null);
          }}
          className="text-xs font-semibold text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
        {err && <span className="w-full text-xs font-semibold text-red-600">{err}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {phone ? (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="font-semibold text-[var(--brand-blue)] hover:underline"
        >
          {phone}
        </a>
      ) : (
        <span className="text-slate-400">no phone on file</span>
      )}
      <button
        onClick={() => setEditing(true)}
        className="text-xs font-semibold text-slate-400 underline transition-colors hover:text-slate-700"
      >
        edit
      </button>
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

/** Total active minutes → compact "2h 5m" / "45m" / "—". */
function fmtMinutes(mins: number) {
  if (!mins) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
