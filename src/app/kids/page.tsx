import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { AuthLayout } from "@/components/AuthLayout";
import { KidLoginForm } from "@/components/forms/KidLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kid login — SunSharp",
  description:
    "Kids: log in with your username and PIN to keep learning and growing!",
  alternates: { canonical: "/kids" },
};

export default async function KidsLoginPage() {
  const { profile } = await getSessionProfile();
  if (profile) redirect(profile.role === "parent" ? "/parent" : "/home");

  return <AuthLayout title="Your next discovery is waiting." intro="Practice a little, collect your favorites, and make something wonderful." formTitle="Hi, explorer!" formHint="Enter your username and PIN to jump back in." switchHref="/login" switchLabel="Grown-up login →"><KidLoginForm/></AuthLayout>;
}
