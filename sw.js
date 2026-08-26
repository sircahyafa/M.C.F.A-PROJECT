/* ═══ M.C.F.A PROJECT — SERVICE WORKER ═══
   Network-first strategy: always tries to fetch the latest file from the
   network first (so GitHub Pages updates show up immediately instead of
   an old cached splash/version sticking around). Falls back to cache only
   when offline. Cache name is versioned — bump CACHE_VERSION whenever you
   want to force every visitor to drop old cached files.
*/

const CACHE_VERSION = 'mcfa-v2';
const CACHE_NAME = `mcfa-cache-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './index_PROJECT.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg'
];

/* ── INSTALL: pre-cache core files, activate immediately ── */
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
});

/* ── ACTIVATE: clear out any old versioned caches, take control right away ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith('mcfa-cache-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── FETCH: network-first, cache fallback ──
   Ensures the newest deployed HTML/JS always wins when online, so edits
   pushed to GitHub Pages show up on next load instead of an old cached
   splash/intro screen sticking around.
*/
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone)).catch(() => {});
        return networkResponse;
      })
      .catch(() =>
        caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('./index_PROJECT.html'))
      )
  );
});

/* ── MESSAGE: allow the page to force-activate a waiting new SW immediately
   (paired with the SKIP_WAITING postMessage already sent from index_PROJECT.html) ── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
