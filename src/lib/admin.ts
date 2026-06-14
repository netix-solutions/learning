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

/** Headline counts + per-subject breakdown for the dashboard. */
export async function getAdminStats(): Promise<AdminStats> {
  const db = createAdminClient();

  const [
    profilesRes,
    attemptsRes,
    subjectsRes,
    questionsRes,
  ] = await Promise.all([
    db.from("profiles").select("role, created_at, last_active_date"),
    db.from("attempts").select("subject_id, is_correct"),
    db.from("subjects").select("id, name, emoji, color, sort").order("sort"),
    db.from("questions").select("subject_id"),
  ]);

  const profiles = profilesRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const subjects = subjectsRes.data ?? [];
  const questions = questionsRes.data ?? [];

  const today = todayISO();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const parents = profiles.filter((p) => p.role === "parent").length;
  const students = profiles.filter((p) => p.role === "student").length;
  const newUsers7d = profiles.filter((p) => p.created_at >= weekAgo).length;
  const activeToday = profiles.filter(
    (p) => p.last_active_date === today,
  ).length;

  const correct = attempts.filter((a) => a.is_correct).length;
  const accuracy =
    attempts.length > 0 ? Math.round((correct / attempts.length) * 100) : 0;

  const qBySubject = new Map<string, number>();
  for (const q of questions)
    qBySubject.set(q.subject_id, (qBySubject.get(q.subject_id) ?? 0) + 1);

  const aBySubject = new Map<string, { attempts: number; correct: number }>();
  for (const a of attempts) {
    const cur = aBySubject.get(a.subject_id) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (a.is_correct) cur.correct += 1;
    aBySubject.set(a.subject_id, cur);
  }

  return {
    parents,
    students,
    newUsers7d,
    attempts: attempts.length,
    correct,
    accuracy,
    questions: questions.length,
    activeToday,
    subjects: subjects.map((s) => ({
      id: s.id,
      name: s.name,
      emoji: s.emoji,
      color: s.color,
      questions: qBySubject.get(s.id) ?? 0,
      attempts: aBySubject.get(s.id)?.attempts ?? 0,
      correct: aBySubject.get(s.id)?.correct ?? 0,
    })),
  };
}

/** Every user with rolled-up stats, newest first. */
export async function getAdminUsers(): Promise<AdminUser[]> {
  const db = createAdminClient();

  const [profilesRes, attemptsRes, linksRes, authRes] = await Promise.all([
    db
      .from("profiles")
      .select(
        "id, role, display_name, username, grade, avatar, xp, streak_count, last_active_date, created_at",
      )
      .order("created_at", { ascending: false }),
    db.from("attempts").select("student_id, is_correct"),
    db.from("parent_child").select("parent_id, child_id"),
    // Emails live in auth.users, not profiles. perPage caps at 1000 — see note
    // in the dashboard; fine at current scale.
    db.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const profiles = profilesRes.data ?? [];
  const attempts = attemptsRes.data ?? [];
  const links = linksRes.data ?? [];

  const emailById = new Map<string, string | null>();
  for (const u of authRes.data?.users ?? []) emailById.set(u.id, u.email ?? null);

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
