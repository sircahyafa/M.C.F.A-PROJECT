# Sistem Data

Penyimpanan utama: **localStorage** perangkat. Cloud: **Firebase Auth + Firestore** (koleksi `backups`, 1 dokumen per pengguna, skema cloud = 1, batas aman payload ±950 KB). Tidak ada private key di repositori; konfigurasi web Firebase bersifat publik dan keamanannya bergantung pada Firestore Rules (tidak ada di repositori — lihat TESTING.md).

## Kunci localStorage (hasil pemindaian kode)
| Kunci | Isi |
|---|---|
| `mcfa_adp_v1_<YYYY-MM-DD>` | checklist Program Adaptasi per hari (terpisah dari Kegiatan Sehari-hari) |
| `mcfa_adp_prod_v1` | produksi konten Adaptasi: `days[tanggal][akun][1] = {t, s:{tahap:tanggal}}` |
| `mcfa_adpk_log_v1`, `_prev` | log lama jadwal konten bertahap (dipertahankan; tidak lagi dirender) |
| `mcfa_adpk_v1`, `mcfa_backup_pre_adaptasi_v1` | konfigurasi lama & salinan pengaman |
| `mcfa_konten_<akun>` | daftar konten per akun (status, tanggal, riwayat, `src` penanda asal Adaptasi) |
| `mcfa_tahap1_<akun>` | followers, subscribers, target, riwayat per akun |
| `mcfa_akun_hub_v1` | pemetaan kategori akun |
| `mcfa_kpc_info_v1` | catatan isian sendiri profil KP.CIHUY: `{notes:{kunci:teks}, upd:{kunci:ISO}}` (maks 1.200 karakter per kartu) |
| `ba_*` | checklist Kegiatan Sehari-hari |
| `fin_ledger_v1`, `fin_milestones_v1`, `mcfa_usd_rate_v1` | Keuangan: transaksi/saldo, pencapaian, kurs |
| `mcfa_reno_v1` | renovasi studio |
| `mcfa_person_*`, `avatar_*` | foto & data personal |
| `mcfa_fx`, `mcfa_fx_prefs_v1`, `mcfa_sfx`, `fathul_light_v1`, `mcfa_pwa_dismissed`, `oh*` | preferensi tampilan/suara |
| `mcfa_cloud_seen`, `mcfa_pre_import_snapshot` | penanda sinkron & salinan pengaman (tidak ikut ekspor/cloud) |
| `mcfa_career_ach_v1` | riwayat pencapaian Karier: `{v:1, items:{"akun|metrik|tahap":{id,m,n,events:[{t,type:'tercapai'\|'dikoreksi',value,target,src}]}}}` (append-only; ikut ekspor/cloud) |
| `mcfa_data_version_v1` | versi struktur data (lokal perangkat; tidak ikut ekspor/cloud) |
| `mcfa_pre_migration_snapshot_v1` | salinan pengaman sebelum migrasi (lokal; tidak ikut ekspor/cloud) |
| `mcfa_quarantine_v1` | salinan data rusak `[{k, why, at, raw}]` (lokal; aslinya tidak diubah) |

| `mcfa_tugasAwalHarian_v1` | Tugas Awal skema v5: `{v:5, s:{t1:{id:true}, t2:{id:true}}}` (Tahap 1 = 14 NOV, Tahap 2 = 20 NOV 2026; checklist terpisah) |
| `mcfa_tugasAwal_arsip_v4` | salinan pengaman data Tugas Awal skema lama (1–13 NOV, dihapus dari data aktif; tidak dirender/dihitung) |
| `mcfa_tugasAwal_rusak_v5` | salinan data Tugas Awal yang tidak terbaca (bila ada) |

## Hubungan data
Aktivitas (Kegiatan Sehari-hari) → Program Adaptasi (`MCFA_ADP`) → Produksi Konten (`MCFA_ADPP`) → jembatan (`MCFA_T6.sync`) → `mcfa_konten_<akun>` (status "Siap Upload") → centang "Sudah Diupload" (≥ 21 Nov 2026) → `MCFA_STUDIO.actual()` → Karier & Dashboard. Statistik membaca satu sumber (`MCFA_STUDIO`); tidak ada angka tertulis terpisah.

## Versi struktur data
`MCFA_MIGRATE.SCHEMA = 2`. v1 = struktur sampai build 20261109.13 (tanpa penanda). v2 = penanda versi + normalisasi `mcfa_tahap1_*` + `mcfa_career_ach_v1` + karantina. Migrasi berjalan hanya bila ada pekerjaan, selalu didahului salinan pengaman dan divalidasi sesudahnya (gagal → dikembalikan). Tidak ada penghapusan data. Detail: `00-data-migration.js` dan CHANGELOG 20261109.14.

## Backup, migrasi, konflik
- Ekspor/Impor JSON (`{app:'MCFA', schema:1, dataSchema:2, data:{…}}`; `dataSchema` lebih baru dari aplikasi → ditolak, tanpa `dataSchema` = cadangan lama, diterima) dengan validasi struktur dan salinan pengaman otomatis sebelum menimpa.
- Cloud: pemulihan juga membuat salinan pengaman; backup otomatis tidak menimpa cloud yang lebih baru dari yang terakhir dilihat perangkat.
- Migrasi `_getKonten` menambah field baru tanpa menghapus data lama. Tidak ada data lama yang dihapus oleh rilis ini.

## Aturan tulis lintas-tab (build 20261110.8)
Modul yang menyimpan seluruh objek (Tugas Awal, Kegiatan Harian, Kehidupan, Buku Keuangan, Milestone, Akun Hub) WAJIB membaca ulang penyimpanan sebelum mengubah & menulis, lalu menyelaraskan tampilan lewat event `storage`. Penghapusan nilai pada objek yang digabung memakai `null` (bukan `delete`) — contoh: `mcfa_akun_hub_v1.group[akun] = null` = kembali ke kategori bawaan.
