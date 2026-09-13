// Public URL changes independently of the brand and child account identifiers.
// Keep the working address until the replacement domain is connected.
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://sunsharp.app").replace(/\/$/, "");
