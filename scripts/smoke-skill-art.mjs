// RLS smoke test for skill_art: students must see ONLY approved rows.
// Creates a throwaway student, checks visibility before/after approving one
// row (service role flips it back), then cleans up.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-skill-art.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) {
  console.error("Need PROD_URL, PROD_KEY, ANON_KEY.");
  process.exit(1);
}

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `art-smoke-${Date.now()}@example.com`;
const password = `Smoke-${crypto.randomUUID()}`;
let userId;
let flipped;

function assert(cond, label) {
  if (cond) console.log(`✓ ${label}`);
  else {
    console.error(`✗ FAIL: ${label}`);
    process.exitCode = 1;
  }
}

try {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "student", display_name: "Art Smoke", grade: "3" },
  });
  if (error) throw error;
  userId = created.user.id;

  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  await kid.auth.signInWithPassword({ email, password });

  const { count: pendingTotal } = await admin
    .from("skill_art")
    .select("*", { count: "exact", head: true })
    .neq("status", "approved");
  const { data: visibleBefore } = await kid
    .from("skill_art")
    .select("id, status");
  assert(
    (visibleBefore ?? []).every((r) => r.status === "approved"),
    `student sees 0 non-approved rows (${pendingTotal} exist)`,
  );

  // Approve one row and confirm it appears.
  const { data: one } = await admin
    .from("skill_art")
    .select("id, status")
    .eq("status", "pending")
    .limit(1)
    .single();
  if (one) {
    flipped = one.id;
    await admin.from("skill_art").update({ status: "approved" }).eq("id", one.id);
    const { data: visibleAfter } = await kid
      .from("skill_art")
      .select("id")
      .eq("id", one.id);
    assert(visibleAfter?.length === 1, "approving a row makes it visible to students");
  } else {
    console.log("↷ no pending rows to flip — skipped visibility-flip check");
  }

  // Students cannot write.
  const { error: writeErr } = await kid
    .from("skill_art")
    .update({ status: "approved" })
    .neq("status", "approved");
  const { count: stillPending } = await admin
    .from("skill_art")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");
  assert(
    writeErr != null || (pendingTotal ?? 0) - 1 <= (stillPending ?? 0),
    "students cannot update skill_art",
  );
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (flipped) await admin.from("skill_art").update({ status: "pending" }).eq("id", flipped);
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user (and reverted the flipped row)");
  }
}
