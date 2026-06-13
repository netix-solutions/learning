"use client";

import { useTransition } from "react";
import { removeChild } from "@/app/actions/children";

export function RemoveChildButton({
  childId,
  name,
}: {
  childId: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (
          confirm(
            `Remove ${name}? This permanently deletes their login and all progress.`,
          )
        ) {
          start(async () => {
            await removeChild(childId);
          });
        }
      }}
      className="text-sm font-semibold text-slate-400 hover:text-red-500"
    >
      {pending ? "Removing…" : "Remove"}
    </button>
  );
}
