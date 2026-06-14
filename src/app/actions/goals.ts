"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clampDays, clampMinutes } from "@/lib/goals";

export type GoalFormState = { error: string | null; success: string | null };

/** A parent sets (or clears) the weekly time goal for one of their children. */
export async function setGoal(
  _prev: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please sign in again.", success: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "parent")
    return { error: "Only a parent account can set goals.", success: null };

  const childId = String(formData.get("child_id") ?? "");
  const days = clampDays(Number(formData.get("days_per_week")));
  const minutes = clampMinutes(Number(formData.get("minutes_per_day")));

  const admin = createAdminClient();
  // Confirm the parent owns this child.
  const { data: link } = await admin
    .from("parent_child")
    .select("child_id")
    .eq("parent_id", user.id)
    .eq("child_id", childId)
    .maybeSingle();
  if (!link) return { error: "That child isn't on your account.", success: null };

  const { error } = await admin.from("child_goals").upsert(
    {
      child_id: childId,
      days_per_week: days,
      minutes_per_day: minutes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id" },
  );
  if (error) return { error: "Could not save the goal. Try again.", success: null };

  revalidatePath(`/parent/child/${childId}`);
  revalidatePath("/parent");
  return {
    error: null,
    success: `Goal set: ${minutes} min/day, ${days} day${days === 1 ? "" : "s"}/week.`,
  };
}
