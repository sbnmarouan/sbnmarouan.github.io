// sw.js — cache statique simple (offline basique)
const VERSION = "v1.0.0";
const STATIC_CACHE = `static-${VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./main.js",
  "./modules/menu.js",
  "./modules/todos.js",
  "./modules/scroll.js",
  // Ajoute ici tes images critiques si tu veux offline immédiat :
  // "assets/placeholder/featured.webp",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        const clone = resp.clone();
        if (resp.ok && new URL(request.url).origin === location.origin) {
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        }
        return resp;
      }).catch(() => cached)
    })
  );
});
