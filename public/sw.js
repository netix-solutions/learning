/* SummerSharp service worker — enables install + offline resilience.
 * Intentionally conservative: it never caches Supabase API calls (those are
 * cross-origin and pass straight through), so auth and answer-grading always
 * hit the network. It caches the static app shell so the app launches offline
 * and shows a friendly offline page when a navigation can't reach the network. */
const CACHE = "summersharp-v2";
const APP_SHELL = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle same-origin GETs. Supabase (cross-origin) passes straight through.
  if (url.origin !== self.location.origin) return;

  // Page navigations: network-only, falling back to the static offline page.
  // We deliberately DO NOT cache navigation responses — pages like /home and
  // /parent/child/[id] are authenticated, per-child SSR HTML, and caching them
  // could serve one child's rendered page to another on a shared device.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }

  // Static assets (build output, images, fonts): stale-while-revalidate.
  if (
    url.pathname.startsWith("/_next/static") ||
    /\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
  }
});
