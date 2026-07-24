// Minimal service worker for PWA installability.
// Network-first: never serves stale app code.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Intentionally empty pass-through — required for install prompt eligibility on Android.
  // The browser handles all requests normally.
});
