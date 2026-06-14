"use client";

import { useTransition } from "react";
import { adminDeleteUser } from "@/app/actions/admin";

export function DeleteUserButton({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            `Permanently delete ${name}? This removes their login and all related data. This cannot be undone.`,
          )
        ) {
          start(async () => {
            const res = await adminDeleteUser(userId);
            if (res.error) alert(res.error);
          });
        }
      }}
      className="text-xs font-semibold text-slate-400 hover:text-red-500 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
