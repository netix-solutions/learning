"use client";

import { signOut } from "@/app/actions/auth";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={`btn-pop bg-white px-4 py-2 text-sm text-slate-600 ring-2 ring-slate-200 hover:text-slate-900 ${className}`}
      >
        Sign out
      </button>
    </form>
  );
}
