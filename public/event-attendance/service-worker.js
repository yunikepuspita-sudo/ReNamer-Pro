/* Smart Attendance Event — Service Worker
 * Cache-first for the app shell, network-first for everything else.
 * Bump CACHE_VERSION on every release so clients pick up new assets. */
const CACHE_VERSION = 'sae-v1';
const APP_SHELL = [
  './',
  './index.html',
  './checkin.html',
  './admin.html',
  './styles.css',
  './app.js',
  './qr.js',
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
  if (req.method !== 'GET') return; // never cache POSTs to the backend

  const url = new URL(req.url);

  // App-shell navigations & same-origin static files: cache-first.
  const isShell = url.origin === location.origin &&
    (req.mode === 'navigate' || APP_SHELL.some((p) => url.pathname.endsWith(p.replace('./', '/'))));

  if (isShell) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  // CDN libs (qrcode, html5-qrcode, xlsx): stale-while-revalidate.
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && (url.protocol === 'https:' || url.protocol === 'http:')) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
