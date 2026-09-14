import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AuthLayout } from "@/components/AuthLayout";
import { ParentSignupForm } from "@/components/forms/ParentSignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up — SunSharp",
  description:
    "Create your free family account and keep your K–5 kids sharp all summer with fun math, reading, and science practice.",
  alternates: { canonical: "/signup" },
};

export default async function SignupPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return <AuthLayout title="A brighter place to learn." intro="Set up your family, choose a grade, and let curiosity take it from there." formTitle="Create your family account" formHint="You’ll add your child’s login next." switchHref="/login" switchLabel="Already have an account? Log in →"><ParentSignupForm/></AuthLayout>;
}
