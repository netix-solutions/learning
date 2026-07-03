// E2E test for the engagement package: weekly quest, streak shields (buy +
// consume), spends-aware balances, and limited-time shop items.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-quest-shield.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) {
  console.error("Need PROD_URL, PROD_KEY, ANON_KEY.");
  process.exit(1);
}

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `quest-smoke-${Date.now()}@example.com`;
const password = `Smoke-${crypto.randomUUID()}`;
let userId;
let tempItemId;

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
    user_metadata: { role: "student", display_name: "Quest Smoke", grade: "2" },
  });
  if (error) throw error;
  userId = created.user.id;
  await admin.from("profiles").update({ xp: 1000 }).eq("id", userId);

  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  await kid.auth.signInWithPassword({ email, password });

  // --- Weekly quest -----------------------------------------------------
  const { data: q0 } = await kid.rpc("weekly_quest_status");
  assert(
    ["math", "reading", "science"].includes(q0?.subject) &&
      q0?.target === 20 && q0?.progress === 0 && q0?.claimed === false,
    `quest: 20 correct ${q0?.subject} answers for ${q0?.reward} pts (${q0?.days_left}d left)`,
  );
  const { data: early } = await kid.rpc("claim_weekly_quest");
  assert(early?.ok === false && early?.error === "quest not finished", "unfinished quest can't be claimed");

  // Fast-forward: service role plants 20 correct attempts in the quest subject.
  const { data: subjQs } = await admin
    .from("questions").select("id").eq("subject_id", q0.subject).limit(20);
  await admin.from("attempts").insert(
    subjQs.map((row) => ({
      student_id: userId, question_id: row.id, subject_id: q0.subject,
      selected_index: 0, is_correct: true, xp_earned: 0,
    })),
  );
  const { data: q1 } = await kid.rpc("weekly_quest_status");
  assert(q1?.progress === 20, `progress tracked (${q1?.progress}/20)`);
  const { data: claim } = await kid.rpc("claim_weekly_quest");
  assert(claim?.ok === true && claim?.reward === 150, "quest claimed for 150");
  const { data: dupe } = await kid.rpc("claim_weekly_quest");
  assert(dupe?.ok === false && dupe?.error === "already claimed", "double-claim refused");

  // --- Streak shields (xp now 1150, nothing spent yet) --------------------
  const { data: s1 } = await kid.rpc("buy_streak_shield");
  assert(s1?.ok === true && s1?.shields === 1 && s1?.balance === 1000, `shield 1 bought (balance ${s1?.balance})`);
  const { data: s2 } = await kid.rpc("buy_streak_shield");
  assert(s2?.ok === true && s2?.shields === 2 && s2?.balance === 850, `shield 2 bought (balance ${s2?.balance})`);
  const { data: s3 } = await kid.rpc("buy_streak_shield");
  assert(s3?.ok === false && s3?.error === "you can hold 2 shields", "shield cap enforced");

  const { data: shop } = await kid.rpc("get_my_shop");
  assert(shop?.shields === 2 && shop?.shield_price === 150, "get_my_shop reports shields");
  assert(shop?.balance === 850, `shop balance is spends-aware (${shop?.balance})`);

  // Consumption: last active 2 days ago + streak 5 → shield bridges the gap.
  const twoDaysAgo = new Date(Date.now() - 2 * 86400e3).toISOString().slice(0, 10);
  await admin.from("profiles")
    .update({ last_active_date: twoDaysAgo, streak_count: 5 })
    .eq("id", userId);
  const { data: mcq } = await admin
    .from("questions").select("id, answer_index").eq("subject_id", "math")
    .eq("grade", "2").not("answer_index", "is", null).limit(1).single();
  const { data: att } = await kid.rpc("record_attempt", {
    p_question_id: mcq.id, p_answer: mcq.answer_index,
  });
  assert(att?.shield_used === true && att?.new_streak === 6, `shield bridged the gap (streak ${att?.new_streak})`);
  const { data: prof } = await kid.from("profiles").select("streak_shields").eq("id", userId).single();
  assert(prof?.streak_shields === 1, "one shield consumed");

  // --- Limited-time items -------------------------------------------------
  const seasonal = shop.items.find((i) => i.slug === "snorkel-puppy");
  assert(!!seasonal?.available_until, "seasonal item carries its expiry");
  const { data: temp } = await admin.from("shop_items").insert({
    kind: "avatar", slug: `expired-${Date.now()}`, name: "Expired Test",
    image_url: "/shop/astro-cat.png", price: 10, active: true,
    available_until: new Date(Date.now() - 86400e3).toISOString(),
  }).select().single();
  tempItemId = temp.id;
  const { data: shop2 } = await kid.rpc("get_my_shop");
  assert(!shop2.items.some((i) => i.id === tempItemId), "expired item hidden from the shop");
  const { data: buyExpired } = await kid.rpc("buy_shop_item", { p_item: tempItemId });
  assert(buyExpired?.ok === false && buyExpired?.error === "item not found", "expired item can't be bought");
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (tempItemId) await admin.from("shop_items").delete().eq("id", tempItemId);
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user + temp item");
  }
}
