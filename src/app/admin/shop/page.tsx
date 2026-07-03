import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminShell } from "@/components/AdminShell";
import {
  AdminShopStudio,
  ShopItemActiveToggle,
} from "@/components/admin/AdminShopStudio";

export const metadata = { title: "Shop · SummerSharp Admin" };
export const dynamic = "force-dynamic";

type ShopItemRow = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  price: number;
  active: boolean;
  created_at: string;
  owners: { count: number }[];
};

export default async function AdminShopPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");

  const admin = createAdminClient();
  const { data } = await admin
    .from("shop_items")
    .select("id, slug, name, image_url, price, active, created_at, owners:item_purchases(count)")
    .order("sort")
    .order("price");
  const items = (data ?? []) as ShopItemRow[];

  return (
    <AdminShell active="shop">
      <h1 className="font-display text-3xl font-bold text-slate-800">
        Avatar Shop
      </h1>
      <p className="mt-1 text-slate-500">
        Kids spend earned points here. {items.length} items in the catalog.
      </p>

      {/* AI item studio */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-1 font-display text-xl font-bold text-slate-800">
          AI item studio 🎨
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Describe a character and the AI paints it in the app&apos;s style
          (via Vercel AI Gateway), uploads it, and puts it in the shop.
        </p>
        <AdminShopStudio />
      </section>

      {/* Catalog */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-display text-xl font-bold text-slate-800">
          Catalog
        </h2>
        <div className="grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-xl border p-3 ${
                item.active ? "border-slate-100" : "border-slate-100 bg-slate-50 opacity-70"
              }`}
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">{item.name}</p>
                <p className="text-xs text-slate-400">{item.slug}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                ⭐ {item.price}
              </span>
              <span className="w-20 text-center text-sm font-semibold text-slate-500">
                {item.owners?.[0]?.count ?? 0} owned
              </span>
              <ShopItemActiveToggle id={item.id} active={item.active} />
            </div>
          ))}
          {items.length === 0 && (
            <p className="py-6 text-center text-slate-400">
              No items yet — generate the first one above.
            </p>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
