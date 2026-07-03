import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata = {
  title: "My Collection — SummerSharp",
  robots: { index: false },
};

type ShopItem = {
  id: string;
  slug: string;
  name: string;
  image_url: string;
  price: number;
  owned: boolean;
  available_until: string | null;
};

/**
 * The collection album: every avatar in one sticker-book grid with a
 * completion meter. Unowned ones show as mystery silhouettes — completionist
 * fuel that points straight back at earning and the shop.
 */
export default async function CollectionPage() {
  const { user, profile, supabase } = await getSessionProfile();
  if (!user) redirect("/kids");
  if (profile?.role !== "student") redirect("/parent");

  const { data } = await supabase.rpc("get_my_shop");
  const shop = data as { balance: number; items: ShopItem[] } | null;
  const items = shop?.items ?? [];
  const owned = items.filter((i) => i.owned).length;
  const pct = items.length ? Math.round((owned / items.length) * 100) : 0;
  const complete = owned === items.length && items.length > 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-2">
        <BrandLogo href="/home" />
        <Link
          href="/shop"
          className="btn-pop bg-white px-4 py-2 text-sm font-bold text-slate-600 ring-2 ring-slate-200"
        >
          🛍️ Shop
        </Link>
      </header>

      <div className="card-fun flex items-center gap-4 p-5">
        <span className="text-5xl">{complete ? "👑" : "📖"}</span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-extrabold text-slate-800">
            My Collection
          </h1>
          <p className="font-semibold text-slate-500">
            {complete
              ? "COMPLETE! You collected every single avatar! 🏆"
              : `${owned} of ${items.length} avatars collected — can you get them all?`}
          </p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 font-display text-3xl font-extrabold text-slate-800">
          {pct}%
        </span>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.id}
            className={`card-fun flex flex-col items-center p-3 text-center ${
              item.owned ? "" : "opacity-90"
            }`}
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image_url}
                alt={item.owned ? item.name : "Mystery avatar"}
                className={`h-full w-full object-cover ${
                  item.owned ? "" : "brightness-0 opacity-15"
                }`}
              />
              {!item.owned && (
                <span className="absolute inset-0 grid place-items-center font-display text-3xl font-extrabold text-slate-400">
                  ?
                </span>
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-bold leading-tight ${
                item.owned ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {item.owned ? item.name : "???"}
            </span>
            {!item.owned && (
              <span className="text-[0.65rem] font-bold text-amber-600">⭐ {item.price}</span>
            )}
          </div>
        ))}
      </div>

      {!complete && (
        <Link
          href="/shop"
          className="btn-pop card-fun mt-6 flex items-center justify-center gap-2 p-4 font-display text-lg font-extrabold text-slate-700"
        >
          Fill your album in the shop! 🛍️ →
        </Link>
      )}
    </main>
  );
}
