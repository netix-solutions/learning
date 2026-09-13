import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { getMyGarden } from "@/app/actions/garden";
import { LearningGarden } from "@/components/LearningGarden";
export const metadata = { title: "My learning garden — SunSharp", robots: { index: false } };
export default async function GardenPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");
  return <main className="mx-auto max-w-2xl px-4 py-6"><Link href="/home" className="inline-flex min-h-12 items-center rounded-xl bg-white px-4 font-bold text-slate-700">← Home</Link><h1 className="mt-6 text-3xl font-bold text-slate-800">A little learning. A little growing.</h1><LearningGarden initial={await getMyGarden()} full /></main>;
}
