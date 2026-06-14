import { streamText } from "ai";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { teachFor } from "@/lib/teaching";

// Node runtime (not edge): the service-role admin client and gateway OIDC are happiest here.
export const runtime = "nodejs";
export const maxDuration = 30;

// Coarse per-student burst guard. In-memory, so it's per serverless instance —
// not a global limiter, but enough to stop a kid hammering a billed endpoint.
const hits = new Map<string, number[]>();
const LIMIT = 8;
const WINDOW_MS = 60_000;
function rateLimited(id: string): boolean {
  const now = Date.now();
  const recent = (hits.get(id) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(id, recent);
  return recent.length > LIMIT;
}

export async function POST(req: Request) {
  // 1. Must be a signed-in student.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Please sign in first.", { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "student") return new Response("Students only.", { status: 403 });

  if (rateLimited(user.id))
    return new Response("Let's slow down a little — try again in a minute! 🙂", { status: 429 });

  // 2. Load the question WITH its answer key, server-side only (service role bypasses RLS).
  const body = (await req.json().catch(() => ({}))) as {
    questionId?: string;
    selectedIndex?: number;
  };
  const questionId = String(body.questionId ?? "");
  if (!questionId) return new Response("Missing question.", { status: 400 });

  const admin = createAdminClient();
  const { data: q } = await admin
    .from("questions")
    .select("subject_id, grade, prompt, choices, answer_index, explanation, skill")
    .eq("id", questionId)
    .single();
  if (!q) return new Response("Question not found.", { status: 404 });

  const choices = (q.choices as string[]) ?? [];
  const correct = choices[q.answer_index];
  const sel = body.selectedIndex;
  const chosen = Number.isInteger(sel) && sel! >= 0 && sel! < choices.length ? choices[sel!] : null;
  const subject = ["reading", "science"].includes(q.subject_id) ? q.subject_id : "math";
  const teach = teachFor(q.skill);

  // 3. Grounded, tightly-scoped, kid-safe tutor prompt. The model only elaborates
  //    the KNOWN-CORRECT answer + explanation — it must not assert new facts.
  const system = [
    `You are a warm, patient tutor for a Grade ${q.grade} child.`,
    `Use very simple words and short sentences a Grade ${q.grade} student understands. Be encouraging and add a little emoji.`,
    `Teach ONLY this one ${subject} problem. If the topic is anything else, gently say you can only help with this question right now.`,
    `Ground everything ONLY in the correct answer and the reason provided below. Do NOT introduce new facts, numbers, rules, or claims beyond them, and never say the correct answer is anything other than what is given.`,
    `Never ask for or mention any personal information.`,
    `Explain in at most 4 short steps, then end with one short cheer. Plain text only — no markdown headings or bullet symbols.`,
  ].join(" ");

  const userPrompt = [
    `Skill: ${teach?.title ?? q.skill ?? subject}.`,
    `Question: ${q.prompt}`,
    `Answer choices: ${choices.join("  |  ")}`,
    `The correct answer is: ${correct}.`,
    q.explanation ? `Why it is correct: ${q.explanation}` : "",
    chosen != null ? `The child just answered "${chosen}", which is not correct.` : "",
    `Gently explain ${chosen != null ? "why that answer isn't right, then " : ""}how to reach the correct answer, step by step, so they understand it next time.`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = streamText({
    model: "anthropic/claude-haiku-4.5",
    system,
    prompt: userPrompt,
    maxOutputTokens: 500,
  });

  return result.toTextStreamResponse();
}
