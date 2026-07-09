import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { CardCollection } from "@/components/CardCollection";

export const metadata = {
  title: "My Cards — SummerSharp",
  robots: { index: false },
};

export default async function ShopPage() {
  const { user, profile } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-2">
        <BrandLogo href="/home" />
      </header>
      <CardCollection />
    </main>
  );
}
