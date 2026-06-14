import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Grade, Role } from "@/lib/types";

/**
 * Admin area auth + data.
 *
 * The admin is intentionally NOT a Supabase user. Parents/students live behind
 * RLS that only ever exposes a single family's data — exactly what an operator
 * dashboard must see *past*. So the admin signs in against a single set of
 * credentials (env-configured) and gets an HMAC-signed, httpOnly session
 * cookie; every admin data read then goes through the service-role client,
 * which bypasses RLS. No schema changes, no `admin` role to provision.
 */

export const ADMIN_COOKIE = "ss_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

// Credentials default to the values requested for this build so the dashboard
// works out-of-the-box, but are overridable via env for the live deploy.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "email@netixsolutions.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "NetixSolutions2026!";
// Signing secret for the session cookie. Falls back to the password so the
// cookie can't be forged without knowing the credentials, but SHOULD be set to
// an independent random value in production.
const ADMIN_SECRET =
  process.env.ADMIN_SECRET ?? `ss-admin-${ADMIN_PASSWORD}`;

/** Constant-time string compare that won't throw on length mismatch. */
function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // Compare against self to keep timing roughly constant, then fail.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

/** True only if the email + password match the configured admin credentials. */
export function verifyAdminCredentials(email: string, password: string) {
  return (
    safeEqual(email.trim().toLowerCase(), ADMIN_EMAIL.toLowerCase()) &&
    safeEqual(password, ADMIN_PASSWORD)
  );
}

function sign(payload: string) {
  return createHmac("sha256", ADMIN_SECRET).update(payload).digest("base64url");
}

/** Build a signed `<exp>.<sig>` session token that expires after the TTL. */
export function createAdminToken(now = Date.now()) {
  const exp = String(now + SESSION_TTL_MS);
  return `${exp}.${sign(exp)}`;
}

/** Validate a session token: correct signature AND not past its expiry. */
export function verifyAdminToken(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(exp))) return false;
  const expMs = Number(exp);
  return Number.isFinite(expMs) && expMs > now;
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdminAuthed() {
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

// ---------------------------------------------------------------------------
// Dashboard data (service-role; bypasses RLS)
// ---------------------------------------------------------------------------

export type AdminStats = {
  parents: number;
  students: number;
  newUsers7d: number;
  attempts: number;
  correct: number;
  accuracy: number;
  questions: number;
  activeToday: number;
  subjects: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    questions: number;
    attempts: number;
    correct: number;
  }[];
};

export type AdminUser = {
  id: string;
  role: Role;
  display_name: string;
  username: string | null;
  email: string | null;
  grade: Grade | null;
  avatar: string;
  xp: number;
  streak_count: number;
  last_active_date: string | null;
  created_at: string;
  attempts: number;
  correct: number;
  accuracy: number;
  parent_name: string | null;
  child_count: number;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Page through a PostgREST select so results aren't capped at the 1000-row default. */
async function fetchAllRows<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const out: T[] = [];
  const size = 1000;
  for (let from = 0; ; from += size) {
    const { data, error } = await page(from, from + size - 1);
    if (error || !data || data.length === 0) break;
    out.push(...data);
    if (data.length < size) break;
  }
  return out;
}

/** Headline counts + per-subject breakdown for the dashboard. */
export async function getAdminStats(): Promise<AdminStats> {
  const db = createAdminClient();
  const today = todayISO();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  // Count with head queries so nothing is capped at PostgREST's 1000-row default
  // (the bank has 10k+ questions — fetching rows to count them undercounted badly).
  const countOf = (q: PromiseLike<{ count: number | null }>) =>
    Promise.resolve(q).then((r) => r.count ?? 0);
  const head = () => ({ count: "exact" as const, head: true });

  const { data: subjectRows } = await db
    .from("subjects")
    .select("id, name, emoji, color, sort")
    .order("sort");
  const subjects = subjectRows ?? [];

  const [
    parents,
    students,
    newUsers7d,
    activeToday,
    attempts,
    correct,
    questions,
    perSubject,
  ] = await Promise.all([
    countOf(db.from("profiles").select("*", head()).eq("role", "parent")),
    countOf(db.from("profiles").select("*", head()).eq("role", "student")),
    countOf(db.from("profiles").select("*", head()).gte("created_at", weekAgo)),
    countOf(db.from("profiles").select("*", head()).eq("last_active_date", today)),
    countOf(db.from("attempts").select("*", head())),
    countOf(db.from("attempts").select("*", head()).eq("is_correct", true)),
    countOf(db.from("questions").select("*", head())),
    Promise.all(
      subjects.map(async (s) => {
        const [q, a, c] = await Promise.all([
          countOf(db.from("questions").select("*", head()).eq("subject_id", s.id)),
          countOf(db.from("attempts").select("*", head()).eq("subject_id", s.id)),
          countOf(
            db.from("attempts").select("*", head()).eq("subject_id", s.id).eq("is_correct", true),
          ),
        ]);
        return {
          id: s.id, name: s.name, emoji: s.emoji, color: s.color,
          questions: q, attempts: a, correct: c,
        };
      }),
    ),
  ]);

  return {
    parents,
    students,
    newUsers7d,
    activeToday,
    attempts,
    correct,
    accuracy: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
    questions,
    subjects: perSubject,
  };
}

/** Every user with rolled-up stats, newest first. */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const db = createAdminClient();

  const [profiles, attempts, links] = await Promise.all([
    fetchAllRows((from, to) =>
      db
        .from("profiles")
        .select(
          "id, role, display_name, username, grade, avatar, xp, streak_count, last_active_date, created_at",
        )
        .order("created_at", { ascending: false })
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      db.from("attempts").select("student_id, is_correct").range(from, to),
    ),
    fetchAllRows((from, to) =>
      db.from("parent_child").select("parent_id, child_id").range(from, to),
    ),
  ]);

  // Emails live in auth.users, not profiles. listUsers caps at perPage 1000, so
  // page through until a short page comes back.
  const emailById = new Map<string, string | null>();
  for (let pageNum = 1; ; pageNum++) {
    const { data, error } = await db.auth.admin.listUsers({ page: pageNum, perPage: 1000 });
    const users = data?.users ?? [];
    if (error || users.length === 0) break;
    for (const u of users) emailById.set(u.id, u.email ?? null);
    if (users.length < 1000) break;
  }

  const statsById = new Map<string, { attempts: number; correct: number }>();
  for (const a of attempts) {
    const cur = statsById.get(a.student_id) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (a.is_correct) cur.correct += 1;
    statsById.set(a.student_id, cur);
  }

  const nameById = new Map<string, string>();
  for (const p of profiles) nameById.set(p.id, p.display_name);

  // child -> parent name, and parent -> number of children
  const parentNameByChild = new Map<string, string>();
  const childCountByParent = new Map<string, number>();
  for (const l of links) {
    const pname = nameById.get(l.parent_id);
    if (pname) parentNameByChild.set(l.child_id, pname);
    childCountByParent.set(
      l.parent_id,
      (childCountByParent.get(l.parent_id) ?? 0) + 1,
    );
  }

  return profiles.map((p) => {
    const s = statsById.get(p.id) ?? { attempts: 0, correct: 0 };
    // Students' synthetic usernames double as login; parents have real emails.
    const email =
      p.role === "parent" ? emailById.get(p.id) ?? null : null;
    return {
      id: p.id,
      role: p.role as Role,
      display_name: p.display_name,
      username: p.username,
      email,
      grade: p.grade as Grade | null,
      avatar: p.avatar,
      xp: p.xp,
      streak_count: p.streak_count,
      last_active_date: p.last_active_date,
      created_at: p.created_at,
      attempts: s.attempts,
      correct: s.correct,
      accuracy:
        s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0,
      parent_name: parentNameByChild.get(p.id) ?? null,
      child_count: childCountByParent.get(p.id) ?? 0,
    };
  });
}
