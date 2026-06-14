"use client";

import { useState, useTransition } from "react";
import { switchToChild } from "@/app/actions/auth";

/**
 * Parent-side button: hand the device to a child by opening their account on
 * this device — no username/PIN needed. The server verifies the parent owns the
 * child and swaps the session, then redirects to the kid home.
 */
export function OpenChildButton({
  childId,
  name,
}: {
  childId: string;
  name: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await switchToChild(childId);
            if (res?.error) setError(res.error);
          });
        }}
        className="btn-pop px-4 py-2 text-sm font-bold text-white"
        style={{ background: "var(--brand-orange)" }}
      >
        {pending ? "Opening…" : `Let ${name} play →`}
      </button>
      {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
    </div>
  );
}
