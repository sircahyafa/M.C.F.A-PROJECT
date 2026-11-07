# Laporan Pengujian — build 20261107.6 (7 Nov 2026) · perbaikan GitHub Pages

Lingkungan: Chromium headless (Playwright), viewport 390×844, server statis lokal yang meniru GitHub Pages (subpath `/mcfa-repo/`, huruf besar/kecil dibedakan, 404 asli, tanpa fallback SPA). Layanan eksternal (Google Fonts, Firebase) diblokir/ditahan agar kondisi offline teruji.

## LULUS
| Uji | Hasil |
|---|---|
| Sintaks | 46 berkas JS + semua skrip inline `node --check` OK; JSON, SVG valid; kurung CSS seimbang |
| Referensi berkas | 158 referensi lokal (HTML/CSS/JS/SW/manifest/registri) semua menunjuk berkas yang ada; tidak ada subfolder; tidak ada path lama di kode |
| Versi | `index.html`, `sw.js`, `assets.json`, dokumentasi seragam 20261107.6 |
| Muat dari subpath | splash tertutup ±4,5 dtk, intro tampil, `enterApp()` membuka aplikasi, 5 tab navigasi bawah berpindah halaman, 27 gambar tanpa yang rusak, 0 respons ≥ 400, 0 JS exception |
| Atlas | `atlas_redesign.html` terbuka (200) tanpa error, juga saat offline |
| Reproduksi bug | kode LAMA dengan folder `css/ js/ assets/` hilang (seperti unggahan GitHub yang meratakan berkas): splash tidak pernah tertutup, `enterApp` tidak ada — sama dengan screenshot |
| Berkas hilang (build baru) | `05-splash-particles.js`, `30-local-backup-json.js`, `main.css`, `sheina.jpg` sengaja dihapus: splash tetap tertutup (±6 dtk), aplikasi terbuka, muncul pesan yang menyebut berkas gagal + tombol muat ulang |
| Canvas gagal (`getContext` → null) | splash tertutup, aplikasi terbuka |
| Firebase menggantung / diblokir | aplikasi terbuka normal tanpa menunggu |
| Firebase tersedia (SDK tiruan) | modul akun `19-cloud-account-sync.js` termuat setelah SDK; `mcfaOpenAccountPanel` aktif |
| Service Worker | terdaftar dengan scope subpath; 79 berkas ter-cache; reload offline membuka index dan Atlas dengan benar; Atlas tidak lagi menimpa cache index |
| Reload otomatis | build lama me-reload halaman sendiri pada kunjungan pertama (4 navigasi); build baru tidak (2) |
| Data lokal | kunci localStorage tetap setelah reload; buku transaksi dinormalisasi oleh kode lama sama persis seperti sebelumnya (diuji pada kode asli) |

## BELUM / TIDAK DAPAT DIUJI
- **GitHub Pages sungguhan** (HTTPS, CDN, cache GitHub): belum dipublikasikan di sana; uji memakai server lokal yang meniru perilakunya.
- **Firebase asli** (login, Firestore, sinkron akun): tidak ada internet di lingkungan uji. Hanya dibuktikan bahwa modul dimuat setelah SDK dan kode modul tidak diubah. Pastikan domain `username.github.io` terdaftar di Firebase Console → Authentication → Settings → Authorized domains.
- Google Fonts asli (offline, memakai font cadangan sistem).
- HP/PWA sungguhan: instalasi, ikon di layar utama, performa, baterai.
- Tampilan font Arab pada ikon sudah berupa path (tidak bergantung perangkat), tetapi tampilan akhir di peluncur HP tertentu tidak diuji.

---

# Laporan Pengujian — build 20261103.1 (3 Nov 2026)
Lingkungan: Chromium headless (Playwright), viewport 390×844 (HP), zona Asia/Jakarta, jam dimanipulasi per skenario. Seluruh uji dijalankan pada versi monolit awal **dan** versi modular; hasil sama.

## LULUS
| Area | Hasil |
|---|---|
| Muat aplikasi | 0 error JS; validasi bawaan (Renovasi, Barongsukma, Posting, CORE) OK |
| Tanggal (6 skenario: 3 Nov, 5 Nov 00:00, 20 Nov 23:59, 21 Nov 00:00, 29 Feb 2028, 20 Nov 2029) | Day −17/−15/0/1/466/1096 benar; selfCheck Adaptasi kosong (lulus); target produksi 64 |
| Integrasi (17 uji) | rotasi 4 akun berbeda/hari; 6 tahap = 6/24; "Siap Upload" ≠ upload; Zona terpisah; statistik 0 sebelum 21 Nov; sync idempoten; batal tahap → "Dalam Produksi"; hari belum tiba ditolak; upload & jadwal < 21 Nov ditolak; data bertahan setelah tutup-buka; upload 21 Nov → statistik OKK +1, batal → kembali |
| Tombol | 226 handler / 62 fungsi, semua terdefinisi |
| Backup/Restore JSON | ekspor → hapus semua → impor: 6 kunci identik; salinan pengaman terbuat |
| PWA | SW aktif, cache terisi, manifest + ikon HTTP 200, reload offline berhasil |
| Aset | 25 `<img>` tanpa yang rusak, 0 respons HTTP ≥ 400, latar CSS termuat; 15 gambar identik dengan aslinya (md5); ikon byte-identik |

## BELUM DAPAT DIUJI
- Login, Cloud Sync, backup/restore cloud: tidak ada internet di lingkungan uji (Firebase di-blokir). Logika dibaca, tetapi tidak dijalankan.
- **Firestore Rules**: tidak tersedia → keamanan cadangan cloud tidak dapat dinilai.
- GitHub Pages dan HP Android sungguhan (performa, baterai, instalasi PWA).
- Peringatan Chromium: `AudioContext` menunggu interaksi pengguna (normal).
- Uji manual semua formulir/edit/hapus per halaman tidak diotomatisasi penuh; yang diuji adalah jalur data utama di atas.

## Catatan
- Rotasi 4 akun/hari adalah keputusan pengguna (3 Nov 2026); uji mengikuti keputusan itu.

## Build 20261103.2 (3 Nov 2026) — uji perubahan tanggal & centang
Chromium headless (Playwright), 390×844, Asia/Jakarta, jam dimanipulasi (1, 6, 21 Nov 2026). 0 error JS. LULUS: Tugas Awal 1–20 Nov (20 hari) di semua penanda `data-mcfa-range/days`; status harian (3 Nov = TUGAS AWAL 3/20 · PERSIAPAN 1/2; 6 Nov = TUGAS AWAL 6/20 · ADAPTASI 2/16; 21 Nov = DAY 1); `mcfaSelfCheck` bersih; centang Tugas Awal, dekorasi, Adaptasi, dan Aktivitas harian bisa dicentang dan dibatalkan tanpa tanggal/gembok; reset; label keuangan Tahap 3 = Investasi (Tahap 1–2 tetap, nominal tetap).
BELUM DIUJI: HP Android sungguhan, Cloud Sync/Firebase (diblokir di lingkungan uji).
