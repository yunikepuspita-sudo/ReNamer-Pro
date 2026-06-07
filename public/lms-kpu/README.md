# 🎓 LMS Kepemiluan — *Tiered Facilitation Model* (KPU)

**Learning Management System berjenjang** untuk pengembangan kompetensi **Komisioner
KPU**, mengoperasionalkan *Policy Brief* **"Tiered Facilitation Model: Kerangka Strategis
Pengembangan Kompetensi Komisioner KPU"**.

Aplikasi **PWA *offline-first*** (vanilla JS, tanpa backend — data tersimpan di
`localStorage`), dapat diakses di `/lms-kpu/` dan dipasang ke layar utama (Add to Home
Screen). Kerangka fitur LMS terinspirasi **[Frappe LMS](https://github.com/frappe/lms)**.

> 📐 Detail arsitektur lengkap: **[`ARCHITECTURE.md`](./ARCHITECTURE.md)**.

## ✨ Inti

- **Berjenjang (3 tier)** — pilih jenjang Anda; modul **Tahap 2 dipersonalisasi**:
  - **KPU RI (Pusat)** — kepemimpinan strategis & visioner (kebijakan nasional, krisis).
  - **KPU/KIP Provinsi** — operasional regional (sinkronisasi pusat–daerah, koordinasi).
  - **KPU/KIP Kabupaten/Kota** — operasional lapangan (logistik, data pemilih, lokal).
- **Alur 7 tahap** — Orientasi & Self-Assessment → Penguatan Kompetensi sesuai Jenjang →
  Peer Learning → Etika & Integritas → Pembelajaran Adaptif → Manajemen Pengetahuan →
  Refleksi Akhir & Peer Review.
- **Peta Kompetensi** — self-assessment 8 domain (awal vs akhir) divisualkan **radar**.
- **Bank Kasus Kepemiluan** — memori institusional: praktik baik & kegagalan kebijakan;
  peserta dapat **berkontribusi** (lintas periode).
- **Fasilitator** — direktori 5 tipe *critical partner* (mantan komisioner, akademisi,
  DKPP/MK, praktisi internasional, fasilitator lokal) + relevansi per jenjang.
- **Evaluasi berbasis dampak** — 5 indikator kinerja kelembagaan (sebelum/sesudah).
- **Kuis** (ambang lulus 70%) & **Sertifikat penyelesaian** (cetak/PDF).

## 🗂️ Struktur

```
lms-kpu/
├── index.html          # app shell + service worker
├── styles.css          # desain sistem + cetak sertifikat
├── data.js             # kurikulum (window.LMS): tier, kompetensi, 7 tahap, kasus
├── app.js              # engine + UI (tab, progres, kuis, radar, modal)
├── manifest.json       # PWA installable
├── service-worker.js   # cache app-shell (offline-first)
├── icons/              # ikon adaptif
├── ARCHITECTURE.md     # dokumen arsitektur (pemetaan ke Policy Brief)
└── README.md
```

## 🚀 Menjalankan

Bagian dari repo E-Pustaka Pemilu (folder `public/`):

```bash
npm run dev      # buka http://localhost:5173/lms-kpu/
npm run build    # ikut ter-build ke dist/lms-kpu/
```

Atau buka `index.html` langsung lewat *static server* apa pun.

## 🔒 Catatan

Prototipe **edukatif & non-komersial**. Nama fasilitator bersifat **peran** (bukan
individu); studi kasus disusun ulang untuk pembelajaran. Verifikasi terhadap regulasi &
data resmi sebelum penggunaan kelembagaan. Data pembelajaran tersimpan **lokal di
perangkat** (sukarela & reflektif) untuk menjaga independensi komisioner.
