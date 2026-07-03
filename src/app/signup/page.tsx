import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { ParentSignupForm } from "@/components/forms/ParentSignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — SummerSharp",
  description:
    "Create your free family account and keep your K–5 kids sharp all summer with fun math, reading, and science practice.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <BrandLogo />
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold text-slate-800">
          Create your family account
        </h1>
        <p className="mb-5 mt-1 text-center text-slate-500">
          You&apos;ll add your kids&apos; logins next.
        </p>
        <ParentSignupForm />
      </div>
      <Link href="/" className="mt-6 font-semibold text-slate-500 hover:text-slate-700">
        ← Back home
      </Link>
    </main>
  );
}
