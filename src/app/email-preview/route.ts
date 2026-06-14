// TEMPORARY preview of the branded email template. Safe to delete.
import { welcomeEmail } from "@/lib/email-templates";

export function GET() {
  return new Response(welcomeEmail({ name: "Andrew" }).html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
