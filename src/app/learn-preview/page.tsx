import { notFound } from "next/navigation";
import { LessonJourney } from "@/app/learn/LessonJourney";
import { lessonsForGrade } from "@/lib/lessons";
import { GRADES, type Grade } from "@/lib/types";

// Local visual/content review only. Production lessons always require student auth.
export default async function LessonPreview({ searchParams }: { searchParams: Promise<{ grade?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { grade = "K" } = await searchParams;
  if (!GRADES.includes(grade as Grade)) notFound();
  return <LessonJourney lessons={lessonsForGrade(grade as Grade)} studentId={`preview-${grade}`} trackActivity={false} />;
}
