# Arsitektur LMS Kepemiluan — *Tiered Facilitation Model* (KPU)

Dokumen ini menjabarkan **arsitektur sistem pembelajaran (LMS)** untuk pengembangan
kompetensi **Komisioner KPU**, sebagai operasionalisasi *Policy Brief* **"Tiered
Facilitation Model: Kerangka Strategis Pengembangan Kompetensi Komisioner KPU"**
(Pusat Pembelajaran dan Strategi Kebijakan, Talenta ASN Nasional).

Arsitektur dirancang **berjenjang (*tiered*)**, **berkelanjutan**, **non-hierarkis**,
dan **berbasis kesukarelaan** — selaras rekomendasi kebijakan — serta dikemas sebagai
**Progressive Web App (PWA)** *offline-first*. Kerangka fitur LMS (Course → Chapter →
Lesson → Quiz → Batch → Certificate) mengadopsi pola **[Frappe LMS](https://github.com/frappe/lms)**
yang dipetakan ke alur 7 tahap dan 3 jenjang komisioner.

---

## 1. Tujuan & Prinsip Desain

| Prinsip (dari Policy Brief) | Wujud dalam arsitektur |
| --- | --- |
| **Berjenjang** (*tiered*) | 3 *learning path* sesuai jenjang: KPU RI, Provinsi, Kab/Kota. Tahap 2 dipersonalisasi per jenjang. |
| **Berkelanjutan** (sepanjang masa jabatan) | Alur 7 tahap dari *induction* (awal jabatan) → *exit reflection* (akhir jabatan). |
| **Non-hierarkis** | *Peer learning* & *mentoring* kolektif; komisioner = pembelajar **dan** sumber pengetahuan. |
| **Kesukarelaan & independensi** | Tanpa relasi komando; fasilitator sebagai *critical partner*, bukan pengawas/evaluator. |
| **Terintegrasi manajemen pengetahuan** | **Bank Kasus** kepemiluan sebagai memori institusional lintas periode. |
| **Evaluasi berbasis dampak** | Indikator kinerja kelembagaan, bukan sekadar penyelesaian aktivitas. |

---

## 2. Model Berjenjang (*Tiered Facilitation*)

```
┌──────────────────────── TIER 1 · KPU RI (Pusat) ────────────────────────┐
│  Fokus: Kepemimpinan strategis & visioner                               │
│  Desain kebijakan nasional · data pemilih skala besar · penetapan hasil │
│  · manajemen krisis · komunikasi publik nasional                        │
│  Fasilitator: Mantan Komisioner Pusat · Akademisi · DKPP/MK · Internasional
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────── TIER 2 · KPU/KIP Provinsi ───────────────────────────┐
│  Fokus: Kepemimpinan operasional regional                               │
│  Sinkronisasi pusat–daerah · konflik regional · koordinasi lintas kab/kota
│  Fasilitator: Mantan Komisioner · Akademisi · Fasilitator Lokal         │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────── TIER 3 · KPU/KIP Kabupaten/Kota ─────────────────────┐
│  Fokus: Kepemimpinan operasional lapangan                               │
│  Logistik · pemutakhiran data pemilih · dinamika sosial-politik lokal   │
│  Fasilitator: Akademisi · DKPP/MK · Fasilitator Lokal                   │
└─────────────────────────────────────────────────────────────────────────┘
```

Jenjang bersifat **non-hierarkis**: bukan tangga promosi, melainkan **perbedaan
kewenangan & kompleksitas**. Materi yang sama (mis. etika, manajemen krisis) hadir di
semua jenjang dengan kedalaman/konteks berbeda.

---

## 3. Alur Pembelajaran — 7 Tahap

Tiap tahap = *Chapter* besar berisi **modul** (Course) → **materi** (Lesson) → **kuis**.

| Tahap | Nama | Waktu | Inti |
| --- | --- | --- | --- |
| **1** | Orientasi & Evaluasi Mandiri | Awal jabatan | *Induction* + **self-assessment** kompetensi (baseline). |
| **2** | Penguatan Kompetensi Strategis **sesuai Jenjang** | Inti | **Dipersonalisasi per tier** (lihat §2). |
| **3** | *Peer Learning* & *Mentoring* Kolektif | Berkelanjutan | Refleksi dilema kebijakan, non-hierarkis. |
| **4** | Etika, Integritas & Independensi | Poros utama | Klinik etika, difasilitasi DKPP/MK. |
| **5** | Pembelajaran Adaptif (*E-Learning* & Inovasi) | *On-demand* | Teknologi pemilu, disinformasi, tren global. |
| **6** | Integrasi Manajemen Pengetahuan | Berkelanjutan | Kontribusi **Bank Kasus**. |
| **7** | Refleksi Akhir & *Peer Review* | Akhir jabatan | Peta kompetensi **akhir** + transfer pengetahuan. |

---

## 4. Model Data (Domain)

Dipetakan dari konsep Frappe LMS ke domain kepemiluan:

```
Tier (Jenjang)                 ← Audience / Cohort
 └─ LearningPath (7 Stages)    ← Course pathway
     └─ Stage                  ← Chapter
         └─ Module             ← Course/Sub-course   (Tahap 2: per-tier)
             ├─ Lesson         ← Lesson  {baca|video|refleksi|diskusi|studi-kasus}
             └─ Quiz           ← Quiz    {soal[], kunci, ambang 70%}

CompetencyFramework (8 domain) ← skill matrix  (self-assessment awal/akhir → radar)
Facilitator (5 tipe)           ← Instructor    (critical partner, per-tier)
CaseBank (praktik-baik|gagal)  ← Knowledge Mgmt (memori institusional, kontribusi)
ImpactEvaluation (5 indikator) ← Outcome eval   (sebelum/sesudah → Δ kinerja kelembagaan)
Certificate                    ← Certificate    (syarat: alur 100% + kuis lulus + dll)
```

**Penyimpanan (prototipe):** seluruh *state* peserta (`tier`, `done`, `kuis`, `komp`,
`dampak`, `kasus`) disimpan di `localStorage` (`lms_kpu_v1`) — *offline-first*, tanpa
backend. Lihat §7 untuk jalur produksi.

---

## 5. Arsitektur Aplikasi (PWA)

```
public/lms-kpu/
├── index.html          App shell + registrasi service worker
├── styles.css          Desain sistem (tokens, komponen, cetak sertifikat)
├── data.js   ┐         Kurikulum: TIERS, KOMPETENSI, FASILITATOR, DAMPAK,
│            │          STAGES (7), BANK_KASUS_SEED  → window.LMS
├── app.js    ┘         Engine + UI: router tab, progres, kuis, radar, modal
├── manifest.json       Metadata PWA (installable, standalone)
├── service-worker.js   Cache app-shell (network-first, fallback offline)
└── icons/              Ikon adaptif (SVG + PNG 192/512)
```

- **Tanpa framework / build step** — *vanilla* JS, sejalan sub-aplikasi KPU lain di repo
  ini (`perencanaan-kpu`, `event-attendance`). Ringan, mudah diaudit, dan stabil di
  perangkat pemerintah beragam.
- **Render** berbasis *template literal* + delegasi event; satu sumber kebenaran `S`
  (state) yang di-*persist* tiap perubahan.
- **PWA**: *installable* (Add to Home Screen), berjalan *standalone*, materi & app-shell
  tersedia **offline** setelah kunjungan pertama (cocok untuk daerah konektivitas rendah).

### Strategi *Offline / Service Worker*
`network-first` untuk app-shell (selalu versi terbaru saat *online*; *cache* sebagai
*fallback* saat *offline*). `CACHE_VERSION` di-*bump* tiap rilis untuk invalidasi.

---

## 6. Komponen Fungsional (Tab)

| Tab | Fungsi | Tahap terkait |
| --- | --- | --- |
| 🏠 **Beranda** | Ringkasan progres alur, *continue learning*, prinsip model | — |
| 🪜 **Alur 7 Tahap** | Daftar tahap → modul → materi (+kuis), tandai selesai, refleksi | 1–7 |
| 🎯 **Kompetensi** | Self-assessment 8 domain (awal vs akhir) → **radar** pertumbuhan | 1 & 7 |
| 🗂️ **Bank Kasus** | Praktik baik & kegagalan; kontribusi kolektif (memori institusional) | 6 |
| 🤝 **Fasilitator** | Direktori 5 tipe fasilitator + relevansi per jenjang | semua |
| 📊 **Evaluasi Dampak** | 5 indikator dampak (sebelum/sesudah) → Δ kinerja kelembagaan | 7 |
| 🏅 **Sertifikat** | Syarat penyelesaian + sertifikat cetak/PDF | 7 |

---

## 7. Jalur Produksi & Integrasi (Roadmap)

Prototipe ini *frontend-only*. Untuk implementasi kelembagaan:

1. **Backend LMS** — adopsi **Frappe LMS** (open source) sebagai sistem inti:
   *Course*, *Batch* (kohort per periode jabatan), *Enrollment*, *Progress*, *Quiz*,
   *Assignment*, *Certificate*, *Discussion*. PWA ini menjadi *front-end* kustom /
   *headless client* via REST API Frappe.
2. **SSO & Identitas** — integrasi akun resmi KPU (mis. *single sign-on* internal) dengan
   peran: Komisioner (per jenjang), Fasilitator, Admin Pusbang.
3. **Manajemen Pengetahuan** — Bank Kasus terhubung ke repositori dokumen resmi
   (praktik baik, kegagalan kebijakan, putusan sengketa MK/DKPP) dengan kurasi & retensi.
4. **Evaluasi Dampak** — tautkan indikator ke data kelembagaan (tren sengketa
   administratif, survei kepercayaan publik) untuk evaluasi *outcome*, bukan output.
5. **Privasi & Independensi** — data pembelajaran komisioner bersifat **reflektif &
   sukarela**; akses fasilitator dibatasi sebagai *critical partner*, bukan penilai
   kinerja, untuk menjaga independensi (sesuai amanat Policy Brief).
6. **Sertifikasi** — opsi pengembangan menjadi instrumen **sertifikasi calon
   penyelenggara pemilu** (sesuai gagasan di Policy Brief), dengan TTE & verifikasi.

---

## 8. Pemetaan ke Policy Brief (Telusur)

| Rekomendasi Policy Brief | Realisasi arsitektur |
| --- | --- |
| Alur berjenjang & berkelanjutan | §2 (3 tier) + §3 (7 tahap) |
| Integrasi manajemen pengetahuan; bank kasus | Tab **Bank Kasus** (§6), `BANK_KASUS_SEED` |
| Evaluasi **berbasis dampak** kelembagaan | Tab **Evaluasi Dampak** (5 indikator) |
| Netralitas & independensi; fasilitator independen | Model **Fasilitator** = *critical partner* (§6) |
| Self-assessment & refleksi (kesadaran profesional) | **Kompetensi** (radar) + materi refleksi |
| Replikasi lintas periode tanpa kehilangan pengetahuan | *Cohort/Batch* (§7) + Bank Kasus |

> Prototipe edukatif. Konten, nama fasilitator (sebagai peran), dan studi kasus disusun
> ulang untuk pembelajaran; verifikasi terhadap regulasi & data resmi sebelum penggunaan
> kelembagaan.
