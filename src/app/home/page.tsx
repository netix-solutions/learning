import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { Avatar } from "@/components/Avatar";
import { LearningRewards } from "@/components/LearningRewards";
import { getMyTrain } from "@/app/actions/train";
import { getMyGarden } from "@/app/actions/garden";
import { GradeWelcome } from "@/components/GradeWelcome";
import { HomeLearningChoices } from "@/components/HomeLearningChoices";
import { type Subject } from "@/lib/types";

export default async function StudentHome() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");

  const [{ data: subjects }, garden, train] = await Promise.all([
    supabase.rpc("get_grade_subjects", { p_grade: profile.grade }),
    getMyGarden(),
    getMyTrain().catch(() => undefined),
  ]);

  return (
    <main data-grade={profile.grade} className="grade-home home-dashboard mx-auto w-full max-w-6xl px-4 py-8">
      <section className="home-greeting flex items-center gap-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white sm:h-16 sm:w-16">
          <Avatar id={profile.avatar} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold text-slate-800 sm:text-2xl">
            Hi, {profile.display_name}!
          </h1>
          <p className="mt-1 text-base text-slate-600">A little curiosity goes a long way.</p>
        </div>
      </section>

      <GradeWelcome grade={profile.grade} />
      <div className="home-columns"><HomeLearningChoices grade={profile.grade} subjects={(subjects ?? []) as Subject[]} />

      <aside className="home-rewards"><LearningRewards grade={profile.grade} initialGarden={garden} initialTrain={train} /></aside></div>
    </main>
  );
}
