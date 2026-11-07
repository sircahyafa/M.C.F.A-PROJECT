# M.C.F.A PROJECT

Aplikasi pribadi MC FATHUL ADZIM — PWA statis (HTML + CSS + JavaScript, tanpa build step).
Build: `20261107.6`

## Menjalankan
- **GitHub Pages:** unggah SEMUA berkas di folder ini langsung ke **root repository** (tidak ada subfolder). Semua path relatif, jadi aman di `https://username.github.io/nama-repository/`.
  Settings → Pages → *Deploy from a branch* → branch `main` → folder `/ (root)`.
- **Lokal:** jalankan server statis di folder ini, mis. `python3 -m http.server 8000`, lalu buka `http://localhost:8000`.
  (Service Worker/PWA hanya aktif lewat `http(s)://`.)
- Aplikasi tidak membutuhkan konfigurasi Netlify atau server khusus.

## Struktur (SATU TINGKAT — semua berkas di root)
```
index.html                  kerangka aplikasi
atlas_redesign.html         halaman Atlas (dibuka dari Karier)
sw.js                       Service Worker
manifest.json               PWA manifest
assets.json                 registri aset terpusat
icon-192.svg / icon-512.svg ikon aplikasi (Bismillah + MCFA PROJECT)
icon-192.png / icon-512.png / apple-touch-icon.png   ikon PNG (iOS/Android)
favicon.svg                 ikon tab browser (versi ringkas)
main.css layout.css components.css tahap.css polish.css avatar-ring.css stats-info.css kpc-profile.css
                            (urutan = urutan cascade, lihat index.html)
01-…45-*.js                 dimuat berurutan (global scope bersama; URUTAN WAJIB dijaga)
*.jpg / *.png               gambar akun, profil, latar, poster
README.md CHANGELOG.md DATABASE.md TESTING.md
```
**Jangan membuat subfolder.** Jika berkas dipindah ke folder, `index.html` tidak akan menemukannya.

## Ketahanan startup (anti macet di logo loading)
- `index.html` memuat *startup guard* inline: splash dijamin tertutup (batas keras 7 detik) walau JS/CSS/Firebase/canvas gagal.
- Bila ada berkas JS/CSS gagal dimuat (mis. tidak ikut terunggah), muncul pesan yang menyebut nama berkasnya + tombol *Muat ulang*.
- Firebase dimuat non-blokir; tanpa internet aplikasi berjalan penuh dalam mode lokal (data tetap di perangkat).
- Animasi canvas (splash & intro) bersifat opsional: kegagalannya tidak menghentikan aplikasi.

## Tanggal resmi (sumber tunggal: `MCFA_CORE` di `04-core-timeline.js`)
| Bagian | Tanggal |
|---|---|
| **Tugas Awal MC FATHUL ADZIM** (periode payung) | **1–20 Nov 2026 (20 hari)** |
| ↳ Tugas Persiapan Lanjutan (di dalam Tugas Awal) | 3–4 Nov 2026 |
| ↳ Program Adaptasi (di dalam Tugas Awal) | **8–20 Nov 2026 (13 hari)** |
| ↳ Daftar Dekorasi Studio (Tugas Awal, aktif 6–20 Nov) | 6–20 Nov 2026 (15 hari) |
| ↳ Urutan Tugas Awal (sejak 20261106.7) | 1 Persiapan Project · 2 Pembersihan Studio · 3 Pembersihan Rumah · 4 Persiapan Hidup Baru · 5 Persiapan Branding Akun · 20 Persiapan Akhir Menyeluruh |
| **Day 1** (Project, Studio, Upload, Program, Progres) | **21 Nov 2026** |
| Akhir proyek utama (Day 1.096) | 20 Nov 2029 |

Mengubah tanggal cukup di `MCFA_CORE`; semua halaman membaca dari sana.

## Memperbarui rilis
Setiap berkas CSS/JS dipanggil dengan `?v=<BUILD>`. Saat mengubah file, naikkan nilai build di `index.html`, `BUILD` di `sw.js` (daftar precache ikut dibuat dari nilai itu), dan `build` di `assets.json`, agar perangkat memuat versi baru.
