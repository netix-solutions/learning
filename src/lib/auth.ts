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
