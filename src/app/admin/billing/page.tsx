import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSubscriptions, isAdminAuthed, type AdminSubscription } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { formatCents, priceForKids } from "@/lib/billing";

export const metadata = { title: "Billing · SummerSharp Admin" };
export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700",
  trialing: "bg-blue-50 text-blue-700",
  past_due: "bg-amber-50 text-amber-700",
  unpaid: "bg-red-50 text-red-600",
  canceled: "bg-slate-100 text-slate-500",
  free: "bg-slate-100 text-slate-500",
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBillingPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const subs = await getAdminSubscriptions();
  const paying = subs.filter((s) => s.status === "active" || s.status === "trialing");

  return (
    <AdminShell active="billing">
      <h1 className="font-display text-3xl font-bold text-slate-800">Billing</h1>
      <p className="mt-1 text-slate-500">
        {subs.length} subscription {subs.length === 1 ? "record" : "records"} ·{" "}
        {paying.length} active or trialing
      </p>

      {subs.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
          No subscriptions yet. Rows appear here once a parent starts a trial or
          subscribes.
        </p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {subs.map((s) => (
            <SubRow key={s.parentId} s={s} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}

function SubRow({ s }: { s: AdminSubscription }) {
  return (
    <Link
      href={`/admin/billing/${s.parentId}`}
      className="flex items-center gap-4 border-b border-slate-100 p-4 transition-colors last:border-b-0 hover:bg-slate-50"
    >
      <div className="min-w-0">
        <div className="truncate font-bold text-slate-800">{s.name}</div>
        <div className="truncate text-sm text-slate-500">{s.email ?? "—"}</div>
      </div>

      <div className="ml-auto flex items-center gap-5 text-center">
        <div className="hidden sm:block">
          <div className="font-display text-sm font-bold text-slate-800">
            {s.seats} {s.seats === 1 ? "kid" : "kids"}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {formatCents(priceForKids(Math.max(1, s.seats)))}/mo
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="font-display text-sm font-bold text-slate-800">
            {fmtDate(s.currentPeriodEnd)}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            {s.cancelAtPeriodEnd ? "ends" : "renews"}
          </div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
            STATUS_STYLE[s.status] ?? "bg-slate-100 text-slate-500"
          }`}
        >
          {s.status.replace("_", " ")}
          {s.cancelAtPeriodEnd && s.status !== "canceled" ? " · ending" : ""}
        </span>
        <span className="text-sm font-bold text-[var(--brand-blue)]">Manage →</span>
      </div>
    </Link>
  );
}
