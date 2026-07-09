import { redirect } from "next/navigation";

// The collection album is now part of the Sticker Book at /shop — keep this
// path working for old links by redirecting.
export default function CollectionPage() {
  redirect("/shop");
}
