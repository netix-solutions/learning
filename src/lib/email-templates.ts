// Branded, email-client-safe HTML templates for SummerSharp account emails.
// Email clients are picky: everything is table-based with INLINE styles, no
// external CSS, web-safe font stacks, and a plain-text alternative. Brand colors
// mirror globals.css (orange #f57c1f, blue #1d70c2, sun #ffc223).

import {
  SUPPORT_PHONE,
  SUPPORT_PHONE_TEL,
  SUPPORT_EMAIL,
  SUPPORT_URL,
} from "@/lib/contact";

const BRAND = {
  orange: "#f57c1f",
  blue: "#1d70c2",
  sun: "#ffc223",
  ink: "#1e293b", // slate-800
  muted: "#64748b", // slate-500
  faint: "#94a3b8", // slate-400
  card: "#ffffff",
  bg: "#f1f5f9", // slate-100
};
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const SITE = "https://summersharp.app";

export type EmailContent = { subject: string; html: string; text: string };

/** Shared shell: sunny header, white card, footer. `cta` is optional. */
function layout(opts: {
  preheader: string;
  heading: string;
  bodyHtml: string;
  cta?: { label: string; url: string };
}): string {
  const { preheader, heading, bodyHtml, cta } = opts;
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;">
         <tr><td align="center" bgcolor="${BRAND.blue}" style="border-radius:9999px;">
           <a href="${cta.url}" target="_blank"
              style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:9999px;">
             ${cta.label}
           </a>
         </td></tr>
       </table>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>SummerSharp</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${BRAND.bg};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;">

        <!-- Sunny header -->
        <tr><td align="center" style="background:linear-gradient(135deg,${BRAND.sun},${BRAND.orange});background-color:${BRAND.orange};border-radius:20px 20px 0 0;padding:28px 24px 24px;">
          <div style="font-size:40px;line-height:1;">☀️</div>
          <div style="margin-top:8px;font-family:${FONT};font-size:26px;font-weight:800;letter-spacing:-0.5px;">
            <span style="color:#ffffff;">Summer</span><span style="color:#0b3a66;">Sharp</span>
          </div>
          <div style="margin-top:4px;font-family:${FONT};font-size:13px;font-weight:600;color:#ffffff;opacity:0.9;">Stay sharp all summer!</div>
        </td></tr>

        <!-- Body card -->
        <tr><td style="background:${BRAND.card};padding:32px 32px 28px;">
          <h1 style="margin:0 0 14px;font-family:${FONT};font-size:22px;font-weight:800;color:${BRAND.ink};">${heading}</h1>
          <div style="font-family:${FONT};font-size:16px;line-height:1.6;color:${BRAND.muted};">${bodyHtml}</div>
          ${button}
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:${BRAND.card};border-radius:0 0 20px 20px;border-top:1px solid #eef2f7;padding:20px 32px 28px;">
          <p style="margin:0 0 8px;font-family:${FONT};font-size:12px;line-height:1.5;color:${BRAND.faint};">
            You're receiving this because you have a SummerSharp account.
          </p>
          <p style="margin:0;font-family:${FONT};font-size:12px;line-height:1.5;color:${BRAND.faint};">
            <a href="${SITE}/privacy" style="color:${BRAND.muted};text-decoration:underline;">Privacy</a> &nbsp;·&nbsp;
            <a href="${SITE}/terms" style="color:${BRAND.muted};text-decoration:underline;">Terms</a> &nbsp;·&nbsp;
            <a href="${SITE}" style="color:${BRAND.muted};text-decoration:underline;">summersharp.app</a>
          </p>
          <p style="margin:12px 0 0;font-family:${FONT};font-size:11px;color:${BRAND.faint};">© 2026 Netix Solutions, LLC. All rights reserved.</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Welcome email sent after a parent creates their account. */
export function welcomeEmail(opts: { name?: string }): EmailContent {
  const name = (opts.name || "there").trim();
  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${escapeHtml(name)}, welcome aboard! 🎉</p>
    <p style="margin:0 0 14px;">Your SummerSharp account is ready. Here's how to get your kids learning over the break:</p>
    <ul style="margin:0 0 4px;padding-left:20px;">
      <li style="margin-bottom:8px;">Add each child a fun <strong>username and PIN</strong> — no email needed for them.</li>
      <li style="margin-bottom:8px;">They practice <strong>Math, Reading, Science</strong> and more, earning XP and badges.</li>
      <li style="margin-bottom:8px;">You watch their progress and see exactly which skills to help with.</li>
    </ul>`;
  return {
    subject: "Welcome to SummerSharp ☀️",
    html: layout({
      preheader: "Your SummerSharp account is ready — add your first learner.",
      heading: "Welcome to SummerSharp!",
      bodyHtml,
      cta: { label: "Add your first child", url: `${SITE}/parent` },
    }),
    text:
      `Hi ${name}, welcome to SummerSharp!\n\n` +
      `Your account is ready. To get started:\n` +
      `- Add each child a username and PIN (no email needed for them)\n` +
      `- They practice Math, Reading, Science and more, earning XP and badges\n` +
      `- You watch their progress and see which skills to help with\n\n` +
      `Add your first child: ${SITE}/parent\n\n` +
      `© 2026 Netix Solutions, LLC`,
  };
}

/**
 * The big welcome-guide email — sent ~5 minutes after signup (via the welcome
 * cron). Welcomes the parent, explains how the app works, and shows them how to
 * get it onto their kid's device: a generic QR to open the site, plus
 * step-by-step PWA "install like an app" instructions.
 */
export function welcomeGuideEmail(opts: { name?: string }): EmailContent {
  const name = (opts.name || "there").trim();
  const h2 = `margin:26px 0 8px;font-family:${FONT};font-size:16px;font-weight:800;color:${BRAND.ink};`;
  const li = "margin-bottom:8px;";

  const bodyHtml = `
    <p style="margin:0 0 14px;">Hi ${escapeHtml(name)}, welcome aboard — your free trial is on! 🎉</p>
    <p style="margin:0 0 6px;">SummerSharp keeps kids sharp over the break with quick, fun daily practice. Here's everything you need to get going.</p>

    <h2 style="${h2}">☀️ How it works</h2>
    <ul style="margin:0;padding-left:20px;">
      <li style="${li}">Give each child a fun <strong>username &amp; PIN</strong> — no email needed for them.</li>
      <li style="${li}">They practice <strong>Math, Reading &amp; Science</strong>, earning XP, badges and daily streaks.</li>
      <li style="${li}">You set a <strong>daily time goal</strong> and watch progress from your parent dashboard.</li>
    </ul>

    <h2 style="${h2}">📱 Put it on your kid's device</h2>
    <p style="margin:0 0 14px;">Scan this with your child's iPad, tablet, or phone camera to open SummerSharp right on their device:</p>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 10px;">
      <tr><td align="center" style="background:#ffffff;border:1px solid #eef2f7;border-radius:16px;padding:14px;">
        <img src="${SITE}/install-qr.png" width="180" height="180" alt="Scan to open SummerSharp" style="display:block;width:180px;height:180px;border-radius:8px;">
      </td></tr>
    </table>
    <p style="margin:0 0 4px;font-size:14px;color:${BRAND.faint};text-align:center;">Or just open <a href="${SITE}" style="color:${BRAND.blue};text-decoration:underline;">summersharp.app</a> in the device's browser.</p>

    <h2 style="${h2}">⬇️ Install it like an app (no app store)</h2>
    <p style="margin:0 0 12px;">Make SummerSharp open full-screen like a real app, with its own home-screen icon:</p>
    <ul style="margin:0;padding-left:20px;">
      <li style="${li}"><strong>iPhone / iPad (Safari):</strong> tap the <strong>Share</strong> icon, then <strong>Add to Home Screen</strong>.</li>
      <li style="${li}"><strong>Android (Chrome):</strong> tap the <strong>⋮</strong> menu, then <strong>Install app</strong> (or "Add to Home screen").</li>
    </ul>
    <p style="margin:8px 0 0;">That's it — tap the new icon and it opens like an app, no browser bars.</p>

    <h2 style="${h2}">💻 On your computer? Instant handoff</h2>
    <p style="margin:0;">From your dashboard, tap <strong>📱 Play on a phone</strong> to show a QR that logs your kid straight into their account on a phone — no typing a username or PIN.</p>

    <h2 style="${h2}">We're here to help</h2>
    <p style="margin:0;">Questions any time, 24/7: <a href="tel:${SUPPORT_PHONE_TEL}" style="color:${BRAND.blue};text-decoration:underline;">${SUPPORT_PHONE}</a> &middot; <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND.blue};text-decoration:underline;">${SUPPORT_EMAIL}</a> &middot; <a href="${SUPPORT_URL}" style="color:${BRAND.blue};text-decoration:underline;">help center</a>.</p>`;

  return {
    subject: "Welcome to SummerSharp — get it on your kid's device 📱",
    html: layout({
      preheader:
        "How SummerSharp works, plus how to add it to your child's iPad, tablet or phone.",
      heading: "Welcome — let's get your learners going!",
      bodyHtml,
      cta: { label: "Open my dashboard", url: `${SITE}/parent` },
    }),
    text:
      `Hi ${name}, welcome to SummerSharp — your free trial is on!\n\n` +
      `HOW IT WORKS\n` +
      `- Give each child a username & PIN (no email needed for them)\n` +
      `- They practice Math, Reading & Science, earning XP, badges and streaks\n` +
      `- You set a daily time goal and watch progress from your dashboard\n\n` +
      `PUT IT ON YOUR KID'S DEVICE\n` +
      `Open ${SITE} in your child's iPad/tablet/phone browser (or scan the QR code in this email).\n\n` +
      `INSTALL IT LIKE AN APP (no app store)\n` +
      `- iPhone/iPad (Safari): Share icon -> Add to Home Screen\n` +
      `- Android (Chrome): menu (three dots) -> Install app\n` +
      `Then tap the new home-screen icon and it opens full-screen like a real app.\n\n` +
      `ON YOUR COMPUTER\n` +
      `Tap "Play on a phone" on your dashboard to show a QR that logs your kid in on a phone instantly.\n\n` +
      `NEED HELP? We're here 24/7: ${SUPPORT_PHONE} · ${SUPPORT_EMAIL} · ${SUPPORT_URL}\n\n` +
      `Open your dashboard: ${SITE}/parent\n\n` +
      `© 2026 Netix Solutions, LLC`,
  };
}

/** Generic account notice (e.g., password changed, security notices). */
export function accountNoticeEmail(opts: {
  heading: string;
  message: string;
  cta?: { label: string; url: string };
  preheader?: string;
}): EmailContent {
  return {
    subject: opts.heading,
    html: layout({
      preheader: opts.preheader ?? opts.heading,
      heading: opts.heading,
      bodyHtml: `<p style="margin:0;">${escapeHtml(opts.message)}</p>`,
      cta: opts.cta,
    }),
    text: `${opts.message}${opts.cta ? `\n\n${opts.cta.label}: ${opts.cta.url}` : ""}\n\n© 2026 Netix Solutions, LLC`,
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
