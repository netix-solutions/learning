import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { goalMetEmail, goalReminderEmail } from "@/lib/goal-emails";
import type { GoalProgress } from "@/lib/goals";

// Daily Vercel Cron. Checks each child's weekly goal and emails the parent when
// the goal is met (once) or is about to be missed (Saturday, if behind). Day/
// week math lives in goal_progress (ET). Dedup via goal_notifications.
//
// Pass ?dry=1 to compute + report WITHOUT sending or recording — used to verify
// the logic (the email half is dormant until Resend/DNS is configured anyway).
export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`.
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) return new Response("Unauthorized", { status: 401 });

  const dry = new URL(req.url).searchParams.get("dry") === "1";
  const admin = createAdminClient();

  const { data: goals } = await admin.from("child_goals").select("child_id");
  const out: Array<{ child: string; kind: string; to?: string; sent: boolean }> = [];
  let checked = 0;

  for (const row of goals ?? []) {
    checked++;
    const childId = row.child_id as string;
    const { data: progRaw } = await admin.rpc("goal_progress", { p_child: childId });
    const p = progRaw as GoalProgress | null;
    if (!p) continue;

    // Decide which (if any) notification is due.
    // Met → celebrate (once). Otherwise, late in the week (Fri/Sat) and behind →
    // nudge once. The weekly dedup means it fires the first qualifying day (Fri).
    let kind: "met" | "reminder" | null = null;
    if (p.week_met) kind = "met";
    else if (p.dow >= 5 && p.week_goal_days < p.days_per_week) kind = "reminder";
    if (!kind) continue;

    // Dedup: one of each kind per child per week.
    const { data: already } = await admin
      .from("goal_notifications")
      .select("kind")
      .eq("child_id", childId)
      .eq("week_start", p.week_start)
      .eq("kind", kind)
      .maybeSingle();
    if (already) continue;

    // Resolve child name + a parent email.
    const { data: child } = await admin
      .from("profiles")
      .select("display_name")
      .eq("id", childId)
      .single();
    const { data: links } = await admin
      .from("parent_child")
      .select("parent_id")
      .eq("child_id", childId);

    let to: string | undefined;
    for (const l of links ?? []) {
      const { data: pu } = await admin.auth.admin.getUserById(l.parent_id as string);
      if (pu?.user?.email) {
        to = pu.user.email;
        break;
      }
    }
    if (!to) continue;

    const childName = child?.display_name ?? "Your child";
    const content =
      kind === "met"
        ? goalMetEmail({ childName, daysPerWeek: p.days_per_week, minutesPerDay: p.minutes_per_day })
        : goalReminderEmail({
            childName,
            daysPerWeek: p.days_per_week,
            minutesPerDay: p.minutes_per_day,
            daysSoFar: p.week_goal_days,
          });

    let sent = false;
    if (!dry) {
      const res = await sendEmail({ to, ...content });
      sent = res.ok;
      // Record so we don't resend this kind this week (even if delivery is
      // pending DNS — we attempted it; avoids retry spam once it works).
      await admin
        .from("goal_notifications")
        .insert({ child_id: childId, week_start: p.week_start, kind });
    }
    out.push({ child: childName, kind, to, sent });
  }

  return Response.json({ ok: true, dry, checked, notifications: out });
}
