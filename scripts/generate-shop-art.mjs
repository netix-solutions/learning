// Generate avatar-shop artwork with an image model through the Vercel AI Gateway.
//
// Usage:
//   node --env-file=.env.local scripts/generate-shop-art.mjs [--only slug] [--force]
//
// Auth: needs VERCEL_OIDC_TOKEN (vercel env pull) or AI_GATEWAY_API_KEY in the
// env file. Images land in public/shop/<slug>.png so they ship with the app;
// the matching shop_items rows are seeded separately (see seed-shop-items.mjs).

import { generateText } from "ai";
import { CATALOG, AVATAR_STYLE } from "./shop-catalog.mjs";
import { mkdir, writeFile, access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const run = promisify(execFile);

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT_DIR = path.join(ROOT, "public", "shop");

const MODEL = "google/gemini-3.1-flash-image-preview";

async function exists(p) {
  return access(p).then(() => true, () => false);
}

async function generateOne(item, force) {
  const file = path.join(OUT_DIR, `${item.slug}.png`);
  if (!force && (await exists(file))) {
    console.log(`↷ ${item.slug} (already exists, skipping)`);
    return;
  }
  const result = await generateText({
    model: MODEL,
    prompt: `${AVATAR_STYLE}\n\nThe character: ${item.subject}.`,
    providerOptions: { gateway: { tags: ["feature:avatar-shop"] } },
  });
  const image = result.files.find((f) => f.mediaType?.startsWith("image/"));
  if (!image) throw new Error(`No image returned for ${item.slug} (${result.text?.slice(0, 120)})`);
  await writeFile(file, image.uint8Array);
  // Avatars render at ≤96px, so 256px is plenty — shrinks ~1MB model output
  // to a few tens of KB. sips ships with macOS (where this script is run).
  if (process.platform === "darwin") {
    await run("sips", ["-Z", "256", file, "--out", file]);
  }
  console.log(`✓ ${item.slug}.png`);
}

const only = process.argv.includes("--only")
  ? process.argv[process.argv.indexOf("--only") + 1]
  : null;
const force = process.argv.includes("--force");

await mkdir(OUT_DIR, { recursive: true });
const items = only ? CATALOG.filter((i) => i.slug === only) : CATALOG;
if (!items.length) throw new Error(`No catalog entry named "${only}"`);

for (const item of items) {
  try {
    await generateOne(item, force);
  } catch (err) {
    console.error(`✗ ${item.slug}: ${err.message}`);
    process.exitCode = 1;
  }
}
