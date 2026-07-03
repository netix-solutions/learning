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
  await admin.from("profiles").update({ xp: 500 }).eq("id", userId);

  // 2. Act as the student.
  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: signInErr } = await kid.auth.signInWithPassword({ email, password });
  if (signInErr) throw signInErr;

  const { data: shop } = await kid.rpc("get_my_shop");
  assert(shop?.balance === 500, `balance starts at 500 (got ${shop?.balance})`);
  assert(Array.isArray(shop?.items) && shop.items.length >= 12, `catalog has ≥12 items (got ${shop?.items?.length})`);
  assert(shop?.deal?.item_id && shop.deal.deal_price > 0, "daily deal present");
  assert(shop?.mystery_price === 100, "mystery box priced at 100");

  // Real price the server will charge, accounting for today's deal.
  const priceOf = (i) => (shop.deal?.item_id === i.id ? shop.deal.deal_price : i.price);

  const cheap = shop.items.filter((i) => !i.owned && i.price <= 200).sort((a, b) => a.price - b.price)[0];

  // 3. Can't afford something beyond the balance (drain first via a temp xp cut).
  await admin.from("profiles").update({ xp: 10 }).eq("id", userId);
  const rich = shop.items.filter((i) => priceOf(i) > 10).sort((a, b) => b.price - a.price)[0];
  const { data: broke } = await kid.rpc("buy_shop_item", { p_item: rich.id });
  assert(broke?.ok === false && broke?.error === "not enough points", `unaffordable item correctly refused`);
  const { data: brokeBox } = await kid.rpc("buy_mystery_box");
  assert(brokeBox?.ok === false && brokeBox?.error === "not enough points", "broke kid can't open mystery box");
  await admin.from("profiles").update({ xp: 500 }).eq("id", userId);

  // 4. Buy an affordable one (at deal price if it happens to be today's deal).
  const expected = priceOf(cheap);
  const { data: bought } = await kid.rpc("buy_shop_item", { p_item: cheap.id });
  assert(bought?.ok === true, `bought ${cheap.name} for ${expected}`);
  assert(bought?.balance === 500 - expected, `balance now ${500 - expected} (got ${bought?.balance})`);

  // 4b. Mystery box: always wins an unowned avatar for exactly 100.
  const { data: box } = await kid.rpc("buy_mystery_box");
  assert(box?.ok === true && box?.item?.id, `mystery box won ${box?.item?.name}`);
  assert(box?.item?.id !== cheap.id, "mystery box never awards an owned item");
  assert(box?.balance === 500 - expected - 100, `balance after box is ${500 - expected - 100} (got ${box?.balance})`);

  // 5. Double-buy is refused.
  const { data: dupe } = await kid.rpc("buy_shop_item", { p_item: cheap.id });
  assert(dupe?.ok === false && dupe?.error === "already owned", "double-buy refused");

  // 6. Equip it → profiles.avatar becomes the image URL.
  const { data: equipped } = await kid.rpc("equip_shop_item", { p_item: cheap.id });
  assert(equipped?.ok === true, "equip succeeds");
  const { data: prof } = await kid.from("profiles").select("avatar, xp").eq("id", userId).single();
  assert(prof?.avatar === cheap.image_url, `avatar is now ${cheap.image_url}`);
  assert(prof?.xp === 500, "xp (level) untouched by spending");

  // 7. Can't equip something never bought.
  const unowned = shop.items.find((i) => !i.owned && i.id !== cheap.id && i.id !== box?.item?.id);
  const { data: notOwned } = await kid.rpc("equip_shop_item", { p_item: unowned.id });
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
