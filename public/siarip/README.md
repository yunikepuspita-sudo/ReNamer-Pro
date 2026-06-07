# SIARIP KPU — PWA Prototipe

**SIARIP** (Sistem Informasi Arsip Digital dan Retensi) KPU — aplikasi web progresif
(PWA) mandiri untuk digitalisasi, klasifikasi, penyimpanan, pencarian, retensi, dan
penyusutan arsip elektronik di lingkungan KPU RI, KPU Provinsi, dan KPU Kabupaten/Kota.

Dapat dipasang (Add to Home Screen) dan berjalan **offline** sepenuhnya — tanpa server,
seluruh logika berjalan di perangkat (vanilla JS).

## Dasar hukum yang diacu

- **PKPU No. 17 Tahun 2023** — Jadwal Retensi Arsip KPU
- **PKPU No. 13 Tahun 2019** — JRA Kepegawaian & Keuangan
- **Keputusan KPU No. 57 Tahun 2022** — Kode Klasifikasi Arsip & Pengkodean Naskah Dinas
- **Keputusan KPU No. 1258 Tahun 2024** — Pengelolaan Arsip Terjaga

## Modul

| Menu | Fungsi |
| --- | --- |
| **Beranda** | Dashboard eksekutif/pimpinan: total arsip nasional, progress digitalisasi, gauge, 10 KPI utama, sebaran capaian. |
| **Provinsi** | Dashboard Sekretaris KPU Provinsi: progress per sub bagian + **heatmap** (🟩 >90% · 🟨 70–89% · 🟥 <70%). |
| **Satker** | Ranking digitalisasi 27 KPU Kab/Kota se-Jawa Barat; klik baris untuk rincian (fisik, digital, terjaga, permanen, musnah, retensi habis). |
| **Digitalisasi** | Simulasi alur Scan → OCR → AI Auto-Metadata → QR/Barcode → validasi operator → PDF/A; hasil tersimpan ke Repository. |
| **Repository** | Full-Text Search + filter sub bagian & status; menampilkan kode klasifikasi, ID, status retensi. |
| **Arsip Terjaga** | Gerbang RBAC + MFA (simulasi), enkripsi AES-256, daftar arsip terjaga, audit trail/log akses. |
| **AI Kearsipan** | AI Auto-Metadata + klasifikasi otomatis & **Retensi Checker** (Aktif/Inaktif/Permanen/Musnah berbasis JRA). |
| **Integrasi** | Ekosistem SRIKANDI + E-Office, E-SPPD, E-Kinerja, SIPPBJ, E-Planning, E-Monev, JDIH, Website KPU, serta rekomendasi teknologi. |

## Menjalankan

PWA statis — cukup disajikan oleh web server mana pun.

```bash
# dari root repo
npx serve public        # lalu buka http://localhost:3000/siarip/
# atau via build E-Pustaka
npm run build && npm run preview   # buka /siarip/
```

## Berkas

```
siarip/
├── index.html          # app shell + registrasi service worker
├── styles.css          # tema KPU (biru #1d4ed8)
├── data.js             # seed: subbagian, klasifikasi, JRA, 27 satker, sampel arsip, KPI
├── ai.js               # mesin AI: klasifikasi keyword, auto-metadata, retensi checker
├── app.js              # hash router + seluruh tampilan
├── manifest.json       # metadata PWA (installable)
├── service-worker.js   # cache network-first + fallback offline
└── icons/
    ├── icon.svg            # ikon vektor
    ├── icon-192.png        # ikon PWA
    ├── icon-512.png        # ikon PWA (maskable)
    └── make-icons.cjs      # generator PNG dari pixel (Node, tanpa dependensi)
```

## Catatan

Data bersifat **ilustratif** untuk demonstrasi. Pada produksi:

- OCR digantikan **Tesseract/PaddleOCR**; klasifikasi & metadata oleh **LLM** + **RAG semantic search**.
- Penyimpanan: **PostgreSQL + Elasticsearch**, objek di **MinIO/Object Storage Nasional**.
- Keamanan: **SSO KPU, MFA, enkripsi dokumen, audit trail immutable**.
- Arsip terjaga: enkripsi **AES-256**, RBAC, approval berlapis, log akses (Kep. KPU 1258/2024).

Regenerasi ikon PNG bila ikon diubah:

```bash
node siarip/icons/make-icons.cjs
```
