/* SIARIP KPU · Service Worker
 * Network-first untuk app-shell (selalu versi terbaru saat online; cache sebagai
 * fallback offline). Bump CACHE_VERSION pada tiap rilis. */
const CACHE_VERSION = 'siarip-v1';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './ai.js',
  './app.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
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
  if (url.origin !== location.origin) return; // biarkan lintas-origin langsung ke jaringan

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
});
