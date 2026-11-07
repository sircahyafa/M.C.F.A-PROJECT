/* ═══════════════════════════════════════════════════════
   M.C.F.A PROJECT — Service Worker (build 20261107.6)
   Struktur berkas: SATU TINGKAT (semua berkas di root). Semua path relatif
   terhadap lokasi sw.js, sehingga aman di GitHub Pages dengan subpath repo
   (https://user.github.io/nama-repo/).
   Strategi:
   - Navigasi (buka/refresh)  → NETWORK-FIRST dengan batas waktu 4 dtk, lalu cache.
     Hanya respons 200 yang disimpan; kunci cache = URL halaman itu sendiri
     (Atlas tidak lagi menimpa index.html).
   - CSS/JS (?v=<BUILD>), gambar, ikon → CACHE-FIRST + pembaruan latar belakang.
   - Install TIDAK PERNAH gagal hanya karena satu berkas gagal diunduh.
   ═══════════════════════════════════════════════════════ */

const BUILD = '20261107.6';
const CACHE_VERSION = 'mcfa-v4-' + BUILD;
const STATIC_CACHE = CACHE_VERSION + '-static';
const NAV_TIMEOUT_MS = 4000;

/* Aset INTI (kerangka aplikasi) — dicoba semua, kegagalan satu berkas dicatat saja */
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './main.css?v=20261107.6',
  './layout.css?v=20261107.6',
  './components.css?v=20261107.6',
  './tahap.css?v=20261107.6',
  './polish.css?v=20261107.6',
  './avatar-ring.css?v=20261107.6',
  './stats-info.css?v=20261107.6',
  './kpc-profile.css?v=20261107.6',
  './01-power-saver.js?v=20261107.6',
  './02-icons-helper.js?v=20261107.6',
  './03-nav-back-stack.js?v=20261107.6',
  './04-core-timeline.js?v=20261107.6',
  './05-splash-particles.js?v=20261107.6',
  './06-life-phases-intro.js?v=20261107.6',
  './07-adaptation-program.js?v=20261107.6',
  './08-adaptation-content-production.js?v=20261107.6',
  './09-activity-hero-toggle.js?v=20261107.6',
  './10-activity-daily-calendar.js?v=20261107.6',
  './11-initial-tasks-nov.js?v=20261107.6',
  './12-app-core-intro-canvas.js?v=20261107.6',
  './13-page-navigation.js?v=20261107.6',
  './14-premium-upgrades.js?v=20261107.6',
  './15-avatar-upload.js?v=20261107.6',
  './16-production-polish.js?v=20261107.6',
  './17-motion-layer.js?v=20261107.6',
  './18-fx-preferences.js?v=20261107.6',
  './19-cloud-account-sync.js?v=20261107.6',
  './20-finance-milestones.js?v=20261107.6',
  './21-finance-ledger.js?v=20261107.6',
  './22-overlay-back-bridge.js?v=20261107.6',
  './23-stage-system.js?v=20261107.6',
  './24-activity-stage.js?v=20261107.6',
  './25-studio-stage.js?v=20261107.6',
  './26-life-stage.js?v=20261107.6',
  './27-career-stage.js?v=20261107.6',
  './28-finance-stage.js?v=20261107.6',
  './29-narrative-account-count.js?v=20261107.6',
  './30-local-backup-json.js?v=20261107.6',
  './31-studio-account-hub.js?v=20261107.6',
  './32-career-growth-map.js?v=20261107.6',
  './33-finance-tabs.js?v=20261107.6',
  './34-life-summary.js?v=20261107.6',
  './35-sfx-ambient-dashboard.js?v=20261107.6',
  './36-stage-ordering.js?v=20261107.6',
  './37-finance-stage-widgets.js?v=20261107.6',
  './38-studio-stage-head.js?v=20261107.6',
  './39-finance-totals.js?v=20261107.6',
  './40-card-shimmer.js?v=20261107.6',
  './41-midnight-rollover.js?v=20261107.6',
  './42-content-bridge-studio.js?v=20261107.6',
  './43-visibility-pause.js?v=20261107.6',
  './44-stats-info.js?v=20261107.6',
  './45-kpc-profile.js?v=20261107.6'
];

/* Aset OPSIONAL (gambar, ikon, halaman tambahan) — kegagalan diabaikan */
const OPTIONAL_ASSETS = [
  './atlas_redesign.html',
  './favicon.svg',
  './icon-192.svg',
  './icon-512.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './alley.jpg',
  './ayla.jpg',
  './barongsukma.jpg',
  './cne.jpg',
  './fathulmeme.jpg',
  './kpc.jpg',
  './lol.jpg',
  './mcfa-studio-logo.jpg',
  './mcfa.jpg',
  './monkipedia.jpg',
  './oh-launch-bg.jpg',
  './oh-launch-cta.png',
  './oh-naskah.png',
  './okk.jpg',
  './sheina.jpg',
  './zona.jpg'
];

function cacheOne(cache, url) {
  return fetch(new Request(url, { cache: 'reload' }))
    .then((res) => { if (res && res.ok) return cache.put(url, res); })
    .catch(() => { /* abaikan: berkas ini akan di-cache saat pertama dipakai */ });
}

/* ── INSTALL ── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => Promise.all([
        Promise.all(CORE_ASSETS.map((u) => cacheOne(cache, u))),
        Promise.all(OPTIONAL_ASSETS.map((u) => cacheOne(cache, u)))
      ]))
      .catch(() => {})
      .then(() => self.skipWaiting())
  );
});

/* ── ACTIVATE ── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k.indexOf('mcfa-') === 0 && k !== STATIC_CACHE).map((k) => caches.delete(k))
      ))
      .catch(() => {})
      .then(() => self.clients.claim())
  );
});

function fromCache(request) {
  return caches.open(STATIC_CACHE).then((cache) =>
    cache.match(request).then((hit) => hit || cache.match(request, { ignoreSearch: true }))
  );
}

/* ── FETCH ── */
self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Navigasi — network-first (+timeout), fallback cache */
  if (request.mode === 'navigate') {
    event.respondWith(
      new Promise((resolve) => {
        let settled = false;
        const useCache = () => fromCache(request)
          .then((hit) => hit || caches.open(STATIC_CACHE).then((c) => c.match('./index.html')))
          .then((hit) => hit || fetch(request));
        const timer = setTimeout(() => {
          if (settled) return;
          useCache().then((r) => { if (!settled && r) { settled = true; resolve(r); } }).catch(() => {});
        }, NAV_TIMEOUT_MS);
        fetch(request)
          .then((res) => {
            if (res && res.ok && res.type === 'basic') {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            if (!settled) { settled = true; clearTimeout(timer); resolve(res); }
          })
          .catch(() => {
            clearTimeout(timer);
            if (settled) return;
            useCache().then((r) => { settled = true; resolve(r || Response.error()); })
                      .catch(() => { settled = true; resolve(Response.error()); });
          });
      })
    );
    return;
  }

  /* Aset statis — cache-first, perbarui di latar belakang (hanya respons 200) */
  event.respondWith(
    fromCache(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => cached || Response.error());
      return cached || network;
    })
  );
});

/* ── SKIP_WAITING (dipakai index.html saat pembaruan terdeteksi) ── */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});
