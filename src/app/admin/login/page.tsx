import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin";
import { AdminLoginForm } from "@/components/forms/AdminLoginForm";

export const metadata = { title: "Admin · SummerSharp" };

export default async function AdminLoginPage() {
  if (await isAdminAuthed()) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="flex items-center gap-2 text-slate-800">
        <span className="text-3xl">🛠️</span>
        <span className="font-display text-2xl font-bold">SummerSharp Admin</span>
      </div>
      <div className="card-fun mt-6 w-full p-6 sm:p-8">
        <h1 className="mb-1 text-center font-display text-2xl font-bold text-slate-800">
          Operator sign-in
        </h1>
        <p className="mb-5 text-center text-sm text-slate-500">
          Restricted area — staff only.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
