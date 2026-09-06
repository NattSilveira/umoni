const CACHE_NAME = "umoni-v4";
const APP_FILES = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/theme.js",
  "./js/module.js",
  "./manifest.webmanifest",
];
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const isAppCode = /\.(css|js)$/.test(new URL(event.request.url).pathname);
  event.respondWith(
    isAppCode
      ? fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }).catch(() => caches.match(event.request))
      : caches.match(event.request).then((cached) => cached || fetch(event.request)),
  );
});
