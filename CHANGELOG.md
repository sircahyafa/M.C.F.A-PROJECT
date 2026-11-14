# Changelog

## 20261114.2 — Perubahan daftar tugas (Makan)

- **Dihapus:** "Pemanasan Fisik" dari A. Memulai Hari (ID `a-08` dipensiunkan; centang lamanya tidak dihitung lagi).
- **Ditambah:** "Makan" sebelum Mandi Wajib (A, ID `a-09`), sebelum Buat Print A6 (H, ID `h-03`), dan di akhir daftar (kategori baru J. Penutup, ID `j-01`).
- **Total:** 110 tugas per tahap, 220 keseluruhan (A=8, B=2, C=2, D=30, E=3, F=3, G=3, H=3, I=55, J=1). ID tugas lama TIDAK bergeser sehingga centang yang sudah ada tetap menempel pada tugas yang sama.
- **Uji:** `TAH.verify()` bersih; centang 3 tugas Makan → Tahap 1 = 5/110 (5%), Tahap 2 tidak berubah, keseluruhan 5/220 (2%); tetap tersimpan setelah muat ulang; data uji berisi `a-08` diabaikan dari hitungan.

## 20261114.1 — Tugas Awal 2 Tahap (final)

- **Dihapus:** seluruh tugas, centang, riwayat, statistik, dan persentase Tugas Awal tanggal 1–13 NOV 2026 dari data aktif. Salinan pengaman utuh skema lama disimpan SEKALI di `mcfa_tugasAwal_arsip_v4` (tidak dirender, tidak dihitung; boleh dihapus manual bila ingin benar-benar bersih). Kegiatan Sehari-hari (`ba_*`) dan Program Adaptasi TIDAK diubah.
- **Tahap baru:** Tahap 1 = 14 NOV 2026, Tahap 2 = 20 NOV 2026 (`MCFA_CORE.taStage1/taStage2`); 15–19 NOV 2026 kosong (`taGapStart/taGapEnd`). `taskStart/taskEnd` kini 14/20 NOV; `planEnd`/`dailyStart` dihapus.
- **Daftar tugas:** kategori A–I (108 tugas per tahap; D = 30 dalam 6 sub-kelompok; I = Akun dan Branding 11 akun × 5 = 55, ID `h5-…` dan isi dipertahankan). ID unik permanen (`a-01`, `d2-03`, …).
- **Database:** skema v5 `{v:5, s:{t1:{id:true}, t2:{id:true}}}` di `mcfa_tugasAwalHarian_v1`; centang Tahap 1 dan 2 terpisah. Migrasi v4 → v5 otomatis (juga saat impor cadangan lama); hanya ID yang dikenal yang dihitung. Toggle membaca ulang penyimpanan sebelum menulis dan membatalkan perubahan bila gagal tersimpan.
- **Perhitungan:** satu fungsi `calc()` dari data tersimpan → selesai/belum/total/persen per kategori, per tahap, dan keseluruhan; 100% hanya bila semua selesai. Hero Aktivitas kini memakai angka yang sama.
- **UI:** strip 14–20 NOV (15–19 tidak bisa dipilih), kartu progres keseluruhan + ringkasan per tahap, bilah progres per kategori, sub-kelompok dengan hitungan, teks 13,5 px/600, area ketuk ≥ 44 px, `Reset` hanya untuk tahap yang dibuka.
- **Catatan:** Program Adaptasi tetap 15–20 NOV (di luar cakupan perintah ini) sehingga 20 NOV kini memuat Tahap 2 dan hari terakhir Adaptasi.
- **Uji (Chromium, 360 dan 320 px, Asia/Jakarta):** `TAH.verify()` dan `mcfaSelfCheck()` kosong; migrasi data lama; centang/batal; independensi Tahap 1–2; persistensi setelah muat ulang; tanpa galat JS dan tanpa overflow horizontal. Belum diuji di HP Android sungguhan.


## 20261112.3 — Struktur Datar

- **Diubah:** seluruh berkas kini langsung di root (tanpa 14 folder); semua rujukan di `index.html`, `sw.js`, `manifest.json`, `assets.json`, `atlas_redesign.html`, CSS, dan JS disesuaikan. Nama berkas tidak berubah. Tidak ada perubahan tampilan atau perilaku.

## 20261112.2 — Tiga Fase: kontras, struktur, dan animasi

- **Diperbaiki:** kartu tiga fase tampil abu-abu dan teksnya menyatu dengan latar karena nama kelas `tp-card`/`tp-wrap` bentrok dengan widget Tahap. Diganti kelas sendiri `bt-*`; kartu kini gelap solid dengan teks terang berkontras tinggi.
- **Struktur baru:** ringkasan 3 chip (Benih · Batang · Bunga, ketuk untuk melompat), jalur vertikal bernomor yang menyambung antarfase, kartu berisi hero, tema, rentang tanggal + jumlah hari, deskripsi, label MAKNA, kutipan filosofis, dan tahap biologis. Layar ≥900 px: tiga kolom.
- **Animasi:** ilustrasi "tumbuh" dari bawah, gerak kamera pelan, serbuk cahaya melayang, jalur tersambung saat digulir, teks muncul berurutan, denyut pada nomor fase. Hormati pengaturan "kurangi gerakan".

## 20261112.1 — Official History bernuansa foto + Bibit dan Akar Baru 3 fase

- **Official History:** seluruh hero kini diberi grading sinematik (grain film, kontras halus). Slot foto asli: letakkan `hero-<kunci>.jpg` (kunci: `prolog1`, `prolog2`, `bibit-awal`, `pertumbuhan`, `akar`, `penyembuhan`, `bibit-baru`, `sempurna`, `fase1`, `fase2`, `fase3`); bila berkas ada ia menggantikan ilustrasi vektor, bila tidak ada tampilan lama tetap dipakai.
- **Bibit dan Akar Baru:** dibagi tiga fase — Fase 1 (21 Nov 2026–20 Nov 2027, Foundation & Learning), Fase 2 (21 Nov 2027–20 Nov 2028, Growth & Expansion), Fase 3 (21 Nov 2028–20 Nov 2029, Results & Realization) — masing-masing dengan ilustrasi perkembangan biologis (benih/akar → batang/ranting → daun/bunga), narasi, dan kutipan filosofis. Tampil di halaman Project (sebelum Timeline Proyek) dan di bab V Official History.
- **Tidak diubah:** data, tanggal resmi (`MCFA_CORE`), navigasi, dan bagian lain.

## 20261111.8 — Teks Terlalu Kecil di HP

- **Diperbaiki:** `html body .pb-sep-days` (teks "TUGAS AWAL 12/14" di kepala semua halaman) memakai 6,5 px karena aturan di akhir `05-polish.css` menimpa aturan minimum 9 px di bagian 16 berkas yang sama. Kini 9 px (layar >340 px) dan 7,5 px di layar ≤340 px, karena kolom tengah hanya ±44 px di 320 px dan 9 px menambah tinggi blok tanggal dari 45 ke 84 px.
- **Diperbaiki:** lencana `AKTIF` pada peta jalan Karier (`.rm-c .now`, `04-tahap.css`) 7,5 → 9 px.
- **Uji (Chromium, 320 dan 360 px, zona Asia/Jakarta, 5 halaman):** tanpa galat JS, tanpa overflow horizontal, tanpa teks terpotong vertikal.
- **Build:** `20261111.8`.

## 20261111.7 — Audit Statis Final (aksesibilitas gambar)

- **Audit statis (tanpa perubahan perilaku):** sintaks 62 berkas JS valid (`node --check`); `manifest.json` & `assets.json` valid; 77 rujukan `index.html` dan seluruh daftar precache `sw.js` ada di disk; md5 + ukuran 16 gambar cocok `assets.json`; tidak ada pola `new Date('YYYY-MM-DD')` / `toISOString().slice` yang rawan geser hari; tanggal resmi dihitung ulang: Tugas Awal 14 hr, Adaptasi 6 hr, Tahap 365+366+365 = 1.096 hr, DAY 1 = 21 NOV 2026 (Sabtu).
- **Diperbaiki:** 11 `<img>` foto akun di `index.html` tidak punya atribut `alt`; ditambahkan `alt=""` (dekoratif, nama akun sudah tertulis di sebelahnya) agar pembaca layar tidak membacakan nama berkas.
- **Diperiksa, BUKAN bug:** `function save` ganda (`12` dan `11`) — yang di `11` berada di dalam IIFE; `function goalIco` ganda identik (`02` dan `12`), dibiarkan; semua `localStorage.setItem` berada dalam `try/catch`.
- **Build:** `20261111.7` di `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`, README.

## 20261111.6 — Potongan Foto Akun Diaktifkan (keputusan pengguna)

- **`06-avatar-ring.css`:** 12 penyeleksi `img[src*="/accounts/….jpg"]` diganti menjadi `img[src*="….jpg"]` agar cocok dengan lokasi foto yang sebenarnya (sebelumnya folder `accounts/` tidak ada, sehingga aturan tidak pernah aktif). Isi aturan tidak diubah. Penyeleksi tanpa garis miring awal karena `src` bersifat relatif.
- **Efek (tab Akun di Studio, dibandingkan lewat tangkapan layar):** logo Zona Asumsi tampil utuh (`contain`, latar #0b0b0d) alih-alih terpotong; posisi foto bergeser: MC. Fathul Adzim 25→15%, Fathul Al-Meme 25→12%, Dunia Ayla 25→18%, Otak Kepala Kardus/Alley's/LOL 25→30%, KP. Cihuy 25→40%, CNE Pictures 25→45%; Barongsukma dan Monkipedia tetap 25%. Foto Sheina tidak termasuk aturan ini.
- **Build:** `20261111.6` di `index.html` (semua `?v=`), `sw.js`, `assets.json`, `00-data-migration.js`, README. Berkas diubah: `06-avatar-ring.css`, `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`, `README.md`, `CHANGELOG.md`, `TESTING.md`, `BELUM-SELESAI.md`. Tidak ada logika, data, tanggal, atau teks yang berubah.


## 20261111.5 — Performa Android: Kilau Lencana & Satu AudioContext

**Hasil ukur lebih dulu (CPU dilambatkan 4×, 360×740):** biaya skrip saat diam hanya 4–20 ms/detik per halaman, jadi lima timer polling (`33`, `34`, `35`, `37`, `38`) BUKAN penyebab lag dan sengaja tidak diubah (semuanya sudah berpenjaga tanda-tangan: DOM hanya ditulis bila nilainya berubah). Penyebab nyata yang terukur ada dua:

- **Diperbaiki — kilau lencana emas `#daysLeft` (`05-polish.css`, akhir berkas):** `@keyframes tbBadgeGlowFinal` menganimasikan `box-shadow` tanpa henti (repaint + recalc style tiap frame) dan lolos dari aturan mode hemat karena spesifisitasnya lebih tinggi (`.topbar-badge.gold` + `!important` mengalahkan `html:not(.full-fx) *`). Kini bayangan dasar tetap (= keyframe 0%) dan bayangan puncak (= keyframe 50%) ada di `::after` yang hanya diganti opacity-nya (jalur compositor), ritme tetap 2,6 dtk. **Ukur:** recalc style halaman Studio 207 → 28 ms/detik. **Tampilan:** tangkapan layar 3× — selisih 0 piksel pada 0%, selisih maksimum 7/255 pada puncak (tidak ada piksel berbeda >8).
- **Diperbaiki — 5 `AudioContext` → 1 (`01-power-saver.js`, `06`, `10`, `12`, `14`, `18`):** fungsi bersama `window.mcfaAudioCtx()` (dibuat malas, di-resume bila `suspended`, mengembalikan `null` bila tidak didukung). Konteks ditahan (`suspend`) saat aplikasi di latar belakang dan otomatis dipakai lagi pada suara berikutnya; `14` kini selalu lewat getter itu agar ikut di-resume. Seluruh suara sekali-putar, tidak ada `close()`/loop, jadi berbagi aman. **Ukur:** jalur uji yang sama membuat 2 konteks di build .4 dan 1 di build .5, jumlah osilator identik (41), tanpa error.
- **Tidak diubah (disengaja):** animasi ambient Karier/Aktivitas (`sfxUfoPass` memakai `left`, `sfxPlanetFloat` memakai `filter`) — di mode hemat (bawaan) berjalan satu putaran 18–60 dtk lalu berhenti; mengubahnya ke transform akan mengubah tampilan. `pfSweep` hanya `transform` (ringan). Aturan potongan foto `/accounts/` (lihat 20261111.4): atas keputusan pengguna DIBIARKAN tidak aktif. Daftar pekerjaan yang belum selesai ada di `BELUM-SELESAI.md`.
- **Build:** `20261111.5` di `index.html` (semua `?v=`), `sw.js`, `assets.json`, `00-data-migration.js`, README. **Berkas diubah:** `05-polish.css`, `01`, `06`, `10`, `12`, `14`, `18`, `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`, `README.md`, `CHANGELOG.md`, `TESTING.md`. Data, tanggal, ID, kunci penyimpanan, teks tidak diubah.

## 20261111.4 — Pengelompokan Berkas ke Folder Bernomor (tanpa perubahan fungsi)

**Tujuan:** isi ZIP rapi dan berurutan sesuai kelompoknya saat diunggah ke GitHub. Tidak ada kode logika, data, tanggal, ID, kunci penyimpanan, desain, atau teks yang diubah.

- **Struktur baru:** `index.html`, `atlas_redesign.html`, `sw.js`, `manifest.json`, `assets.json`, `README.md` tetap di root; sisanya 81 berkas dikelompokkan ke folder `01-css` … `14-dokumen` (peta lengkap di README). 8 CSS diberi nomor sesuai urutan cascade (`01-main.css` … `08-kpc-profile.css`); 48 JS tetap bernama sama (nomor 00–47 = urutan muat) dan hanya dipindah ke folder per fungsi.
- **Rujukan ditulis ulang (otomatis, bukan manual):** `index.html` (78), `sw.js` (78, 82 berkas precache), `manifest.json` (6 ikon), `03-components.css` (2 `url()`, jalur relatif `../12-…`), `31-studio-account-hub.js` (2), `45-kpc-profile.js` (2), `36-stage-ordering.js` (1). `assets.json` dibuat ulang; md5 16 gambar sama dengan sebelumnya (isi gambar tidak berubah).
- **Build:** `20261111.4` di `index.html` (semua `?v=`), `sw.js`, `assets.json`, `00-data-migration.js`, README. Cache SW baru `mcfa-v4-20261111.4-static`.
- **Temuan, TIDAK diubah (perlu keputusan):** 12 aturan di `06-avatar-ring.css` (baris 19–30 dan 85) memakai penyeleksi `img[src*="/accounts/…jpg"]`, padahal foto akun tidak pernah berada di folder `accounts/` sejak struktur dibuat datar — aturan itu tidak pernah cocok, jadi posisi potong tiap foto (mis. `zona.jpg` memakai `contain`) tidak aktif. Dibiarkan agar tampilan sama persis dengan sebelumnya; mengaktifkannya akan mengubah potongan foto akun.
- **Tidak diubah:** semua catatan 20261111.3 (lima `AudioContext` dan lima timer 600–800 ms) tetap menunggu bagian audio/performa.
- **Berkas diubah:** semua yang dipindah, ditambah `index.html`, `sw.js`, `manifest.json`, `assets.json`, `README.md`, `00-data-migration.js`, `03-components.css`, `31`, `36`, `45`. Dokumen ini dan TESTING.md berpindah ke ``.

## 20261111.3 — Final Audit Bagian 2: Kode & Event Listener

**Hasil audit:** 48 modul JS diperiksa (sintaks, deklarasi global, pemasangan listener, timer). Pemasangan listener di `12` semuanya tingkat-atas dan sekali jalan. Uji dinamis berpindah antar 5 menu 8 putaran dan buka-tutup panel Efek/Akun 6 kali: jumlah node DOM, timer baru, dan listener tidak bertambah (listener yang naik saat panel dibuka menempel pada elemen yang diganti tiap render, bukan kebocoran).

- **Diperbaiki — tombol Enter memutar ulang animasi masuk (`12`, `16`):** `keydown Enter` dipasang di seluruh dokumen dan `enterApp()` tidak punya pengaman. Setelah masuk aplikasi, setiap Enter (mis. tombol Enter/Go keyboard Android di kolom isian, atau Enter pada tombol pengaturan) menjalankan lagi suara ketuk, kembang api, suara sukses, 3 ledakan confetti, dan pembungkus di `16` ikut menyembunyikan lalu menganimasikan ulang kartu beranda. Kini `enterApp()` hanya berjalan sekali (`_mcfaEntered`), mengembalikan `false` bila sudah masuk atau elemen intro tidak ada; Enter hanya memicu masuk selagi intro aktif; pembungkus `16` melewati animasi kartu bila `enterApp` mengembalikan `false`. Alur masuk pertama (tombol, Enter, klik ganda) tidak berubah: tiap kali tepat 1 kali.
- **Tidak diubah (disengaja):** `goalIco` terdefinisi di `02` dan `12` dengan isi identik; dibiarkan karena tidak berbahaya dan `02` dimuat lebih awal untuk modul `06`.
- **Catatan untuk bagian berikutnya:** 5 `AudioContext` terpisah (`06`, `10`, `12`, `14`, `18`) dan 5 timer 600–800 ms (`33`, `34`, `35`, `37`, `38`) tetap menunggu bagian audio/performa.
- **Build:** `20261111.3` di `index.html` (semua `?v=`), `sw.js`, `assets.json`, `00-data-migration.js`, README.
- **Berkas diubah:** `12`, `16`, `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`, `README.md`, `CHANGELOG.md`, `TESTING.md`. Data, tanggal, ID, dan kunci penyimpanan tidak diubah.

## 20261111.2 — Final Audit Tahap 1: Tanggal & Timeline

**Hasil audit:** `MCFA_CORE` (`04`) tetap satu-satunya sumber tanggal resmi. Semua literal tanggal di 49 berkas JS/HTML dipindai; semua tanggal bertahun yang tampil di DOM (5 halaman) cocok dengan `MCFA_CORE`. Tidak ada tanggal lama yang tampil. Tanggal resmi tidak diubah.

- **Diperbaiki — hari salah di perangkat zona timur Jakarta (`35`):** kartu "AKTIVITAS · HARI INI" memformat hari dengan `Intl` (zona Asia/Jakarta) pada Date tengah malam LOKAL. Di perangkat WIT/WITA (UTC+8/+9) instan itu jatuh di hari sebelumnya Jakarta: 11 NOV 2026 tampil "Selasa" (seharusnya Rabu). Kini memakai `formatDayUpper(d)` (dari komponen tanggal Jakarta), sekaligus KAPITAL sesuai aturan tampilan.
- **Diperbaiki — stempel waktu memakai zona perangkat & bukan kapital:** stempel kurs (`12`), stempel "Diperbarui/Tersimpan" Karier (`12`), dan riwayat pencapaian (`47`) memakai `toLocaleString` ("11 Nov"). Kini helper baru `formatStampUpper()` (`04`): selalu waktu dinding Asia/Jakarta, KAPITAL ("11 NOVEMBER 2026 · 10.00"), tanggal-saja tanpa jam, tanggal tidak sah → kosong.
- **Diperbaiki — Buku Keuangan menulis "1 Jan 2026" (`21`):** tanggal transaksi/periode/arsip dan label bulan/tahun kini lewat `formatDateUpper` (kapital). Data tersimpan tetap ISO `YYYY-MM-DD` (tidak berubah).
- **Diperbaiki — teks manual (`index.html`):** "pada 15 NOV" di Roadmap Tugas Awal kini terikat `MCFA_CORE.adaptStart` (`data-mcfa-date`).
- **Tidak diubah:** `MCFA_CORE`, data tugas, ID, kunci localStorage, skema, desain/CSS. Tanggal literal pada tabel spesifikasi (fase Barongsukma, jadwal rotasi Adaptasi, pemeriksa/tes) sengaja tetap karena merupakan isi data, bukan penanda periode.
- **Build:** `20261111.2` di `index.html` (semua `?v=`), `sw.js`, `assets.json`, `00-data-migration.js`, README.
- **Berkas diubah:** `04`, `12`, `21`, `35`, `47`, `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`, `README.md`, `CHANGELOG.md`, `TESTING.md`.

## 20261111.1 — Pembaruan Final Tugas Awal MC FATHUL ADZIM (periode & jadwal baru, 86 tugas)

- **Periode (sumber tunggal `MCFA_CORE`, `04`):** `planEnd` 9 → **10 NOV**, `dailyStart` 10 → **11 NOV**. 1–10 NOV = PERENCANAAN, 11–14 NOV = PELAKSANAAN TUGAS. Label UI (`data-mcfa-short`), panel PERENCANAAN, `mcfaSelfCheck` dan `TAH.verify` membaca/menguji nilai itu. `taskStart` 1 NOV, `taskEnd` 14 NOV, Adaptasi mulai **15 NOV**, DAY 1 **21 NOV** — tidak berubah.
- **Jadwal baru (`11`):** 11 NOV = **13 tugas** (gabungan tugas 10 & 11 NOV lama + *Ganti gayung menjadi kuning*) · 12 NOV = **16 tugas** (seluruh pembersihan studio N2 = 10 dan rumah N3 = 6, dari 14 NOV lama) · 13 NOV = **2 tugas** (print A6, mata pelajaran; dari 12 NOV lama) · 14 NOV = **55 tugas** (branding 11 akun × 5; dari 13 NOV lama). Total **86**.
- **ID & centang:** semua ID lama dipertahankan (tugas yang dipindah tetap `h1-…/h2-…/h3-…/h4-…/h5-…/h9-…/h11-…/dek-1-12`, centang lama menempel pada ID yang sama). **Satu-satunya ID baru: `h11-ganti-gayung-kuning`** (belum tercentang). Skema penyimpanan `mcfa_tugasAwalHarian_v1` tetap v4 → tidak ada migrasi data yang diperlukan dan tidak ada data yang diubah; arsip nonaktif (114 ID) tidak berubah dan tidak dihitung.
- **Persentase:** `pctOf(selesai,total)` = selesai ÷ total × 100 (dibulatkan), dengan jaminan **100% hanya bila semua selesai** (tidak pernah dibulatkan naik) dan 0% hanya bila tidak ada yang selesai. Dipakai untuk persen harian dan keseluruhan (÷ 86).
- **Pemeriksa:** `TAH.verify()` kini menguji jumlah per hari (13/16/2/55), urutan & ID 11 NOV dan 13 NOV, N2/N3 lengkap di 12 NOV, 11 akun × 5 di 14 NOV, tidak ada ID ganda/ID di dua tanggal, total 86, bentrokan ID baru dengan arsip.
- **Build & cache:** build `20261111.1` di `index.html` (semua `?v=`), `sw.js` (cache `mcfa-v4-20261111.1`, precache), `assets.json`, `00-data-migration.js`, README.
- **Berkas diubah:** `04`, `11`, `index.html` (label bawaan + build), `sw.js`, `assets.json`, `00-data-migration.js`, `README.md`, `CHANGELOG.md`, `TESTING.md`. Desain/CSS dan modul lain tidak disentuh.

## 20261110.8 — Final Fix Bagian 2: Sinkronisasi & Akurasi Data

**Hasil audit:** alur satu-sumber-data (konten → Studio → Karier → Dashboard, centang → progres, riwayat) sudah benar dan diuji ulang. Yang ditemukan adalah **kehilangan data saat dua tab/jendela (mis. PWA + tab Chrome) terbuka bersamaan**: modul yang menyimpan SELURUH data dari salinan memori menimpa perubahan yang baru dibuat di tab lain. Terbukti di build .7: centang dari tab B hilang setelah tab A (basi) mencentang item lain.

- **Diperbaiki — Tugas Awal (`11`):** `S` kini dimuat ulang dari penyimpanan sebelum tiap centang/reset (`syncFromStore`), dan tampilan ikut selaras lewat event `storage` (dua arah). Tampilan item selalu mengikuti `S` (`counters`).
- **Diperbaiki — Kegiatan Sehari-hari (`10`):** satu hari ditulis utuh dari DOM; kini DOM diselaraskan dulu dengan penyimpanan sebelum centang (`baSyncDom`) dan hari yang sedang dilihat dimuat ulang saat tab lain mengubahnya.
- **Diperbaiki — Kehidupan (`12`):** `toggleGoal`/`toggleDebt` memuat ulang `S` dulu (`syncS`); perubahan dari tab lain (centang maupun batal-centang) langsung tampil, termasuk statistik (`updateAll`).
- **Diperbaiki — Buku Keuangan (`21`):** `clone()` kini membaca buku dari penyimpanan sebelum SETIAP perubahan, sehingga transaksi yang dicatat di tab lain tidak hilang; tab lain menghitung ulang saldo lewat event `storage`. (Risiko terbesar: data uang.)
- **Diperbaiki — Milestone Keuangan (`20`):** batalkan/tandai ulang/ubah tanggal pencapaian memuat ulang state dulu — riwayat pencapaian dari tab lain tidak tertimpa.
- **Diperbaiki — Akun Hub (`31`):** `persist()` menggabungkan `meta`/`group`/`notes` dengan isi penyimpanan. Mengembalikan kategori ke bawaan kini menyimpan `null` (bukan `delete`) agar penggabungan tidak menghidupkan nilai lama; semua pembaca sudah menganggap `null` = bawaan.
- **Diperbaiki — penyimpanan tertunda (debounce) bisa hilang:** (a) Judul Produksi Adaptasi (`08`) memakai SATU timer bersama untuk semua kolom — mengetik di kolom kedua dalam 0,4 dtk membatalkan simpan kolom pertama; kini satu penunggu per kolom (hari|akun). (b) Catatan harian Adaptasi (`07`), judul produksi (`08`), dan catatan Ayla (`31`) kini langsung ditulis saat aplikasi disembunyikan/ditutup (`visibilitychange`/`pagehide`) dan catatan `07` juga saat berganti hari — tidak lagi menunggu 0,4 dtk.
- **Sudah benar, tidak diubah:** Adaptasi (`07`), produksi (`08`), konten akun, Statistik Studio/Followers/Subscriber, Kolaborasi, Belajar, profil KP.CIHUY, pencapaian Karier — semuanya sudah membaca ulang dari penyimpanan sebelum menulis.
- **Tidak ada perubahan skema data.** Satu-satunya nilai baru yang mungkin muncul: `mcfa_akun_hub_v1.group[<akun>] = null`. Tanggal, ID, kunci localStorage, centang yang ada: tidak diubah.
- **Efek samping yang disengaja:** tab yang sedang terbuka kini ikut berubah tampilannya saat tab lain mengubah data (sebelumnya baru tampil setelah muat ulang).
- **Berkas diubah:** `07`, `08`, `10`, `11`, `12`, `20`, `21`, `31` (+ penanda build di `index.html`, `sw.js`, `assets.json`, `00-data-migration.js`), `README.md`, `CHANGELOG.md`, `TESTING.md`.
- **Belum dikerjakan (bagian berikutnya):** impor/restore yang masih bisa melapor sukses walau sebagian key gagal ditulis (Bagian 4); audit animasi/suara/performa Android (Bagian 5).

## 20261110.7 — Final Fix Bagian 1: Finalisasi Tanggal & Timeline

- **Pemeriksaan:** seluruh literal tanggal di 49 berkas JS/CSS/HTML dipindai, lalu semua tanggal yang benar-benar tampil di DOM dicocokkan dengan tanggal resmi (jam uji 10 NOV & 21 NOV 2026, Asia/Jakarta). Semua tanggal bertahun cocok dengan `MCFA_CORE`; tidak ada tanggal lama yang masih tampil.
- **Diperbaiki — batas Perencanaan/Tugas Harian tidak punya sumber tunggal:** UI & data memakai **1–9 NOV perencanaan, 10–14 NOV tugas harian**, tetapi komentar `MCFA_CORE`, komentar modul 11, dan README masih menulis 1–7 / 8–14, dan batasnya ditulis manual di 4 tempat. Kini `MCFA_CORE.planEnd` (9 NOV) dan `MCFA_CORE.dailyStart` (10 NOV) menjadi sumber; label di `index.html` (2 tempat) dan panel PERENCANAAN (`11`) membacanya lewat `data-mcfa-short` / `mcfaCompactRange()`.
- **Diperbaiki — rentang statis:** `44-stats-info.js` menulis `'21 NOV 2026 sampai 20 NOV 2027'` manual; kini dihitung dari `projectStart` → `stage1End`. Tampilan sama.
- **Pemeriksa diperkuat:** `mcfaSelfCheck` memeriksa `planEnd`, `dailyStart`, urutan tepat sesudah, dan jumlah hari 9 + 5 = 14. `TAH.verify` memeriksa tiap tanggal perencanaan kosong dan tiap tanggal tugas harian berisi, berdasarkan `MCFA_CORE` (bukan angka tetap).
- **Tidak diubah:** data tugas, ID, centang, kunci localStorage, skema. Tanggal pada data tugas per hari (10–14 NOV), jadwal rotasi Adaptasi, fase Barongsukma, dan tes validasi sengaja tetap literal (isi/spesifikasi, bukan penanda periode).
- Berkas diubah: `04`, `11`, `44`, `index.html` (+ penanda build di `sw.js`, `assets.json`, `00`), `README.md`, `CHANGELOG.md`.

## 20261110.6 — Panel PERSIAPAN: penanda "DAY 1 · 21 NOV" dihapus

- **Pemeriksaan:** panel PERSIAPAN MCFA PROJECT (Tugas Awal + Adaptasi) **tidak** berganti/bergabung berdasarkan tanggal 21 NOV — keduanya sudah tergabung sejak awal, dan status SELESAI hanya ditentukan oleh centang tugas.
- **Dihapus:** strip "⚑ DAY 1 · 21 NOV — MULAI AKTIVITAS SEHARI-HARI" di dasar panel (satu-satunya sisa penanda tanggal 21 di panel). Centang hijau penanda selesai tetap lewat ✓ per bagian dan tampilan SELESAI saat semua tugas tercentang.
- Berkas diubah: `46-persiapan-selesai.js` saja (+ penanda build). Data/tanggal inti tidak diubah.

## 20261110.6 — Perbaikan teks yang menyatu dengan latar (panel PERSIAPAN)

- **Gejala:** di Aktivitas → Adaptasi (dan isi Tugas Awal) banyak teks hampir tak terlihat — nama akun + persen ("Otak Kepala Kardus 0%"), judul "PRODUKSI KONTEN · …", tombol tahap (Ide konten, Persiapan materi, Produksi, Editing, Pemeriksaan akhir, Siap upload), dan teks lain di dalam kartu putih.
- **Penyebab (hasil pengukuran kontras di browser uji):** build 20261110.4 memindahkan kartu Tugas Awal & Adaptasi ke dalam panel gelap `.psp`, yang memberi `color:#fff` ke semua turunannya. Isi kartu berlatar terang, jadi elemen yang tidak punya warna sendiri (`color:inherit`) ikut putih di atas putih (rasio kontras 1,0–1,1 dari minimal 4,5).
- **Perbaikan:** satu aturan CSS di `polish.css` — `#pspGroup .akt-section-body{color:var(--text,#07101f)}` — mengembalikan warna teks gelap pada isi kartu saja. Header berwarna/gelap tidak berubah; elemen dengan warna sendiri (tombol hijau, badge, header Pagi/Siang) tidak berubah. Tombol tahap yang dinonaktifkan (hari yang belum tiba) dinaikkan dari opacity .45 ke .7 agar tetap terbaca.
- **Tidak diubah:** data, tanggal, penyimpanan, logika JS. Hanya `polish.css` + penanda build.

## 20261110.6 — Aktivitas: Kegiatan Sehari-hari di atas + panel PERSIAPAN MCFA PROJECT

**Susunan halaman Aktivitas kini dua kelompok utama:** 1. **KEGIATAN SEHARI-HARI** (paling atas) · 2. **PERSIAPAN MCFA PROJECT** (panel di bawahnya) yang berisi dua subbagian terpisah: ① Tugas Awal MC Fathul Adzim dan ② Adaptasi.
- **Yang digabung hanya penempatan & tampilan.** Kartu `#heroTugasAwal` dan `#heroAdaptasi` dipindahkan apa adanya (elemen, ID, pendengar klik) ke dalam panel; `#heroHarian` dipindah ke posisi pertama. Tidak ada data dibuat ulang/disalin: tugas, ID tugas, tanggal, riwayat centang, perhitungan hari/durasi/progres, dan kunci localStorage tidak berubah. Panel **tidak menyimpan data apa pun**.
- **Status otomatis dari centang yang tersimpan** (bukan dari tanggal atau tombol): satu subbagian dianggap selesai hanya bila totalnya > 0 dan semua tugasnya tercentang. Keduanya belum selesai → **BELUM SELESAI** · salah satu selesai → **PERSIAPAN BERLANGSUNG** · keduanya selesai → **SELESAI**. Membatalkan centang otomatis mengembalikan status.
- **Progres gabungan** = Σ selesai ÷ Σ tugas dari sumber aslinya: Tugas Awal `TAH.overall()` (ID unik, 85 tugas) + Adaptasi `MCFA_ADP.stats()` (seluruh hari periode termasuk produksi konten). Persen 100% hanya tampil bila semua tugas selesai (tidak dibulatkan naik dari 99,x%).
- **Tampilan SELESAI:** tanda centang besar beranimasi, panel berubah ke tema zamrud + emas, tulisan **PERSIAPAN MCFA PROJECT SELESAI**, keterangan lanjut ke Aktivitas Sehari-hari + tombol pintas. Efek kilau/konfeti hanya saat status BERUBAH menjadi selesai di sesi itu (tidak diulang setiap muat ulang). Animasi buka/tutup, progres, dan centang tugas; ikut `prefers-reduced-motion` dan mode kurangi gerak aplikasi.
- **Menggantikan perilaku lama `46-persiapan-selesai.js`:** dulu panel "PERSIAPAN M.C.F.A PROJECT SELESAI" muncul otomatis begitu tanggal mencapai DAY 1 (21 NOV 2026) walau tugas belum selesai — itu berbasis tanggal, bertentangan dengan aturan baru, jadi dihapus. Panel kini selalu tampil dan statusnya hanya mengikuti centang. Pratinjau tampilan SELESAI (tanpa menulis data): `?preview=selesai`.
- **Label kartu:** "Blueprint Aktivitas · 01/02/03" → Kegiatan Sehari-hari = "Blueprint Aktivitas · 01", Tugas Awal = "Persiapan · Bagian 1", Adaptasi = "Persiapan · Bagian 2" (teks saja).
- **Berkas diubah:** `46-persiapan-selesai.js` (ditulis ulang), `components.css` (blok CSS `.psp` diganti), `11-initial-tasks-nov.js` (hanya menambah pembaca `TAH.overall`), `index.html` (3 label kartu + versi build), `sw.js`, `assets.json`, `00-data-migration.js` (konstanta build), `README.md`, `CHANGELOG.md`, `TESTING.md`. Versi `11-initial-tasks-nov.js?v=…3` yang tertinggal kini disamakan ke build yang sama.
- **Tidak ada perubahan skema data.** Satu-satunya nilai tersimpan yang berbeda setelah aksi yang sama adalah penanda versi migrasi (`mcfa_data_version_v1.build`).
- **Perlu diketahui:** status mengikuti aturan tertulis — "PERSIAPAN BERLANGSUNG" baru tampil saat salah satu subbagian sudah selesai penuh; centang sebagian di kedua subbagian masih berstatus BELUM SELESAI (progres sebagiannya tetap terlihat di bar dan angka). Adaptasi baru bisa selesai penuh setelah 20 NOV karena centang hari yang belum tiba ditolak (aturan lama, tidak diubah).

## 20261110.2 — Bagian 2: Audit & Integrasi Sistem

**Hasil audit:** tidak ditemukan bug integrasi besar. Tanggal sudah lewat helper pusat (`mcfaNowJakarta`/`mcfaTodayIso`; semua `toISOString()` hanya stempel waktu); penyimpanan utama (Tugas Awal, Kegiatan Harian, Adaptasi, produksi konten, konten akun) sudah mengembalikan tampilan + menampilkan pesan bila gagal simpan; gerbang upload resmi 21 NOV 2026 benar; 68 handler inline semuanya terdefinisi; tidak ada ID ganda; tanggal/hari resmi di `index.html` terikat ke `MCFA_CORE`.
- **Diperbaiki — catatan harian Adaptasi (`07`) dan judul produksi (`08`):** gagal simpan pada ketikan (debounce) dulu senyap; kini menampilkan "Catatan/Judul belum tersimpan".
- **Diperbaiki — penanda build ganda:** `00-data-migration.js` punya konstanta `BUILD` sendiri (tercatat di metadata migrasi) yang tertinggal di build lama; kini disamakan. Pemeriksa `build-consistency.sh` ditambahkan di rangkaian uji.
- **Dibuktikan (uji perilaku):** konten Adaptasi lengkap → tepat 1 item "Siap Upload" tanpa duplikat; 18 NOV "Sudah Diupload" ditolak; tepat 21 NOV 00:00 WIB berhasil dan dihitung di Studio; data upload lama bertanggal sebelum DAY 1 tidak dihitung tetapi tidak dihapus; storage penuh → status tidak berubah; kunci `ba_*`/`mcfa_adp_v1_*` tidak tercampur.
- **Self-check bawaan semuanya kosong/lulus:** `mcfaSelfCheck`, `TAH.verify`, `MCFA_ADP.verify/audit`, `MCFA_T6.selfCheck`, `MCFA_FIN_LEDGER.selfCheck`, `MCFA_PSP.verify`, `MCFA_ADPP.selfCheck`.
- **Tidak ada perubahan skema data.**
- Berkas diubah: `00`, `07`, `08`, `index.html`, `sw.js`, `assets.json`, `README.md`, `CHANGELOG.md`.
- **Belum dikerjakan:** impor/restore (`30`, `00 restoreSnapshot`, `19 applyLocalData`) masih dapat melaporkan sukses walau sebagian key gagal ditulis → Bagian 5.

## 20261110.1 — Bagian 1: Konsistensi Sistem Tahap 1/2/3

- **Disatukan — "tahap berjalan menurut tanggal":** sebelumnya ada 5 salinan perulangan tanggal (`12` `_t1Stage`, `32`, `36`, `37`, `38`). Kini satu fungsi `MCFA_TAHAP.running()` di `23-stage-system.js` (tanggal Jakarta; sebelum DAY 1 = 1, setelah `projectEnd` = 3). Dibedakan jelas dari `MCFA_TAHAP.get()` = tahap yang DIPILIH pengguna; tanggal tidak pernah mengubah pilihan.
- **Diperbaiki — fallback "Tahap 1" tertulis langsung:** daftar akun Platform di Karier (`27-career-stage.js`) dan faktor nominal Keuangan (`finStageFactor` di `12`) memakai Tahap 1 bila pilihan ditutup, sedangkan modal akun memakai tahap berjalan. Kini ketiganya memakai `MCFA_TAHAP.running()`. Perilaku sebelum 21 Nov 2027 identik (tahap berjalan = 1).
- **Dikoreksi (komentar saja):** `growthStart`/`evalStart` di `04-core-timeline.js` adalah label Milestone 3–5 di `index.html`, BUKAN Tahap 1/2/3. Nilai tidak diubah.
- **Dibiarkan:** pilihan tahap tidak disimpan setelah reload; kartu `#krTahap1Box` (disembunyikan CSS) tidak diubah.
- **Tidak ada perubahan skema data / localStorage.**
- **Uji:** `mcfa-tests/stage.test.js` — 35 LULUS, 0 GAGAL (Chromium, jam palsu Jakarta, 390 px). Belum diuji: Android/iOS fisik, tampilan visual.
- Berkas diubah: `04`, `12`, `23`, `27`, `32`, `36`, `37`, `38`, `index.html`, `sw.js`, `assets.json`, `README.md`, `CHANGELOG.md`.

## 20261109.14 — Bagian 10–11: Sistem Karier, Dashboard, Migrasi & Kompatibilitas Data

**Catatan asal:** ZIP kerja berisi build sampai Bagian 7. Bagian 8–9 tidak ada di berkas ini dan tidak dikerjakan di sini.

### Bagian 10 — Karier & Dashboard
- **Diperbaiki — ✓ palsu pada checkpoint Peta Pertumbuhan (`32-career-growth-map.js`):** tanda ✓ dulu muncul hanya karena tanggal checkpoint terlewat (diuji: 1 Jun 2027 dengan 0 subscriber menampilkan ✓ 250 RB dan ✓ 500 RB). Kini ✓ hanya bila SEMUA akun subscriber sudah ≥ nilai checkpoint; tanggal lewat tanpa capaian ditandai "terlewat" dengan jumlah akun yang sudah sampai (mis. `0/6 akun · terlewat`).
- **Diperbaiki — rumus gabungan berbeda di tiap tampilan:** Studio memakai Σaktual/Σtarget tanpa batas (bisa >100%, satu akun menutupi yang lain), Peta Pertumbuhan memakai rata-rata mentah dibanding target bawaan (mengabaikan target per akun), Karier memakai Σmin(aktual,target)/Σtarget. Kini satu fungsi `MCFA_STUDIO.aggregate(ids, n, metrik)` (`12-app-core-intro-canvas.js`) dipakai oleh `25-studio-stage.js`, `27-career-stage.js`, `32-career-growth-map.js`, dan kotak "Fokus TAHAP 1" (`_renderKarirTahap1`). **Efek yang terlihat:** persen di Studio bisa lebih rendah dari sebelumnya bila ada akun melampaui target; itu koreksi, bukan penurunan data.
- **Diperbaiki — angka tertulis tetap di Karier (`index.html` + `32-career-growth-map.js`):** "Total Target Audiens 15 Juta+ (3 akun × 1JT + 6 channel × 2JT)" kini dihitung dari target Tahap 3 akun yang benar-benar menerima target (hasil sekarang **14 Juta**: 2 akun followers + 6 channel YouTube, karena akun Persona tanpa target sesuai aturan final yang sudah ada). Jumlah "Jalur Karier"/"Target Ilmu"/"Target Karir" dihitung dari jumlah kartu. Kotak "Status" (dulu ikon api tanpa arti) kini `H-<hari>` sebelum DAY 1, `Tahap n` saat berjalan, `Selesai` sesudahnya.
- **Baru — Riwayat Pencapaian Karier (`47-career-achievements.js`, kunci `mcfa_career_ach_v1`):** mencatat kapan target followers/subscribers/konten per akun per Tahap benar-benar tercapai (aktual ≥ target > 0). Append-only: bila angka dikoreksi di bawah target dicatat "dikoreksi" (riwayat tidak dihapus, tidak tampil sebagai tercapai); tercapai lagi menambah peristiwa baru. Ditampilkan di tab Platform. Data lama diisi lewat migrasi memakai waktu dari riwayat audiens/tanggal upload; bila waktu tak diketahui ditulis "waktu tidak tercatat" (tidak dikarang).
- CSS: `.rm-cp div.late`, `.rm-cp-n`, `.kr-lv-sub`, `.kr-ach-corr` (`tahap.css`).

### Bagian 11 — Migrasi & kompatibilitas (`00-data-migration.js`, dimuat paling awal)
- **Versi struktur data tercatat:** `MCFA_MIGRATE.SCHEMA = 2` (1 = struktur sampai build .13 tanpa penanda). Penanda lokal `mcfa_data_version_v1` (versi, build, waktu, langkah, inventaris kunci). Terlihat di panel "Akun & Cadangan".
- **Aman:** scan hanya-baca dulu; tanpa pekerjaan → tidak ada penulisan. Sebelum menulis dibuat salinan pengaman `mcfa_pre_migration_snapshot_v1` (gagal menyimpan → migrasi dibatalkan, data tidak diubah). Validasi sesudah: kunci tidak hilang, JSON tetap valid, daftar/riwayat tidak berkurang, followers/subs sama; gagal → kunci dikembalikan otomatis. Maks 3 percobaan gagal.
- **Idempoten:** tiap langkah mendeteksi sendiri apakah perlu bekerja; 3× muat ulang tidak menggandakan karantina, buku pencapaian, maupun menimpa salinan pengaman.
- **Langkah:** (1) `karantina-data-rusak` — JSON rusak / bentuk salah (`mcfa_konten_*` bukan array, `mcfa_tahap1_*` bukan objek) disalin ke `mcfa_quarantine_v1` SEBELUM modul lain sempat menimpanya (dulu `save()` menimpa data rusak tanpa jejak); aslinya tidak diubah. (2) `tahap1-normalisasi` — format lama `{followers, subs}` dilengkapi `targets`/`hist`; teks digit murni → angka; `hist`/`targets` yang bukan bentuk semestinya dipindah ke `hist_legacy`/`targets_legacy` (tidak dibuang). (3) `pencapaian-karier-isi-dari-data-lama`.
- **Data lama/tidak terpakai:** tidak ada penghapusan massal. Kunci legacy & tak dikenal dipertahankan dan dicatat di inventaris. (Pembersih `mcfa_adpk_*` dari Bagian 4 tetap hanya menghapus kunci yang tidak berisi centang pengguna.)
- **Penjaga versi lebih baru:** data bertanda versi > 2 tidak disentuh. Impor JSON / pemulihan cloud dari struktur lebih baru ditolak; cadangan lama (tanpa `dataSchema`) diterima dan dimigrasi saat dimuat.
- **Ekspor/cloud:** ekspor membawa `dataSchema`; cloud membawa `__mcfa_data_schema` DI DALAM payload (tidak menambah field dokumen Firestore karena Firestore Rules tidak ada di repositori). Salinan pengaman migrasi, karantina, dan penanda versi bersifat lokal (tidak ikut ekspor/cloud; menjaga batas ±950 KB dan agar penanda tidak terbawa ke perangkat lain).
- API: `MCFA_MIGRATE.report()`, `.summary()`, `.register(step)`, `.restoreSnapshot()` (manual, tidak pernah otomatis).
- **Tidak diubah:** semua migrasi lazy modul lain (`_getKonten`, `renoLoad`, buku Keuangan, `migrateV4` tugas awal) tetap berjalan seperti sebelumnya.
- Berkas baru: `00-data-migration.js`, `47-career-achievements.js`. Berkas diubah: `12`, `19`, `25`, `27`, `30`, `32`, `index.html`, `sw.js`, `assets.json`, `tahap.css`, dokumen.
- Build `20261109.14` (index.html, sw.js, assets.json, README).

### Ditemukan, TIDAK diubah (perlu keputusan pemilik)
- "INDIKATOR PERSONA" di halaman Identitas (`bp-trait-pct`: 87–100%) adalah angka tertulis di HTML tanpa sumber data, tampil seperti progres. Belum diubah karena itu teks buatan pemilik.
- Persentase Renovasi pada profil kosong (13–54%) berasal dari keputusan "status awal 26 Okt 2026" yang sudah terdokumentasi di `renoLoad`; dibiarkan.

## 20261109.13 — Bagian 7: Keuangan dan perhitungan

- **Diperiksa, tanpa perubahan (lolos uji):** pemasukan/pengeluaran tidak tertukar; nominal integer aman (maks Rp 999.999.999.999, desimal/negatif/0 ditolak); saldo = pemasukan aktif − pengeluaran aktif; progres target = pemasukan aktif (pengeluaran tidak menurunkan); edit nominal/jenis memakai id yang sama (tidak ganda); hapus → riwayat dihapus, total & saldo & pencapaian dihitung ulang; tanggal ketat (31 FEB, kosong, masa depan, sebelum 1 JAN 2026 ditolak); klik ganda cepat ditolak; kegagalan `setItem` → buku, saldo, dan memori tidak berubah, pesan gagal tampil; tanggal transaksi identik di zona Jakarta/Los Angeles/Auckland.
- **Diperbaiki — transaksi tertaut Kehidupan:** transaksi bersumber `KH-<id>` yang masih tercentang di Kehidupan kini terkunci di Buku (tombol TERTAUT, pesan penjelasan). Sebelumnya bisa dihapus/diedit manual sehingga target tetap tercentang tanpa transaksi (dua angka berbeda untuk satu informasi). Membatalkan centang di Kehidupan tetap menjadi jalur pembatalan; transaksi yatim (target tak tercentang) masih bisa diedit/dihapus.
- **Diperbaiki — data tidak valid tidak lagi dibuang diam-diam:** `load()` di `21-finance-ledger.js` dulu menyaring transaksi tak sah lalu menimpanya pada penyimpanan berikutnya (hilang tanpa jejak). Kini dipindah ke `invalid` (karantina, tidak dihitung ke saldo, tidak diubah) dan tampil di panel "Perlu verifikasi".
- **Diperbaiki — sourceId tertaut ganda:** dua transaksi aktif dengan `sourceId` Kehidupan yang sama (mis. hasil gabungan dua perangkat) sebelumnya terhitung dua kali. Kini salinan kedua dipindah ke Riwayat dihapus (`reason: duplikat-sumber`) dan tidak dihitung, di `21` dan di `MCFA_FIN_CALC` (`20`).
- **Diperbaiki — uang hantu dari cache saldo:** `fin_milestones_v1.balance` hanyalah cache turunan, tetapi dulu dibaca sebagai "saldo awal lama" bila buku transaksi hilang. Kini cache bertanda `bd` (hanya dipasang bila buku v2 sudah tersimpan) tidak lagi dimigrasi; saldo manual lama yang benar-benar belum dimigrasi tetap diangkat satu kali.
- **Satu sumber hitungan:** `MCFA_FIN_CALC.activeTx()` kini membawa `date/cat/source/sourceId`; kartu "Dompet bulan ini" (`33-finance-tabs.js`) dan "Jajan anak-anak" (`12-app-core-intro-canvas.js`) memakainya, bukan membaca & menjumlah `fin_ledger_v1` mentah (tanpa filter) sendiri-sendiri.
- **Tanggal:** `20` memakai `mcfaParse`/`mcfaIsValidIso`; edit tanggal pencapaian menolak tanggal masa depan dan sebelum awal periode Keuangan; `21` memakai `mcfaIsValidIso` (format tetap `YYYY-MM-DD`).
- **Baru (hanya baca):** `MCFA_FIN_LEDGER.selfCheck()` — id ganda, nominal tak aman, tanggal tak sah, sourceId ganda, saldo ≠ pemasukan − pengeluaran, saldo periode ≠ saldo total, transaksi tertaut yatim.
- Tidak diubah: `financeStart` (2026-01-01), daftar target keuangan, angka saldo/target pengguna.
- Build `20261109.13` (index.html, sw.js, assets.json, README).

## 20261109.12 — Bagian 6: Kehidupan dan Aktivitas

- **Diperbaiki:** `baResetAll()` (`10-activity-daily-calendar.js`) mengosongkan centang di layar sebelum menghapus kuncinya; bila `removeItem` gagal, layar tampak kosong padahal data masih tersimpan. Kini centang yang aktif dipulihkan di layar dan muncul pesan "Reset belum tersimpan".
- **Diperiksa, tanpa perubahan (lolos uji):**
  - Target Kehidupan (`toggleGoal`): centang → `fathul_light_v1` + cap tanggal; target bernominal → tepat satu transaksi Keuangan bersumber `KH-<id>` (saldo mengikuti); batal centang → transaksi dibatalkan, total kembali, transaksi manual tidak ikut terhapus; centang ulang → tetap satu transaksi; nominal berubah → transaksi diperbarui (bukan ganda). 30 dari 30 target memiliki nominal.
  - Kegagalan simpan: `fathul_light_v1` gagal → centang dibatalkan; buku Keuangan gagal → centang dibatalkan dan tidak ada transaksi yatim.
  - Kegiatan Sehari-hari (`baToggle`/`baSave`): centang/batal tersimpan per hari, bertahan setelah buka kembali, rollback saat gagal simpan, tidak bisa dicentang sebelum DAY 1.
- Belum ada tautan Kehidupan → Karier otomatis di kode; tidak ditambahkan karena tidak ada target Karier yang bernominal/berkaitan secara eksplisit (tanda: perlu keputusan pemilik).
- Build `20261109.12` (index.html, sw.js, assets.json, README).

## 20261109.11 — Bagian 5: Studio (konten, posting, followers/subscribers)

- **Riwayat followers/subscribers tidak lagi terpotong:** batas otomatis 50 catatan di `MCFA_STUDIO.save()` (`12-app-core-intro-canvas.js`) dihapus. Tiap catatan kini menyimpan waktu, nilai lama → baru (`c`) dan selisih (`dl`). Catatan lama tetap valid (tanpa `dl`). Panel "Riwayat audiens" (10 terbaru, jumlah total tertera) ditambahkan di bawah form angka akun; seluruh riwayat tetap tersimpan.
- **Riwayat perubahan konten tidak lagi terpotong:** batas 40 entri di `_kontenHist()` dihapus (komentar lamanya sendiri menyatakan "tidak pernah dihapus otomatis"). Penghapusan oleh pengguna dibuat di Bagian 8.
- **Jembatan produksi → Studio (`42-content-bridge-studio.js`):**
  - Bug: tahap dibatalkan lalu dicentang lagi membuat konten tertaut tetap 'Dalam Produksi'. Kini kembali ke 'Siap Upload' pada konten yang sama (hanya bila penurunan status berasal dari sinkronisasi; status yang diubah manual tidak ditimpa).
  - Rekonsiliasi baru: konten tertaut (`src` 'adpp:…') yang sumber produksinya hilang → 'Siap Upload' turun ke 'Dalam Produksi' (tidak dihapus). Yang sudah 'Sudah Diupload' TIDAK disentuh. `MCFA_T6.reconcile()` (hanya baca) melaporkan yatim, yatim-terupload, dan duplikat per sumber.
- **Batal upload (`_toggleKonten`):** konten asal produksi Adaptasi kembali ke 'Siap Upload' (sebelumnya jatuh ke 'Ide' karena `productionKey` sengaja kosong).
- Diperiksa tanpa perubahan: upload sebelum 21 NOV ditolak; tanggal upload = tanggal Jakarta; konten dihitung sekali (dedup id); status Siap Upload tidak dihitung posting; batal upload menurunkan hitungan; kegagalan simpan (`setItem` error) mengembalikan data; ID akun statis di `AKUN` (Pusat Akun hanya menyimpan meta/kategori per ID, tidak bisa membuat akun ganda).
- Uji (Chromium headless, jam simulasi 17 & 21 NOV 2026): 60 pembaruan followers → 60 catatan + selisih; 55 entri riwayat konten utuh; sinkron 3× → 1 konten; batal/ulang tahap; upload 21 NOV → posting 1, batal → 0; yatim terupload tetap ada; 0 error JS.
- Build `20261109.11` (index.html, sw.js, assets.json, README).

## 20261109.10 — Bagian 3C: transisi 20→21 NOV 2026 (Persiapan M.C.F.A Project Selesai)

- **Diperiksa (tanpa perubahan perilaku):** `46-persiapan-selesai.js` sudah memindah kartu `#heroTugasAwal` dan `#heroAdaptasi` ke `#pspGroup` tepat di bawah `#heroHarian`, memakai `mcfaTodayIso()` (Asia/Jakarta) dan `MCFA_CORE.projectStart`. Yang dipindah hanya elemen; ID, pendengar klik, dan localStorage tidak disentuh.
- **Diperbaiki:** pada jalur "reload ditunda" (pengguna sedang mengetik / dialog terbuka, `41-midnight-rollover.js` menunda reload), kartu baru berpindah sampai 60 detik setelah 00:00. Kini `46` memasang penjadwal tepat di 00:00:00 WIB (`arm()` / `MCFA_PSP.msToStart()`), dihitung dari jam dinding Jakarta, dipasang ulang tiap putaran dan saat aplikasi kembali terlihat (aman setelah perangkat tidur). Tidak ada kunci localStorage baru.
- Uji (Chromium headless, jam simulasi, zona perangkat Los Angeles & Auckland): 23:59:xx → 00:00 pindah otomatis tanpa reload manual; 1 kelompok, 1 salinan tiap kartu, tanpa ID ganda; centang Tugas Awal (3–4 tugas) tetap; centang/batal centang di dalam kelompok tetap memperbarui progres; buka segar 20 NOV (tampilan lama), 21 NOV 00:00, 22 NOV (tampilan baru); `?preview=selesai`; batas 16:59:59.999Z = Day 0, 17:00:00.000Z = Day 1.
- Build dinaikkan ke `20261109.10` (index.html, sw.js, assets.json, README).

## 20261109.9 — Bagian 4: logika jadwal lama (MCFA_ADPK) dimatikan

- **Dihapus dari runtime:** modul `MCFA_ADPK` di `07-adaptation-program.js` (jadwal konten bertahap mulai 3 NOV, `PLAN_START`, `FIX/ENTRY`, `OFFICIAL` 21–22 NOV, penulisan `mcfa_adpk_log_v1`). Tidak ada lagi kode yang bisa membuat data baru bertanggal 3 NOV.
- **Dependensi dialihkan ke data resmi:** `42-content-bridge-studio.js` `selfCheck()` kini memeriksa `MCFA_CORE` (studioStart = contentStart = 21 NOV) + daftar `AKUN`, dan memastikan `window.MCFA_ADPK` tidak ada. Kartu "JADWAL AWAL" di profil akun (`12-app-core`, `_renderPostingSys`) kini memakai `MCFA_CORE.contentStart` + `AKUN`; keluaran diuji identik dengan versi sebelumnya untuk 11 akun.
- **Dilepas:** pernyataan "BARONGSUKMA akun pertama" di selfCheck — itu hanya urutan larik jadwal lama, bukan data resmi baru. Urutan upload hari pertama tidak lagi diasumsikan.
- **Kunci lama** `mcfa_adpk_log_v1`, `mcfa_adpk_log_v1_prev`, `mcfa_adpk_v1`: tidak ada kode yang membacanya lagi. `MCFA_ADPK_LEGACY.clean()` (jalan otomatis saat dimuat, idempoten, tanpa kunci baru) menghapus kunci yang terbukti tidak berisi centang; kunci yang berisi centang pengguna atau tidak terbaca DIPERTAHANKAN dan dilaporkan lewat `MCFA_ADPK_LEGACY.report()` untuk diputuskan pengguna (Bagian 8).
- Uji: tidak ada error JS; `MCFA_T6.selfCheck()`, `mcfaSelfCheck()`, `TAH.verify()` bersih; `MCFA_ADP`/`MCFA_ADPP` tetap termuat; 18 NOV dan 21 NOV 00:00 tanpa error. Build `20261109.9`.

## 20261109.8 — Bagian 2: ketetapan tanggal (audit final)

- **Validasi tanggal ketat:** `mcfaIsValidIso()` baru; `mcfaParse()` kini mengembalikan *Invalid Date* untuk tanggal yang tidak ada (31 FEB, 29 FEB 2027, bulan 13) — sebelumnya diam-diam bergeser ke bulan berikutnya.
- **Zona waktu Asia/Jakarta tunggal:** `mcfaNowJakarta()` kini dihitung dari UTC+7 tetap (`MCFA_TZ_OFFSET_MIN`), tanpa `Intl` dan tanpa bergantung zona perangkat; `mcfaMidnight()` tanpa argumen memakai tanggal Jakarta (dulu zona perangkat). Ditambah `mcfaJakartaParts()` (jam/menit WIB untuk uji pergantian hari).
- **Satu parser:** 7 salinan `new Date(parseInt…)` di `10-activity-daily-calendar.js` dan `12-app-core-intro-canvas.js` dialihkan ke `mcfaParse`; fallback `new Date()` di `11`, `31`, `46` diganti `mcfaTodayIso()/mcfaNowJakarta()`.
- **`mcfaSelfCheck()`** ditambah: hari 7 tanggal kunci (21 NOV 2004 MINGGU … 20 NOV 2029 SELASA), penolakan 31 FEB / 29 FEB 2027 / bulan 13, tanggal lahir & awal fase setelah project.
- Uji: 9 jam-simulasi (1, 14, 15, 20 NOV 23:59, 21 NOV 00:00, 21 NOV 2027, 29 FEB 2028, 20 & 21 NOV 2029) × 3 zona perangkat (Jakarta, Los Angeles, Auckland) → hasil identik; 0 error JS; durasi 14 / 6 / 1.096 benar.
- Tidak diubah: `MCFA_CORE` (nilai sudah sesuai tabel resmi), `financeStart` tetap 2026-01-01. Build `20261109.8`.

## 20261109.7 — Tugas Awal: panel data lama tanpa tanggal dihapus

- **Dihapus dari Tugas Awal MC FATHUL ADZIM:** seluruh panel di bawah kalender — **Tugas Lainnya** (Makan, Buat logo KP.Cihuy), **Daftar Dekorasi Studio** (A. Pembelian dan Pengumpulan Bahan, B. DIY dan Dekorasi) dan **Persiapan Akhir** (Kamar, Studio, Rumah, Peralatan dan Perlengkapan, Project, Persiapan Hidup Baru, Dekorasi Studio, Branding Seluruh Akun). Tugas Awal kini hanya berisi isi kalender 1–14 NOV.
- **Hitungan progres:** 189 → **85 tugas** (semua dari 8–14 NOV). Bilah progres, "selesai / belum", dasbor Aktivitas, dan "tugas berikutnya" otomatis mengikuti.
- **Tetap ada:** *Lantai vinyl* (`dek-1-12`) tetap di 11 NOV karena memang bagian kalender.
- **Data aman:** 104 ID yang dihapus dicatat di `TAH.arsip().dataLama` (nonaktif, tidak dirender, tidak dihitung). Centang lamanya di localStorage tidak dihapus.
- `TAH.verify()` diperbarui (85 tugas aktif, arsip 114 ID unik, `#tahExtra` tidak ada lagi). Elemen `#tahExtra` dihapus dari `index.html`.
- Build dinaikkan ke `20261109.7` (index.html, sw.js, assets.json, README).

## 20261109.6 — FINAL UPDATE langkah 7: data lama dikembalikan, Adaptasi tetap 15–20 NOV, audit tanggal

- **Koreksi langkah 6:** data lama Tugas Awal yang TIDAK diperintahkan hapus kembali aktif sebagai panel **tanpa tanggal** di bawah kalender (`#tahExtra`): Makan, Logo KP.Cihuy (blok "Tugas Lainnya"), Daftar Dekorasi Studio (19 item; Lantai vinyl tetap hanya di 11 NOV), dan Persiapan Akhir Menyeluruh (83 item `h20-…`). Tidak masuk kalender 1–14 NOV, tetap ikut hitungan progres. Total aktif **189** (85 kalender + 104 data lama).
- **Tetap dihapus (arsip nonaktif, tidak dihitung):** grup "TUGAS LAMA" dan 5 tugas yang diperintahkan hapus — Cukur rambut, Mandi wajib, Sholat tobat, Dzikir, Ucapan Caca — beserta 5 ulangannya di Persiapan Akhir. 199 − 10 = 189. Centang lama tidak dihapus dari penyimpanan.
- **Adaptasi dikonfirmasi 15–20 NOV 2026 (6 hari)**; tidak ada perubahan pada `adaptEnd`. Komentar "8–20 NOV" di `index.html` dan `07-adaptation-program.js` dikoreksi menjadi 15–20 NOV.
- **Audit tanggal:** dihapus sisa konsep "Tugas Persiapan Lanjutan 3–4 NOV" (`prepStart/prepEnd/prepTotalDays`, kartu di timeline Kehidupan, tes) karena 3–4 NOV adalah Perencanaan; dihapus `decoStart/decoTotalDays` (daftar dekorasi kini tanpa tanggal); teks "dijalankan di dalam periode Tugas Awal" di timeline Kehidupan dikoreksi. Tanggal lain (DAY 1 21 NOV 2026, akhir proyek 20 NOV 2029, fase hidup, Tahap 1/2/3, Barongsukma, posting konten) diperiksa: semua konsisten.
- `TAH.verify()` diperbarui (14 tanggal, 189 tugas, arsip 10, tidak ada ID di dua tempat). Hasil: tanpa temuan.

## 20261109.5 — FINAL UPDATE langkah 6: periode Tugas Awal 1–14 NOV, tugas lama diarsipkan, kalender 14 tanggal

- **Periode (Bagian 3):** `MCFA_CORE.taskEnd` 2026-11-20 → **2026-11-14** (14 hari). Judul "TUGAS AWAL HARIAN" → **TUGAS AWAL MC FATHUL ADZIM**; semua teks periode, jumlah hari, dan label "1 NOV — 14 NOV 2026" mengikuti sumber tunggal. 15 NOV bukan lagi bagian Tugas Awal; `projectStatus`, status dashboard Aktivitas, tes mandiri, dan komentar disesuaikan (Tugas Awal 1–14 → Adaptasi mulai 15 → DAY 1 21 NOV). Status "Tugas Persiapan" 3–4 NOV dihapus dari penentu status (3–4 NOV = Perencanaan).
- **Tugas lama (Bagian 4):** grup "TUGAS LAMA (DIPERTAHANKAN)" di 8 & 9 NOV dihapus dari tampilan. Dikeluarkan dari daftar aktif dan semua hitungan: Cukur rambut, Mandi wajib, Sholat tobat, Dzikir, Ucapan Caca, serta Makan dan Logo KP.Cihuy (satu grup yang sama). Daftar Dekorasi Studio (15–20 NOV, 19 item selain Lantai vinyl) dan "Persiapan Akhir Menyeluruh" 20 NOV (88 item `h20-…`) juga keluar karena berada setelah 14 NOV dan tidak ada di data final.
- **Arsip nonaktif:** `ARSIP` (7 + 19 + 88 = 114 ID) di `11-initial-tasks-nov.js`, dapat dibaca lewat `TAH.arsip()`. Tidak dirender dan tidak dihitung. Centang lama di localStorage TIDAK dihapus.
- **Kalender (Bagian 5):** strip kalender tepat 14 tanggal (1–14 NOV); 1–7 NOV bertanda Perencanaan. Legenda diganti "1–7 NOV = perencanaan · 8–14 NOV = tugas harian".
- **Hitungan (Bagian 9):** total aktif **85** (sebelumnya 199 = 85 aktif + 114 arsip). Dihitung dari ID unik di daftar aktif; centang arsip tidak ikut menghitung (diuji).
- `TAH.verify()` ditulis ulang: 14 tanggal, tidak ada entri di luar periode, tidak ada grup/tugas lama aktif, arsip 114 ID dan tidak bocor ke daftar aktif, total 85. Hasil: tanpa temuan.
- **Belum dikerjakan:** akhir Program Adaptasi (masih 20 NOV, 6 hari; menunggu konfirmasi apakah Adaptasi hanya 15 NOV) dan pemeriksaan tanggal menyeluruh langkah 7 (halaman Akun/Studio, riwayat).

## 20261109.4 — FINAL UPDATE langkah 5: konsep visual "garis akhir"

- Di dalam kelompok PERSIAPAN M.C.F.A PROJECT SELESAI (bagian atas, sebelum dua bagian data): jalur perjalanan **TUGAS AWAL ✓ → ADAPTASI ✓ → ⚑ DAY 1 (tanggal dari `MCFA_CORE.projectStart`)**, lalu tiga kalimat bertingkat: SELESAI MENYIAPKAN. / SIAP MENJALANI. / **SAATNYA MENJADI MC FATHUL ADZIM.** dan catatan penutup "Semua fondasi sudah dibangun. Semua persiapan telah diselesaikan."
- Tiap bagian (1 Tugas Awal, 2 Adaptasi) diberi pil "✓ SELESAI". Data, progres, dan riwayat di kartu tidak diubah.
- Satu animasi singkat (garis emas tergambar saat dibuka); mati otomatis bila perangkat memakai reduced-motion. Hanya CSS + HTML di `46-persiapan-selesai.js` dan `components.css`.

## 20261109.3 — FINAL UPDATE langkah 3–4: kelompok PERSIAPAN M.C.F.A PROJECT SELESAI

- Berkas baru `46-persiapan-selesai.js` (terdaftar di index.html, sw.js, assets.json). Mulai **21 NOV 2026 (DAY 1)** halaman Kegiatan menampilkan: 1) KEGIATAN SEHARI-HARI, 2) PERSIAPAN M.C.F.A PROJECT SELESAI tepat di bawahnya. Tugas Awal dan Adaptasi tidak lagi tampil terpisah di halaman utama.
- Klik kelompok → dua bagian bernomor: **1 TUGAS AWAL MC FATHUL ADZIM** dan **2 ADAPTASI**. Yang dipindah hanya penempatan kartu (elemen, ID, pendengar klik apa adanya); daftar tugas, riwayat, tanggal, dan data localStorage masing-masing tidak disentuh dan tidak digabung.
- Sebelum 21 NOV tampilan lama tetap dipakai agar tugas yang sedang dikerjakan tidak tertutup. Pratinjau kapan saja: buka aplikasi dengan `?preview=selesai`.
- Desain (`components.css`, akhir berkas): kartu ivory + emas champagne, lebih kecil & lebih sempit dari kartu hero, segel centang emas, label "SELESAI MENYIAPKAN · SIAP MENJALANI", tanpa animasi berlebih (hormati reduced-motion).
- Belum dikerjakan (langkah 5–6): elemen visual "garis akhir" di dalam kelompok, dan pemeriksaan tanggal menyeluruh (teks Tugas Awal "1–20 NOV · 20 hari" masih lama).

## 20261109.2 — FINAL UPDATE langkah 2: Tugas Awal disusun ulang (1–14 NOV 2026)

- **1–7 NOV = PERENCANAAN**: tanpa tugas harian, status & kartu tanggal khusus (`components.css` `.s4`).
- **8 NOV** Buat M.C.F.A Project · Buat jadwal olahraga baru. **9 NOV** Pemanasan olahraga pertama (1) · Pemanasan running pertama (1) · Perbagus kamar Ayla (pasang terpal). **10 NOV** Buat pull up · samsak · pemberat · buku fake. **11 NOV** Pasang lantai vinyl · Ganti tempat sendok · Tambahkan tanaman hias. **12 NOV** Buat print A6 Kehidupan MC Fathul Adzim · Buat mata pelajaran. **13 NOV** Branding (11 akun × 5 tugas, utuh dari tanggal 5 lama). **14 NOV** BERESKAN DAN BERSIHKAN STUDIO DAN RUMAH (seluruh isi tanggal 2 + tanggal 3).
- ID tugas lama dipertahankan, jadi centang & riwayat tetap menempel. Lantai vinyl berbagi satu centang dengan daftar dekorasi (`dek-1-12`, dihitung sekali). 3 tugas baru: terpal Ayla, ganti tempat sendok, tanaman hias → total 196 → 199.
- Tugas lama yang tidak ada di jadwal baru (Makan, Logo KP.Cihuy, Cukur rambut, Mandi wajib, Sholat tobat, Dzikir, Ucapan Caca) tidak dibuang: grup "TUGAS LAMA (DIPERTAHANKAN)" di 8 & 9 NOV.
- Dihapus sebagai halaman: LIBUR 6 NOV dan kumpulan tugas 7 NOV (isinya sudah tersebar di tanggal baru). Daftar Dekorasi tampil mulai 15 NOV. `TAH.verify()` ditulis ulang (hasil: tanpa temuan).
- **Belum diubah (menunggu langkah 3–6):** 20 NOV "Persiapan Akhir Menyeluruh" dan batas akhir Tugas Awal (`taskEnd`).

## 20261109.1 — FINAL UPDATE langkah 1: tanggal Adaptasi → 15 NOVEMBER 2026

- `MCFA_CORE.adaptStart` 2026-11-08 → **2026-11-15** (akhir tetap 20 NOV; 6 hari). Semua halaman membaca dari sumber ini, jadi header, kalender Adaptasi, rotasi produksi konten, status harian dan dashboard ikut berubah.
- Teks cadangan di `index.html` (rentang & jumlah hari) diperbarui; tes mandiri `04`/`08` disesuaikan (hasil: CORE OK).
- Daftar Dekorasi Studio tetap pada penempatan lamanya (8 NOV) lewat konstanta `DEK_START` di `11-initial-tasks-nov.js`; tidak ikut pindah.
- Data di localStorage tidak dihapus: centang Adaptasi bertanggal 8–14 NOV tetap tersimpan, hanya tidak lagi ditampilkan.
- Build 20261107.6 → 20261109.1 (index.html, sw.js, assets.json, manifest.json, README).

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
