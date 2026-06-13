import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { KidLoginForm } from "@/components/forms/KidLoginForm";

export default async function KidsLoginPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <BrandLogo />
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="mb-1 text-center font-display text-3xl font-bold text-slate-800">
          Hi there! 🎒
        </h1>
        <p className="mb-5 text-center text-slate-500">
          Log in to keep your streak going!
        </p>
        <KidLoginForm />
      </div>
      <Link href="/login" className="mt-6 font-semibold text-slate-500 hover:text-slate-700">
        👋 Grown-ups log in here
      </Link>
    </main>
  );
}
