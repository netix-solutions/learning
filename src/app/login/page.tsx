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

  return <AuthLayout title="Welcome back, grown-up." intro="A clear view of their progress. A little more room for their curiosity." formTitle="Parents log in" formHint="Use your email and password to open your family dashboard." switchHref="/kids" switchLabel="Kids log in with username & PIN →"><ParentLoginForm/></AuthLayout>;
}
