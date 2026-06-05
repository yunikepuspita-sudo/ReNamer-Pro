/* SISFO SPPD KPU Jabar — Service Worker (offline-first app shell) */
const VERSION = 'sppd-kpujabar-v1.0.0';
const SHELL_CACHE = `${VERSION}-shell`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

/* Berkas inti aplikasi (app shell) yang di-precache agar bisa jalan offline. */
const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './js/app.js',
  './js/router.js',
  './js/store.js',
  './js/seed.js',
  './js/auth.js',
  './js/domain.js',
  './js/ui.js',
  './js/qr.js',
  './js/views/dashboard.js',
  './js/views/pengajuan.js',
  './js/views/daftar.js',
  './js/views/detail.js',
  './js/views/approval.js',
  './js/views/spj.js',
  './js/views/pembayaran.js',
  './js/views/arsip.js',
  './js/views/anggaran.js',
  './js/views/masterdata.js',
  './js/views/audit.js',
  './js/views/login.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Navigasi halaman: network-first, fallback ke shell (cocok untuk SPA + offline).
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Aset pihak ketiga (mis. pustaka QR via CDN): stale-while-revalidate.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request).then((res) => {
          if (res && res.status === 200) cache.put(request, res.clone());
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // Aset lokal: cache-first dengan pembaruan latar belakang.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
