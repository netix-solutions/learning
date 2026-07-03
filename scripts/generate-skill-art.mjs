// Generate per-skill scene illustrations for practice questions, end to end
// through the Vercel AI Gateway:
//
//   1. art-direct — a text model reads real sample questions for the skill and
//      writes one answer-free scene description,
//   2. paint      — an image model renders it in the app's house style,
//   3. verify     — a vision model checks it (kid-safe, no text, no maps, no
//      real-person likenesses); one repaint on failure,
//   4. publish    — upload to the public `art` bucket + upsert a skill_art row
//      with status 'pending' (a human approves in /admin/art before kids see it).
//
// Usage:
//   PROD_URL=... PROD_KEY=<service_role> \
//   node --env-file=<env with VERCEL_OIDC_TOKEN> scripts/generate-skill-art.mjs \
//     [--subject civics] [--skill civ.K.flag] [--concurrency 4] [--force]
//
// Skill selection: social studies + the science skills that have no hand-made
// ScienceDiagram. Math is excluded on purpose (its deterministic SVG
// manipulatives are answer-exact) and so are map/geography-accuracy skills
// (image models draw confidently wrong maps).

import { generateText } from "ai";
import { writeFile, readFile, rm, mkdtemp } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import path from "node:path";

const run = promisify(execFile);

const URL = process.env.PROD_URL;
const KEY = process.env.PROD_KEY;
if (!URL || !KEY) {
  console.error("Need PROD_URL and PROD_KEY (service role) env vars.");
  process.exit(1);
}

const PAINT_MODEL = "google/gemini-3.1-flash-image-preview";
const TEXT_MODEL = "anthropic/claude-haiku-4.5";

// Science skills already covered by hand-made ScienceDiagram SVGs (see
// ScienceDiagram.tsx pick()) — those stay authoritative.
const SCIENCE_SVG_COVERED =
  /watercycle|solar|lifecycle|plants|matter|moon|daynight|foodweb|circuit|magnet|senses|livingnonliving|animalneeds|animalbabies|weather|force|pushpull|energy|body|season|habitat/;

// Geography skills where the visual IS the geography — a wrong AI map teaches
// wrong facts. Excluded until real SVG maps exist.
const GEO_MAPPY =
  /map|globe|direction|latlong|hemisphere|continent|ocean|usregions|usa|world|regions/;

const STYLE = [
  "Cute flat vector-style illustration for a children's learning app, wide landscape composition.",
  "Soft rounded shapes, bold clean outlines, bright cheerful pastel colors, sunny friendly mood.",
  "Absolutely no words, letters, numbers, or signs anywhere in the image.",
  "No photorealism, no watermark.",
].join(" ");

const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: H });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

/** PostgREST caps responses at 1000 rows — page through the whole set. */
async function restAll(path) {
  const all = [];
  for (let from = 0; ; from += 1000) {
    const res = await fetch(`${URL}/rest/v1/${path}`, {
      headers: { ...H, Range: `${from}-${from + 999}` },
    });
    if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
    const page = await res.json();
    all.push(...page);
    if (page.length < 1000) return all;
  }
}

/** All (subject, skill) pairs the pilot should cover. */
async function targetSkills() {
  const rows = await restAll(
    "questions?subject_id=in.(civics,economics,history,geography,science)&select=subject_id,skill&order=id",
  );
  const counts = new Map();
  for (const r of rows) {
    if (!r.skill) continue;
    const k = `${r.subject_id}/${r.skill}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const targets = [];
  for (const [key, n] of counts) {
    const [subject, skill] = key.split("/");
    if (n < 3) continue; // stray/legacy skills
    if (subject === "science" && SCIENCE_SVG_COVERED.test(skill)) continue;
    if (subject === "geography" && GEO_MAPPY.test(skill)) continue;
    targets.push({ subject, skill });
  }
  return targets.sort((a, b) => a.subject.localeCompare(b.subject) || a.skill.localeCompare(b.skill));
}

async function artDirect(subject, skill, samples) {
  const { text } = await generateText({
    model: TEXT_MODEL,
    system: [
      "You are the art director for a cheerful K-5 learning app.",
      "Given a quiz skill and sample questions, write ONE sentence describing a single scene to illustrate the topic.",
      "Hard rules: the scene must not reveal or hint at the answer to any question;",
      "no readable text, letters, numbers, signs, or labels; no maps, globes, or geographic outlines;",
      "no likenesses of specific real people (show generic friendly characters or objects instead);",
      "kid-appropriate, warm, concrete, and visually simple. Florida/summer touches welcome when natural.",
      "Reply with the sentence only.",
    ].join(" "),
    prompt: `Subject: ${subject}\nSkill id: ${skill}\nSample questions:\n${samples
      .map((s) => `- ${s}`)
      .join("\n")}`,
    maxOutputTokens: 120,
    providerOptions: { gateway: { tags: ["feature:skill-art"] } },
  });
  return text.trim().replace(/^"|"$/g, "");
}

async function paint(scene) {
  const result = await generateText({
    model: PAINT_MODEL,
    prompt: `${STYLE}\n\nThe scene: ${scene}`,
    providerOptions: { gateway: { tags: ["feature:skill-art"] } },
  });
  const image = result.files.find((f) => f.mediaType?.startsWith("image/"));
  if (!image) throw new Error(`no image returned (${result.text?.slice(0, 100) || "no text"})`);
  return image;
}

async function verify(image, scene) {
  const { text } = await generateText({
    model: TEXT_MODEL,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", image: image.uint8Array },
          {
            type: "text",
            text: [
              `This image should illustrate: "${scene}" for a K-5 children's learning app.`,
              "Check: (1) matches the scene, (2) appropriate for young children,",
              "(3) contains NO readable text/letters/numbers, (4) no map or geographic outline,",
              "(5) no likeness of a specific real person.",
              'Reply with ONLY JSON: {"ok": true|false, "reason": "<short reason if not ok>"}',
            ].join(" "),
          },
        ],
      },
    ],
    maxOutputTokens: 100,
    providerOptions: { gateway: { tags: ["feature:skill-art"] } },
  });
  try {
    const m = text.match(/\{.*\}/s);
    return m ? JSON.parse(m[0]) : { ok: false, reason: `unparseable verdict: ${text.slice(0, 80)}` };
  } catch {
    return { ok: false, reason: `unparseable verdict: ${text.slice(0, 80)}` };
  }
}

/** Model output is ~1MB/1500px; banners render at ≤700px. sips is macOS-only,
 *  matching where this script runs — elsewhere the full-size PNG uploads. */
async function shrink(bytes) {
  if (process.platform !== "darwin") return bytes;
  const dir = await mkdtemp(path.join(tmpdir(), "skill-art-"));
  const f = path.join(dir, "img.png");
  try {
    await writeFile(f, bytes);
    await run("sips", ["-Z", "640", f, "--out", f]);
    return await readFile(f);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function upload(subject, skill, image) {
  const bytes = await shrink(image.uint8Array);
  // Random suffix busts CDN/browser caches when a skill is regenerated.
  const key = `${subject}/${skill.replaceAll(".", "-")}-${crypto.randomUUID().slice(0, 6)}.png`;
  const res = await fetch(`${URL}/storage/v1/object/art/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "image/png" },
    body: bytes,
  });
  if (!res.ok) throw new Error(`upload: ${res.status} ${await res.text()}`);
  return `${URL}/storage/v1/object/public/art/${key}`;
}

async function upsertRow(row) {
  const res = await fetch(`${URL}/rest/v1/skill_art?on_conflict=subject_id,skill`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify([row]),
  });
  if (!res.ok) throw new Error(`upsert: ${res.status} ${await res.text()}`);
}

async function processSkill({ subject, skill }, existing, force) {
  const tag = `${subject}/${skill}`;
  if (!force && existing.has(tag)) {
    console.log(`↷ ${tag} (already has art)`);
    return;
  }
  const samples = (
    await rest(
      `questions?subject_id=eq.${subject}&skill=eq.${encodeURIComponent(skill)}&select=prompt&limit=6`,
    )
  ).map((q) => q.prompt);

  const scene = await artDirect(subject, skill, samples);

  let image = await paint(scene);
  let verdict = await verify(image, scene);
  if (!verdict.ok) {
    console.log(`  ⟳ ${tag}: repainting (${verdict.reason})`);
    image = await paint(scene);
    verdict = await verify(image, scene);
  }

  const imageUrl = await upload(subject, skill, image);
  await upsertRow({
    subject_id: subject,
    skill,
    image_url: imageUrl,
    art_prompt: scene,
    review_note: verdict.ok ? "auto-check passed" : `NEEDS A LOOK: ${verdict.reason}`,
    status: "pending",
  });
  console.log(`${verdict.ok ? "✓" : "⚠"} ${tag} — ${scene.slice(0, 80)}…`);
}

// ---- main -------------------------------------------------------------------

const arg = (name) =>
  process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : null;
const force = process.argv.includes("--force");
const concurrency = Number(arg("--concurrency") ?? 4);

let targets = await targetSkills();
if (arg("--subject")) targets = targets.filter((t) => t.subject === arg("--subject"));
if (arg("--skill")) targets = targets.filter((t) => t.skill === arg("--skill"));

const existingRows = await rest("skill_art?select=subject_id,skill");
const existing = new Set(existingRows.map((r) => `${r.subject_id}/${r.skill}`));

console.log(`Generating art for ${targets.length} skills (concurrency ${concurrency})…`);
let failed = 0;
const queue = [...targets];
await Promise.all(
  Array.from({ length: concurrency }, async () => {
    for (let t = queue.shift(); t; t = queue.shift()) {
      try {
        await processSkill(t, existing, force);
      } catch (err) {
        failed++;
        console.error(`✗ ${t.subject}/${t.skill}: ${err.message}`);
      }
    }
  }),
);
console.log(failed ? `Done with ${failed} failures.` : "Done — all clean.");
if (failed) process.exitCode = 1;
