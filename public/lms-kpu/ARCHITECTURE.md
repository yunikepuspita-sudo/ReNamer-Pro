# Arsitektur SiPINTER KPU — *Election Knowledge & Competency Platform*

**SiPINTER KPU** (*Sistem Pembelajaran Integratif, Terstruktur & Berjenjang*) — alias
**ELSA** (*Election Learning & Succession Academy*) — adalah **Election Knowledge &
Competency Platform** untuk pengembangan kompetensi penyelenggara pemilu secara
**berjenjang (*tiered*)**, **berkelanjutan**, **non-hierarkis**, dan **terintegrasi dengan
manajemen pengetahuan kelembagaan**.

Platform ini **bukan sekadar e-learning**, melainkan mengintegrasikan **pembelajaran +
sertifikasi + knowledge management + succession planning** — selaras rekomendasi *Policy
Brief* **"Tiered Facilitation Model: Kerangka Strategis Pengembangan Kompetensi Komisioner
KPU"** (Pusbang & Strategi Kebijakan, Talenta ASN Nasional). Core LMS mengadopsi
**[Frappe LMS](https://github.com/frappe/lms)** dan dikemas sebagai **PWA offline-first**.

---

## 1. Diagram Arsitektur (Tiered LMS KPU)

```
┌─────────────────────────────────────────────┐
│              PWA FRONTEND                    │
│ Android │ iOS │ Tablet │ Desktop │ Offline  │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│             API GATEWAY                      │
│ REST API │ GraphQL │ SSO KPU │ OAuth2        │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│        CORE LMS ENGINE — Frappe LMS          │
│ Courses │ Learning Path │ Quiz │ Webinar     │
│ Assignment │ Exam │ Certificate              │
└─────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│         TIERED COMPETENCY ENGINE             │
│ Tier 1  Komisioner KPU RI                    │
│ Tier 2  Komisioner KPU Provinsi              │
│ Tier 3  Komisioner KPU Kab/Kota              │
│ Tier 4  Sekretariat Provinsi                 │
│ Tier 5  Sekretariat Kab/Kota                 │
│ Tier 6  PPK    │ Tier 7  PPS │ Tier 8 KPPS   │
│ Tier 9  Relawan Demokrasi                    │
│ Tier 10 Masyarakat Umum                      │
└─────────────────────────────────────────────┘
        │             │              │
        ▼             ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ KNOWLEDGE    │ │ CERTIFICATION│ │ AI LEARNING  │
│ MANAGEMENT   │ │ & TALENT     │ │ ASSISTANT    │
│ Bank Kasus   │ │ Sertifikasi  │ │ Chatbot      │
│ Best Practice│ │ Badge Digital│ │ AI Tutor     │
│ Lesson Learn │ │ CPD Point    │ │ Translator   │
│ Digital Lib  │ │ Talent Pool  │ │ Quiz Gen     │
│ FAQ          │ │ Succession   │ │ Recommendation│
│ AI Sem.Search│ │ Leadership   │ │ Summarizer   │
└──────────────┘ └──────────────┘ └──────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│             ANALYTICS CENTER                 │
│ Learning Dashboard │ Kompetensi Dashboard    │
│ Heatmap Kompetensi │ Predictive Talent       │
│ Kinerja Pembelajaran                         │
└─────────────────────────────────────────────┘
```

> Dalam aplikasi, blueprint ini dapat dilihat langsung pada tab **🏗️ Arsitektur**.

---

## 2. Lapisan Arsitektur (8 Layer)

| Layer | Komponen | Catatan |
| --- | --- | --- |
| **PWA Frontend** | Android · iOS · Tablet · Desktop · *offline-first* | Installable, *standalone*, *service worker*. |
| **API Gateway** | REST · GraphQL · SSO KPU · OAuth2 | Otentikasi & otorisasi peran per tier. |
| **Core LMS Engine** | **Frappe LMS** — Course, Learning Path, Quiz, Webinar, Assignment, Exam, Certificate | Sistem inti pembelajaran (open source). |
| **Tiered Competency Engine** | 10 tier · alur 7 tahap · self-assessment & radar | Personalisasi konten per jenjang. |
| **Knowledge Management** | Bank Kasus, Best Practice, Lesson Learned, Digital Library, FAQ, AI Semantic Search | Memori institusional lintas periode. |
| **Certification & Talent** | Sertifikasi, Badge, CPD Point, Talent Pool, Succession, Leadership Pipeline | Menghubungkan belajar → karier. |
| **AI Learning Assistant** | Chatbot, Tutor, Translator, Quiz Generator, Recommendation, Summarizer | Claude + RAG knowledge base. |
| **Analytics Center** | Learning/Kompetensi Dashboard, Heatmap, Predictive Talent | Evaluasi berbasis dampak. |

---

## 3. Tiered Competency Engine — 10 Tier

Bersifat **non-hierarkis**: bukan tangga promosi semata, melainkan **perbedaan kewenangan
& kompleksitas**. Kedalaman alur (jumlah tahap aktif) menyesuaikan kelompok jenjang.

| Tier | Jenjang | Kelompok | Fokus | Alur aktif |
| --- | --- | --- | --- | --- |
| 1 | Komisioner KPU RI | Komisioner | Strategis & visioner nasional | 7 tahap |
| 2 | Komisioner KPU Provinsi | Komisioner | Operasional regional | 7 tahap |
| 3 | Komisioner KPU Kab/Kota | Komisioner | Operasional lapangan | 7 tahap |
| 4 | Sekretariat Provinsi | Sekretariat | Tata kelola & dukungan teknis | 5 tahap |
| 5 | Sekretariat Kab/Kota | Sekretariat | Administrasi & logistik | 5 tahap |
| 6 | PPK | Badan Ad Hoc | Rekapitulasi kecamatan | 4 tahap |
| 7 | PPS | Badan Ad Hoc | Coklit & pembentukan KPPS | 4 tahap |
| 8 | KPPS | Badan Ad Hoc | Pemungutan & penghitungan TPS | 4 tahap |
| 9 | Relawan Demokrasi | Publik | Sosialisasi & pendidikan pemilih | 3 tahap |
| 10 | Masyarakat Umum | Publik | Literasi kepemiluan | 3 tahap |

**Tahap 2 (Strategic Learning)** dipersonalisasi penuh per tier (mis. Komisioner RI →
desain kebijakan nasional & manajemen krisis; PPS → Coklit & pembentukan KPPS; KPPS →
pemungutan & penghitungan suara; Masyarakat → hak pilih & anti-hoaks).

---

## 4. Tiered Facilitation Model — Alur 7 Tahap

| Tahap | Nama | Inti |
| --- | --- | --- |
| 1 | Orientasi & Evaluasi Mandiri | Induction + self-assessment (baseline). |
| 2 | Penguatan Kompetensi **sesuai Jenjang** | **Dipersonalisasi per tier.** |
| 3 | Peer Learning & Mentoring Kolektif | Non-hierarkis; pembelajar = sumber pengetahuan. |
| 4 | Etika, Integritas & Independensi | Klinik etika (DKPP/MK). |
| 5 | Pembelajaran Adaptif | E-learning, webinar, microlearning, AI recommendation. |
| 6 | Integrasi Manajemen Pengetahuan | Kontribusi Knowledge Hub. |
| 7 | Refleksi Akhir & Peer Review | Peta kompetensi akhir + transfer pengetahuan. |

---

## 5. Modul Utama PWA

1. **Learning** — Course, Webinar, Video Learning, Podcast
2. **Assessment** — Quiz, CAT, Simulasi Tahapan
3. **Certification** — Digital Certificate, QR Validation, Open Badge
4. **Community** — Forum, Peer Learning, Mentoring
5. **Knowledge Hub** — Putusan DKPP, Putusan MK, PKPU, JDIH
6. **AI Assistant** — Tanya Regulasi, Tanya Tahapan, Tanya Sengketa
7. **Mobile Offline** — Download Modul/Video, Sinkronisasi saat online

---

## 6. AI Learning Assistant (RAG)

Dua lapis (lihat `ai.js`):

- **Offline** (selalu aktif) — *retrieval* kata kunci atas Knowledge Base lokal + FAQ.
  Berjalan tanpa jaringan; cocok untuk daerah konektivitas rendah.
- **Live** (opsional) — **Claude (Anthropic)** via:
  - **Edge Function `lms-ai`** (Supabase) — kunci `ANTHROPIC_API_KEY` aman di server
    (direkomendasikan). Lihat `supabase/functions/lms-ai/index.ts`.
  - **Direct** — Anthropic API langsung dari browser (kunci di `localStorage`, uji coba).

Jawaban Live **di-grounding** pada hasil *retrieval* (pola **RAG ringan**) sehingga tidak
mengarang dasar hukum/nomor putusan. Produksi: ganti *keyword retrieval* dengan **Vector
Database + embeddings** (mis. LangChain) atas korpus JDIH/DKPP/MK.

---

## 7. Certification, Talent & Succession

- **CPD Point** — materi selesai ×2 + kuis lulus ×5 + kontribusi knowledge ×10.
- **Digital Badge / Open Badge** — per tahap selesai & per domain kompetensi yang dikuasai.
- **Sertifikat Kompetensi** — terbit bila syarat penyelesaian terpenuhi (alur 100%, kuis
  lulus, peta kompetensi akhir, kontribusi knowledge). Roadmap: **QR validation** & TTE.
- **Skor Talenta** — komposit (penyelesaian 50% · rata-rata kompetensi akhir 30% · CPD 20%)
  → kesiapan menapaki **leadership pipeline** dalam kelompok jenjang (*succession planning*).

---

## 8. Integrasi Sistem KPU

| Sistem | Arah | Kegunaan |
| --- | --- | --- |
| **SSO KPU** | ⇄ | Identitas & peran penyelenggara. |
| **SIAKBA** | → | Data badan ad hoc → enrolment & sertifikasi. |
| **SIMPEG** | → | Kepegawaian → profil & CPD. |
| **JDIH KPU** | → | Regulasi & PKPU → Knowledge Hub & AI Summarizer. |
| **SIDALIH** | → | Data pemilih → modul Coklit/DPT. |
| **SIREKAP** | → | Konteks rekapitulasi → studi kasus & simulasi. |
| **SIPOL** | → | Data peserta pemilu → materi pendukung. |
| **e-Office** | ⇄ | Persuratan & penugasan pembelajaran. |
| **DKPP Knowledge Center** | → | Putusan & kasus etik → bank kasus. |
| **MK Election Case Repository** | → | Putusan sengketa → bank kasus & lesson learned. |
| **Knowledge Repository KPU** | ⇄ | Repositori dokumen & best practice. |

---

## 9. Teknologi Stack

| Lapisan | Teknologi |
| --- | --- |
| **Frontend PWA** | React / Next.js · Ionic PWA · Service Worker |
| **Backend** | Frappe Framework · ERPNext Integration · Python · PostgreSQL |
| **AI Layer** | Claude / LLM · RAG Knowledge Base · Vector Database · LangChain |
| **Infrastructure** | Kubernetes · Docker · NGINX · Redis · MinIO |

> **Prototipe ini** sengaja *frontend-only* (vanilla JS, `localStorage`) agar ringan,
> mudah diaudit, & konsisten dengan sub-aplikasi KPU lain di repo. Stack di atas adalah
> **target produksi**: PWA menjadi *front-end* atas Frappe LMS (headless via REST/GraphQL).

---

## 10. Roadmap Kematangan (6 Level)

| Level | Kapabilitas |
| --- | --- |
| **L1** | LMS Dasar — course, learning path, quiz, sertifikat. |
| **L2** | + Sertifikasi — sertifikasi kompetensi, badge, QR validation. |
| **L3** | + Knowledge Management — bank kasus, putusan DKPP/MK, lesson learned, digital library. |
| **L4** | + AI Assistant — chatbot, tutor, summarizer, recommendation (RAG). |
| **L5** | + Talent Pool & Succession — CPD, talent pool, leadership pipeline. |
| **L6** | **National Election Learning Ecosystem** — lintas pemangku: KPU RI–Prov–Kab/Kota, PPK/PPS/KPPS, akademisi, pemantau pemilu, partai politik, masyarakat. |

---

## 11. Implementasi Prototipe (apa yang sudah berjalan)

| Layer / Modul | Status di prototipe PWA |
| --- | --- |
| Tiered Competency Engine (10 tier) | ✅ Onboarding + personalisasi alur per tier |
| Alur 7 tahap + Quiz | ✅ Fungsional, progres di `localStorage` |
| Kompetensi (radar awal/akhir) | ✅ Self-assessment + visualisasi |
| Knowledge Management | ✅ 8 kategori + pencarian + kontribusi |
| AI Learning Assistant | ✅ Offline (RAG ringan) + Live (Claude via Edge/direct) |
| Certification & Talent | ✅ CPD, badge, sertifikat, talent score, pipeline |
| Analytics Center | ✅ Dashboard, heatmap, evaluasi dampak, predictive |
| Arsitektur (blueprint) | ✅ Tab visual (layer, tier, integrasi, tech, roadmap) |
| Core LMS (Frappe), API Gateway, SSO, Vector DB, Infra | ⏳ Roadmap produksi (lihat §9–10) |

---

## 12. Pemetaan ke Policy Brief

| Rekomendasi Policy Brief | Realisasi platform |
| --- | --- |
| Pembelajaran **berjenjang & berkelanjutan** | Tiered Competency Engine (§3) + alur 7 tahap (§4) |
| **Terintegrasi manajemen pengetahuan** | Knowledge Management System (§5–8) |
| **Evaluasi berbasis dampak** kelembagaan | Analytics Center — Evaluasi Dampak |
| **Netralitas & independensi**; fasilitator independen | Fasilitator = *critical partner* (tab Fasilitator) |
| Self-assessment & refleksi (kesadaran profesional) | Kompetensi (radar) + materi refleksi |
| **Investasi kelembagaan** lintas periode | Talent/Succession + memori institusional (Knowledge Hub) |

> Prototipe edukatif. Kutipan kasus/angka disusun ulang untuk pembelajaran; verifikasi ke
> sumber resmi (JDIH KPU, DKPP, MK) sebelum penggunaan kelembagaan.
