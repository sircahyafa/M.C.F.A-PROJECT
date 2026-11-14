# Status Pekerjaan — build 20261111.6 (11 NOV 2026)

## SUDAH (diuji nyata, lihat TESTING.md)
- Pengelompokan berkas ke folder bernomor 01–14 (`index.html`, `sw.js`, `manifest.json`, `assets.json`, `atlas_redesign.html`, `README.md` tetap di root).
- Tanggal resmi dan hitungan cocok: Tugas Awal 14 hari, Adaptasi 6 hari, Tahap 365 + 366 + 365 = 1.096 hari, DAY 1 = 21 NOV 2026.
- Kilau lencana emas tidak lagi menganimasikan `box-shadow` (recalc style Studio 207 → 28 ms/detik, emulasi CPU 4×).
- Lima `AudioContext` menjadi satu, ditahan saat aplikasi di latar belakang.
- Teks lima halaman, self-check, kunci penyimpanan, Service Worker dan mode offline tidak berubah.

## KEPUTUSAN PENGGUNA
- Aturan potongan foto akun (`06-avatar-ring.css`) **DIAKTIFKAN** untuk semua akun setelah melihat gambar perbandingan (build .6): logo Zona Asumsi tampil utuh; akun lain bergeser beberapa persen.

## BELUM DIKERJAKAN
1. **Penyempurnaan visual:** pemeriksaan teks bertumpuk/terpotong, kontras, dan tata letak di layar 320 px dan 360 px belum dilakukan.
2. **Audit ulang keamanan data:** konflik penyimpanan, risiko kehilangan data, dan skenario beberapa tab di build ini belum diaudit ulang (mengandalkan audit build .3 dan sebelumnya; penulisan dari tab basi pada Akun Hub dan Milestone baru diperiksa lewat kode).
3. **Uji perhitungan banyak tanggal:** build .5 diuji pada satu jam terkunci (11 NOV); pengujian 8 skenario tanggal dilakukan di build .2 dan belum diulang.
4. **Animasi ambient Karier:** masih memberi beban gaya sekitar 196 ms/detik pada emulasi 4× (UFO memakai `left`, planet memakai `filter`); berjalan satu putaran di mode hemat lalu berhenti. Dibiarkan karena mengubahnya mengubah tampilan.
5. **Berkas besar belum dipecah:** `12-app-core-intro-canvas.js` (195 KB), `03-components.css` (182 KB), `index.html` (237 KB). Memecah saja tidak mempercepat; perlu pemuatan bertahap yang berisiko dan butuh uji khusus.

## BELUM TERUJI (tidak dapat diuji di lingkungan kerja ini)
- HP Android sungguhan, termasuk layar kecil dan perangkat berspesifikasi rendah (angka performa hanya emulasi).
- Firebase/Cloud Sync dan **Firestore Rules** (tidak ada di repositori; keamanan cloud bergantung padanya).
- Kualitas suara; jalur suara Official History (`06`) dan centang harian (`10`) hanya diganti secara mekanis.
- Pembaruan Service Worker pada perangkat yang sudah memasang build lama (buka sekali dengan koneksi, lalu muat ulang).
- Unggah ke GitHub Pages sungguhan: seret FOLDER-nya, bukan file ZIP.

## SENGAJA TIDAK DIUBAH
- Lima timer polling (`33`, `34`, `35`, `37`, `38`): biaya skrip saat diam hanya 4–20 ms/detik dan sudah hanya menulis tampilan saat nilai berubah.
