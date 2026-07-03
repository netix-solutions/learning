// Repetition test for the adaptive picker: a throwaway grade-2 student plays
// many rounds (answering wrong a lot, which used to trap the picker in one
// weak skill's small pool) and we measure repeats and skill mix.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-freshness.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) {
  console.error("Need PROD_URL, PROD_KEY, ANON_KEY.");
  process.exit(1);
}

const ROUNDS = 10;
const PER_ROUND = 6;

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `fresh-smoke-${Date.now()}@example.com`;
const password = `Smoke-${crypto.randomUUID()}`;
let userId;

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
    user_metadata: { role: "student", display_name: "Fresh Smoke", grade: "2" },
  });
  if (error) throw error;
  userId = created.user.id;

  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  await kid.auth.signInWithPassword({ email, password });

  const servedCounts = new Map(); // question id -> times served
  const skillsPerRound = [];

  for (let r = 0; r < ROUNDS; r++) {
    const { data: qs, error: qErr } = await kid.rpc("get_adaptive_questions", {
      p_subject: "science", // smallest grade-2 pool of the daily-mix subjects
      p_grade: "2",
      p_count: PER_ROUND,
    });
    if (qErr) throw qErr;
    skillsPerRound.push(new Set(qs.map((q) => q.skill)).size);
    for (const q of qs) {
      servedCounts.set(q.id, (servedCounts.get(q.id) ?? 0) + 1);
      // Answer (wrong on purpose ~half the time) so "seen" state accrues the
      // way it does for a real struggling kid. Non-mcq kinds may reject the
      // dummy answer — that's fine, the serve itself is what we measure.
      try {
        await kid.rpc("record_attempt", { p_question_id: q.id, p_answer: r % 2 });
      } catch {
        // non-mcq kinds may reject the dummy answer; the serve still counts
      }
    }
  }

  const served = [...servedCounts.values()].reduce((a, b) => a + b, 0);
  const distinct = servedCounts.size;
  const maxRepeat = Math.max(...servedCounts.values());
  const avgSkills = skillsPerRound.reduce((a, b) => a + b, 0) / skillsPerRound.length;

  console.log(
    `served ${served} · distinct ${distinct} · max repeats of one question ${maxRepeat} · avg skills/round ${avgSkills.toFixed(1)}`,
  );
  // Pool is 139; 60 serves should be almost all unique now.
  assert(distinct >= served * 0.95, `≥95% of serves are unique (${distinct}/${served})`);
  assert(maxRepeat <= 2, `no question served more than twice (max ${maxRepeat})`);
  assert(avgSkills >= 3, `rounds mix ≥3 skills on average (${avgSkills.toFixed(1)})`);
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user");
  }
}
