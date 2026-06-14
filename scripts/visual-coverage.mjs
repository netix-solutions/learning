// Measures how often the re-teach <SkillVisual> renders a REAL manipulative
// vs. the generic Mascot fallback, by replaying the component's prompt/skill
// matching over the generated math bank. Keep this in sync with
// src/components/SkillVisual.tsx. Run: node scripts/visual-coverage.mjs
//
// Note: SkillVisual is shown in the "re-teach" modal after a miss, so this is
// "when a child misses a question of this skill, do they get a fitting visual?"

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sql = readFileSync(resolve(__dirname, "../supabase/seeds/questions.sql"), "utf8");

// Mirror of SkillVisual's logic — returns the visual kind (or "mascot").
function visualFor(prompt, skill) {
  if (/shape/.test(skill ?? "")) {
    if (/\b(triangle|square|rectangle|pentagon|hexagon|octagon)\b/.test(prompt)) return "shape";
  }
  if (/^How many/.test(prompt)) {
    const tail = prompt.trim().split(/\s+/).pop() ?? "";
    const chars = [...tail];
    if (chars.length >= 2 && chars.every((c) => c === chars[0])) return "count";
  }
  let m;
  if ((m = prompt.match(/rectangle is (\d+) cm by (\d+) cm\.\s*What is its (area|perimeter)/))) {
    const l = +m[1], w = +m[2];
    if (l >= 1 && l <= 12 && w >= 1 && w <= 12) return "rect";
  }
  if ((m = prompt.match(/(\d+)\s*÷\s*(\d+)\s*=/))) {
    const a = +m[1], b = +m[2];
    if (b >= 1 && b <= 12 && a % b === 0 && a / b <= 12) return "division";
  }
  if ((m = prompt.match(/(\d+)\s*rows of\s*(\d+)/))) {
    const r = +m[1], c = +m[2];
    if (r >= 1 && r <= 12 && c >= 1 && c <= 12) return "array";
  }
  if ((m = prompt.match(/(\d+)\s*×\s*(\d+)/))) {
    const a = +m[1], b = +m[2];
    if (a >= 1 && a <= 12 && b >= 1 && b <= 12) return "groups";
  }
  if ((m = prompt.match(/(\d+)\s*([+\-])\s*(\d+)\s*=/))) {
    const x = +m[1], y = +m[3];
    const end = m[2] === "+" ? x + y : x - y;
    if (Math.max(x, y, end) <= 20 && end >= 0) return "numberline";
  }
  if ((m = prompt.match(/\b(\d+)\/(\d+)\b/)) && /frac|dec/.test(skill ?? "")) {
    const n = +m[1], d = +m[2];
    if (d >= 2 && d <= 12 && n <= d) return "fraction";
  }
  return "mascot";
}

// Parse math rows: capture skill + prompt (the quoted field right before choices).
const rowRe =
  /^\s*\('math',\s*'[^']*',\s*\d+,\s*('(?:[^']|'')*'|NULL),\s*(?:'(?:[^']|'')*'|NULL),\s*('(?:[^']|'')*')\s*,\s*'\[/;
const unquote = (s) => (s === "NULL" ? null : s.replace(/^'|'$/g, "").replace(/''/g, "'"));

const bySkill = {};
let total = 0, real = 0;
for (const line of sql.split("\n")) {
  const m = line.match(rowRe);
  if (!m) continue;
  const skill = unquote(m[1]);
  const prompt = unquote(m[2]);
  const kind = visualFor(prompt, skill);
  const key = skill ?? "(none)";
  bySkill[key] ??= { total: 0, real: 0, kinds: {} };
  bySkill[key].total++;
  bySkill[key].kinds[kind] = (bySkill[key].kinds[kind] ?? 0) + 1;
  total++;
  if (kind !== "mascot") { bySkill[key].real++; real++; }
}

console.log(`\nSkillVisual coverage over ${total} math questions`);
console.log("skill          | real visual | fallback | top visual");
console.log("---------------+-------------+----------+-----------");
for (const k of Object.keys(bySkill).sort()) {
  const s = bySkill[k];
  const pct = Math.round((s.real / s.total) * 100);
  const top = Object.entries(s.kinds).sort((a, b) => b[1] - a[1])[0];
  console.log(
    `${k.padEnd(14)} | ${String(pct + "%").padStart(5)} (${String(s.real).padStart(4)}) | ${String(s.total - s.real).padStart(8)} | ${top[0]} (${top[1]})`,
  );
}
console.log(`\nOverall: ${Math.round((real / total) * 100)}% of math questions render a real manipulative (${real}/${total}).`);
