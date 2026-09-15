"use server";
import { getSessionProfile } from "@/lib/auth";
import { gardenProgress, type GardenProgress } from "@/lib/garden";
export async function getMyGarden(): Promise<GardenProgress | null> {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user || profile?.role !== "student") return null;
  const [attempts, lessons, baseline] = await Promise.all([
    supabase.from("attempts").select("id", { count: "exact", head: true }).eq("student_id", user.id),
    supabase.from("learning_runs").select("id", { count: "exact", head: true }).eq("student_id", user.id).not("completed_at", "is", null),
    supabase.from("reward_reset_baselines").select("attempts,lessons").eq("student_id", user.id).maybeSingle(),
  ]);
  if (attempts.error || lessons.error || baseline.error) return null;
  return gardenProgress((attempts.count ?? 0) - Number(baseline.data?.attempts ?? 0), (lessons.count ?? 0) - Number(baseline.data?.lessons ?? 0));
}
