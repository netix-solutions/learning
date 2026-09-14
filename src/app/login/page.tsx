import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AuthLayout } from "@/components/AuthLayout";
import { ParentLoginForm } from "@/components/forms/ParentLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Parent login — SunSharp",
  description: "Log in to your SunSharp parent dashboard.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return <AuthLayout title="Welcome back, grown-up." intro="A clear view of their progress. A little more room for their curiosity." formTitle="Parent login" formHint="Pick up where your family left off." switchHref="/kids" switchLabel="Looking for kid login? →"><ParentLoginForm/></AuthLayout>;
}
