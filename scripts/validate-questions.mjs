// Independent validator for the generated question bank.
//
// Re-parses supabase/seeds/questions.sql from scratch (NOT trusting the generator's
// own checks) and:
//   - verifies every row is structurally sound (4 distinct choices, valid index),
//   - RE-COMPUTES every computable math answer from the prompt and compares it to the
//     keyed choice (arithmetic, decimals, order-of-ops, area, volume, rounding,
//     skip-counting, place value),
//   - reports the answer-position distribution (guards against a "always B" bias).
//
// Run:  node scripts/validate-questions.mjs   (npm run validate:questions)
// Exits non-zero if anything fails, so it can gate CI / a regenerate.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = resolve(__dirname, "../supabase/seeds/questions.sql");
const sql = readFileSync(file, "utf8");
const lines = sql.split("\n").filter((l) => l.startsWith("  ('"));

const num = (s) => parseFloat(String(s).replace(/,/g, "")); // tolerate "6,000"
const close = (a, b) => Math.abs(a - b) < 1e-6;

let rows = 0, structuralBad = 0, mathChecked = 0, mathBad = 0;
const idxDist = { 0: 0, 1: 0, 2: 0, 3: 0 };
const byKind = {};
const fail = (msg) => { console.log("  ✗", msg); };

function recompute(prompt, choices, ai) {
  const keyed = choices[ai];
  let m;
  // a OP b = ?  (integers or decimals; × is multiply)
  if ((m = prompt.match(/^([\d.]+)\s*([+\-×])\s*([\d.]+)\s*=\s*\?$/))) {
    const x = num(m[1]), y = num(m[3]);
    const exp = m[2] === "+" ? x + y : m[2] === "-" ? x - y : x * y;
    return ["arith", close(num(keyed), exp), exp];
  }
  // a + b × c = ?  (order of operations)
  if ((m = prompt.match(/^What is\s+(\d+)\s*\+\s*(\d+)\s*×\s*(\d+)\s*\?$/))) {
    return ["order-of-ops", close(num(keyed), num(m[1]) + num(m[2]) * num(m[3])), num(m[1]) + num(m[2]) * num(m[3])];
  }
  // rectangle area
  if ((m = prompt.match(/rectangle is (\d+) cm by (\d+) cm/))) {
    return ["area", close(num(keyed), num(m[1]) * num(m[2])), `${num(m[1]) * num(m[2])} sq cm`];
  }
  // box volume
  if ((m = prompt.match(/box is (\d+) × (\d+) × (\d+)/))) {
    return ["volume", close(num(keyed), num(m[1]) * num(m[2]) * num(m[3])), num(m[1]) * num(m[2]) * num(m[3])];
  }
  // rounding
  if ((m = prompt.match(/^Round (\d+) to the nearest (ten|hundred)\.$/))) {
    const to = m[2] === "ten" ? 10 : 100;
    const exp = Math.round(num(m[1]) / to) * to;
    return ["rounding", close(num(keyed), exp), exp];
  }
  // skip count / count by:  ".. : a, b, c, ?"
  if (/^(Skip count by|Count by)/.test(prompt) && (m = prompt.match(/:\s*(\d+),\s*(\d+),\s*(\d+),\s*\?/))) {
    const a = num(m[1]), b = num(m[2]), c = num(m[3]);
    return ["skip-count", close(num(keyed), c + (b - a)), c + (b - a)];
  }
  // "What number comes right after N?"
  if ((m = prompt.match(/comes right after (\d+)\?/))) {
    return ["next-number", close(num(keyed), num(m[1]) + 1), num(m[1]) + 1];
  }
  // factor pair: "A factor pair of T is:" -> keyed "X and Y", verify X*Y === T
  if ((m = prompt.match(/factor pair of (\d+) is:/))) {
    const t = num(m[1]);
    const km = String(keyed).match(/(\d+)\s+and\s+(\d+)/);
    return ["factor-pair", !!km && num(km[1]) * num(km[2]) === t, t];
  }
  // even / odd
  if ((m = prompt.match(/Which number is (even|odd)\?/))) {
    const parity = num(keyed) % 2;
    return ["even-odd", m[1] === "even" ? parity === 0 : parity === 1, m[1]];
  }
  // equivalent to 1/2: keyed "a/b" with 2a === b
  if (/equal to 1\/2\?/.test(prompt)) {
    const km = String(keyed).match(/^(\d+)\/(\d+)$/);
    return ["frac-equiv", !!km && 2 * num(km[1]) === num(km[2]), "a/b, 2a=b"];
  }
  // largest unit fraction = smallest denominator among the choices
  if (/Which fraction is the largest\?/.test(prompt) && choices.every((c) => /^1\/\d+$/.test(c))) {
    const dens = choices.map((c) => num(c.split("/")[1]));
    const keyedDen = num(keyed.split("/")[1]);
    return ["frac-largest", keyedDen === Math.min(...dens), `min den`];
  }
  // 1/2 + 1/D = ?  -> keyed "n/D" where n === D/2 + 1
  if ((m = prompt.match(/^1\/2 \+ 1\/(\d+) = \?$/))) {
    const d = num(m[1]);
    const km = String(keyed).match(/^(\d+)\/(\d+)$/);
    const ok = !!km && num(km[2]) === d && num(km[1]) === d / 2 + 1;
    return ["frac-add", ok, `${d / 2 + 1}/${d}`];
  }
  // place value: "value of the D in N"  (only when D occurs once in N)
  if ((m = prompt.match(/value of the (\d) in ([\d,]+)\?/))) {
    const d = m[1], n = m[2].replace(/,/g, "");
    const positions = [...n].map((ch, i) => (ch === d ? i : -1)).filter((i) => i >= 0);
    if (positions.length === 1) {
      const place = Math.pow(10, n.length - 1 - positions[0]);
      return ["place-value", close(num(keyed), num(d) * place), num(d) * place];
    }
    return null; // ambiguous repeated digit — skip
  }
  return null; // not independently computable (fractions, decimals-as-fractions, etc.)
}

for (const line of lines) {
  const m = line.match(/'(\[[^\]]*\])',\s*(\d+),/);
  if (!m) { structuralBad++; fail(`unparseable row: ${line.slice(0, 80)}`); continue; }
  rows++;
  const choices = JSON.parse(m[1].replace(/''/g, "'"));
  const ai = Number(m[2]);
  idxDist[ai] = (idxDist[ai] ?? 0) + 1;
  if (choices.length !== 4) { structuralBad++; fail(`not 4 choices: ${JSON.stringify(choices)}`); }
  if (new Set(choices).size !== 4) { structuralBad++; fail(`dup choices: ${JSON.stringify(choices)}`); }
  if (ai < 0 || ai > 3) { structuralBad++; fail(`bad index ${ai}`); }

  const isMath = /^\s*\('math'/.test(line);
  if (isMath) {
    // prompt = first SQL string literal after the standard column
    const pm = line.match(/'(?:MA|ELA)\.[^']*'|NULL,\s*'((?:[^']|'')*)'/);
    const prm = line.match(/,\s*((?:'(?:[^']|'')*'|NULL))\s*,\s*'\[/); // the field right before choices = prompt
    const prompt = prm ? prm[1].replace(/^'|'$/g, "").replace(/''/g, "'") : "";
    const res = recompute(prompt, choices, ai);
    if (res) {
      const [kind, ok] = res;
      byKind[kind] ??= { checked: 0, bad: 0 };
      byKind[kind].checked++;
      mathChecked++;
      if (!ok) { byKind[kind].bad++; mathBad++; fail(`MATH WRONG [${kind}]: "${prompt}" keyed=${choices[ai]} exp=${res[2]}`); }
    }
  }
}

console.log(`\nValidated ${file}`);
console.log(`Rows parsed:            ${rows}`);
console.log(`Structural failures:    ${structuralBad}`);
console.log(`Math rows recomputed:   ${mathChecked}  (mismatches: ${mathBad})`);
console.log("  by kind:", Object.fromEntries(Object.entries(byKind).map(([k, v]) => [k, `${v.checked - v.bad}/${v.checked}`])));
console.log(`Answer-position spread: ${JSON.stringify(idxDist)}`);

const passed = structuralBad === 0 && mathBad === 0;
console.log(passed ? "\n✓ PASS" : "\n✗ FAIL");
process.exit(passed ? 0 : 1);
