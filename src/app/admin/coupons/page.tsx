import { redirect } from "next/navigation";
import { getAdminCoupons, isAdminAuthed, type AdminCoupon } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { AdminCouponForm } from "@/components/admin/AdminCouponForm";
import { CouponActiveToggle } from "@/components/admin/CouponActiveToggle";

export const metadata = { title: "Coupons · SummerSharp Admin" };
export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function perk(c: AdminCoupon) {
  if (c.kind === "free")
    return c.maxKids ? `Free · up to ${c.maxKids} kids` : "Free · unlimited kids";
  return `${c.trialDays}-day trial`;
}

export default async function AdminCouponsPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const coupons = await getAdminCoupons();

  return (
    <AdminShell active="coupons">
      <h1 className="font-display text-3xl font-bold text-slate-800">Coupons</h1>
      <p className="mt-1 text-slate-500">
        Issue free family plans or extended trials. {coupons.length} total.
      </p>

      {/* Create */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">
          New coupon
        </h2>
        <AdminCouponForm />
        <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
          Looking for a percentage or dollar discount? Those are handled by Stripe
          promotion codes (already enabled at checkout) — create them in the Stripe
          Dashboard → Product catalog → Coupons, and parents enter them on the
          payment screen.
        </p>
      </section>

      {/* List */}
      <section className="mt-8">
        <h2 className="mb-3 font-display text-xl font-bold text-slate-800">
          All coupons
        </h2>
        {coupons.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
            No coupons yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {coupons.map((c) => (
              <div
                key={c.code}
                className="flex items-center gap-4 border-b border-slate-100 p-4 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-800">
                      {c.code}
                    </span>
                    {!c.active && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                        inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-1 truncate text-sm text-slate-500">
                    {perk(c)}
                    {c.description ? ` · ${c.description}` : ""}
                    {c.expiresAt ? ` · expires ${fmtDate(c.expiresAt)}` : ""}
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-6 text-center">
                  <div className="hidden sm:block">
                    <div className="font-display text-sm font-bold text-slate-800">
                      {c.redeemedCount}
                      {c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      redeemed
                    </div>
                  </div>
                  <CouponActiveToggle code={c.code} active={c.active} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
