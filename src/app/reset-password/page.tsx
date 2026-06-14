import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";
import { ResetPasswordForm } from "@/components/forms/ResetPasswordForm";

export const metadata = { title: "Choose a new password · SummerSharp" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  // The recovery link routes through /auth/confirm, which signs the user in
  // before sending them here — so a valid session means the link was good.
  const { user } = await getSessionProfile();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <BrandLogo />
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="mb-5 text-center font-display text-2xl font-bold text-slate-800">
          Choose a new password
        </h1>

        {user ? (
          <ResetPasswordForm />
        ) : (
          <div className="text-center">
            <div className="text-5xl">⏳</div>
            <p className="mt-3 font-semibold text-slate-700">
              This reset link is invalid or has expired. Reset links can only be
              used once and are good for a short time.
            </p>
            <Link
              href="/forgot-password"
              className="mt-5 inline-block font-bold text-[var(--brand-blue)] underline"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
