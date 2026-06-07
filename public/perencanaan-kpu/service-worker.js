/* AI Planning Document Factory — KPU · Service Worker
 * Network-first untuk app-shell (selalu versi terbaru saat online; cache sebagai
 * fallback offline). Stale-while-revalidate untuk library CDN (qrcodejs).
 * Bump CACHE_VERSION pada tiap rilis. */
const CACHE_VERSION = 'kpu-plan-v2';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './templates.js',
  './generators.js',
  './ai.js',
  './app.js',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  if (sameOrigin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req).then((cached) =>
            cached || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())
          )
        )
    );
    return;
  }

  // CDN library (qrcodejs): stale-while-revalidate
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
