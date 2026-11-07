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

## Hubungan data
Aktivitas (Kegiatan Sehari-hari) → Program Adaptasi (`MCFA_ADP`) → Produksi Konten (`MCFA_ADPP`) → jembatan (`MCFA_T6.sync`) → `mcfa_konten_<akun>` (status "Siap Upload") → centang "Sudah Diupload" (≥ 21 Nov 2026) → `MCFA_STUDIO.actual()` → Karier & Dashboard. Statistik membaca satu sumber (`MCFA_STUDIO`); tidak ada angka tertulis terpisah.

## Backup, migrasi, konflik
- Ekspor/Impor JSON (`{app:'MCFA', schema:1, data:{…}}`) dengan validasi struktur dan salinan pengaman otomatis sebelum menimpa.
- Cloud: pemulihan juga membuat salinan pengaman; backup otomatis tidak menimpa cloud yang lebih baru dari yang terakhir dilihat perangkat.
- Migrasi `_getKonten` menambah field baru tanpa menghapus data lama. Tidak ada data lama yang dihapus oleh rilis ini.
