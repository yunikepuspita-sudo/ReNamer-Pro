/* Smart Attendance Event — Service Worker
 * Network-first untuk app-shell/HTML (selalu ambil versi terbaru saat online,
 * cache hanya dipakai sebagai fallback offline). Stale-while-revalidate untuk
 * library CDN. Bump CACHE_VERSION pada tiap rilis agar klien memuat aset baru. */
const CACHE_VERSION = 'sae-v5';
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
  if (req.method !== 'GET') return; // jangan cache POST ke backend

  const url = new URL(req.url);
  const sameOrigin = url.origin === location.origin;

  // Halaman & aset aplikasi (same-origin): NETWORK-FIRST.
  // Online → selalu versi terbaru; offline → fallback ke cache.
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

  // Library CDN (qrcode, html5-qrcode, xlsx, pdf.js): stale-while-revalidate.
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
