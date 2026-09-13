import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getStudentEntitlement } from "@/lib/entitlement";
import { PracticeLocked } from "@/components/PracticeLocked";
import { lessonsForGrade } from "@/lib/lessons";
import { LessonJourney } from "./LessonJourney";

export const metadata = { title: "Learn step by step — SummerSharp", robots: { index: false } };

export default async function LearnPage() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student" || !profile.grade) redirect("/parent");
  const entitlement = await getStudentEntitlement(user.id);
  if (!entitlement.entitled) return <PracticeLocked />;
  const { data: completed } = await supabase.from("learning_runs").select("lesson_id").eq("student_id", user.id).eq("grade", profile.grade).not("completed_at", "is", null);
  return <LessonJourney initialCompleted={[...new Set((completed ?? []).map(row => row.lesson_id as string))]} lessons={lessonsForGrade(profile.grade)} studentId={user.id} />;
}
