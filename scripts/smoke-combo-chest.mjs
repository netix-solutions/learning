// E2E test for the combo bonus + daily chest. A throwaway student answers
// real questions (answer key read via service role) and we assert the exact
// bonus escalation, the reset on a miss, and the chest's guards and payout.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-combo-chest.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) {
  console.error("Need PROD_URL, PROD_KEY, ANON_KEY.");
  process.exit(1);
}

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `combo-smoke-${Date.now()}@example.com`;
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
    user_metadata: { role: "student", display_name: "Combo Smoke", grade: "2" },
  });
  if (error) throw error;
  userId = created.user.id;

  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  await kid.auth.signInWithPassword({ email, password });

  // Chest is locked before any practice.
  const { data: locked } = await kid.rpc("open_daily_chest");
  assert(locked?.ok === false && locked?.error === "practice first", "chest locked before practicing");

  // Grab a batch of mcq questions + their answer keys (service role).
  const { data: qs } = await kid.rpc("get_adaptive_questions", {
    p_subject: "math",
    p_grade: "2",
    p_count: 8,
  });
  const mcq = qs.filter((q) => !q.kind || q.kind === "mcq").slice(0, 5);
  const { data: keys } = await admin
    .from("questions")
    .select("id, answer_index, xp")
    .in("id", mcq.map((q) => q.id));
  const keyOf = new Map(keys.map((k) => [k.id, k]));

  // 4 correct in a row: bonuses must escalate 0, +2, +4, +6.
  const expectedBonus = [0, 2, 4, 6];
  for (let i = 0; i < 4; i++) {
    const q = mcq[i];
    const k = keyOf.get(q.id);
    const { data: res } = await kid.rpc("record_attempt", {
      p_question_id: q.id,
      p_answer: k.answer_index,
    });
    assert(
      res?.is_correct === true && res?.combo_bonus === expectedBonus[i],
      `answer ${i + 1} correct, combo bonus +${expectedBonus[i]} (got +${res?.combo_bonus})`,
    );
    assert(
      res?.xp_earned === k.xp + expectedBonus[i],
      `xp = base ${k.xp} + bonus (got ${res?.xp_earned})`,
    );
  }

  // A miss resets the run.
  const q5 = mcq[4];
  const wrong = (keyOf.get(q5.id).answer_index + 1) % 4;
  const { data: missed } = await kid.rpc("record_attempt", { p_question_id: q5.id, p_answer: wrong });
  assert(missed?.is_correct === false && missed?.xp_earned === 0, "miss earns 0");
  const { data: after } = await kid.rpc("record_attempt", {
    p_question_id: q5.id,
    p_answer: keyOf.get(q5.id).answer_index,
  });
  assert(after?.combo_bonus === 0, `combo resets after a miss (got +${after?.combo_bonus})`);

  // Chest: opens once, pays 10–44, lands on the profile, refuses seconds.
  const { data: prof1 } = await kid.from("profiles").select("xp").eq("id", userId).single();
  const { data: chest } = await kid.rpc("open_daily_chest");
  assert(chest?.ok === true && chest.reward >= 10 && chest.reward <= 44, `chest paid ${chest?.reward} (10–44)`);
  const { data: prof2 } = await kid.from("profiles").select("xp").eq("id", userId).single();
  assert(prof2.xp === prof1.xp + chest.reward, "reward landed on xp");
  const { data: again } = await kid.rpc("open_daily_chest");
  assert(again?.ok === false && again?.error === "already opened today", "second open refused");
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user");
  }
}
