import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Current auth user + their profile (or nulls if signed out). */
export async function getSessionProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, profile: null as Profile | null, supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: (profile as Profile) ?? null, supabase };
}

/** Convert a kid username into the synthetic email used for auth. */
export function childEmail(username: string) {
  const domain =
    process.env.NEXT_PUBLIC_CHILD_EMAIL_DOMAIN ?? "students.summersharp.local";
  return `${username.trim().toLowerCase()}@${domain}`;
}

/**
 * Supabase requires a password of at least 6 characters, but kids only ever
 * type their 4-digit PIN. We derive a stable >=6-char password from the PIN so
 * the short, kid-friendly PIN keeps working on hosted Supabase. Used identically
 * when creating a child and when the child signs in.
 */
export function childPassword(pin: string) {
  return `ss-${pin.trim()}`;
}
