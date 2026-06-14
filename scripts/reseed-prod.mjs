// Safe production reseed of the questions bank.
//
// Inserts the freshly generated bank (supabase/seeds/questions.sql) into the
// hosted DB, then deletes ONLY old question rows that are NOT referenced by any
// attempt — so student history (attempts.question_id -> questions FK) is fully
// preserved. NEVER truncates. Dry-run by default; pass --apply to write.
//
// Usage: PROD_URL=... PROD_KEY=<service_role> node scripts/reseed-prod.mjs [--apply]

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
const APPLY = process.argv.includes("--apply");
if (!URL || !KEY) {
  console.error("Need PROD_URL and PROD_KEY env vars.");
  process.exit(1);
}
const __dirname = dirname(fileURLToPath(import.meta.url));
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

// --- parse one SQL value tuple (single-quoted strings with '' escape) ---
function parseTuple(s) {
  const f = [];
  let i = 0;
  while (i < s.length) {
    while (s[i] === " " || s[i] === ",") i++;
    if (i >= s.length) break;
    if (s[i] === "'") {
      i++;
      let buf = "";
      while (i < s.length) {
        if (s[i] === "'") {
          if (s[i + 1] === "'") { buf += "'"; i += 2; continue; }
          i++; break;
        }
        buf += s[i++];
      }
      f.push({ t: "str", v: buf });
    } else {
      let buf = "";
      while (i < s.length && s[i] !== ",") buf += s[i++];
      f.push({ t: "raw", v: buf.trim() });
    }
  }
  return f;
}
const nullable = (x) => (x.t === "raw" && x.v === "NULL" ? null : x.v);

const sql = readFileSync(resolve(__dirname, "../supabase/seeds/questions.sql"), "utf8");
const rows = [];
for (const line of sql.split("\n")) {
  const m = line.match(/^\s*\((.*)\)[,;]\s*$/);
  if (!m) continue;
  const f = parseTuple(m[1]);
  if (f.length !== 10) continue;
  rows.push({
    subject_id: f[0].v,
    grade: f[1].v,
    difficulty: Number(f[2].v),
    skill: nullable(f[3]),
    standard: nullable(f[4]),
    prompt: f[5].v,
    choices: JSON.parse(f[6].v),
    answer_index: Number(f[7].v),
    explanation: nullable(f[8]),
    xp: Number(f[9].v),
  });
}
const bad = rows.filter(
  (r) => !Array.isArray(r.choices) || r.choices.length !== 4 || !(r.answer_index >= 0 && r.answer_index < 4) || !r.prompt,
);
console.log(`Parsed ${rows.length} rows from questions.sql; ${bad.length} structurally bad.`);
if (bad.length) { console.log(bad.slice(0, 3)); process.exit(1); }

async function pageAll(path, pick) {
  const out = [];
  let from = 0;
  const step = 1000;
  for (;;) {
    const r = await fetch(`${URL}/rest/v1/${path}&limit=${step}&offset=${from}`, { headers: H });
    if (!r.ok) throw new Error(`${path}: ${r.status} ${await r.text()}`);
    const j = await r.json();
    out.push(...j.map(pick));
    if (j.length < step) break;
    from += step;
  }
  return out;
}
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

const beforeIds = await pageAll("questions?select=id", (x) => x.id);
const refIds = new Set(await pageAll("attempts?select=question_id", (x) => x.question_id));
const toDelete = beforeIds.filter((id) => !refIds.has(id));

console.log(`\nPROD now: ${beforeIds.length} questions, ${refIds.size} referenced by attempts.`);
console.log(`Plan: INSERT ${rows.length} new; DELETE ${toDelete.length} old unreferenced; KEEP ${refIds.size} referenced (history preserved).`);
console.log(`Result ≈ ${rows.length + refIds.size} questions.`);

if (!APPLY) {
  console.log("\nDRY RUN — pass --apply to execute.");
  process.exit(0);
}

console.log("\nInserting new rows...");
let ins = 0;
for (const batch of chunk(rows, 500)) {
  const r = await fetch(`${URL}/rest/v1/questions`, {
    method: "POST",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify(batch),
  });
  if (!r.ok) throw new Error(`insert: ${r.status} ${await r.text()}`);
  ins += batch.length;
  process.stdout.write(`\r  inserted ${ins}/${rows.length}`);
}
console.log("");

console.log("Deleting old unreferenced rows...");
let del = 0;
for (const batch of chunk(toDelete, 150)) {
  const r = await fetch(`${URL}/rest/v1/questions?id=in.(${batch.join(",")})`, {
    method: "DELETE",
    headers: { ...H, Prefer: "return=minimal" },
  });
  if (!r.ok) throw new Error(`delete: ${r.status} ${await r.text()}`);
  del += batch.length;
  process.stdout.write(`\r  deleted ${del}/${toDelete.length}`);
}
console.log("");

const after = (await pageAll("questions?select=id", (x) => x.id)).length;
console.log(`\nDone. PROD now has ${after} questions (kept ${refIds.size} referenced).`);
