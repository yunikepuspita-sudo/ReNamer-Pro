# Panduan Deployment & Integrasi — SiPINTER KPU

Prototipe PWA ini **berjalan tanpa backend** (offline-first, `localStorage`). Dokumen ini
menjelaskan cara menaikkannya ke **produksi**: AI Live (Claude), backend **Frappe LMS**
(headless), SSO, dan RAG knowledge base — mengikuti roadmap kematangan L1→L6 di
[`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 0. Menjalankan prototipe (tanpa backend)

```bash
npm run dev        # http://localhost:5173/lms-kpu/
npm run build      # ter-build ke dist/lms-kpu/ (di-deploy via GitHub Pages)
```

Semua fitur inti (10 tier, alur 7 tahap, kuis, kompetensi, Knowledge Hub, sertifikat,
analytics) berfungsi penuh offline. Lanjutkan ke bagian berikut sesuai kebutuhan.

---

## 1. AI Live (Claude) — Level 4

Tanpa konfigurasi, AI Assistant menjawab dari Knowledge Base lokal (RAG ringan). Untuk
jawaban Claude penuh:

### 1a. Edge Function (direkomendasikan — kunci aman di server)
```bash
supabase functions deploy lms-ai --no-verify-jwt
# Supabase Dashboard → Edge Functions → Manage secrets:
#   ANTHROPIC_API_KEY = sk-ant-...
```
Di aplikasi: **AI Assistant → ⚙️ Pengaturan** → mode **Edge** → isi
`https://<project>.supabase.co/functions/v1/lms-ai` (+ anon key bila perlu).

Sumber: `supabase/functions/lms-ai/index.ts` (relay; membatasi model & ukuran prompt).

### 1b. Direct (uji coba internal)
Mode **Direct** menaruh `ANTHROPIC_API_KEY` di `localStorage` perangkat — hanya untuk uji
coba, **jangan** untuk publik.

### 1c. RAG produksi
Ganti *keyword retrieval* (`ai.js`) dengan **embeddings + Vector Database** (mis. pgvector
/ LangChain) atas korpus **JDIH KPU, Putusan DKPP, Putusan MK**. Alur:
`pertanyaan → embed → top-k dokumen → grounding ke Claude`.

---

## 2. Backend Frappe LMS (headless) — Level 1–3 & 5

PWA ini menjadi **front-end** atas Frappe LMS via REST.

### 2a. Pasang Frappe LMS
```bash
# Prasyarat: bench (Frappe). Lihat https://github.com/frappe/lms
bench get-app lms https://github.com/frappe/lms
bench --site lms.kpu.local install-app lms
bench --site lms.kpu.local add-to-hosts
bench start
```

### 2b. API key untuk integrasi
Frappe Desk → **User → API Access → Generate Keys** → dapatkan `api_key` & `api_secret`.
Otentikasi REST: header `Authorization: token <api_key>:<api_secret>`.

### 2c. Hubungkan dari PWA
Tab **📥 Sinkronisasi → Konektor Frappe LMS**: isi Base URL + API Key/Secret →
**Simpan** → **Uji koneksi** → **Tarik katalog kursus**.

> Catatan CORS: izinkan origin PWA pada konfigurasi situs Frappe
> (`allow_cors` / reverse-proxy NGINX) agar `fetch` lintas-origin berhasil.

### 2d. Pemetaan model → doctype Frappe LMS
| Model lokal | Doctype Frappe LMS |
| --- | --- |
| Tier (10 jenjang) | LMS Batch / Audience |
| Alur 7 tahap | LMS Course (Learning Path) |
| Modul | Course Chapter |
| Materi (lesson) | Course Lesson |
| Kuis | LMS Quiz (ambang 70%) |
| Progres & CPD | LMS Enrollment / Course Progress |
| Sertifikat | LMS Certificate (+ QR validation) |
| Knowledge Hub | Wiki / Knowledge Base |

Strategi sinkron: **offline-first** — tulis lokal dulu, lalu *push* progres ke Frappe saat
online; *pull* katalog/penugasan saat membuka aplikasi. (Konektor saat ini menyediakan uji
koneksi + tarik katalog; *push* progres adalah langkah lanjutan.)

---

## 3. SSO & Identitas — Level 2+

- **OAuth2 / SSO KPU** sebagai API Gateway: peran per tier (Komisioner, Sekretariat,
  Badan Ad Hoc, Publik) menentukan akses modul & data.
- Integrasi **SIAKBA** (data badan ad hoc) & **SIMPEG** (kepegawaian) → auto-enrolment ke
  Batch/tier yang sesuai + profil CPD.

---

## 4. Integrasi sistem KPU — Level 3 & 6

| Sistem | Arah | Kegunaan |
| --- | --- | --- |
| SSO KPU | ⇄ | Identitas & peran. |
| SIAKBA | → | Enrolment & sertifikasi badan ad hoc. |
| SIMPEG | → | Profil & CPD. |
| JDIH KPU | → | Knowledge Hub & AI Summarizer. |
| SIDALIH / SIREKAP / SIPOL | → | Materi & studi kasus kontekstual. |
| e-Office | ⇄ | Persuratan & penugasan pembelajaran. |
| DKPP / MK Repository | → | Bank kasus & lesson learned. |

---

## 5. Cadangan & portabilitas data

Selama belum tersambung backend, gunakan tab **📥 Sinkronisasi → Ekspor/Impor JSON** untuk
memindahkan progres antar perangkat atau mencadangkan. Rahasia (kunci API) **tidak** ikut
diekspor.

---

## 6. Infrastruktur produksi (referensi)

Kubernetes · Docker · NGINX (TLS + CORS) · Redis (cache/queue) · PostgreSQL (Frappe) ·
MinIO (media/video) · Vector DB (RAG). PWA dapat tetap di-*host* statis (GitHub Pages / CDN)
dan berbicara ke API Gateway.

> Seluruh langkah di atas bersifat panduan arsitektur. Sesuaikan dengan kebijakan keamanan,
> tata kelola data, dan regulasi KPU sebelum penerapan kelembagaan.
