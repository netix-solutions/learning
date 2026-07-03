// Upsert the avatar-shop catalog (scripts/generate-shop-art.mjs CATALOG) into
// shop_items. Idempotent — keyed on slug, so re-running updates names/prices
// without duplicating rows or touching purchases.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> node scripts/seed-shop-items.mjs

import { CATALOG } from "./shop-catalog.mjs";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
if (!URL || !KEY) {
  console.error("Need PROD_URL and PROD_KEY env vars.");
  process.exit(1);
}

const rows = CATALOG.map((item, i) => ({
  kind: "avatar",
  slug: item.slug,
  name: item.name,
  image_url: `/shop/${item.slug}.png`,
  price: item.price,
  sort: (i + 1) * 10,
  active: true,
}));

const res = await fetch(`${URL}/rest/v1/shop_items?on_conflict=slug`, {
  method: "POST",
  headers: {
    apikey: KEY,
    Authorization: `Bearer ${KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(rows),
});
if (!res.ok) {
  console.error(`Seed failed: ${res.status} ${await res.text()}`);
  process.exit(1);
}
const saved = await res.json();
console.log(`✓ Upserted ${saved.length} shop items:`);
for (const r of saved) console.log(`  ${r.name} — ${r.price} pts (${r.slug})`);
