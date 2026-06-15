# Arsitektur Aplikasi **SAE SURVEI**

> **Smart Analytics & Evaluation for Survey, Reputation, Value, Engagement, and Index**
>
> Platform survei digital berbasis **Web/PWA** yang mengotomatisasi pengukuran
> kepuasan, persepsi, *engagement*, dan indeks organisasi — lalu menyajikannya
> sebagai **dashboard analitik** dan **laporan otomatis** secara *real-time*.

Dokumen ini adalah cetak biru (*blueprint*) arsitektur SAE SURVEI sebagai bagian
dari ekosistem tata kelola digital KPU (bersama **SAE PISAN**, **SAE RAPAT**,
**SAE NASKAH**, dan **SAE PERENCANAAN** — lihat `public/perencanaan-kpu/`).

---

## 1. Tujuan Sistem

Menggantikan proses survei manual (Google Form + Excel + pengolahan statistik
terpisah) menjadi **satu platform terintegrasi** yang menghasilkan:

| Kategori | Output |
| -------- | ------ |
| **Pelayanan Publik** | IKM (Indeks Kepuasan Masyarakat), SKM, NPS (Net Promoter Score) |
| **SDM / Internal** | Survei Pegawai, Employee Satisfaction Index, Employee Engagement Index |
| **Tata Kelola** | Survei Integritas, Integrity/Ethics/Governance Index, Survei Reformasi Birokrasi |
| **Stakeholder** | Survei Stakeholder, Stakeholder Trust Index |
| **Organisasi** | Survei Kepemimpinan (Leadership Index), Survei Budaya Organisasi (Culture Index), Change Readiness Index |
| **Penyajian** | Dashboard Real-Time, Laporan PDF/Word/PPTX otomatis |

---

## 2. Arsitektur High-Level

```
┌──────────────────────┐
│      RESPONDEN        │
│  HP / Tablet / PC     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      PWA Frontend     │
│   Next.js / React     │
└──────────┬───────────┘
           │
           ▼
┌───────────────────────────────────────┐
│             API Gateway                │
└──────┬───────────┬───────────┬─────────┘
       │           │           │
       ▼           ▼           ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Survey Core │ │  AI Engine  │ │  Analytics  │
│   Service   │ │   Service   │ │   Service   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────┬───────┴───────┬───────┘
               ▼               ▼
       ┌───────────────────────┐
       │  PostgreSQL Database   │
       └───────────┬───────────┘
                   ▼
       ┌───────────────────────┐
       │    Data Warehouse     │
       └───────────┬───────────┘
                   ▼
       ┌───────────────────────┐
       │ Dashboard & Reporting │
       └───────────────────────┘
```

### Tanggung Jawab Layanan

| Layanan | Tanggung Jawab |
| ------- | -------------- |
| **API Gateway** | Routing, autentikasi/otorisasi (JWT/SSO), *rate-limit*, isolasi *tenant* |
| **Survey Core Service** | CRUD survei, *survey builder*, distribusi, koleksi jawaban, *branching logic* |
| **AI Engine Service** | *Sentiment analysis*, *topic clustering*, *recommendation generator*, *report writer* |
| **Analytics Service** | Perhitungan indeks (IKM/SKM/NPS/Engagement), agregasi, *trend*, ekspor |
| **PostgreSQL** | Basis data transaksional (OLTP) multi-tenant |
| **Data Warehouse** | Penyimpanan analitik historis (OLAP) untuk dashboard & laporan |

---

## 3. Modul Utama

### A. Survey Builder
Membuat survei **tanpa coding**, *drag & drop*.

- Jenis pertanyaan: **Likert Scale**, **Rating Bintang**, **Pilihan Ganda**,
  **Isian Singkat**, **Upload Dokumen**, **Matrix Question**.
- **Branching Logic** — contoh: `jika nilai layanan < 3 → tampilkan pertanyaan keluhan`.

### B. Survey Distribution
Distribusi multi-kanal: **QR Code**, **Link**, **Email**, **WhatsApp**,
**SMS Gateway**, **Kiosk Mode**.

```
Pelayanan selesai → QR otomatis muncul → Responden scan → Mengisi survei
```

### C. Survei Pegawai (Internal)
Variabel: kepuasan kerja, kesejahteraan, *work-life balance*, kepemimpinan,
komunikasi organisasi, budaya kerja, *employee engagement*.
→ Output: **Employee Engagement Index**.

### D. Survei Stakeholder
Untuk mitra kerja, vendor, akademisi, media, pemilih, peserta pemilu.
→ Output: **Stakeholder Trust Index**.

### E. IKM / SKM Engine
Mengacu regulasi **Kementerian PANRB**. Perhitungan otomatis:

```
Nilai Persepsi → NRR (Nilai Rata-rata Tertimbang) → Konversi 25–100 → Kategori Mutu
```

| Nilai Konversi | Mutu | Kategori |
| -------------- | ---- | -------- |
| 88,31 – 100,00 | **A** | Sangat Baik |
| 76,61 – 88,30 | **B** | Baik |
| 65,00 – 76,60 | **C** | Kurang Baik |
| 25,00 – 64,99 | **D** | Tidak Baik |

---

## 4. AI Analytics Engine

| Kapabilitas | Deskripsi | Contoh |
| ----------- | --------- | ------ |
| **Sentiment Analysis** | Mengklasifikasi komentar responden | *"Pelayanan cepat tetapi ruang tunggu kurang nyaman"* → ✅ Pelayanan cepat · ❌ Ruang tunggu |
| **Topic Clustering** | Mengelompokkan isu | Antrian · Petugas · Website · Fasilitas · Informasi |
| **Recommendation Generator** | Rekomendasi tindak lanjut berprioritas | Keluhan fasilitas naik 25% → 1) Perbaikan ruang tunggu, 2) Penambahan kursi, 3) Penambahan AC |

**Lapisan AI:** OpenAI API (cloud) atau **Ollama / Claude via Edge Function**
(on-premise) — sejalan dengan pola `pustaka-ai` & `perencanaan-ai` pada repo ini
(kunci API disimpan di server, bukan di klien).

---

## 5. Dashboard Analitik

- **Dashboard Eksekutif** — Nilai IKM, jumlah responden, *trend* bulanan, unit terbaik & terburuk.
- **Dashboard Pimpinan** — *heatmap* seluruh unit (mis. Bidang A 89 · B 76 · C 91 · D 80).
- **Dashboard Operasional** — analisis per pertanyaan · per unit · per jabatan · per wilayah · per periode.

---

## 6. AI Report Generator

Satu klik → **PDF** (executive summary, grafik, analisis, rekomendasi),
**Word** (siap ditandatangani), dan **PowerPoint** (untuk rapat pimpinan).

---

## 7. Multi-Tenant

Satu server, banyak pelanggan, **data terisolasi** per instansi —
contoh: *KPU Jawa Barat · KPU Kabupaten Bandung · KPU Kota Bekasi · KPU Ciamis*.

Isolasi dapat diterapkan via *row-level security* (kolom `tenant_id`) atau
*schema-per-tenant* di PostgreSQL, dengan penegakan di **API Gateway**.

---

## 8. Integrasi Ekosistem SAE

| Integrasi | Pemicu | Hasil |
| --------- | ------ | ----- |
| **SAE PISAN** | Setelah presensi kegiatan | Peserta menerima survei otomatis |
| **SAE RAPAT** | Setelah rapat | Evaluasi rapat otomatis |
| **SAE NASKAH** | Laporan survei selesai | Otomatis menjadi nota dinas / laporan pimpinan |
| **SAE PERENCANAAN** | Hasil survei | Menjadi dasar penyusunan program & indikator kinerja |

---

## 9. Teknologi yang Direkomendasikan

| Lapisan | Pilihan |
| ------- | ------- |
| **Frontend** | Next.js · React · Tailwind · PWA |
| **Backend** | NestJS · FastAPI |
| **Database** | PostgreSQL |
| **AI Layer** | OpenAI API · Ollama (on-premise) · Claude (via Edge Function) |
| **Dashboard / BI** | Metabase · Apache Superset |

---

## 10. Indeks yang Dapat Dihasilkan

- **Pelayanan Publik:** IKM · SKM · NPS
- **SDM:** Employee Satisfaction Index · Employee Engagement Index
- **Tata Kelola:** Integrity Index · Ethics Index · Governance Index
- **Organisasi:** Culture Index · Leadership Index · Change Readiness Index

---

## 11. Paket Produk

| Paket | Cakupan | Harga (indikatif) |
| ----- | ------- | ----------------- |
| **SAE SURVEI BASIC** | IKM · QR Survey · Dashboard | Rp 15–25 juta/tahun |
| **SAE SURVEI PRO** | Multi-survei · AI Analytics · PDF otomatis | Rp 40–75 juta/tahun |
| **SAE SURVEI ENTERPRISE** | Multi-instansi · Data Warehouse · AI Insight · SSO | Rp 100–250 juta/tahun |

---

## 12. Potensi Pasar

Hampir setiap instansi **wajib** melakukan pengukuran kepuasan layanan, kepuasan
pegawai, evaluasi kegiatan, dan survei stakeholder secara berkala. Integrasi
dengan **SAE PISAN**, **SAE RAPAT**, **SAE NASKAH**, dan **SAE PERENCANAAN**
membentuk **ekosistem tata kelola digital** yang saling terhubung — dari
pengukuran, analisis, rekomendasi, hingga perencanaan tindak lanjut.

---

> _Dokumen arsitektur — draf awal. Angka pagu/harga bersifat indikatif._
