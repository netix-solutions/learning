import "server-only";

import type { EmailContent } from "@/lib/email-templates";

/**
 * Transactional email via Resend (https://resend.com). SERVER ONLY.
 *
 * Configured by env:
 *   RESEND_API_KEY — secret API key (never expose to the browser)
 *   EMAIL_FROM     — verified sender, e.g. "SummerSharp <noreply@summersharp.app>"
 *
 * Sending NEVER throws: if the key is missing or Resend errors, we log and return
 * { ok:false } so callers (e.g. signup) are never broken by email problems. The
 * `summersharp.app` domain must be verified in Resend before delivery works.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "SummerSharp <noreply@summersharp.app>";

export type SendResult = { ok: boolean; skipped?: boolean; error?: string };

export async function sendEmail(
  args: { to: string | string[] } & EmailContent,
): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[email] RESEND_API_KEY not set — skipping send to", args.to);
    return { ok: false, skipped: true };
  }
  const from = process.env.EMAIL_FROM || DEFAULT_FROM;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(args.to) ? args.to : [args.to],
        subject: args.subject,
        html: args.html,
        text: args.text,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[email] Resend ${res.status}:`, detail.slice(0, 300));
      return { ok: false, error: `resend_${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: "network" };
  }
}
