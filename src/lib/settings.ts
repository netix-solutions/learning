import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";

const ROW_ID = "singleton";

/**
 * The master "is billing on?" flag. Operator-controlled from /admin and stored
 * in app_settings, so it flips with a single click — no redeploy.
 *
 * Falls back to the BILLING_ENABLED env var if the app_settings table/row isn't
 * there yet, so this is safe to deploy before the migration is applied. Cached
 * per request (React cache) to dedupe within a single render.
 */
export const isBillingOn = cache(async (): Promise<boolean> => {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("app_settings")
      .select("billing_enabled")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) throw error;
    if (data) return !!data.billing_enabled;
  } catch {
    // app_settings not migrated yet — fall back to the env var.
  }
  return process.env.BILLING_ENABLED === "true";
});

/** Set the billing flag (caller must authorize — see adminSetBilling). */
export async function setBillingOn(
  enabled: boolean,
): Promise<{ error: string | null }> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("app_settings")
    .upsert({
      id: ROW_ID,
      billing_enabled: enabled,
      updated_at: new Date().toISOString(),
    });
  return { error: error ? "Could not save the setting." : null };
}
