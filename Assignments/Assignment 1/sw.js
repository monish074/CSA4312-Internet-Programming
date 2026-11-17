const CACHE_NAME = "techvista-2026-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./schedule.html",
  "./register.html",
  "./media.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./captions.vtt",
  "./images/techvista.jpg",
  "./images/techvista.webp",
  "./images/poster.png",
  "./images/sponsor1.png",
  "./images/sponsor2.png",
  "./images/icon-192.png",
  "./images/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
