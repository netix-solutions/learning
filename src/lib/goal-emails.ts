import type { EmailContent } from "@/lib/email-templates";

// Branded emails sent to a parent about a child's learning-time goal. Kept
// self-contained (a small inline layout) so this never collides with the main
// email-templates module.

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shell(heading: string, bodyHtml: string, cta = true): string {
  return `<!doctype html><html><body style="margin:0;background:#eef6ff;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#143a5e">
  <div style="max-width:520px;margin:0 auto;padding:24px">
    <div style="text-align:center;padding:8px 0 16px">
      <span style="font-size:22px;font-weight:800;color:#f57c1f">Summer</span><span style="font-size:22px;font-weight:800;color:#1d70c2">Sharp</span>
    </div>
    <div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 10px 30px -12px rgba(80,30,140,.25)">
      <h1 style="margin:0 0 12px;font-size:22px;color:#0f172a">${heading}</h1>
      ${bodyHtml}
      ${cta ? `<a href="https://summersharp.app/parent" style="display:inline-block;margin-top:18px;background:linear-gradient(90deg,#1d70c2,#2aa7e6);color:#fff;text-decoration:none;font-weight:800;padding:12px 22px;border-radius:9999px">Open your dashboard →</a>` : ""}
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:16px">
      SummerSharp · You're receiving this because you set a learning goal.
    </p>
  </div></body></html>`;
}

/** Sent once when a child reaches their weekly goal. */
export function goalMetEmail(opts: {
  childName: string;
  daysPerWeek: number;
  minutesPerDay: number;
}): EmailContent {
  const name = esc(opts.childName);
  const subject = `🎉 ${opts.childName} hit their weekly SummerSharp goal!`;
  const body = `
    <p style="margin:0 0 10px;font-size:15px;line-height:1.6">
      Way to go — <strong>${name}</strong> reached the goal of practicing
      <strong>${opts.minutesPerDay} minutes a day, ${opts.daysPerWeek} day${opts.daysPerWeek === 1 ? "" : "s"} this week.</strong> 🌟
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#475569">
      Consistency is how summer learning sticks. Tell ${name} you're proud!
    </p>`;
  return { subject, html: shell("Goal reached! 🏆", body), text: subject };
}

/** Sent late in the week when a child is behind and the goal is at risk. */
export function goalReminderEmail(opts: {
  childName: string;
  daysPerWeek: number;
  minutesPerDay: number;
  daysSoFar: number;
}): EmailContent {
  const name = esc(opts.childName);
  const remaining = Math.max(0, opts.daysPerWeek - opts.daysSoFar);
  const subject = `⏰ ${opts.childName} is close to missing this week's goal`;
  const body = `
    <p style="margin:0 0 10px;font-size:15px;line-height:1.6">
      <strong>${name}</strong> has hit the daily goal
      <strong>${opts.daysSoFar} of ${opts.daysPerWeek}</strong> days this week —
      <strong>${remaining} more ${remaining === 1 ? "day" : "days"}</strong> to go before the week ends.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:#475569">
      A quick ${opts.minutesPerDay}-minute session today would keep the streak alive. You've got this! 💪
    </p>`;
  return { subject, html: shell("Almost there! ⏰", body), text: subject };
}
