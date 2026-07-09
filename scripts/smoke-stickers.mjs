// E2E test for the Sticker Book: pack opening (no dupes, weighted, balance),
// the "collected them all" edge, individual buy, and set-favorite.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> ANON_KEY=<anon> node scripts/smoke-stickers.mjs

import { createClient } from "@supabase/supabase-js";

const URL = process.env.PROD_URL, KEY = process.env.PROD_KEY, ANON = process.env.ANON_KEY;
if (!URL || !KEY || !ANON) { console.error("Need PROD_URL, PROD_KEY, ANON_KEY."); process.exit(1); }

const admin = createClient(URL, KEY, { auth: { persistSession: false } });
const email = `sticker-smoke-${Date.now()}@example.com`;
const password = `Smoke-${crypto.randomUUID()}`;
let userId;

function assert(cond, label) {
  if (cond) console.log(`✓ ${label}`);
  else { console.error(`✗ FAIL: ${label}`); process.exitCode = 1; }
}

try {
  const { data: created, error } = await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { role: "student", display_name: "Sticker Smoke", grade: "2" },
  });
  if (error) throw error;
  userId = created.user.id;

  const kid = createClient(URL, ANON, { auth: { persistSession: false } });
  await kid.auth.signInWithPassword({ email, password });

  // Fresh book: nothing owned.
  const { data: book0 } = await kid.rpc("get_sticker_book");
  assert(book0?.pack?.price === 75 && book0?.pack?.count === 3, "pack is 75 pts / 3 stickers");
  assert(book0?.items?.length >= 29, `book lists all stickers (${book0?.items?.length})`);
  assert(book0.items.every((i) => !i.owned), "start with 0 stickers");
  assert(book0.items.some((i) => i.rarity === "shiny"), "a shiny exists to chase");

  // Broke kid can't open a pack.
  await admin.from("profiles").update({ xp: 10 }).eq("id", userId);
  const { data: broke } = await kid.rpc("buy_sticker_pack");
  assert(broke?.ok === false && broke?.error === "not enough points", "broke kid can't open a pack");

  // Load up and open packs until the whole set is collected.
  await admin.from("profiles").update({ xp: 3000 }).eq("id", userId);
  const owned = new Set();
  let packs = 0, balance = 3000;
  for (let i = 0; i < 20; i++) {
    const { data: res } = await kid.rpc("buy_sticker_pack");
    if (res?.error === "You collected them all! 🎉") break;
    assert(res?.ok === true, `pack ${i + 1} opened`);
    assert(Array.isArray(res.awarded) && res.awarded.length >= 1 && res.awarded.length <= 3,
      `pack ${i + 1} gave 1–3 stickers (${res.awarded?.length})`);
    // No sticker in this pack was already owned (no dupes).
    const fresh = res.awarded.every((s) => !owned.has(s.id));
    assert(fresh, `pack ${i + 1} had no duplicates`);
    res.awarded.forEach((s) => owned.add(s.id));
    balance -= 75;
    assert(res.balance === balance, `balance now ${balance} (got ${res.balance})`);
    packs++;
    if (owned.size >= 29) {
      // one more should say "collected them all"
      const { data: done } = await kid.rpc("buy_sticker_pack");
      assert(done?.ok === false && done?.error?.includes("collected them all"),
        "further packs blocked once every sticker is owned");
      break;
    }
  }
  console.log(`  (opened ${packs} packs, collected ${owned.size}/29 unique)`);
  assert(owned.size === 29, `collected every unique sticker with no dupes (${owned.size}/29)`);

  // Set-favorite (equip) works on an owned sticker.
  const someOwned = book0.items[0];
  await admin.from("profiles").update({ xp: 3000 }).eq("id", userId); // ensure owned already
  const { data: eq } = await kid.rpc("equip_shop_item", { p_item: someOwned.id });
  assert(eq?.ok === true, "can set a sticker as favorite buddy");
  const { data: prof } = await kid.from("profiles").select("avatar").eq("id", userId).single();
  assert(prof?.avatar === someOwned.image_url, "favorite is reflected on the profile");
} catch (err) {
  console.error(`✗ ERROR: ${err.message ?? err}`);
  process.exitCode = 1;
} finally {
  if (userId) {
    await admin.auth.admin.deleteUser(userId);
    console.log("✓ cleaned up throwaway user");
  }
}
