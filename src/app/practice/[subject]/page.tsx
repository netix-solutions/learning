import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getStudentEntitlement } from "@/lib/entitlement";
import { PracticeLocked } from "@/components/PracticeLocked";
import type { Subject } from "@/lib/types";
import { PracticeClient } from "./PracticeClient";

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams: Promise<{ game?: string }>;
}) {
  const { subject } = await params;
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student" || !profile.grade) redirect("/parent");

  // Paywall (no-op while BILLING_ENABLED is off — entitlement defaults to true).
  const entitlement = await getStudentEntitlement(user.id);
  if (!entitlement.entitled) return <PracticeLocked />;

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

  const { game } = await searchParams;
  const skill = subject === 'math' && game === 'numberline' && ['1', '2'].includes(profile.grade) ? `${profile.grade}.numberline` : undefined;
  return <PracticeClient key={`${user.id}:${profile.grade}:${skill ?? 'mixed'}`} studentId={user.id} subject={meta} grade={profile.grade} skill={skill} />;
}
