# Changelog

> Catatan: entri di bawah build 20261107.6 ditulis saat proyek masih memakai folder `css/`, `js/`, `assets/`. Sejak 20261107.6 semua berkas ada langsung di root: `js/12-…` kini cukup `12-app-core-intro-canvas.js`, `css/polish.css` → `polish.css`, `assets/images/…/x.jpg` → `x.jpg`.

## 20261107.6 — perbaikan GitHub Pages (struktur satu tingkat, startup tahan gagal, ikon baru)

**Penyebab macet di logo loading (terbukti dari kode & uji)**
- Splash (`#splashScreen`) hanya bisa ditutup oleh `05-splash-particles.js`. Jika berkas JS/CSS tidak ditemukan (404) — misalnya folder `css/` `js/` tidak ikut terunggah ke GitHub — splash tertahan selamanya (diuji ulang: gejalanya sama dengan screenshot).
- Kode canvas di splash dan di awal `12-app-core-intro-canvas.js` tidak dilindungi: bila `getContext('2d')` gagal, seluruh berkas inti (190 KB) ikut mati.
- Tiga `<script>` Firebase (gstatic) bersifat memblokir pemuatan; Google Fonts memblokir render.
- `sw.js`: `cache.addAll` gagal total bila satu berkas gagal; setiap navigasi (termasuk ke Atlas) ditimpa ke kunci `./index.html`; respons 404 bisa tersimpan; `controllerchange` memicu reload otomatis pada kunjungan pertama.

**Perbaikan**
- Struktur: semua berkas dipindah ke root (tanpa subfolder); seluruh referensi (HTML, CSS `url()`, JS, SW, manifest, registri) diperbarui. Tidak ada nama berkas yang bertabrakan.
- `index.html`: *startup guard* inline (batas keras 7 dtk, tap-untuk-lewati, pesan berkas gagal + tombol muat ulang); Firebase dimuat non-blokir lewat loader (modul `19-cloud-account-sync.js` hanya dijalankan setelah SDK siap; kode modul tidak diubah); Google Fonts non-blokir.
- `05-splash-particles.js`: timer penutup & tap-to-skip dipasang PERTAMA; canvas opsional dan dibungkus try/catch. Animasi dipertahankan.
- `12-app-core-intro-canvas.js`: canvas intro dibungkus try/catch; reload otomatis oleh Service Worker hanya saat PEMBARUAN (bukan instalasi pertama).
- `sw.js` ditulis ulang: aset inti vs opsional, install tidak pernah gagal karena satu berkas, hanya respons 200 disimpan, kunci cache = URL halaman, navigasi network-first dengan batas 4 dtk, bersihkan cache lama saat activate, scope relatif (aman di subpath).
- Ikon: `icon-192.svg` dan `icon-512.svg` didesain ulang dengan Bismillah lengkap berharakat (بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ) di atas MCFA, lalu garis emas, lalu PROJECT. Teks diubah menjadi SVG path sehingga identik di semua perangkat. Ditambah `favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`; manifest & `<head>` diperbarui.
- `assets.json`: dibangun ulang dari berkas yang benar-benar ada (sebelumnya build 20261106.2 dan tidak memuat `44-stats-info.js`, `45-kpc-profile.js`, `stats-info.css`, `kpc-profile.css`).
- Versi seluruh proyek: 20261107.5 → 20261107.6.

**Tidak diubah:** data, tanggal, perhitungan, kunci localStorage, struktur Firestore, konfigurasi Firebase, logika bisnis, tampilan halaman.

## 20261107.5 — 7 NOV 2026 (halaman akun ringkas + Daftar Pelajaran bergaya LMS)

**Halaman akun (M.C.F.A STUDIO)**
- `js/12`: checklist "Fokus Identitas & Branding" (Persona) beserta versi "Perkembangan Proyek" (Kolaborasi) dan "Pencapaian Proyek" (Adik) dihapus dari semua akun: judul, bar progres, dan 5 butir checkbox. Isinya tidak hilang — tetap tampil sekali di bagian bawah akun (**Strategi Konten**).
- Statistik akun dipertahankan. Dua kotak yang dulu dihitung dari checkbox (persentase) diganti statistik nyata: Kolaborasi → *Perkembangan Akun* (F · S), Adik → *Konsistensi Aktivitas*.
- `_fokusLoad/_fokusToggle` dan CSS `.psys-fk` dihapus. Data lama `mcfa_fokus_<akun>` di localStorage tidak disentuh.

**Pembelajaran SHEINA**
- `js/12`, `js/36`: daftar checkbox diganti kartu pembelajaran (`_pLearnHtml`): program (deskripsi, tujuan, progres) → kategori → kartu materi (ikon, judul, deskripsi, indikator progres). Tap kartu = tandai selesai.
- `PERSON.sheina.lms` (baru): ikon, warna, dan deskripsi. `belajar` (nama & urutan materi) tidak diubah; kunci simpanan `k0…k11` sama, sehingga progres lama tetap terbaca oleh Stats & kartu Sheina.
- `css/layout.css`: gaya `.pl-*`; aturan `.xt-ck/.xt-box/.xt-pbar/.xt-ptxt` dihapus.

## 20261107.4 — 7 NOV 2026 (revisi tombol Persona)
- `css/polish.css`: tombol panah Persona diperkecil (44 → 34 px, ikon 18 px; seluruh header tetap area ketuk). Teks header sedikit diperbesar: nama 21 → ±24 px (menyesuaikan lebar layar), badge 8,5 → 10 px, baris kode 9 → 10,5 px; layar ≤380px sedikit dirapatkan agar tidak terpotong. Foto, warna, isi, dan struktur kartu tidak berubah.

## 20261107.3 — 7 NOV 2026 (Integrasi Kehidupan → Keuangan: otomatis, sinkron undo)

**Diubah**
- `js/12-app-core-intro-canvas.js`: pop-up konfirmasi "Catat pengeluaran … ke Keuangan?" dan konfirmasi hapus saat undo DIHAPUS. Centang target bernominal = transaksi otomatis (ID `KH-<id target>`); undo = transaksi dibatalkan; bila buku gagal menyimpan, centang dibatalkan agar tidak pernah berbeda. Jenis transaksi 'out' (atau `ftype` bila diset), kategori: utang → "Cicilan / Hutang", lainnya → "Lainnya". Item tanpa nominal tidak membuat transaksi. Tambah `mcfaGoalNominalChanged(id)` untuk memperbarui transaksi bila nominal berubah.
- `js/21-finance-ledger.js`: tambah `MCFA_FIN_LEDGER.syncLinked(sid, spec|null)` — idempoten (tambah / perbarui / hapus duplikat / batalkan). `addLinked/removeLinked/hasLinked` tetap. Transaksi manual dan historis tidak disentuh; transaksi yang dibatalkan masuk "Riwayat dihapus".

**Pengujian (Chromium 390px):** centang → 1 transaksi, saldo & pengeluaran berubah, 0 dialog; undo → kembali ke saldo awal; undo+centang cepat & sinkron dua kali → tetap 1 transaksi; nominal 120→130 jt → transaksi diperbarui; refresh → centang & transaksi tetap; transaksi manual utuh; item tanpa nominal → tidak ada transaksi; 0 pageerror. BELUM diuji: HP Android asli, cloud sync/Firebase.

## 20261107.2 — 7 NOV 2026 (M.C.F.A Studio: tombol panah kartu Persona)

**Diubah (hanya tombol panah & interaksinya)**
- `css/polish.css`: panah `::after` pada `.bp-persona-header` diganti tombol bulat 44×44 px (warna solid sesuai warna Persona, ikon chevron putih tebal, bayangan + cincin putih), diletakkan absolut sehingga tata letak teks tidak bergeser. Area klik header diperluas (padding 8px, margin negatif agar tata letak tetap). Respons: hover (desktop), tekan = mengecil + redup + cincin melebar, putar 90° ke bawah saat terbuka; mati bila `prefers-reduced-motion`.
- `js/15-avatar-upload.js`: header Persona kini dapat difokus dan dibuka dengan Enter/Spasi (`role=button`, `aria-expanded`). `toggleBpPersona` asli tidak diubah.
- Foto, nama, warna kartu, deskripsi, isi, dan struktur kartu tidak diubah. Build 20261107.2.

**Pengujian (Chromium):** HP 390px (sentuh) dan desktop 1280px — tap/klik pada panah membuka lalu menutup kedua Persona; Enter/Spasi berfungsi; tombol 44×44 px; tidak ada pageerror.

## 20261107.1 — 7 NOV 2026 (Tugas Awal: libur 6 NOV, kumpulan 1–5 NOV di 7 NOV · visual tugas Adaptasi)

**Diubah**
- `js/11-initial-tasks-nov.js`: 6 NOV = LIBUR (Istirahat · Fresh · Recovery), tanpa tugas dan tanpa progres. 7 NOV menampilkan seluruh tugas 1–5 NOV memakai ID yang SAMA dengan tanggal asal (satu centang; centang/undo dari tanggal mana pun langsung sinkron). Daftar dekorasi studio tampil 8–20 NOV (ID `dek-*` dan centangnya tidak berubah). Tambah `TAH.verify()`.
- `js/07-adaptation-program.js` + `css/polish.css`: tampilan tugas Adaptasi saja — warna per kategori, tebal (Bold/Semibold/Regular) per tingkat penting, emoji hanya di tugas kunci. Nama, ID, urutan, centang, progres tidak berubah.
- Build 20261107.1 (index.html, sw.js, README).

**Pengujian (Chromium 390px, tanpa jaringan):** total tetap 196 tugas unik; 7 NOV = 15 blok / 88 tugas; centang di 7 NOV ↔ 1 NOV dan 4 NOV ↔ 7 NOV sinkron dua arah, tanpa hitungan ganda; data bertahan setelah reload; `TAH.verify()`, `MCFA_ADP.verify()/audit()` kosong; 0 pageerror. BELUM diuji: HP Android asli, offline/PWA, Firebase, tangkapan layar visual Adaptasi.

## 20261106.10 — 6 NOV 2026 (Bagian 3: audit integrasi + perapian)

**Audit (tanpa perubahan perilaku):** Studio, Karier, dan Pusat Akun sudah membaca satu sumber `MCFA_STUDIO` (`mcfa_tahap1_<akun>` untuk audiens/target, `mcfa_konten_<akun>` untuk konten). "Siap Upload" tidak dihitung sebagai upload; Produksi Konten → Studio tidak membuat data ganda.

**Dirapikan**
- `js/04-core-timeline.js`: tambah `mcfaTodayIso()` (tanggal hari ini Asia/Jakarta, 'YYYY-MM-DD') sebagai satu-satunya sumber tanggal berbentuk teks.
- `js/12`, `js/20`, `js/21`, `js/33`: empat salinan `Intl.DateTimeFormat(... 'Asia/Jakarta')` diganti `mcfaTodayIso()`.
- `js/30-local-backup-json.js`: nama file backup memakai tanggal Jakarta (sebelumnya UTC, bisa mundur sehari pukul 00.00–07.00 WIB).
- `js/12`: konstanta `TAHAP1` kini hanya rentang tanggal; target Tahap 1 hanya dari `MCFA_TAHAP.def` (nilai cadangan 500.000/1.000.000 dihapus).
- `js/31-studio-account-hub.js`: kartu "Target Subs" di Profil akun Dunia Ayla kini mengikuti target tahap (`_tgtStat`), bukan "2 JT" statis.

**Pengujian (Chromium 390px, tanpa jaringan)**
- 12 NOV 23:30 WIB → 2026-11-12; 13 NOV 05:00 WIB (UTC masih 12 NOV) → 2026-11-13.
- Followers Barongsukma diubah → Karier dan ringkasan Studio ikut berubah, lalu dikembalikan.
- Konten status Siap tidak dihitung; ID sama dihitung sekali; sinkron Produksi→Studio dua kali = 1 item; batal tahap → status Produksi.
- Kartu Ayla Tahap 1 = "1 JT" (sebelumnya "2 JT" statis). `MCFA_ADP.verify/audit`, `MCFA_T6.selfCheck`, `MCFA_ADPK.selfCheck` kosong; 0 pageerror.
- Catatan: `MCFA_ADP.audit()` yang dijalankan sebelum halaman selesai dimuat (<~3 dtk) bisa melaporkan "Running/Strength muncul 0×" karena label olahraga Sehari-hari belum dirender; setelah dimuat hasilnya kosong.
- BELUM diuji: HP Android asli, offline/PWA, dua perangkat, Firebase.

## 20261106.9 — 6 NOV 2026 (Bagian 2: Program Adaptasi tetap, satu sumber tugas)

**Diubah**
- `js/07-adaptation-program.js`: peningkatan tugas bertahap DIHAPUS total (`RAMP_OFFSET`, `DAY_OF`, `lvlOf()`, `newOf()`, label BARU, teks "+N tugas baru hari ini").
- Daftar tugas rutinitas Program Adaptasi tidak lagi ditulis ulang di 07. Nama, urutan, kategori, dan penempatan dibaca saat render dari Kegiatan Sehari-hari (`#ba-blk-*` di index.html), jadi tidak bisa berbeda. Dibaca saat render karena 07 dimuat sebelum blok Sehari-hari selesai di-parse.
- Semua tanggal 8–20 NOV (13 hari) memakai daftar yang sama: 48 tugas rutin (Pagi 20, Siang 3, Sore 3, Latihan Boxing 6, Malam 6, Menjelang Tidur 10). Sebelumnya tugas ini bertambah per hari.
- Keputusan pengguna: Adaptasi hanya Qhodo (1) per waktu sholat. Qhodo (2)/(3) tetap di Kegiatan Sehari-hari (`ADP_SKIP`, 10 kunci; satu-satunya perbedaan yang diizinkan).
- `MCFA_ADP.verify()` kini memeriksa: jumlah sama dengan Sehari-hari (dikurangi Qhodo (2)/(3)), ID unik, daftar identik di 13 tanggal, tidak ada RAMP_OFFSET, tidak ada label BARU. `audit()` jadwal olahraga disesuaikan.
- `css/components.css`: aturan `.adp-new` dihapus.
- API publik: `MCFA_ADP.level` dan `MCFA_ADP.rampOffset` dihapus; `ids` dan `catalog` kini fungsi.

**Dipertahankan (tidak diubah)**
- 48 ID tugas lama (kunci `mcfa_adp_v1_<tanggal>`), checklist per tanggal tetap terpisah, `MCFA_WORKOUT`, produksi konten (`08-...`), `MCFA_CORE`, tanggal resmi.

**Pengujian (browser nyata, Chromium 390px, tanpa jaringan)**
- 13 tanggal: jumlah dan susunan tugas identik; olahraga sesuai hari (8 NOV Minggu = Running, 9 NOV Senin = Strength Training); `verify()` dan `audit()` kosong; 0 label BARU.
- Centang 8 NOV tidak muncul di 9 NOV; ID unik 48; ID lama terbaca; tanpa pageerror.
- BELUM diuji: perangkat Android asli, offline/PWA, dua perangkat, Firebase.

## Build 20261106.8 — Langkah 4 & 5: posisi foto Sheina di kartu PROJECT ADIK SENDIRI
- **Masalah:** foto Sheina Shafira Anggreni (avatar kedua di kartu PROJECT ADIK SENDIRI, halaman M.C.F.A STUDIO) tampak bergeser ke kiri dan menyempit. Penyebab: `<span class="ah-pph">` berada di dalam wrapper `.ah-stack` kedua, sehingga `<img>`-nya ikut terkena aturan `.ah-cat .ah-stack img` (lebar/tinggi 28px `!important`, `margin-left:-11px`, padding dan border ganda). Terukur sebelum perbaikan: gambar 22×28 px, tergeser 2,5 px ke kiri dan 3 px ke bawah dari pusat bingkai.
- **Perbaikan (`css/avatar-ring.css`, bagian 10, hanya CSS):** gambar kini mengisi bingkai bulat penuh (100%, rasio 1:1, `object-fit:cover`, `object-position:50% 50%`) tanpa margin/padding/border sendiri; cincin gradasi tetap. Offset −11px dipindah dari `.ah-pph` ke wrapper-nya, jadi posisi lingkaran Sheina terhadap avatar Dunia Ayla tidak berubah.
- **Tidak diubah:** markup (`js/31`, `js/36`), ukuran avatar (28 px), foto Dunia Ayla, kartu lain, foto unggahan sendiri (`mcfa_person_photo_sheina` tetap didahulukan), data, tanggal, tugas, dan progres.
- Build dinaikkan ke 20261106.8 di `index.html` (semua `?v=`), `sw.js` (`CACHE_VERSION` + precache), dan README.

## Build 20261106.7 — Langkah 2: struktur & tata letak Program Adaptasi disamakan dengan Kegiatan Sehari-hari
- **Struktur sama dengan Kegiatan Sehari-hari:** header + Reset, navigasi hari, kartu Progres Hari Ini, **kartu Sholat Qhodo Hari Ini (baru; turunan dari tugas Qhodo aktif hari itu, tanpa data baru)**, **strip pill kategori (baru; ketuk pill = fokus satu kategori, "Semua" = kembali)**, bilah Olahraga Hari Ini, lalu 10 kategori dengan urutan yang sama (Pagi, Produksi Pagi, Siang, Produksi Siang, Sore, Latihan Boxing, Produksi Sore, Malam, Produksi Malam, Menjelang Tidur).
- **Tata letak horizontal (`css/polish.css`, `js/07`):** kategori tertutup tampil sebagai kartu ringkas berdampingan (`auto-fill`, min. 148 px; 2 kolom di HP) berisi ikon, hitungan, nama, dan bar progres mini; kategori yang dibuka melebar penuh dan daftar tugasnya menyusun kolom bila ruang cukup. Riwayat hari Adaptasi (13 titik) jadi satu baris yang bisa digeser ke samping dan otomatis menggulir ke hari yang dilihat. Tidak ada overflow horizontal halaman di 390 px.
- **Sistem konten (`js/08`):** kolom isian konten kini berlabel **"Nama konten"** (sebelumnya "Judul / ide konten (opsional)"); data tetap di kunci yang sama (`mcfa_adp_prod_v1`, field `t`) sehingga jembatan ke M.C.F.A STUDIO tidak berubah.
- **Tidak diubah:** ID tugas, kunci penyimpanan (`mcfa_adp_v1_*`, `mcfa_adp_custom_v1`), peningkatan bertahap per hari, rotasi akun konten, tugas tambahan per kategori, progres hari & program, Kegiatan Sehari-hari (10 blok / 58 item tetap).
- Diuji (Chromium headless 390×844 dan 1100×900, jam 19 NOV 2026): `MCFA_ADP.verify()`, `MCFA_ADP.audit()`, `MCFA_ADPP.selfCheck()` kosong (= konsisten); centang, hitungan pill, kartu Qhodo, tugas tambahan, mode fokus, dan data bertahan setelah muat ulang; tanpa error JavaScript.
- Catatan: bagian prompt "sistem konten harus memiliki: Nama konten." terpotong di sumber (hanya satu butir) — hanya "Nama konten" yang diterapkan.

## Build 20261106.6 — Langkah 1: urutan baru Tugas Awal MC FATHUL ADZIM + tanggal 20
- `js/11-initial-tasks-nov.js`: isi tanggal 2 dan 3 ditukar. Tanggal 1 = PERSIAPAN PROJECT, 2 = PEMBERSIHAN STUDIO (kamar mandi, dapur, tempat editing, ruangan tengah, alat workout, teras), 3 = PEMBERSIHAN RUMAH (kamar, rumah, plafon kamar Ayla), 4 = PERSIAPAN HIDUP BARU, 5 = PERSIAPAN BRANDING AKUN. Semua 33 + 55 tugas lama dipertahankan dengan teks yang sama.
- **ID tugas tidak diganti** (tetap `h2-…`/`h3-…` sesuai asal) sehingga centang dan riwayat lama otomatis ikut ke tugas yang sama; tidak ada migrasi data, skema tetap v4, tidak ada tugas ganda.
- **Tanggal 20 NOV = PERSIAPAN AKHIR MENYELURUH** (entri `n20`): seluruh tugas tanggal 1–5 diulang sebagai pemeriksaan akhir dengan ID sendiri `h20-…` (centang terpisah; centang tanggal asal tidak ditimpa), dikelompokkan: Kamar, Studio, Rumah, Peralatan dan Perlengkapan, Project, Persiapan Hidup Baru, Dekorasi Studio, lalu Branding seluruh akun (11 akun × 5 tugas). Daftar dekorasi di tanggal 20 memakai ID `dek-*` yang sama dengan 6–19 NOV (satu centang, tidak ganda).
- `entry()` kini mendahulukan tanggal persis sebelum rentang dekorasi (agar 20 NOV menampilkan `n20`); `overall()` menghitung tiap ID sekali (dekorasi tidak terhitung dua kali). Catatan per tanggal (`note`) ditampilkan di kepala hari.
- Total progres Tugas Awal: 108 → 196 tugas (tambahan 88 tugas pemeriksaan akhir `h20-*`).
- Tidak diubah: Adaptasi, Kegiatan Sehari-hari, foto, jadwal/tanggal di `MCFA_CORE`, data tersimpan.

## Build 20261106.5 — Pembaruan 5: Target Tahap 1/2/3 terhubung di detail akun
- **Masalah:** bagian "Fokus TAHAP 1" di modal akun (M.C.F.A STUDIO → Akun → buka akun) terkunci ke Tahap 1: target followers/subscribers/konten, tanggal, dan form simpan selalu Tahap 1 walau Tahap 2 atau 3 sedang dipilih.
- `js/12`: helper baru `_t1Stage()` (tahap terpilih di pemilih Tahap; bila belum ada yang dipilih → tahap berjalan menurut tanggal, sebelum DAY 1 = Tahap 1). `_renderTahap1`, `_t1Metric`, judul "Fokus TAHAP n", rentang tanggal, "DAY x DARI total" (hari dalam tahap itu), form Simpan (target disimpan ke tahap yang tampil), catatan target konten, dan kapasitas jadwal posting (hari × 2) kini mengikuti tahap. Blok "Program Barongsukma" hanya tampil bila fase program beririsan dengan tahap itu.
- `_tgtStat` (kartu Target Subs/Follow di Stats & Info) memakai `_t1Stage()` yang sama.
- `js/25`: modal akun yang sedang terbuka ikut berganti saat tahap diganti.
- `js/31`: kartu "Progres Tahap n" Dunia Ayla di Pusat Akun mengikuti tahap (sebelumnya selalu "Tahap 1"), menampilkan target bila ada, dan konten kini dihitung dari data Sudah Upload (sebelumnya selalu 0 karena field yang dibaca tidak ada).
- Tidak diubah: data tersimpan (`mcfa_tahap1_<akun>`, format sama), target bawaan per tahap, tanggal tahap, aturan kategori akun (Solo/Persona/Kolaborasi), ringkasan Akun & Konten per Tahap.
- Diuji (Chromium headless 390×844): modal Barongsukma menampilkan 700/500.000/1.000.000 (T1), 800/750.000/1.500.000 (T2), 1.000/1.000.000/2.000.000 (T3); target Tahap 2 yang disimpan tidak mengubah Tahap 1; 0 error JS; `mcfaSelfCheck` dan `MCFA_T6.selfCheck` kosong (lulus).
- Catatan: angka followers/subscribers aktual bersifat kumulatif (satu nilai per akun), jadi sama di semua tahap — yang berbeda adalah targetnya.

## Build 20261106.4 — Pembaruan 4: Program Adaptasi dimulai 8 NOVEMBER 2026
- `MCFA_CORE.adaptStart` diubah `2026-11-06` → `2026-11-08`. Program Adaptasi kini **8–20 NOV 2026 (13 hari)**, sebelumnya 6–20 NOV (15 hari). `adaptEnd` (20 NOV) tidak berubah.
- Kunci baru `MCFA_CORE.decoStart = 2026-11-06` (+ `MCFA_DERIVED.decoTotalDays` = 15 dan penanda `data-mcfa-range="deco"`): daftar Dekorasi Studio di Tugas Awal tetap aktif 6–20 NOV, sehingga 6–7 NOV tetap berisi daftar yang sama (tidak ada hari kosong, centang `dek-*` tidak berubah).
- Mengikuti otomatis dari `MCFA_CORE`: hari ke-n/13 di Program Adaptasi, tombol navigasi hari, titik progres (13), "BELUM DIMULAI · MULAI 8 NOVEMBER 2026" sebelum 8 NOV, status `TUGAS AWAL n/20 · ADAPTASI n/13`, kartu Aktivitas, timeline Blueprint (Kehidupan), teks akhir Fase Penyembuhan, rotasi dan target produksi konten (13 hari × 4 = 52).
- `js/07`: `RAMP_OFFSET` 3 → 5 agar peningkatan bertahap tiap TANGGAL tetap seperti rancangan (8 NOV = tingkat 6, 20 NOV = tingkat 18). Ubah ke 0 bila ingin mulai dari tingkat 1 pada 8 NOV.
- `js/08`: rotasi akun mulai dari 8 NOV; 19 NOV = Barongsukma, MC Fathul Adzim, CNE, OKK; 20 NOV = Barongsukma, MC Fathul Adzim, Zona, Alley's. Pemeriksaan otomatis diperbarui (13 hari, 52 target, 5–7 NOV bukan hari Adaptasi).
- `js/04` pemeriksaan otomatis diperbarui (adaptasi 13 hari, jarak persiapan → adaptasi 4 hari, dekorasi 15 hari). Teks cadangan di `index.html` diperbarui; teks Tugas Persiapan Lanjutan disesuaikan.
- TIDAK diubah: tanggal mulai M.C.F.A PROJECT dan M.C.F.A STUDIO (21 NOV 2026), Day 1 – Day 1.096, tanggal lahir, enam fase Official History, Tugas Awal 1–20 NOV, Persiapan Lanjutan 3–4 NOV.
- Data lama tidak dihapus: centang/catatan `mcfa_adp_v1_2026-11-06` dan `_07` serta `mcfa_adp_prod_v1` untuk 6–7 NOV (bila ada) tetap tersimpan, hanya tidak dihitung karena berada di luar rentang Adaptasi.
- Diuji (Chromium headless 390×844, jam disimulasikan 3, 7, 8, 20, 21 NOV): 0 error JS; `mcfaSelfCheck`, `MCFA_ADPP.selfCheck`, `MCFA_ADP.audit`, `MCFA_ADPK.selfCheck` semuanya kosong (lulus).

## Build 20261106.3 — Pembaruan 3: KP.CIHUY sebagai media informasi & promosi
- Berkas baru `js/45-kpc-profile.js` dan `css/kpc-profile.css` (dimuat paling akhir; ikut precache `sw.js`).
- Modal akun **KP.CIHUY** tidak lagi memakai checkbox, tanda centang, persentase "Perkembangan Proyek", maupun penghitung kontribusi +/−. Diganti halaman profil komunitas: kepala profil (logo bulat, nama, ringkasan) + 3 kategori yang bisa dibuka/tutup (Identitas & Profil · Kehidupan & Kegiatan · Media & Promosi) berisi 16 kartu: identitas, profil Kampung Siruang, sejarah singkat, visi & misi, identitas masyarakat, anak-anak & pemuda, olahraga & permainan, pendidikan & edukasi, sosial & kebersamaan, pertanian/perikanan/pekerjaan, program komunitas, dokumentasi aktivitas, media sosial & platform, strategi promosi, identitas visual & branding, kolaborasi CNE Pictures.
- Isi hanya dari data yang SUDAH ada (AKUN.kpc, kartu Karya & Dampak Sosial, kartu Jajan Anak-Anak, konten berstatus Sudah Upload, followers/subscribers aktual). Tidak ada jumlah anggota, statistik, atau pencapaian yang dikarang.
- Informasi yang memang belum tersedia (sejarah, profil kampung, identitas masyarakat, pertanian/perikanan, tautan platform, dll.) tampil "belum dicatat" dengan tombol **Isi informasi**; catatan disimpan di `mcfa_kpc_info_v1` (ikut backup JSON & cloud) dan hanya ditulis bila berhasil.
- Perubahan di `js/12`: tiga baris (jalur render KP.CIHUY di `openAkun`, `_postingSectionHtml`, `_renderPostingSys`), masing-masing dengan fallback ke tampilan lama bila modul tidak termuat.
- Checkbox akun lain TIDAK diubah: CNE Pictures, Persona (MC Fathul Adzim, Fathul Al-Meme), dan Dunia Ayla tetap seperti semula. Data lama `mcfa_fokus_kpc` / `mcfa_kolab_kpc` tidak dihapus.
- Bagian "Fokus Tahap" KP.CIHUY tetap informatif (dicatat, tanpa target); tidak ada perubahan data, tanggal, atau logika tahap.
- Diuji (Chromium headless 390×844): KP.CIHUY 0 checkbox / 0 penghitung / 16 kartu; CNE, Mercfa, Fathul Al-Meme, Ayla tetap 5 checkbox; simpan catatan bertahan setelah muat ulang; tidak ada error JS.

## Build 20261106.2 — Pembaruan 2: Stats & Info seluruh akun
- Berkas baru `js/44-stats-info.js` dan `css/stats-info.css` (dimuat paling akhir; ikut precache `sw.js`). Satu sumber kartu "Stats & Info" untuk 11 akun + profil Sheina.
- Setiap kartu kini punya ikon, judul, nilai, dan keterangan singkat, dalam grid dua kolom. Jika jumlah kartu ganjil, kartu terakhir melebar penuh sehingga tidak ada ruang kosong (kasus lama: Persona Utama hanya 3 kartu).
- Isi kartu ditulis per akun dari teks yang SUDAH ada di data akun (persona, deskripsi, niche, tag, strategi, daftar squad). Tidak ada angka, anggota, atau pencapaian baru. Data yang memang belum ada tampil "Belum ditetapkan": Target Audiens Persona Utama (mcfa), Platform CNE Pictures, dan peran Nizam & Rezki di CNE.
- Susunan mengikuti kategori: Persona (identitas, branding, fokus karier, keahlian, niche, audiens, strategi, arah), Solo Branding (identitas merek, tujuan, positioning, karakter, strategi, identitas visual, perkembangan), Kolaborasi (identitas, proyek, produksi, strategi publikasi, perkembangan), Project Adik (profil Dunia Ayla, pengelolaan, 4 pilar, olahraga, strategi) dan profil Sheina.
- Kartu bawaan (Persona, Posting, Platform, Target Subs/Follow, program Barongsukma, tim CNE) dipertahankan dan hanya diberi judul + keterangan. Kartu pengganti lama "Fokus Akun" dihapus karena sudah tercakup kartu baru.
- Kartu "Perkembangan" dibaca langsung dari `_postInfo` (hanya konten berstatus Sudah Upload). Kartu target tetap mengikuti Tahap yang aktif lewat `_tgtStat` (tidak diubah).
- Perubahan kode di berkas lama hanya dua baris: `js/12` (render Stats & Info modal akun, dengan fallback ke tampilan lama) dan `js/36` (sisip Stats & Info di profil Sheina). Tidak ada perubahan data, penyimpanan, tanggal, atau logika tahap.
- Diuji (Chromium headless 390×844): 11 akun + Sheina tampil tanpa error JS, tanpa teks meluber; cek mandiri bawaan kosong; target berganti benar saat Tahap 1/2/3; fallback saat modul dimatikan tetap menampilkan 4 kartu lama.

## Build 20261106.1 — Pembaruan 1: foto profil seluruh akun
- `assets/images/profile/sheina.jpg`: crop ulang (420×420) agar wajah dan hijab tepat di tengah. Garis mata file sudah lurus (selisih 0,2°), jadi tidak diputar lagi; yang diperbaiki adalah posisi dan skala crop.
- Berkas baru `css/avatar-ring.css` (dimuat setelah `polish.css`, ikut precache `sw.js`): komponen foto bulat standar berlapis (cincin gradasi conic + celah putih + bayangan berwarna) mengikuti desain cincin Sheina. Warna cincin mengikuti `--c` tiap akun/kategori. Berlaku untuk daftar akun, tumpukan foto kartu kategori, hero Dunia Ayla, foto Sheina, halaman profil Sheina, ikon jendela Sheina, serta foto Persona Utama dan Persona Kedua.
- Titik fokus foto per akun diatur (`object-position`); logo Zona Asumsi ditampilkan utuh (`contain`).
- Tidak ada perubahan data, logika, atau markup.

# CHANGELOG

## Build 20261104.13 — Revisi Tugas Awal 4–5 NOV (permintaan pengguna)
- **4 NOV:** "Olahraga (Day 1)" dan "Running (Day 1)" kembali ke TUGAS 4 NOVEMBER, tepat setelah "Buat ucapan Caca" (urutan: … Buat ucapan Caca → Olahraga → Running → Buat print A6 → Buat mapel). ID tetap, centang ikut.
- **5 NOV = BUAT AKUN / BRANDING:** 11 akun (MC Fathul Adzim, Fathul Al-Meme, Barongsukma, Otak Kepala Kardus, Zona Asumsi, Alley's Creative Kids, Dunia Ayla, LoL Monkey Shop, Monkipedia, KP.CIHUY, CNE Pictures), masing-masing 5 tugas: Buat akun Gmail · Samakan username · Tambahkan bio yang pas · Periksa keamanan akun · Cek akun FB, TikTok, IG dan perhatikan sama seperti di atas. ID tetap `h5-<akun>-gmail|username|bio|aman|sosmed`. Total tugas Tugas Awal 53 → 108.
- Adaptasi tetap mulai 6 NOV. Diuji: urutan 4 NOV, 11 grup × 5 tugas pada 5 NOV, centang tersimpan, centang lama tidak hilang, tanpa error.

## Build 20261104.12 — Tindak lanjut (permintaan pengguna)
- **Rencana upload Adaptasi:** upload Alley, Lol, dan Monkipedia dipindah dari 5 NOV ke 8 NOV (js/07 `FIX`); tahap persiapannya mengikuti (ide 4 NOV, produksi 5 NOV, editing 6 NOV, pemeriksaan 7 NOV, upload 8 NOV). Ekstrapolasi sesudahnya dihitung ulang otomatis (Alley & Lol kini upload 7 dan 8 NOV berurutan; hari penuh solo 16–20 NOV tetap). Semua cek mandiri kosong.
- **CNE Pictures:** pihak kolaborasi "Sepupu 1/2" diganti **Nizam** dan **Rezki** (js/12 `_kolabParties`). Hitungan kontribusi per pihak tetap (disimpan per urutan).

## Build 20261104.11 — Poin 6: Pemeriksaan akhir (rilis pembaruan poin 1–5)
- Pemeriksaan statis: sintaks 43 berkas JS + sw.js valid; nomor build seragam (index.html, sw.js, README); semua aset di index.html terdaftar di cache sw.js dan ada di disk; tidak ada sisa referensi lama (`fmBalanceInput`, "5 Fase", DAY 615, 15 Mar 2026, "Semua akun posting 2×/hari").
- Uji menyeluruh (Chromium headless, tanggal simulasi 5 Nov 2026, 21 Nov 2026, 1 Mar 2027, dibandingkan dengan build awal): semua halaman, 11 akun, pergantian Tahap 1–3 berjalan tanpa error konsol/halaman; semua cek mandiri kosong (core, produksi konten, rencana upload, audit olahraga). Cek rencana upload yang sebelumnya gagal (26 tugas) kini lolos.
- Uji fungsi per poin: foto Sheina lurus (selisih sudut mata 0,01°); status per kategori akun; 4 fase Barongsukma + BB 57/77/75/110/85; Keuangan (migrasi, tambah/edit/hapus, gagal simpan, duplikat, reload); jadwal 4→5 NOV dan Adaptasi 6 NOV (53 tugas, tanpa duplikat, centang ikut pindah).
- Tampilan: "DAY n" pada panel aktivitas non-Solo tidak lagi terpecah dua baris.
- Waktu muat tidak melambat dibanding build awal (0,7–1,8 dtk di lingkungan uji, setara baseline); ukuran paket ±2,3 MB tanpa dependensi baru.

## Build 20261104.10 — Poin 5: Perpindahan jadwal olahraga & Adaptasi
Hanya aktivitas yang disebut yang dipindah; jadwal olahraga mingguan (`MCFA_WORKOUT`) dan aktivitas lain tidak digeser.
- **4 → 5 NOV:** "Olahraga (Day 1)" (Angkat Beban) dan "Running (Day 1)" dipindah dari TUGAS 4 NOVEMBER ke TUGAS 5 NOVEMBER (js/11, entri baru `n5`). Nama, urutan, dan ID tugas (`h4-olahraga-day1`, `h4-running-day1`) dipertahankan sehingga centang/progres ikut pindah; tidak ada duplikat dan penempatan lama di 4 NOV dihapus. Total tugas tetap 53.
- **Adaptasi 5 → 6 NOV:** `MCFA_CORE.adaptStart` = 2026-11-06 (sumber tunggal). Adaptasi kini 6–20 NOV = 15 hari (sebelumnya 16). Otomatis mengikuti: hero & kalender Adaptasi, hitungan hari (6 NOV = hari ke-1), status "TUGAS AWAL n/20 · ADAPTASI n/15", daftar dekorasi studio (mulai 6 NOV), rotasi Produksi Konten (hari ke-1 = 6 NOV; 15 hari, target 60), teks timeline Kehidupan & kartu Aktivitas (juga teks cadangan di index.html).
- **Tingkat peningkatan bertahap:** `RAMP_OFFSET` 2 → 3 sehingga tingkat tiap tanggal tidak berubah (6 NOV = tingkat 4, 20 NOV = tingkat 18).
- **5 NOV** kini hari Tugas Awal biasa (tanpa Persiapan maupun Adaptasi). Cek mandiri js/04 diperbarui (jarak Persiapan→Adaptasi = 2 hari).
- Cek mandiri js/08 diperbarui untuk rotasi yang bergeser satu hari; cek js/07 "semua tugas dalam rencana" kini membandingkan dengan rentang rencana (3 NOV–20 NOV), memperbaiki ketidaksesuaian lama (sebelumnya gagal 26 tugas).
- Catatan: tugas Produksi Konten & upload pada rencana upload yang bertanggal 3–5 NOV tetap ada di data tetapi tidak tampil di Adaptasi karena Adaptasi baru mulai 6 NOV (3–4 NOV sudah begitu sebelumnya). Catatan Adaptasi tanggal 5 NOV (jika pernah diisi) tidak dihapus dari penyimpanan, hanya tidak ditampilkan/dihitung.
- Diuji (Chromium headless; tanggal simulasi 4, 5, 6 NOV): semua cek mandiri lolos, tidak ada error konsol.

## Build 20261104.9 — Poin 4: Perombakan sistem keuangan (satu sumber transaksi)
Sumber tunggal: Buku Transaksi (`fin_ledger_v1`). Rumus bersama di `MCFA_FIN_CALC` (js/20), dipakai js/21, 28, 39 dan ledger.
- **Rumus:** Saldo = Pemasukan Aktif − Pengeluaran Aktif · Progres = Pemasukan Aktif · Sisa Target = Target − Pemasukan Aktif · Persen = Pemasukan Aktif ÷ Target × 100. Pengeluaran tidak menurunkan progres.
- **Saldo Saat Ini read-only:** input manual dihapus (`fmBalanceInput` → `fmBalanceVal`, teks biasa). Handler "koreksi saldo" dihapus. `fin_milestones_v1.balance` hanya cache turunan.
- **Simpan aman:** transaksi ditulis ke penyimpanan lebih dulu (`commit`); bila gagal, buku, saldo, dan progres tidak berubah. Hapus = dipindah ke riwayat `deleted` (tidak dihitung); edit = hitung ulang; penjaga transaksi ganda (tanda tangan 3 detik + ID sumber Studio/Kehidupan) tetap.
- **Pencapaian (milestone)** mengikuti total pemasukan aktif; bila pemasukan dihapus/turun, pencapaian yang tak lagi terpenuhi dicabut otomatis. Kartu "Target Sedang Dikejar" memakai dasar yang sama.
- **UI:** filter Histori Pemasukan / Pengeluaran, "Riwayat dihapus", tile ringkasan (Pemasukan · Pengeluaran · Transaksi Aktif) + cek rumus. Progres Tahap 1 (Rp400 jt) membaca pemasukan aktif.
- **Migrasi v2 (aman, tanpa kehilangan histori):** saldo awal lama / saldo manual lama dijadikan satu transaksi "Saldo awal (migrasi dari sistem lama)" bertanggal 1 Jan 2026 (ID `tx_migrasi_saldo_awal`); semua transaksi lama, termasuk "Koreksi saldo", tetap ada dan kini bisa diedit/dihapus. Nilai lama disimpan di `openingMigrated`. Sebelum migrasi tersimpan, hitungan membaca format lama sehingga angka tidak melompat.
- Diuji (Chromium headless): migrasi dari data lama & saldo manual saja; tambah/edit/hapus pemasukan & pengeluaran; duplikat cepat; gagal simpan (kuota penuh); filter; reload; target Kehidupan (tambah/duplikat/hapus). Tidak ada error konsol.

## Build 20261104.8 — Poin 3: Restrukturisasi fase Barongsukma
Satu sumber data: `BARONG_PROGRAM` (js/12). Semua tampilan (Global Journey, Fase Aktif, Body Target, Fase Berikutnya, History, ringkasan Tahap 1, kartu statistik, deskripsi akun) dibaca dari sana.
- Fase 1 lama ("Bulking Tidak Teratur", 15 Mar–20 Nov 2026) dihapus. Fase 2→1, 3→2, 4→3, 5→4. Tanggal tiap fase tetap: F1 21 Nov 2026–7 Feb 2027 (79 hari), F2 8 Feb–14 Mar 2027 (35), F3 15 Mar–30 Sep 2027 (200), F4 1 Okt–20 Nov 2027 (51) = 365 hari; siklus lanjutan tetap mulai 21 Nov 2027.
- Target BB: F1 57→77, F2 77→75, F3 75→110, F4 110→85 (disimpan juga sebagai `bbFrom`/`bbTo`, divalidasi otomatis). Chip akun: "4 Fase", "DAY 0→364", "57→85kg".
- Global Day 0 = 21 Nov 2026 (sebelumnya 15 Mar 2026). Day Fase kini selalu mulai dari 1 (termasuk Fase 1). Sebelum 21 Nov tampil "BELUM DIMULAI · n hari lagi".
- Milestone "1 YEAR BARONGSUKMA PROGRESS" dipindah dari 15 Mar 2027 ke 21 Nov 2027 (tepat Global Day 365 dari awal baru).
- Kunci fase diganti `p1…p4` (dulu `f1…f5`): perangkat lama yang menyimpan `barongPhaseNotified.v1 = f1` akan mendapat notifikasi "FASE 1 DIMULAI" pada 21 Nov 2026 (tanpa fase ganda/tersisa).
- Validator konsol diperbarui (4 fase, durasi, Global Day, tanpa celah/tumpang tindih, BB, nomor tanpa duplikat). Tidak ada data pengguna yang terikat ke nomor fase lama, jadi tidak diperlukan migrasi.
- Diuji di Chromium headless pada 5 Nov 2026, 21 Nov 2026, 8 Feb 2027, 21 Nov 2027: tidak ada error konsol.

## Build 20261104.7 — Poin 2: Status & indikator per kategori akun
Kategori dibaca dari satu sumber (`MCFA_STUDIO.cat` → `_akunKind`): Solo Branding, Persona, Kolaborasi, Adik. Perubahan langsung di `js/12`, `index.html`, `css/polish.css`; tidak ada modul baru.
- **Solo Branding**: target 2×/hari, target followers/subscribers tidak berubah. Panel posting kini menambah jadwal posting, konsistensi (hari penuh / hari berjalan), runtun hari penuh, dan capaian aktivitas dengan bar progres (`_postInfo`: `activeDays`, `daysMet`, `streak`).
- **Persona**: chip "2×/Hari Posting" diganti chip fokus; panel "Identitas & Perkembangan Akun" (identitas, followers/subs aktual, konten diupload, hari aktif, runtun) dan checklist Fokus Identitas & Branding (dari daftar Strategi Konten).
- **Kolaborasi**: panel "Aktivitas Kolaborasi": pihak terlibat, aktivitas kolaborasi, perkembangan proyek (checklist), konsistensi, dan kontribusi setiap pihak (tombol +/−). Pihak diambil dari data squad KP.CIHUY; CNE Pictures memakai MC FATHUL ADZIM + Sepupu 1/2 (sesuai data "2 orang sepupu").
- **Adik (Dunia Ayla)**: panel "Perkembangan & Proyek Adik": identitas, perkembangan akun, aktivitas konten, pencapaian proyek (checklist).
- Penyimpanan baru: `mcfa_fokus_<akun>` dan `mcfa_kolab_<akun>` (ikut backup JSON). Tulis hanya jika berhasil; gagal simpan = tampilan tidak berubah + notifikasi. Data lama (`mcfa_konten_*`, `mcfa_tahap1_*`, kategori Pusat Akun) tidak diubah.
- Teks pengantar Blueprint ("Semua akun posting 2×/hari") diperbaiki; catatan global posting menyebut kategori tanpa target harian.
- Diuji di Chromium headless (simulasi 5 Nov & 25 Nov 2026): tidak ada error konsol; target harian global = 6 akun Solo × 2 × 5 hari = 60.

## Build 20261104.6 — Poin 1: Perbaikan foto profil (Sheina)
- `assets/images/profile/sheina.jpg` diluruskan: garis mata terukur miring 2,3° (mata kanan lebih tinggi), diputar 2,3° searah jarum jam. Setelah koreksi selisih sudut mata = 0,01°. Ukuran tetap 480×480 (rasio asli 1:1), wajah dan hijab tidak terpotong; sudut kosong akibat rotasi diisi dengan replikasi tepi (latar merah/baju putih) sehingga tidak ada garis atau ruang kosong.
- `css/polish.css` (blok paling bawah): semua slot foto Sheina (Branding `.bp-sheina-img`, Pusat Akun `.ah-sheina .pf`, avatar `.ah-pph`, halaman profil `.pp-ph`, ikon jendela `#am-icon`) memakai `object-fit:cover`, `aspect-ratio:1/1`, `transform:none`, dan `image-orientation:from-image`, sehingga foto tidak tertarik atau miring, termasuk foto unggahan sendiri yang membawa data orientasi EXIF.
- Foto unggahan sendiri (`mcfa_person_photo_sheina`) tetap didahulukan dan tidak ditimpa. Berkas asli sebelum diluruskan tidak disimpan di paket; jika foto di perangkat masih tampak miring, itu berasal dari foto unggahan sendiri, bukan berkas bawaan.
- Build dinaikkan ke `20261104.6` (index.html, sw.js, README) agar cache perangkat diperbarui. Modul lain tidak diubah.

## Build 20261104.5 — Foto Sheina di halaman Branding
- Baris Sheina Shafira Anggreni di halaman Branding: ikon kupu-kupu diganti foto bulat (48 px, sama ukurannya dengan baris Dunia Ayla). Foto unggahan sendiri tetap didahulukan, sama seperti slot foto lain. Nama, keterangan, dan fungsi buka profil tidak diubah.

## Build 20261104.4 — Foto Sheina Shafira Anggreni
- Foto Sheina ditambahkan sebagai aset `assets/images/profile/sheina.jpg` (480×480, dipotong persegi tepat di tengah wajah, hijab utuh, tanpa mengubah warna/latar). Terdaftar di `assets/assets.json` dan precache `sw.js`.
- Dipakai sebagai foto bawaan di tiga slot foto Sheina yang sudah ada: avatar di kartu PROJECT ADIK SENDIRI (`js/31`), kartu Sheina di Pusat Akun (`js/31`), dan halaman profil + ikon jendelanya (`js/36`).
- Foto yang diunggah sendiri lewat ikon kamera (`mcfa_person_photo_sheina`) tetap didahulukan dan tidak ditimpa atau dihapus.
- Build dinaikkan ke `20261104.4`. Daftar Tugas Awal dan fitur lain tidak diubah.

## Build 20261104.3 — Pembaruan total Tugas Awal MC FATHUL ADZIM (H 1–H 4)
- **Daftar H 1–H 4 diganti total** (`js/11-initial-tasks-nov.js`): H 1 = 4 tugas, H 2 = 6, H 3 = 10, H 4 = 13 (33 tugas). Semua tugas lama dihapus dari daftar; tidak ada yang muncul kembali atau ganda. Judul tema lama ("TUBUH ADAPTASI LAGI", "KHUSUS BERSIHKAN STUDIO") ikut dihapus karena sudah tidak sesuai isi.
- **H 5 (daftar dekorasi studio, 5–20 NOV) tidak diubah** — 20 tugas, ID `dek-*`, kode byte-identik dengan build sebelumnya; centang dekorasi tetap tersimpan.
- **ID tugas tetap** (`h1-makan`, `h4-mandi-wajib`, dst.), bukan lagi nomor urut.
- **Migrasi skema v3 → v4** pada kunci `mcfa_tugasAwalHarian_v1` (kunci sama, tetap ikut backup/cloud sync): salinan utuh data lama disimpan di `mcfa_tugasAwalHarian_v1_prev_v3`. Centang lama tidak dianggap selesai untuk tugas baru, kecuali tugas yang sama persis di hari yang sama (Buat jadwal olahraga, Buat ucapan Caca, Buat print A6). Migrasi idempoten.
- Tampilan, bilah olahraga, progres per hari, strip tanggal, ringkasan total, dan hook ke Aktivitas (`TAH.stats/next`) tidak diubah. Total progres: 66 → 53 tugas.
- Build dinaikkan ke `20261104.3` (index.html, sw.js, README) agar perangkat memuat versi baru.

## Build 20261104.2 — Perapian Aktivitas, Adaptasi & jadwal olahraga tunggal
- **Header kartu ungu (Aktivitas):** baris `21 NOVEMBER 2026 / DAY 1 · Tugas Awal · 20 NOVEMBER 2029 / DAY 1.096` turun 10 px (`--pb-dates-shift` di `css/polish.css`; 0px = lama). Hanya posisi — ukuran tulisan, badge, kartu, dan 3 kolom tidak berubah; jarak ke teks di atasnya 10 → 20 px.
- **Duplikasi Running dihapus:** Program Adaptasi sudah punya item `adp_pg_lari`; build sebelumnya menambah `adp_pg_latihan` sehingga Running muncul dua kali. Item ganda dihapus, `adp_pg_lari` kini tampil sejak hari pertama dan namanya dari `MCFA_WORKOUT` (Running/Strength Training). Centang `adp_pg_latihan` (bila ada) otomatis dipindah ke `adp_pg_lari` saat dibaca; tidak ada data yang dihapus.
- **Satu sumber jadwal:** nama olahraga hanya ditulis oleh `MCFA_WORKOUT`. Pemanasan & Pendinginan tidak lagi memuat nama Running/Strength Training, sehingga nama itu hanya muncul sekali per hari di Adaptasi, Sehari-hari, dan Tugas Awal. `MCFA_ADP.audit()` memeriksa 5–20 NOV + DOM Kegiatan Sehari-hari (1× tiap sesi, penempatan Pagi/Sore/Malam, nama = jadwal mingguan); hasil kosong = konsisten.
- **Program Adaptasi — kategori accordion:** urutan & kategori mengikuti Kegiatan Sehari-hari (Pagi, Produksi Pagi, Siang, Produksi Siang, Sore, Latihan Boxing, Produksi Sore, Malam, Produksi Malam, Menjelang Tidur). Semua tertutup sampai diketuk; hitungan "selesai / total" tampil di header kategori. Latihan Boxing kini kategori sendiri (ID item tidak berubah).
- **Tugas tambahan tanpa batas:** tiap kategori punya kolom "Tambah tugas baru". Disimpan di `mcfa_adp_custom_v1` ({id, cat, t, from, until}); muncul mulai hari ditambahkan sampai 20 NOV, centang per hari di catatan harian yang sama (ikut progres hari & program). Hapus = berhenti mulai hari itu, riwayat hari sebelumnya tetap.
- Tugas Awal, Kegiatan Sehari-hari, dan centang yang sudah tersimpan tidak diubah.

## Build 20261104.1 — Posisi header & jadwal olahraga pagi/sore/malam
- **Header:** teks tanggal (`21 NOVEMBER 2026`) dan dua badge (`1.096 HARI`, `0%`) turun 2 px (`--tb-date-shift`, `--tb-badge-shift` di `css/polish.css`; 0px = posisi lama). Ukuran font/kartu/ikon dan jarak horizontal tidak berubah.
- **Pembagian olahraga (sumber tunggal `MCFA_WORKOUT`, `js/04`):** Pagi = Angkat Beban + Running/Strength Training (menurut hari); Sore = Latihan Kaki; Malam = Latihan Lengan. Bilah jadwal kini menampilkan rencana 4 sesi hari itu.
- **Program Adaptasi:** keempat sesi muncul sejak hari pertama. `adp_pg_olahraga` → Angkat Beban; baru `adp_pg_latihan` (Running/Strength), `adp_sr_kaki`; `adp_td_olahraga_tangan` → Latihan Lengan dan pindah ke Malam (ID lama tetap, centang lama aman). Peta sumber `verify()` diperbaiki (kosong = sinkron).
- **Kegiatan Sehari-hari:** "Olahraga" → Angkat Beban, "Lari pagi" → Running/Strength Training, "Olahraga tangan" → Latihan Lengan (dipindah ke Malam), Latihan Kaki baru di Sore. Penyimpanan centang kini memakai kunci tetap per item (`data-bk`: `item_N` asli, `wk_leg` baru), sehingga data lama tidak bergeser. Hitungan Tahap (`js/24`) ikut kunci ini.
- **Tugas Awal:** mulai 4 NOV ada grup Olahraga Pagi/Sore/Malam; item lama `n4-0-3` dipindah ke Pagi (centang aman). 1–3 NOV tidak diubah agar riwayat tidak berubah.
- "Pemanasan latihan" hanya mengikuti nama olahraga di blok Pagi; di Menjelang Tidur memakai teks dasar.

## 20261103.2 — 3 Nov 2026
- **Tanggal Tugas Awal MC FATHUL ADZIM = 1–20 Nov 2026 (20 hari)**, hanya diubah di `MCFA_CORE` (`taskEnd`); semua halaman membaca dari sana (Aktivitas, Timeline Proyek, Sejarah/Titik Nol, pohon fase, dasbor Aktivitas, status harian, validasi `mcfaSelfCheck`). Persiapan Lanjutan (3–4 Nov) dan Program Adaptasi (5–20 Nov) kini ditandai sebagai bagian di dalam Tugas Awal, bukan fase terpisah. DAY 1 PROJECT/STUDIO tetap 21 Nov 2026.
- **Centang Aktivitas**: tanggal/jam selesai tidak lagi ditampilkan, ikon gembok dihapus, dan centang daftar dekorasi studio (5–20 Nov) kini bisa dibatalkan seperti centang lainnya. Data centang lama tidak dihapus.
- **Keuangan Tahap 3**: baris "Bayar Utang" (kartu Diri Sendiri) berlabel "Investasi" saat Tahap 3 dipilih; nominal tidak berubah.
- Dasbor Aktivitas: titik hari 1–20 Nov ditata 7 kolom.

## 20261103.1 — 3 Nov 2026
**Struktur (Tahap 9)**
- `index.html` 2,31 MB → 231 KB. 5 blok `<style>` → `css/`, 43 blok `<script>` inline → `js/01…43` (urutan eksekusi sama), 15 gambar base64 → `assets/images/` (byte-identik, tanpa kompresi ulang).
- `assets/assets.json` sebagai registri aset.
- `<meta charset>` dipindah ke awal `<head>` (sebelumnya setelah ±8.500 baris).
- `sw.js`: cache `mcfa-v3-<build>`, precache seluruh CSS/JS/gambar, URL CSS/JS bersandi versi.
- Ikon, `manifest.json`, `atlas_redesign.html`: tidak diubah.

**Logika (dari tahap sebelumnya, diverifikasi di rilis ini)**
- Satu sumber tanggal `MCFA_CORE`; Day dihitung dari selisih tanggal kalender (kabisat 2028 benar), zona Asia/Jakarta.
- Tugas Awal 1–2 Nov, Persiapan 3–4 Nov, Program Adaptasi 5–20 Nov terpisah.
- Produksi konten Adaptasi (`MCFA_ADPP`): rotasi 4 akun/hari, 6 tahap per konten. **Keputusan pengguna 3 Nov 2026: rotasi 4 akun dipertahankan** (bukan hanya OKK + Zona).
- Jembatan Adaptasi → Studio: konten selesai 6 tahap menjadi "Siap Upload" (bukan statistik posting). Upload resmi hanya mulai 21 Nov 2026.

**Dampak perubahan instruksi:** prompt master 4.3 (2 akun × 2 konten) digantikan keputusan rotasi 4 akun; BARONGSUKMA dan MC Fathul Adzim masuk rotasi 19–20 Nov dan tetap akun pertama pada upload 21 Nov.

## Build 20261103.4 — Presisi teks, tanggal/DAY & sinkron jadwal olahraga
- **Header tanggal:** semua tanggal kini 2 baris rata tengah — `21 NOVEMBER 2026` / `DAY 1` dan `20 NOVEMBER 2029` / `DAY 1.096` (intro, hero Blueprint, header Project, roadmap, penutup). Identitas "MUHAMMAD CAHYA FATHUL ADZIM ( 21 NOVEMBER 2004 )" tersusun 3 baris tanpa tanda kurung/tanggal yatim.
- **Jadwal olahraga (sumber tunggal `MCFA_WORKOUT` di `js/04`)**: Running = Minggu, Selasa, Rabu, Jumat; Strength Training = Senin, Kamis, Sabtu.
- Diterapkan ke Tugas Awal (1–4 Nov), Program Adaptasi (5–20 Nov), dan Kegiatan Sehari-hari (label pagi/sore/malam mengikuti hari yang dilihat) + bilah jadwal mingguan di tiap bagian.
- Centang/riwayat TIDAK berubah (kunci per indeks/ID tetap). Hanya label teks yang mengikuti jadwal.
- Pemenggalan baris: judul/subjudul memakai text-wrap balance, paragraf & label tugas memakai pretty (tanpa kata menggantung). Audit 5 halaman di 360px: tidak ada teks terpotong/keluar kartu (strip tab/chip/pill memang scroll horizontal).
