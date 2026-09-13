import { notFound } from "next/navigation";
import { HomeLearningChoices } from "@/components/HomeLearningChoices";
import { LearningGarden } from "@/components/LearningGarden";
import { gardenProgress } from "@/lib/garden";
import { BrandLogo } from "@/components/BrandLogo";
import type { Grade, Subject } from "@/lib/types";

export const metadata = { title: "Home preview — SunSharp", robots: { index: false, follow: false } };
const subjects: Subject[] = [
  { id: "math", name: "Math", emoji: "➕", color: "blue", sort: 0 },
  { id: "reading", name: "Reading", emoji: "📚", color: "purple", sort: 1 },
  { id: "science", name: "Science", emoji: "🔬", color: "green", sort: 2 },
  { id: "geography", name: "Geography", emoji: "🗺️", color: "blue", sort: 3 },
  { id: "history", name: "History", emoji: "📜", color: "orange", sort: 4 },
  { id: "civics", name: "Civics", emoji: "🏛️", color: "purple", sort: 5 },
  { id: "economics", name: "Economics", emoji: "💰", color: "green", sort: 6 },
];
export default async function HomePreview({ searchParams }: { searchParams: Promise<{ grade?: string; flowers?: string; garden?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const params = await searchParams;
  const grade = (["PK", "K", "1", "2", "3", "4", "5"].includes(params.grade ?? "") ? params.grade : "3") as Grade;
  return <main className="mx-auto max-w-2xl px-4 py-5">
    <BrandLogo href={null} />
    <h1 className="mt-4 text-2xl font-bold text-slate-800">Hi, Sunny!</h1>
    <HomeLearningChoices grade={grade} subjects={grade === "PK" ? subjects.slice(0, 3) : subjects} />
    <LearningGarden full={params.garden === "full"} initial={params.flowers && /^\d{1,4}$/.test(params.flowers) ? gardenProgress(0, Number(params.flowers)) : gardenProgress(18, 2)} />
    <p className="mt-6 text-sm text-slate-600">Grade {grade} preview · sample data</p>
  </main>;
}
