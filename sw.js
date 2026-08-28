/* ═══════════════════════════════════════════════════════
   M.C.F.A PROJECT — Service Worker
   Strategi:
   - Navigasi (buka app / index.html) → NETWORK-FIRST
     Supaya app SELALU coba ambil HTML terbaru dulu. Kalau offline,
     baru fallback ke cache. Ini mencegah white screen akibat
     service worker menyajikan HTML lama/basi saat app dibuka.
   - Asset statis (icon, manifest, font) → CACHE-FIRST
     Supaya load cepat & tetap bisa jalan offline.
   ═══════════════════════════════════════════════════════ */

const CACHE_VERSION = 'mcfa-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

/* ── INSTALL ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('mcfa-') && key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH ── */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Navigasi (buka/refresh app) — NETWORK-FIRST.
     Ini yang mencegah white screen: kalau ada versi baru,
     langsung dipakai. Cache hanya jadi fallback offline. */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put('./index.html', clone));
          return response;
        })
        .catch(() =>
          caches.match('./index.html', { cacheName: STATIC_CACHE })
            .then((cached) => cached || caches.match(request))
        )
    );
    return;
  }

  /* Asset statis (icon, manifest, font, dll) — CACHE-FIRST,
     lalu update cache di background. */
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ── SKIP_WAITING message (dipakai index.html saat update terdeteksi) ── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
