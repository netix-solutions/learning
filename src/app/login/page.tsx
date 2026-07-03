import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { ParentLoginForm } from "@/components/forms/ParentLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent login — SummerSharp",
  description: "Log in to your SummerSharp parent dashboard.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <BrandLogo />
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="mb-5 text-center font-display text-2xl font-bold text-slate-800">
          Grown-up login 👋
        </h1>
        <ParentLoginForm />
      </div>
      <Link href="/kids" className="mt-6 font-semibold text-slate-500 hover:text-slate-700">
        🎒 Are you a kid? Log in here
      </Link>
    </main>
  );
}
