import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import type { Subject } from "@/lib/types";
import { PracticeClient } from "./PracticeClient";

export default async function PracticePage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = await params;
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student" || !profile.grade) redirect("/parent");

  let meta: Subject;
  if (subject === "daily") {
    meta = { id: "daily", name: "Daily Challenge", emoji: "⭐", color: "blue", sort: 0 };
  } else {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subject)
      .maybeSingle();
    if (!data) redirect("/home");
    meta = data as Subject;
  }

  return <PracticeClient subject={meta} grade={profile.grade} />;
}
