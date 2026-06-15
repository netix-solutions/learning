import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { listInvoices, type InvoiceLine } from "@/lib/billing-info";
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
  last_sign_in_at: string | null;
  created_at: string;
  attempts: number;
  correct: number;
  accuracy: number;
  total_minutes: number;
  active_days: number;
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

  const [profiles, attempts, links, usage] = await Promise.all([
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
    fetchAllRows((from, to) =>
      db.from("daily_usage").select("child_id, seconds, day").range(from, to),
    ),
  ]);

  // Emails and last-login live in auth.users, not profiles. listUsers caps at
  // perPage 1000, so page through until a short page comes back.
  const emailById = new Map<string, string | null>();
  const lastSignInById = new Map<string, string | null>();
  for (let pageNum = 1; ; pageNum++) {
    const { data, error } = await db.auth.admin.listUsers({ page: pageNum, perPage: 1000 });
    const users = data?.users ?? [];
    if (error || users.length === 0) break;
    for (const u of users) {
      emailById.set(u.id, u.email ?? null);
      lastSignInById.set(u.id, u.last_sign_in_at ?? null);
    }
    if (users.length < 1000) break;
  }

  const statsById = new Map<string, { attempts: number; correct: number }>();
  for (const a of attempts) {
    const cur = statsById.get(a.student_id) ?? { attempts: 0, correct: 0 };
    cur.attempts += 1;
    if (a.is_correct) cur.correct += 1;
    statsById.set(a.student_id, cur);
  }

  // Active time on the app: sum daily_usage seconds per child, and count the
  // distinct days they showed up (a quick engagement signal).
  const usageById = new Map<string, { seconds: number; days: number }>();
  for (const r of usage) {
    const cur = usageById.get(r.child_id) ?? { seconds: 0, days: 0 };
    cur.seconds += r.seconds ?? 0;
    cur.days += 1;
    usageById.set(r.child_id, cur);
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
    const usage = usageById.get(p.id) ?? { seconds: 0, days: 0 };
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
      last_sign_in_at: lastSignInById.get(p.id) ?? null,
      created_at: p.created_at,
      attempts: s.attempts,
      correct: s.correct,
      accuracy:
        s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0,
      total_minutes: Math.round(usage.seconds / 60),
      active_days: usage.days,
      parent_name: parentNameByChild.get(p.id) ?? null,
      child_count: childCountByParent.get(p.id) ?? 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Billing (service-role; bypasses RLS so the operator can see every family)
// ---------------------------------------------------------------------------

export type AdminSubscription = {
  parentId: string;
  name: string;
  email: string | null;
  status: string;
  seats: number;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  updatedAt: string | null;
};

const SUB_COLUMNS =
  "parent_id, status, seats, current_period_end, trial_end, cancel_at_period_end, stripe_customer_id, stripe_subscription_id, updated_at";

type SubRow = {
  parent_id: string;
  status: string;
  seats: number | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancel_at_period_end: boolean | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string | null;
};

function toAdminSub(row: SubRow, name: string, email: string | null): AdminSubscription {
  return {
    parentId: row.parent_id,
    name,
    email,
    status: row.status,
    seats: row.seats ?? 0,
    currentPeriodEnd: row.current_period_end,
    trialEnd: row.trial_end,
    cancelAtPeriodEnd: row.cancel_at_period_end ?? false,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    updatedAt: row.updated_at,
  };
}

/** Every subscription row, with the parent's name + email, newest activity first. */
export async function getAdminSubscriptions(): Promise<AdminSubscription[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select(SUB_COLUMNS)
    .order("updated_at", { ascending: false });
  const rows = (data ?? []) as SubRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.parent_id);
  const { data: profs } = await db
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);
  const nameById = new Map((profs ?? []).map((p) => [p.id, p.display_name]));

  const emailEntries = await Promise.all(
    ids.map(async (id) => {
      const { data: u } = await db.auth.admin.getUserById(id);
      return [id, u?.user?.email ?? null] as const;
    }),
  );
  const emailById = new Map(emailEntries);

  return rows.map((r) =>
    toAdminSub(r, nameById.get(r.parent_id) ?? "(unknown)", emailById.get(r.parent_id) ?? null),
  );
}

export type ParentBilling = {
  parentId: string;
  name: string;
  email: string | null;
  sub: AdminSubscription | null;
  invoices: InvoiceLine[];
};

/** Full billing detail for one parent: subscription state + Stripe invoices. */
export async function getParentBilling(parentId: string): Promise<ParentBilling | null> {
  const db = createAdminClient();
  const { data: profile } = await db
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", parentId)
    .maybeSingle();
  if (!profile || profile.role !== "parent") return null;

  const { data: u } = await db.auth.admin.getUserById(parentId);
  const email = u?.user?.email ?? null;

  const { data: row } = await db
    .from("subscriptions")
    .select(SUB_COLUMNS)
    .eq("parent_id", parentId)
    .maybeSingle();

  const sub = row ? toAdminSub(row as SubRow, profile.display_name, email) : null;
  const invoices = await listInvoices(sub?.stripeCustomerId);

  return { parentId, name: profile.display_name, email, sub, invoices };
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

export type AdminCoupon = {
  code: string;
  kind: "free" | "trial_days";
  description: string | null;
  maxKids: number | null;
  trialDays: number | null;
  active: boolean;
  maxRedemptions: number | null;
  redeemedCount: number;
  expiresAt: string | null;
  createdAt: string;
};

/** Every coupon, newest first, for the admin coupons page. */
export async function getAdminCoupons(): Promise<AdminCoupon[]> {
  const db = createAdminClient();
  const { data } = await db
    .from("coupons")
    .select(
      "code, kind, description, max_kids, trial_days, active, max_redemptions, redeemed_count, expires_at, created_at",
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((r) => ({
    code: r.code,
    kind: r.kind,
    description: r.description,
    maxKids: r.max_kids,
    trialDays: r.trial_days,
    active: r.active,
    maxRedemptions: r.max_redemptions,
    redeemedCount: r.redeemed_count,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }));
}
