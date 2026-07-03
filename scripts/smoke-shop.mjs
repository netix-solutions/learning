// End-to-end smoke test of the avatar shop against a live Supabase project.
// Creates a throwaway student, gives it points, buys + equips an item through
// the real RPCs (as the student, not service role), asserts the math, then
// deletes the user. Leaves no data behind.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-shop.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) {
  console.error("Need PROD_URL, PROD_KEY (service role), ANON_KEY env vars.");
  process.exit(1);
}

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `shop-smoke-${Date.now()}@example.com`;
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
  // 1. Throwaway student with 200 points.
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: "student", display_name: "Shop Smoke", grade: "3" },
  });
  if (createErr) throw createErr;
  userId = created.user.id;
  await admin.from("profiles").update({ xp: 200 }).eq("id", userId);

  // 2. Act as the student.
  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: signInErr } = await kid.auth.signInWithPassword({ email, password });
  if (signInErr) throw signInErr;

  const { data: shop } = await kid.rpc("get_my_shop");
  assert(shop?.balance === 200, `balance starts at 200 (got ${shop?.balance})`);
  assert(Array.isArray(shop?.items) && shop.items.length >= 12, `catalog has ≥12 items (got ${shop?.items?.length})`);

  const cheap = shop.items.filter((i) => !i.owned && i.price <= 200).sort((a, b) => a.price - b.price)[0];
  const rich = shop.items.filter((i) => i.price > 200).sort((a, b) => b.price - a.price)[0];

  // 3. Can't afford the expensive one.
  const { data: broke } = await kid.rpc("buy_shop_item", { p_item: rich.id });
  assert(broke?.ok === false && broke?.error === "not enough points", `expensive item (${rich.price}) correctly refused`);

  // 4. Buy an affordable one.
  const { data: bought } = await kid.rpc("buy_shop_item", { p_item: cheap.id });
  assert(bought?.ok === true, `bought ${cheap.name} for ${cheap.price}`);
  assert(bought?.balance === 200 - cheap.price, `balance now ${200 - cheap.price} (got ${bought?.balance})`);

  // 5. Double-buy is refused.
  const { data: dupe } = await kid.rpc("buy_shop_item", { p_item: cheap.id });
  assert(dupe?.ok === false && dupe?.error === "already owned", "double-buy refused");

  // 6. Equip it → profiles.avatar becomes the image URL.
  const { data: equipped } = await kid.rpc("equip_shop_item", { p_item: cheap.id });
  assert(equipped?.ok === true, "equip succeeds");
  const { data: prof } = await kid.from("profiles").select("avatar, xp").eq("id", userId).single();
  assert(prof?.avatar === cheap.image_url, `avatar is now ${cheap.image_url}`);
  assert(prof?.xp === 200, "xp (level) untouched by spending");

  // 7. Can't equip something never bought.
  const { data: notOwned } = await kid.rpc("equip_shop_item", { p_item: rich.id });
  assert(notOwned?.ok === false, "equipping an unowned item refused");

  // 8. Purchases are invisible to other users (RLS).
  const stranger = createClient(URL, ANON, { auth: { persistSession: false } });
  const { data: leaked } = await stranger.from("item_purchases").select("*");
  assert(!leaked || leaked.length === 0, "purchases invisible to anonymous users");
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user");
  }
}
