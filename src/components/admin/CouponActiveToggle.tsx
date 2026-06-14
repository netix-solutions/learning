"use client";

import { useTransition } from "react";
import { adminSetCouponActive } from "@/app/actions/admin";

/** Flip a coupon active/inactive from the admin list. */
export function CouponActiveToggle({
  code,
  active,
}: {
  code: string;
  active: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminSetCouponActive(code, !active);
          if (res.error) alert(res.error);
        })
      }
      className={`text-xs font-bold disabled:opacity-50 ${
        active ? "text-slate-400 hover:text-red-500" : "text-emerald-600 hover:text-emerald-700"
      }`}
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </button>
  );
}
