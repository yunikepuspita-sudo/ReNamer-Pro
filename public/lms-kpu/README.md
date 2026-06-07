# 🎓 SiPINTER KPU — *Election Knowledge & Competency Platform*

**SiPINTER KPU** (*Sistem Pembelajaran Integratif, Terstruktur & Berjenjang*) — alias
**ELSA** (*Election Learning & Succession Academy*) — adalah platform yang **bukan sekadar
e-learning**, melainkan mengintegrasikan **pembelajaran + sertifikasi + knowledge
management + succession planning** secara **berjenjang** bagi penyelenggara pemilu hingga
masyarakat.

Berbasis *Policy Brief* **"Tiered Facilitation Model"**; core LMS terinspirasi
**[Frappe LMS](https://github.com/frappe/lms)**. Dikemas sebagai **PWA *offline-first***
(vanilla JS, data di `localStorage`), diakses di `/lms-kpu/`.

> 📐 Blueprint lengkap: **[`ARCHITECTURE.md`](./ARCHITECTURE.md)** · juga tersedia sebagai
> tab **🏗️ Arsitektur** di dalam aplikasi.

## ✨ Kapabilitas

- **Tiered Competency Engine (10 tier)** — Komisioner KPU RI · Provinsi · Kab/Kota ·
  Sekretariat Provinsi · Sekretariat Kab/Kota · PPK · PPS · KPPS · Relawan Demokrasi ·
  Masyarakat Umum. Alur menyesuaikan kedalaman per kelompok jenjang.
- **Tiered Facilitation Model — alur 7 tahap** — Orientasi & Self-Assessment → Penguatan
  Kompetensi **sesuai Jenjang** → Peer Learning → Etika & Integritas → Pembelajaran Adaptif
  → Manajemen Pengetahuan → Refleksi Akhir & Peer Review.
- **Knowledge Management** — Bank Kasus Sengketa · Putusan DKPP/MK · PKPU/JDIH · Best
  Practice · Lesson Learned · Digital Library · FAQ, dengan **pencarian** & **kontribusi**.
- **AI Learning Assistant** — *offline* (RAG ringan atas Knowledge Base) **+ live Claude**
  via Supabase Edge Function (`lms-ai`) atau Anthropic langsung. Tanya regulasi/tahapan/sengketa.
- **Certification & Talent** — CPD Point · Digital Badge · Sertifikat Kompetensi ·
  **Talent Pool & Succession Planning** (skor talenta + leadership pipeline).
- **Analytics Center** — learning dashboard · heatmap kompetensi · **evaluasi berbasis
  dampak** · predictive talent analytics.
- **Peta Kompetensi** — self-assessment 8 domain (awal vs akhir) divisualkan **radar**.

## 🗂️ Struktur

```
lms-kpu/
├── index.html          # app shell + service worker
├── styles.css          # desain sistem
├── data.js             # kurikulum 10 tier, 7 tahap, Knowledge Base, metadata arsitektur
├── ai.js               # AI Assistant: offline (RAG) + live Claude
├── app.js              # engine + UI (9 tab)
├── manifest.json       # PWA installable
├── service-worker.js   # cache app-shell (offline-first)
├── icons/              # ikon adaptif
├── ARCHITECTURE.md     # blueprint platform (pemetaan ke Policy Brief)
└── README.md
```

Edge Function AI: `supabase/functions/lms-ai/index.ts` (relay Claude, kunci di server).

## 🤖 Mengaktifkan AI Live (opsional)

Tanpa konfigurasi, AI Assistant tetap menjawab dari Knowledge Base (offline). Untuk live:

1. Deploy edge function: `supabase functions deploy lms-ai --no-verify-jwt`
2. Set secret `ANTHROPIC_API_KEY` di Supabase.
3. Di app: tab **AI Assistant → ⚙️ Pengaturan** → pilih *Edge*, isi URL function.

## 🚀 Menjalankan

```bash
npm run dev      # http://localhost:5173/lms-kpu/
npm run build    # ikut ter-build ke dist/lms-kpu/
```

## 🔒 Catatan

Prototipe **edukatif & non-komersial**. Kutipan kasus/angka & nama fasilitator (sebagai
peran) disusun ulang untuk pembelajaran — verifikasi ke sumber resmi (JDIH KPU, DKPP, MK)
sebelum penggunaan kelembagaan. Data tersimpan **lokal di perangkat** (sukarela & reflektif)
untuk menjaga independensi penyelenggara.
