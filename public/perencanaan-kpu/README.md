# AI Planning Document Factory — KPU

Aplikasi **"Pabrik Dokumen Perencanaan"** untuk KPU Provinsi Jawa Barat: mengubah
satu ide kegiatan menjadi **seluruh dokumen perencanaan** secara otomatis, sesuai
regulasi pemerintah, dengan validasi anggaran dan alur persetujuan elektronik.

Aplikasi ini **offline-first** (PWA, data tersimpan di `localStorage`) dan dapat
diakses di `/perencanaan-kpu/`.

## Sumber Anggaran

Setiap berkas perencanaan dibuat berdasarkan **pilihan sumber anggaran** sesuai
DIPA KPU Provinsi Jawa Barat TA 2026 (Revisi 8):

| Sumber | Kode | Pagu (indikatif) | Dasar |
| ------ | ---- | ---------------- | ----- |
| **APBN** | Rupiah Murni (RM) | ± Rp 15.427.437.000 | PMK SBM/SHBJ, Perpres PBJ |
| **HNP 2026** | Hibah Langsung Dalam Negeri (HLD), Reg. `22S6FR8A` | Rp 10.000.000.000 | PMK Hibah, NPHD, Perpres PBJ |

> Total pagu DIPA: **Rp 25.427.437.000**. Rincian HNP 2026: Belanja Barang/Jasa
> (Rp 3.939.612.000) · Operasional & Administrasi Perkantoran (Rp 4.735.388.000) ·
> Belanja Modal Peralatan & Mesin (Rp 1.325.000.000).

Pilihan sumber anggaran menentukan dasar hukum, akun belanja, aturan validasi,
serta dokumen tambahan yang diperlukan (mis. SP2HL/SPHL & pengadaan untuk hibah).

## Alur (7 Tahap)

1. **Input Kebutuhan** — form singkat (nama, tujuan, output, lokasi, waktu, peserta, sasaran, jenis, **sumber anggaran**).
2. **AI Requirement Analyzer** — menentukan dokumen Wajib/Perlu/Opsional + Knowledge Base Regulasi.
3. **RAB & AI Budget Validator** — RAB otomatis dari SBM; cek kepatuhan SBM, deteksi duplikasi, simulasi efisiensi.
4. **Document Generator** — Nota Dinas, KAK, TOR, RAB, Jadwal, SK Panitia, SPT, Matriks Risiko (pratinjau & cetak/PDF).
5. **AI Review Assistant** — Compliance / Quality / Risk check + skor kesiapan.
6. **Workflow Approval Engine** — Staf → Kasubbag → Kabag → Sekretaris → KPA → Ketua (berjenjang).
7. **TTE & Arsip Elektronik** — penomoran, hash SHA-256, TTE (simulasi BSrE), QR verifikasi, arsip.

Plus **Dashboard Monitoring**: pipeline (Draft/Review/Approval/Selesai), pagu per
sumber & per program, total rencana anggaran.

## Mode AI (Claude) — opsional

Tanpa konfigurasi, aplikasi memakai **generator template** (offline). Aktifkan
**Mode AI** di tab **⚙️ AI** untuk:

- **AI Copilot Perencanaan** — ketik satu kalimat kebutuhan, formulir Tahap 1 terisi otomatis.
- **Buat dengan AI** — pada Tahap 4, narasi dokumen (Nota Dinas, KAK, dll) ditulis
  Claude, **di-grounding** pada blueprint dokumen contoh KPU Jabar (`templates.js`),
  data form, sumber anggaran, **BAS**, dan RAB. Validasi tetap memakai validator lokal.

Dua jalur:

| Jalur | Keterangan |
| ----- | ---------- |
| **Supabase Edge Function** (disarankan) | Kunci API di server. Deploy `supabase functions deploy perencanaan-ai --no-verify-jwt`, set secret `ANTHROPIC_API_KEY`, lalu isi URL + Anon Key di tab AI. |
| **Langsung ke Anthropic** | Kunci `sk-ant-...` disimpan di localStorage perangkat (untuk uji coba internal). |

Model: Claude Sonnet 4.6 (default), Opus 4.8, atau Haiku 4.5.

## Bagan Akun Standar (BAS)

Tab **📒 BAS** menampilkan struktur akun belanja pemerintah (51 Belanja Pegawai,
52 Belanja Barang, 53 Belanja Modal) mengacu PMK Bagan Akun Standar — termasuk
akun yang dipakai pada DIPA KPU Jabar 2026. BAS dipakai untuk penyusunan &
validasi RAB serta sebagai konteks Mode AI.

## Dokumen contoh sebagai template

Blueprint pada `templates.js` dipelajari dari dokumen nyata KPU Jawa Barat:
**Nota Dinas Penataan Staf** (format nomor `PP.05-ND/32`), **KAK/RAB Pengadaan**
(pola SAE PISAN, Pengadaan Langsung + PPN 11%), serta **KAK Swakelola Tipe I &
Kontrak Swakelola Tipe IV** (Pokok Perjanjian, hirarki dokumen kontrak).

## Catatan

- Angka **SBM bersifat indikatif** (mengikuti pola PMK Standar Biaya Masukan).
  Verifikasi dengan PMK SBM tahun berjalan sebelum dipakai untuk dokumen resmi.
- TTE pada aplikasi ini adalah **simulasi** alur (hash + penomoran + QR). Integrasi
  produksi dirancang untuk BSrE BSSN, SRIKANDI, dan e-Office.

## Berkas

| File | Fungsi |
| ---- | ------ |
| `index.html` | Shell aplikasi + registrasi service worker |
| `data.js` | Knowledge Base: SBM, **BAS**, regulasi, data RKA/DIPA, aturan dokumen |
| `templates.js` | Blueprint dokumen contoh KPU Jabar (grounding template & AI) |
| `generators.js` | Requirement analyzer, RAB generator, validator, generator dokumen, review AI |
| `ai.js` | Klien Mode AI (Edge Function / direct), prompt building, Copilot |
| `app.js` | UI wizard, state, workflow, TTE/hash/QR, dashboard, arsip, BAS, settings AI |
| `styles.css` | Gaya UI + tata letak dokumen cetak |
| `service-worker.js` | Cache offline (network-first app-shell) |

Backend AI: `supabase/functions/perencanaan-ai/` (relay ke Claude, kunci di server).
