import Link from "next/link";
import { adminSignOut } from "@/app/actions/admin";

/** Chrome shared by every signed-in admin page: brand, nav, sign-out. */
export function AdminShell({
  active,
  children,
}: {
  active: "dashboard" | "users";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 text-slate-800">
            <span className="text-2xl">🛠️</span>
            <span className="font-display text-lg font-bold">
              SummerSharp Admin
            </span>
          </Link>

          <nav className="ml-4 flex items-center gap-1 text-sm font-semibold">
            <NavLink href="/admin" label="Dashboard" on={active === "dashboard"} />
            <NavLink href="/admin/users" label="Users" on={active === "users"} />
          </nav>

          <form action={adminSignOut} className="ml-auto">
            <button
              type="submit"
              className="btn-pop bg-white px-4 py-2 text-sm text-slate-600 ring-2 ring-slate-200 hover:text-slate-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}

function NavLink({ href, label, on }: { href: string; label: string; on: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 transition-colors ${
        on
          ? "bg-blue-50 text-[var(--brand-blue)]"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}
