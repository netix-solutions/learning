// Branded, email-client-safe HTML templates for SummerSharp account emails.
// Email clients are picky: everything is table-based with INLINE styles, no
// external CSS, web-safe font stacks, and a plain-text alternative. Brand colors
// mirror globals.css (orange #f57c1f, blue #1d70c2, sun #ffc223).

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
