import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { welcomeGuideEmail } from "@/lib/email-templates";

// Frequent Vercel Cron (every ~5 min). Sends the big welcome-guide email — with
// the "open on your kid's device" QR + PWA install steps — to each new parent
// roughly 5 minutes after they sign up (their free trial begins at signup).
//
// "Sent once" is tracked in the parent's auth user_metadata.welcome_guide_sent_at
// (no DB migration needed). We look at accounts created 5–20 min ago so the job
// can run on a 5-min cadence and never miss or double-send.
//
// ?dry=1 reports who WOULD be emailed without sending or marking.
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const admin = createAdminClient();

  const now = Date.now();
  const fromIso = new Date(now - 20 * 60 * 1000).toISOString(); // created ≤ 20 min ago
  const toIso = new Date(now - 5 * 60 * 1000).toISOString(); // and ≥ 5 min ago

  const { data: parents } = await admin
    .from("profiles")
    .select("id, display_name, created_at")
    .eq("role", "parent")
    .gte("created_at", fromIso)
    .lte("created_at", toIso);

  const out: Array<{ to: string; sent: boolean; skipped?: boolean }> = [];

  for (const p of parents ?? []) {
    const { data: pu } = await admin.auth.admin.getUserById(p.id as string);
    const u = pu?.user;
    if (!u?.email) continue;

    const meta = (u.user_metadata ?? {}) as { welcome_guide_sent_at?: string };
    if (meta.welcome_guide_sent_at) continue; // already sent — dedup

    if (dry) {
      out.push({ to: u.email, sent: false });
      continue;
    }

    const content = welcomeGuideEmail({ name: (p.display_name as string) || undefined });
    const res = await sendEmail({ to: u.email, ...content });

    // Mark sent unless we skipped because email isn't configured yet (so it
    // still goes out once Resend is set up). Marking on a real attempt prevents
    // resend spam on the next run.
    if (!res.skipped) {
      await admin.auth.admin.updateUserById(p.id as string, {
        user_metadata: { ...meta, welcome_guide_sent_at: new Date().toISOString() },
      });
    }
    out.push({ to: u.email, sent: res.ok, skipped: res.skipped });
  }

  return Response.json({ ok: true, dry, candidates: (parents ?? []).length, emails: out });
}
