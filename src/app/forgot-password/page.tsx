import { BrandLogo } from "@/components/BrandLogo";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata = { title: "Reset password · SummerSharp" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <BrandLogo />
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="mb-5 text-center font-display text-2xl font-bold text-slate-800">
          Forgot your password? 🔑
        </h1>
        <ForgotPasswordForm linkExpired={error === "link"} />
      </div>
    </main>
  );
}
