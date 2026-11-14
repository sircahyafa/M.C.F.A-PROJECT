# Laporan Pengujian — build 20261114.2 (Tugas Awal 2 Tahap + tugas Makan)
Catatan: angka 108/216 di bawah berlaku untuk build .1; sejak .2 menjadi 110/220 (A=8 B=2 C=2 D=30 E=3 F=3 G=3 H=3 I=55 J=1), lihat CHANGELOG.
Chromium 153 headless (Playwright), 360 dan 320 px, zona Asia/Jakarta, server statis lokal.

## LULUS — benar-benar dijalankan
- `TAH.verify()` = [] (Tahap 1 = 14 NOV, Tahap 2 = 20 NOV, 15–19 NOV kosong, 108 tugas/tahap, ID unik, kategori A=8 B=2 C=2 D=30 (4,6,7,5,6,2) E=3 F=3 G=3 H=2 I=55, uji independensi tahap). `mcfaSelfCheck()` = [].
- Migrasi v4 → v5 dengan data uji (centang 1–13 NOV + 2 centang Branding): hanya 2 centang `h5-…` tersisa di Tahap 1, Tahap 2 kosong, salinan `mcfa_tugasAwal_arsip_v4` dibuat, penyimpanan menjadi `v:5`.
- Centang Tahap 1 (2 tugas) → Tahap 1 = 4/108 (4%), Tahap 2 tidak berubah; centang 1 tugas di Tahap 2 → Tahap 2 = 1/108 (1%), keseluruhan 5/216 (2%); batal centang → kembali; angka kartu, hero, dan ringkasan tahap sama dengan `TAH.overall()`.
- Muat ulang: centang tetap tersimpan. Sel 15–19 NOV tidak bisa dipilih. Tanpa galat JS, tanpa overflow horizontal (360 dan 320 px).
- Sintaks seluruh berkas JS (`node --check`), rujukan `index.html`/`sw.js` ada di disk.

## BELUM TERUJI
- HP Android sungguhan; sinkron Firebase/cloud dengan skema v5; Program Adaptasi 15–20 NOV tidak diubah dan tidak diuji ulang.
- Kegiatan Sehari-hari (`ba_*`) dan Adaptasi masih menyimpan data 1–13 NOV (di luar cakupan "hanya Tugas Awal").

# Laporan Pengujian — build 20261111.6 (Potongan Foto Akun Diaktifkan)
Lingkungan sama dengan build .5 (Chromium 153 headless, 360×740, tanpa internet).

## LULUS — benar-benar dijalankan
- **Gaya terhitung 11 akun** (diperiksa lewat `getComputedStyle` di tab Akun, termasuk daftar tiap kategori): 11 dari 11 sesuai aturan — Zona `contain`; Ayla 18%, Alley 30%, Barongsukma 25%, Fathul Al-Meme 12%, KP. Cihuy 40%, LOL 30%, MC. Fathul Adzim 15%, Monkipedia 25%, Otak Kepala Kardus 30%, CNE 45%.
- **Tangkapan layar sebelum/sesudah** (gambar perbandingan) menunjukkan logo Zona tampil utuh; akun lain bergeser beberapa persen.
- **Regresi:** teks 5 halaman, self-check, `TAH.verify()`, kunci penyimpanan identik; tanpa 404 dan tanpa error JS; 350 rujukan berkas lengkap; Service Worker precache 82 berkas dan offline berhasil.

## BELUM / TIDAK DAPAT DIUJI
- Tampilan di HP Android sungguhan; foto Sheina tidak termasuk aturan ini (gaya terhitungnya tidak berubah). Daftar lain: lihat `BELUM-SELESAI.md`.

# Laporan Pengujian — build 20261111.5 (Performa: kilau lencana & satu AudioContext)
Lingkungan: Chromium 153 headless (Playwright), viewport 360×740, zona Asia/Jakarta, CPU dilambatkan 4× untuk ukuran performa, tanpa internet. Skrip uji terpisah dari proyek.

## LULUS — benar-benar dijalankan
- **Regresi:** teks 5 halaman, 8.339 node, kunci localStorage, `MCFA_CORE`, `mcfaSelfCheck()` dan `TAH.verify()` identik dengan build .3/.4; tanpa 404 dan tanpa error JS; sintaks 48 JS lulus; rujukan statis lengkap; Service Worker precache 82 berkas dan muat ulang offline berhasil.
- **Kilau lencana:** recalc style halaman Studio 207 → 28 ms/detik (diukur 5 detik saat diam, CPU 4×); piksel identik pada 0% dan selisih maksimum 7/255 pada puncak.
- **AudioContext:** 2 → 1 pada jalur uji yang sama, osilator sama (41); saat tab disembunyikan konteks `suspended`, kembali `running` pada ketukan berikutnya; tanpa error.
- **Catatan keacakan uji:** jumlah osilator pada jalur klik uji kadang 28 (bukan 41) di build lama maupun baru (bergantung pada apa yang tersentuh klik saat intro) — bukan regresi. Siklus bersama diuji deterministik: konteks yang sama dikembalikan, `suspended` saat tersembunyi, `running` lagi saat dipakai.
- **Timer:** biaya skrip saat diam 4–20 ms/detik pada kelima halaman → tidak diubah.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan (angka 4× adalah emulasi, bukan perangkat); kualitas dan kenyaringan suara; jalur suara `06` (Official History) dan `10` (centang harian) hanya diganti secara mekanis, tidak dibunyikan satu per satu; Cloud/Firebase; pembaruan SW pada perangkat yang sudah memasang build lama.

# Laporan Pengujian — build 20261111.4 (Pengelompokan Berkas ke Folder Bernomor)
Lingkungan: Chromium 153 headless (Playwright), viewport 360×740, zona Asia/Jakarta, jam dikunci 11 NOV 2026 10.00 WIB, tanpa internet (font/Firebase tidak tersedia). Skrip uji terpisah dari proyek.

## LULUS — benar-benar dijalankan (build .3 sebagai pembanding, build .4 sebagai hasil)
- **Rujukan statis:** 349 rujukan (HTML, CSS `url()`, JS, SW, manifest, assets.json) dipindai di kedua build; 5 "rusak" yang sama di keduanya adalah positif palsu (potongan URL Firebase CDN, fragmen SVG `%23n`, string `adpp:`). Semua berkas terpakai; tidak ada berkas hilang atau yatim selain `assets.json` (memang registri).
- **Sintaks:** `node --check` pada 48 JS lulus.
- **Perilaku identik:** teks 5 halaman (Aktivitas, Studio, Kehidupan, Karier, Keuangan) sama persis (md5 sama), 8.339 node DOM sama, kunci localStorage sama, `MCFA_CORE` sama, `mcfaSelfCheck()` dan `TAH.verify()` kosong, tanpa error JS, tanpa respons 404; satu-satunya pesan konsol = font Google tidak terjangkau (sama di build .3).
- **Gambar:** 27 `<img>` di halaman Studio semuanya termuat (27/27) di kedua build; gaya `object-fit/position` 18 gambar identik; latar `oh-launch-bg.jpg` bernilai 200.
- **Service Worker:** terpasang, precache 82 berkas = 82 entri di `sw.js`, tanpa 404 dari server; muat ulang saat offline berhasil dan skrip tetap berjalan.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan; Cloud/Firebase; suara; pembaruan SW pada perangkat yang sudah memasang build lama (buka sekali dengan koneksi, lalu muat ulang).
- Unggah ke GitHub Pages sungguhan: pastikan folder ikut terunggah (seret FOLDER, bukan file ZIP).

# Laporan Pengujian — build 20261111.3 (Final Audit Bagian 2: Kode & Event Listener)
Lingkungan: Chromium headless (Playwright), viewport 360×740, zona Asia/Jakarta, tanpa internet. Skrip uji terpisah dari proyek.

## LULUS — benar-benar dijalankan
- **Bukti bug (sebelum perbaikan):** setelah masuk aplikasi, satu Enter memicu ulang 3 confetti, 1 suara sukses, 1 kembang api.
- **Setelah perbaikan:** masuk via tombol = 3 confetti/1 sukses/1 kembang api; Enter ×3 di dalam aplikasi = 0 pemicu, kartu beranda tidak disembunyikan; masuk via Enter ×3 di intro = tepat sekali; klik tombol ganda = tepat sekali; tanpa error JS.
- **Kebocoran:** 8 putaran × 5 menu: DOM 8.339 → 8.339, timer baru 0, listener 591 → 591. Buka-tutup panel Efek dan Akun ×6: DOM 8.372 → 8.372, panel 2 → 2, timer baru 0.
- **Statis:** sintaks 48 JS; 307 deklarasi global tingkat-atas, 1 nama ganda (`goalIco`, isi identik).
- **Regresi:** `mcfaSelfCheck()` dan `TAH.verify()` kosong; profil bersih, data rusak, dan JS hilang berperilaku sama seperti build .2; Service Worker aktif dengan cache `mcfa-v4-20261111.3-static`; `?v=`/`BUILD` seragam.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan (keyboard virtual asli), Cloud/Firebase, suara dan kelancaran animasi, pembaruan Service Worker di perangkat yang sudah memasang versi lama.

# Laporan Pengujian — build 20261111.2 (Final Audit Tahap 1: Tanggal & Timeline)
Lingkungan: Chromium 153 headless (Playwright), jam dikunci, viewport 390×844, tanpa internet. Skrip uji terpisah dari proyek.

## LULUS — benar-benar dijalankan
- **Jam dikunci 8 skenario** (11 NOV 10.00, 14 NOV 23.59, 15 NOV 00.00, 20 NOV 23.59, 21 NOV 00.00 WIB; 20 NOV 2029; 21 NOV 2029; perangkat zona Los Angeles): `mcfaSelfCheck()` dan `TAH.verify()` kosong, tanpa error JS. DAY 1 jatuh tepat 21 NOV 00.00 WIB; 20 NOV 2029 = DAY 1.096, sisa 1; 21 NOV 2029 sisa 0.
- **Tanggal di layar:** 21 string tanggal unik di 5 halaman, semuanya cocok dengan `MCFA_CORE`; nol tanggal tidak kapital; tiap penanda `data-mcfa-*` hanya punya satu nilai.
- **Zona perangkat (4 zona):** Jakarta, Jayapura (UTC+9), Auckland, Los Angeles → "RABU, 11 NOV 2026" di semuanya (sebelum perbaikan: "Selasa" di Jayapura dan Auckland).
- **formatStampUpper & Buku Keuangan (36/36, 3 zona):** konversi UTC→WIB, lewat tengah malam, kabisat 29 FEB 2028, tanggal mustahil; transaksi baru tampil kapital, tersimpan ISO, tidak ganda setelah muat ulang.
- **Statis:** sintaks seluruh JS; semua berkas rujukan `index.html` (74) dan precache `sw.js` (82) ada; `?v=` dan `BUILD` seragam 20261111.2; tanpa id ganda.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan; Cloud/Firebase (tanpa internet); pembaruan Service Worker pada perangkat yang sudah memasang versi lama (buka sekali dengan koneksi, lalu muat ulang).

# Laporan Pengujian — build 20261111.1 (Pembaruan Final Tugas Awal: 86 tugas, periode 11–14 NOV)
Lingkungan: Chromium 153 headless (Playwright), jam dikunci (10, 11, 12, 14, 15, 21 NOV 2026 WIB), zona Asia/Jakarta, viewport 390×844, tanpa internet (font/Firebase diblokir). Skrip uji terpisah dari proyek.

## LULUS — benar-benar dijalankan
- **Struktur (70/70 pemeriksaan):** `TAH.verify()` dan `mcfaSelfCheck()` kosong; 1–10 NOV tanpa tugas; 11/12/13/14 NOV = 13/16/2/55 item di layar; total 86 ID unik, tanpa ID kosong/ganda; urutan & judul 11 NOV sesuai permintaan; 12 NOV kelompok 10 + 6; 14 NOV 11 akun × 5; label periode "1–10 NOV / 11–14 NOV".
- **Pemindahan ID:** data lama (v4) disemai: centang `h5-…` (kini 14 NOV), `h3-…/h2-…` (kini 12 NOV), `h4-print-a6/h4-mapel` (kini 13 NOV), `h4-alat-pull-up/dek-1-12/h1-…/h9-…` (kini 11 NOV) tampil tercentang pada tanggal barunya; centang arsip (`h1-makan`, `dek-1-3`) tidak dihitung → 10 selesai dari 86.
- **Centang penuh 0 → 86:** tiap langkah memeriksa angka selesai/belum, persen keseluruhan, lebar progress bar (juga bar hero), jumlah ID di localStorage, = rumus selesai ÷ 86 × 100%. 100% muncul hanya pada 86/86; persen harian 100% di tiap hari saat hari itu selesai.
- **Reload:** 86/86 = 100% tetap setelah muat ulang; batal 1 → 85/86 = **99%** (bukan 100%), tetap setelah muat ulang.
- **Batal centang 86 → 0:** tiap langkah konsisten; akhir 0/86 dan penyimpanan kosong.
- **Dua tab:** centang dari dua tab (satu basi) tersimpan semua; tampilan tab lain menyusul otomatis; batal dari tab lain hanya menghapus item itu.
- **Data kosong:** 0/86, verify & selfCheck kosong.
- **Sinkronisasi:** hari ke-11 dari 14 pada 11 NOV; 15 NOV = ADAPTASI 1/6; 21 NOV = DAY 1; nama hari 11–14 NOV = Rabu–Sabtu; `MCFA_PSP`, `MCFA_ADP.verify/audit`, `MCFA_T6.selfCheck`, `MCFA_FIN_LEDGER.selfCheck`, `MCFA_ADPP.selfCheck` bersih pada jam 10, 12, 14, 15, 21 NOV.
- **Statis:** sintaks seluruh JS; berkas yang dirujuk `index.html` dan precache `sw.js` ada; `?v=` dan `BUILD` seragam 20261111.1. Tanpa error JavaScript di semua skenario.

## BELUM / TIDAK DAPAT DIUJI
- HP Android/Safari-iOS sungguhan; Cloud/Firebase (tanpa internet); pembaruan Service Worker di perangkat yang sudah memasang versi lama (cache baru `mcfa-v4-20261111.1` dibuat saat dibuka online; buka sekali dengan koneksi lalu muat ulang).

# Laporan Pengujian — build 20261110.8 (Final Fix Bagian 2: Sinkronisasi & Akurasi Data)
Lingkungan: Chromium headless (Playwright), jam dimanipulasi (10, 16, 22 NOV 2026 WIB), zona Asia/Jakarta, viewport 390×844, tanpa internet (font/Firebase diblokir). Skrip uji terpisah dari proyek (tanpa subfolder).

## LULUS — benar-benar dijalankan
- **Dua tab, satu penyimpanan (18/18):** Tugas Awal (centang lintas-tab tampil otomatis; penulisan dari tab basi tidak menimpa; batal-centang hanya menghapus item itu), Kehidupan (utang & target bernominal; centang dan batal-centang lintas-tab), Buku Keuangan (dua transaksi dari dua tab sama-sama tersimpan, saldo = jumlah buku), Kegiatan Sehari-hari (22 NOV), flush catatan Adaptasi saat `pagehide`.
- **Bukti bug lama:** skenario yang sama dijalankan pada build .7 — centang dari tab B HILANG setelah tab A mencentang item lain.
- **Hulu-ke-hilir (13/13):** tambah konten → belum diupload (hitungan 0) → diupload 22 NOV (hitungan 1) → simpan subscriber → tersimpan permanen, tampil di Karier, riwayat tercatat → MUAT ULANG (nilai tetap) → batal upload (kembali 0, item tidak hilang).
- **Self-check bawaan** (`mcfaSelfCheck`, `TAH.verify`, `MCFA_ADP.verify/audit`, `MCFA_T6.selfCheck`, `MCFA_FIN_LEDGER.selfCheck`, `MCFA_PSP.verify`, `MCFA_ADPP.selfCheck`): semua kosong/lulus pada data awal.
- **Statis:** sintaks 49 berkas JS tanpa error; semua berkas yang dirujuk `index.html` dan precache `sw.js` ada; penanda build seragam 20261110.8.
- Jumlah pesan konsol identik dengan build .7 (13; font/Firebase diblokir sandbox + peringatan AudioContext), tanpa error JavaScript baru.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan, Safari/iOS. Perilaku membekukan tab latar belakang oleh Android (event `storage` bisa tertunda) dilindungi oleh baca-ulang sebelum menulis, tetapi tidak diuji di perangkat.
- Cloud/Firebase (tidak ada internet).
- Penulisan dari tab basi pada Akun Hub (`31`) dan Milestone (`20`) diperiksa lewat kode, belum lewat skenario dua tab sendiri.
- Perebutan penulisan yang benar-benar serentak (dua tab menulis pada milidetik yang sama): localStorage bersifat sinkron per-proses, jadi jendela balapnya sangat sempit tetapi tidak nol.

# Laporan Pengujian — build 20261110.6 (Aktivitas: susunan baru + panel PERSIAPAN MCFA PROJECT)
Lingkungan: Chromium headless 153 (Playwright), jam dimanipulasi (10 NOV 15:46 WIB dan 20 NOV 12:00 WIB 2026), zona Asia/Jakarta, tanpa internet (font/Firebase diblokir). Skrip: `MCFA-QA-TESTS-PERSIAPAN.zip` (terpisah dari proyek; jalankan server statis di folder proyek, lalu `python3 logic.py`, `regress.py`, `acc.py`).

## LULUS — benar-benar dijalankan
- **Perilaku (`logic.py`, 32/32):** urutan `heroHarian` → `pspGroup`; kedua kartu di slot terpisah; awal BELUM SELESAI (85 + 432 = 517 tugas); centang NYATA satu tugas Tugas Awal → gabungan 1/517, batal → 0; seluruh Tugas Awal (85/85) → PERSIAPAN BERLANGSUNG; batal 1 tugas → BELUM SELESAI → centang lagi → BERLANGSUNG; seluruh Adaptasi (routine + produksi konten, 432/432) → SELESAI 100% + banner + efek; batal 1 tugas Adaptasi → status turun; batal 1 Tugas Awal juga → BELUM SELESAI; kembalikan → SELESAI; **muat ulang → tetap SELESAI tanpa efek perayaan ulang**, kunci centang tersimpan identik; panel tidak menulis kunci localStorage baru; tanpa error JS; `MCFA_PSP.verify()` kosong di setiap keadaan.
- **Regresi terhadap build sebelumnya (`regress.py`):** aksi centang yang sama dijalankan di build lama dan baru → semua kunci localStorage identik (selisih hanya `mcfa_data_version_v1.build`, karena nomor build naik); hitungan Tugas Awal 56/85, Adaptasi 216/432, hero 56/85 dan 36/72, semua teks rentang tanggal dan jumlah hari identik.
- **Akordeon (`acc.py`):** klik nyata Harian → Tugas Awal → Adaptasi membuka satu kartu pada satu waktu seperti sebelumnya, termasuk kartu di dalam panel.
- **Statis:** sintaks 49 berkas JS (`node --check`) tanpa error; tidak ada id ganda di `index.html`; kurung kurawal 8 berkas CSS seimbang; semua berkas CSS/JS yang dirujuk ada; tidak ada sisa string versi lama di `index.html`/`sw.js`/`assets.json`.
- **Visual:** tangkapan layar 320, 390 (HP) dan 1280 px (desktop); tidak ada overflow horizontal di 320 px; keadaan belum, berlangsung, selesai (tertutup & terbuka) dan pratinjau `?preview=selesai` diperiksa.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan dan Safari/iOS (hanya Chromium headless). Animasi buka/tutup memakai transisi `grid-template-rows` (Chrome 107+, Safari 16+); di peramban lebih lama panel membuka/menutup tanpa animasi tetapi tetap berfungsi.
- Kelancaran animasi (frame rate) dan suara/getar perangkat tidak dapat dinilai di lingkungan headless.
- Cloud/Firebase (tidak ada internet): alur sinkron cloud tidak dijalankan. Perubahan dari perangkat lain tertangkap lewat pengamat DOM, peristiwa `storage`, dan pemeriksaan ulang tiap 30 detik, tetapi tidak diuji dengan Firebase sungguhan.
- Alur centang beberapa tab sekaligus, serta perubahan lintas tengah malam untuk panel ini.

# Laporan Pengujian — build 20261109.14 (Bagian 10–11: Karier, Dashboard, Migrasi)
Lingkungan: Chromium headless 153 (Playwright 1.63), jam dimanipulasi (9 Nov & 25 Nov 2026, 1 Jun 2027), zona Asia/Jakarta, tanpa internet.
Skrip uji terpisah dari proyek (README melarang subfolder): `MCFA-QA-TESTS.zip` (jalankan: `ROOT=<folder proyek> python3 t_migrate.py`, dst).

## LULUS — benar-benar dijalankan
- **Migrasi (34/34, `t_migrate.py`)** dengan data format lama sungguhan: teks digit → angka; `hist` bukan array dipindah ke `hist_legacy`; JSON terpotong & konten bukan-array dikarantina dengan isi asli utuh dan tidak diubah; kunci legacy berisi centang pengguna & kunci tak dikenal dipertahankan; saldo Keuangan format lama tetap terbaca; konten lama (tanpa `status`) terhitung. Muat ulang 3× → tidak ada langkah berjalan lagi, salinan pengaman tidak ditimpa, karantina & buku pencapaian tidak berganda. Salinan pengaman gagal disimpan (QuotaExceeded disimulasikan) → migrasi dibatalkan, data tak berubah, aplikasi tetap jalan. Langkah yang sengaja merusak data → validasi gagal & data dikembalikan, percobaan tercatat. Data bertanda versi 9 → tidak disentuh.
- **Karier & Dashboard (20/20, `t_career.py`):** agregat tunggal (600 rb dari target 500 rb = 50%, bukan 60%); krTahap1Box, Peta Pertumbuhan (angka & lebar bar), ringkasan Platform, dan Studio menampilkan angka yang sama; ubah data → tampilan berubah TANPA muat ulang (akun, konten); pencapaian & konten bertahan setelah muat ulang; koreksi turun → "dikoreksi" (riwayat utuh), naik lagi → peristiwa baru, simpan nilai sama → tidak ada peristiwa ganda; profil kosong → 0 pencapaian, tanpa ✓, Status H-12, Total Target 14 Juta.
- **Checkpoint:** bug ✓ palsu direproduksi pada kode lama (1 Jun 2027, 0 subscriber → ✓ 250 RB, ✓ 500 RB) dan terbukti hilang setelah perbaikan.
- **Ekspor/Impor (9/9, `t_backup.py`):** ekspor membawa `dataSchema:2`, tanpa salinan pengaman/karantina/penanda versi; impor cadangan lama pada perangkat yang sudah v2 tetap termigrasi; salinan pra-impor tersimpan; cadangan versi lebih baru ditolak dan data utuh.
- **Statis:** sintaks 49 berkas JS (`node --check`) tanpa error; HTML seimbang & tanpa id ganda; kurung kurawal 8 berkas CSS seimbang; 41 fungsi handler `onclick` inline semuanya ada; daftar `index.html`/`sw.js`/`assets.json` konsisten (19-cloud dimuat dinamis, sudah begitu sejak sebelumnya).
- **Interaksi (`t_crawl.py`):** 946 elemen interaktif ditemukan di 5 halaman (HP & desktop); 105 diklik tanpa error JS. Sisanya tersembunyi/di tab lain, atau sengaja dilewati (hapus/reset/impor/ekspor/login/cloud).
- **Responsif (`t_resp.py`):** 360, 390, 768, 1366 px × 5 halaman (Karier 4 tab) — tidak ada overflow horizontal; tangkapan layar kartu Riwayat Pencapaian (360 px) dan Peta Pertumbuhan (1366 px) diperiksa visual.
- Bukti perilaku lama: data `mcfa_tahap1_*`/`mcfa_konten_*` yang rusak ditimpa tanpa jejak pada build .13 (diuji di ZIP asli); pada build .14 salinan aslinya masuk karantina.

## BELUM / TIDAK DAPAT DIUJI
- HP Android sungguhan dan Safari/iOS (hanya Chromium headless).
- Cloud/Firebase (tidak ada internet): perubahan di `19-cloud-account-sync.js` (kecualian kunci lokal, `__mcfa_data_schema`, penolakan versi lebih baru) lolos sintaks dan dibaca ulang, tetapi alurnya TIDAK dijalankan.
- Pengujian klik penuh: tombol hapus/reset/impor/ekspor/login hanya diuji lewat jalur ekspor-impor di `t_backup.py`.
- Perilaku nyata saat penyimpanan perangkat hampir penuh selain simulasi QuotaExceeded pada salinan pengaman.
- Perubahan lintas tengah malam / zona waktu lain untuk modul baru (zona Los Angeles/Auckland diuji hanya pada Bagian 7).
- Penggabungan dengan Bagian 8–9 (tidak ada di ZIP ini).

## Bug yang ditemukan di bagian ini
1. ✓ palsu pada checkpoint Peta Pertumbuhan — diperbaiki.
2. Tiga rumus persen berbeda untuk data yang sama (Studio/Peta/Karier) — disatukan di `MCFA_STUDIO.aggregate`.
3. Total Target Audiens "15 Juta+" tertulis tetap, tidak sama dengan target akun hidup (14 Juta) — dihitung dari data.
4. Data JSON rusak ditimpa tanpa jejak oleh `save()`/`_saveKonten` — salinan karantina dibuat lebih dulu.
5. (Kesalahan saya sendiri selama pengerjaan, sudah dikoreksi sebelum rilis) validasi migrasi sempat mengembalikan kunci karantina yang memang sengaja berubah; satu asersi uji ternyata selalu lulus dan diganti dengan asersi nyata.

# Laporan Pengujian — build 20261109.13 (Bagian 7: Keuangan)
Lingkungan: Chromium headless (Playwright), 390×844, jam dimanipulasi, zona Jakarta / Los Angeles / Auckland.

LULUS (48 pemeriksaan otomatis): pemasukan, pengeluaran, edit nominal & jenis, hapus, klik ganda, validasi nominal/tanggal (0, desimal, kosong, 31 FEB, masa depan, sebelum 1 JAN 2026, > Rp 999.999.999.999), saldo & progres & pencapaian dihitung ulang, reload mempertahankan data, kegagalan `setItem` (simpan & hapus) tidak mengubah apa pun, target Kehidupan (centang → 1 transaksi `KH-<id>`, batal → dibatalkan, centang ulang → tetap 1, nominal berubah → diperbarui), transaksi manual tidak ikut terhapus, data rusak dikarantina, sourceId ganda tidak terhitung dua kali, saldo cache tidak menjadi uang hantu, migrasi saldo lama tidak berulang, tanggal transaksi sama di 3 zona, `selfCheck()` bersih, 0 error JS di 20 NOV 23:59:30 dan 21 NOV 00:00:05 WIB.

BELUM DIUJI: HP Android sungguhan; Cloud/Firebase (tidak ada internet); konflik dua tab/perangkat pada buku transaksi (dibahas di Bagian 9).

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
