/* Minimal offline shell for "Add to Home Screen".
   Caches ONLY the static app files. Firebase / Google traffic is never
   intercepted, so real-time sync always uses the live network. */
const CACHE = "potluck-shell-v6";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./firebase-config.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon-180.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  // Only handle same-origin GETs. Everything else (Firebase, gstatic SDK,
  // Firestore streams) goes straight to network.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  // NETWORK-FIRST: always try to fetch the latest deployed file when online,
  // and refresh the cache with it. Fall back to the cached copy only when
  // offline. This guarantees updates appear right after a deploy.
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((hit) => hit || caches.match("./index.html")))
  );
});
