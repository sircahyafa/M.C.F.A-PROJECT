# M.C.F.A PROJECT

Aplikasi pribadi MC FATHUL ADZIM — PWA statis (HTML + CSS + JavaScript, tanpa build step).
Build: `20261114.2`

## Menjalankan
- **GitHub Pages:** unggah SEMUA isi ZIP ke **root repository** (jangan unggah file ZIP-nya; semua berkas langsung di root, tanpa folder). Semua path relatif, jadi aman di `https://username.github.io/nama-repository/`.
  Settings → Pages → *Deploy from a branch* → branch `main` → folder `/ (root)`.
- **Lokal:** jalankan server statis di folder ini, mis. `python3 -m http.server 8000`, lalu buka `http://localhost:8000`.
  (Service Worker/PWA hanya aktif lewat `http(s)://`.)
- Aplikasi tidak membutuhkan konfigurasi Netlify atau server khusus.

## Struktur (SEMUA berkas langsung di root — tanpa folder)
Seluruh berkas berada sejajar di satu tingkat. Nomor di depan nama = urutan; `index.html` tetap menentukan urutan MUAT.
```
index.html · atlas_redesign.html · sw.js · manifest.json · assets.json · README.md
CSS (nomor = urutan cascade):   01-main · 02-layout · 03-components · 04-tahap · 05-polish · 06-avatar-ring · 07-stats-info · 08-kpc-profile   (.css)
JS 00–47 (nomor = urutan muat):  00 migrasi data · 01 hemat daya · 02 ikon · 03 tombol kembali · 04 TIMELINE/MCFA_CORE · 05 splash · 06 intro fase
  07 Program Adaptasi · 08 produksi konten · 09 hero · 10 kalender harian · 11 Tugas Awal · 12 inti aplikasi · 13 navigasi halaman · 14 premium
  15 unggah foto · 16 polish · 17 motion · 18 preferensi efek · 19 akun & sinkron cloud · 20 pencapaian · 21 buku besar · 22 jembatan overlay
  23 sistem Tahap · 24 tahap Aktivitas · 25 tahap Studio · 26 tahap Kehidupan · 27 tahap Karier · 28 tahap Keuangan · 29 jumlah akun
  30 backup JSON lokal · 31 hub akun · 32 peta pertumbuhan · 33 tab keuangan · 34 ringkasan · 35 SFX/ambient · 36 urutan tahap · 37 widget keuangan
  38 kepala tahap · 39 total keuangan · 40 kilau kartu · 41 pergantian hari · 42 jembatan konten · 43 jeda saat tersembunyi · 44 statistik & info
  45 profil KP.CIHUY · 46 PERSIAPAN selesai · 47 riwayat pencapaian
Gambar:  kpc, zona, mcfa, sheina, barongsukma, okk, fathulmeme, ayla, monkipedia, alley, cne, lol (.jpg) · mcfa-studio-logo.jpg
         oh-launch-bg.jpg, oh-launch-cta.png, oh-naskah.png (Official History) · hero-<kunci>.jpg (opsional, foto asli menggantikan ilustrasi)
Ikon:    icon-192/512 (.png .svg) · favicon.svg · apple-touch-icon.png
Dokumen: CHANGELOG.md · TESTING.md · DATABASE.md · BELUM-SELESAI.md
```
**Penting:** jangan mengganti nama berkas. Urutan MUAT JavaScript ditentukan `index.html` dan tidak boleh diubah. Bila menambah/menghapus berkas, perbarui `index.html`, `sw.js`, dan `assets.json`.

## Ketahanan startup (anti macet di logo loading)
- `index.html` memuat *startup guard* inline: splash dijamin tertutup (batas keras 7 detik) walau JS/CSS/Firebase/canvas gagal.
- Bila ada berkas JS/CSS gagal dimuat (mis. tidak ikut terunggah), muncul pesan yang menyebut nama berkasnya + tombol *Muat ulang*.
- Firebase dimuat non-blokir; tanpa internet aplikasi berjalan penuh dalam mode lokal (data tetap di perangkat).
- Animasi canvas (splash & intro) bersifat opsional: kegagalannya tidak menghentikan aplikasi.

## Tanggal resmi (sumber tunggal: `MCFA_CORE` di `04-core-timeline.js`)
| Bagian | Tanggal |
|---|---|
| **Tugas Awal MC FATHUL ADZIM** | **2 TAHAP** — **Tahap 1 = 14 Nov 2026**, **Tahap 2 = 20 Nov 2026** (`taStage1`, `taStage2`); **15–19 Nov 2026 KOSONG** (`taGapStart`–`taGapEnd`, tanpa tugas dan aktivitas otomatis). Daftar tugas sama (110 tugas, kategori A–J), checklist & progres tiap tahap terpisah (total keseluruhan 220). Data/tugas 1–13 Nov 2026 dihapus (14 Nov 2026) |
| ↳ Data lama | Salinan pengaman v4 disimpan sekali di `mcfa_tugasAwal_arsip_v4` (tidak dirender, tidak dihitung); hanya centang Branding akun (h5-…) dipertahankan di Tahap 1 |
| **Program Adaptasi** (BUKAN bagian Tugas Awal) | **15–20 Nov 2026 (6 hari)** — dikonfirmasi pengguna |
| **Day 1** (Project, Studio, Upload, Program, Progres) | **21 Nov 2026** |
| Akhir proyek utama (Day 1.096) | 20 Nov 2029 |

Mengubah tanggal cukup di `MCFA_CORE`; semua halaman membaca dari sana (label tahap lewat `data-mcfa-short` = `stage1`/`stage2`/`gap`). `TAH.verify()` dan `mcfaSelfCheck()` menandai bila data tugas tidak sejalan dengan `planEnd`/`dailyStart`.

## Halaman Aktivitas (susunan)
1. **KEGIATAN SEHARI-HARI** (`#heroHarian`) — paling atas.
2. **PERSIAPAN MCFA PROJECT** (`#pspGroup`, dibuat `46-persiapan-selesai.js`) — berisi ① **Tugas Awal** (`#heroTugasAwal`) dan ② **Adaptasi** (`#heroAdaptasi`). Kartu dipindahkan apa adanya; data tiap subbagian tetap terpisah. Status otomatis dari centang tersimpan: BELUM SELESAI → PERSIAPAN BERLANGSUNG (salah satu subbagian selesai) → SELESAI (keduanya selesai). Pratinjau tampilan SELESAI tanpa menulis data: `?preview=selesai`.

## Memperbarui rilis
Setiap berkas CSS/JS dipanggil dengan `?v=<BUILD>`. Saat mengubah file, naikkan nilai build di `index.html` (semua `?v=`), `BUILD` + daftar precache di `sw.js`, `build` di `assets.json`, dan `00-data-migration.js`, agar perangkat memuat versi baru.
