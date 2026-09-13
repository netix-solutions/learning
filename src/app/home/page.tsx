import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar } from "@/components/Avatar";
import { SignOutButton } from "@/components/SignOutButton";
import { LearningGarden } from "@/components/LearningGarden";
import { getMyGarden } from "@/app/actions/garden";
import { HomeLearningChoices } from "@/components/HomeLearningChoices";
import { type Subject } from "@/lib/types";

export default async function StudentHome() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");

  const [{ data: subjects }, garden] = await Promise.all([
    supabase.rpc("get_grade_subjects", { p_grade: profile.grade }),
    getMyGarden(),
  ]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      <header className="mb-4 flex items-center justify-between gap-2">
        <BrandLogo href={null} />
        {/* "Grown-up" (switch to parent) lives in the kid footer, so the top
            bar just needs Sign out — keeps the logo from crowding on phones. */}
        <div className="flex shrink-0 items-center gap-2">
          <SignOutButton className="min-h-12" />
        </div>
      </header>

      <section className="card-fun flex items-center gap-3 p-4 sm:gap-4 sm:p-5">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-3xl ring-4 ring-white sm:h-16 sm:w-16">
          <Avatar id={profile.avatar} className="h-full w-full" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-bold text-slate-800 sm:text-2xl">
            Hi, {profile.display_name}!
          </h1>
          <p className="mt-1 text-base text-slate-600">Ready to discover something?</p>
        </div>
      </section>

      <HomeLearningChoices grade={profile.grade} subjects={(subjects ?? []) as Subject[]} />

      <LearningGarden initial={garden} />
    </main>
  );
}
