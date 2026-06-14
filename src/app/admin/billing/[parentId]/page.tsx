import Link from "next/link";
import { redirect } from "next/navigation";
import { getParentBilling, isAdminAuthed } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { AdminBillingActions } from "@/components/admin/AdminBillingActions";
import { InvoiceList } from "@/components/billing/InvoiceList";
import { formatCents, priceForKids } from "@/lib/billing";

export const metadata = { title: "Billing detail · SummerSharp Admin" };
export const dynamic = "force-dynamic";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminBillingDetailPage({
  params,
}: {
  params: Promise<{ parentId: string }>;
}) {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  const { parentId } = await params;

  const billing = await getParentBilling(parentId);
  if (!billing) {
    return (
      <AdminShell active="billing">
        <Link href="/admin/billing" className="font-bold text-slate-500 hover:text-slate-700">
          ← Billing
        </Link>
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
          No parent account found for that id.
        </p>
      </AdminShell>
    );
  }

  const { sub, invoices } = billing;
  const subscribed = sub?.status === "active" || sub?.status === "trialing";

  return (
    <AdminShell active="billing">
      <Link href="/admin/billing" className="font-bold text-slate-500 hover:text-slate-700">
        ← Billing
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-800">
        {billing.name}
      </h1>
      <p className="mt-1 text-slate-500">{billing.email ?? "—"}</p>

      {/* Subscription summary */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        {sub ? (
          <>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <Field label="Status">
                <span className="capitalize">{sub.status.replace("_", " ")}</span>
                {sub.cancelAtPeriodEnd && sub.status !== "canceled" ? (
                  <span className="ml-1 text-amber-600">· ending</span>
                ) : null}
              </Field>
              <Field label="Kids (seats)">{sub.seats}</Field>
              <Field label="Monthly">
                {formatCents(priceForKids(Math.max(1, sub.seats)))}
              </Field>
              <Field label={sub.cancelAtPeriodEnd ? "Ends" : "Renews"}>
                {fmtDate(sub.currentPeriodEnd)}
              </Field>
              {sub.trialEnd ? (
                <Field label="Trial ends">{fmtDate(sub.trialEnd)}</Field>
              ) : null}
            </div>

            <div className="mt-5 border-t border-slate-100 pt-5">
              {subscribed || sub.cancelAtPeriodEnd ? (
                <AdminBillingActions
                  parentId={billing.parentId}
                  parentName={billing.name}
                  cancelScheduled={sub.cancelAtPeriodEnd}
                />
              ) : (
                <p className="text-sm text-slate-500">
                  This plan is {sub.status.replace("_", " ")} — nothing to cancel.
                  Use the Stripe portal for anything else.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-slate-500">
            This parent has no billing record yet (never started a trial or
            subscription).
          </p>
        )}
      </section>

      {/* Invoice history */}
      <h2 className="mb-3 mt-8 font-display text-xl font-bold text-slate-800">
        Billing history
      </h2>
      <InvoiceList invoices={invoices} />
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="font-display text-lg font-bold text-slate-800">{children}</div>
    </div>
  );
}
