// Minimal service worker for PWA installability.
// Network-first: never serves stale app code.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through — required for install prompt eligibility on Android.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
