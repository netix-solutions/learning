import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase client using the service-role / secret key.
 * SERVER ONLY — `server-only` makes the build fail if this is ever imported
 * into client code. Used to provision child logins (auth.admin) and to write
 * parent_child links, which bypass RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
