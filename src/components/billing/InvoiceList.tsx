import type { InvoiceLine } from "@/lib/billing-info";
import { formatCents } from "@/lib/billing";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  open: "bg-amber-50 text-amber-700",
  draft: "bg-slate-100 text-slate-500",
  void: "bg-slate-100 text-slate-500",
  uncollectible: "bg-red-50 text-red-600",
};

/**
 * Read-only history of a customer's Stripe invoices. We never reconstruct the
 * PDF ourselves — each row links out to the Stripe-hosted invoice / receipt.
 */
export function InvoiceList({ invoices }: { invoices: InvoiceLine[] }) {
  if (invoices.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-slate-500">
        No invoices yet. They&apos;ll appear here after your first payment.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {invoices.map((inv) => (
        <div
          key={inv.id}
          className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-b-0"
        >
          <div className="min-w-0">
            <div className="font-bold text-slate-800">{fmtDate(inv.createdIso)}</div>
            <div className="truncate text-sm text-slate-400">
              {inv.number ?? inv.id}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="font-display font-bold text-slate-800">
              {formatCents(inv.amountCents)}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
                STATUS_STYLE[inv.status] ?? "bg-slate-100 text-slate-500"
              }`}
            >
              {inv.status}
            </span>
            {inv.hostedUrl || inv.pdfUrl ? (
              <a
                href={(inv.hostedUrl ?? inv.pdfUrl) as string}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-[var(--brand-blue)] hover:underline"
              >
                View →
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
