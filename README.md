# 📚 E-Pustaka Pemilu

🔗 **Demo langsung:** https://yunikepuspita-sudo.github.io/ReNamer-Pro/
🌐 **Domain khusus:** https://pustaka.yunikepuspita.com (via GitHub Pages custom domain)
_(otomatis ter-deploy lewat GitHub Actions setiap ada perubahan di branch utama)_

Aplikasi **perpustakaan digital & toko buku (bookstore)** bertema **demokrasi dan pemilihan umum**,
terinspirasi oleh aplikasi **Gramedia Digital**. Pengguna dapat menjelajahi toko, mencari dan
memfilter koleksi, membeli/menambahkan judul ke pustaka pribadi, lalu membacanya di dalam
**reader bergaya EPUB** dengan tema warna, ukuran huruf, dan penanda halaman yang bisa disesuaikan.

> Proyek demonstrasi non-komersial. Seluruh judul, penulis, dan konten bersifat fiktif/edukatif.

## ✨ Fitur

- **Beranda** dengan rak: Paling Populer, Terbaru, Gratis Dibaca, serta Majalah & Koran.
- **Toko (Bookstore)** dengan pencarian teks + filter jenis (buku/majalah/koran), kategori,
  filter "gratis", dan pengurutan (populer/terbaru/termurah/judul).
- **Tema Pemilu** — telusuri koleksi lewat 8 kategori bertema demokrasi & pemilu
  (Demokrasi & Kewarganegaraan, Pemilu & Pilkada, Hukum & Konstitusi, Kampanye & Politik
  Gagasan, Literasi Digital & Anti-Hoaks, Pemilih Muda, Integritas & Pengawasan, Sejarah
  Pemilu) lengkap dengan halaman grid kategori, halaman per-tema, dan tautan tema di tiap buku.
- **Detail judul**: sinopsis, daftar isi, rating, harga, dan rekomendasi kategori serupa.
- **Reader EPUB** layar penuh:
  - 4 tema baca — **Terang, Gelap, Sepia, Hijau** (seperti mode baca Gramedia).
  - Atur **ukuran huruf**, navigasi antar bab, **progress bar**, **daftar isi**, dan **penanda (bookmark)**.
  - Cuplikan untuk judul berbayar/Premium yang belum dimiliki (paywall).
- **Pustaka Saya**: rak pribadi dengan progres baca per judul.
- **Premium — All You Can Read**: paket langganan bulanan/tahunan membuka koleksi Premium.
- **Persistensi lokal** (localStorage): pustaka, status Premium, progres baca, dan preferensi reader.
- **Papan Peringkat** (`/peringkat`):
  - **Buku Terpopuler** — koleksi diperingkat berdasarkan skor popularitas (dari rating),
    dengan medali untuk 3 teratas, bar skor, dan filter jenis bahan.
  - **Level Pembaca** — gamifikasi aktivitas baca pribadi: poin, level berjenjang
    (Pembaca Baru → Maestro Literasi), statistik (buku dimiliki/selesai, halaman dibaca,
    tema dijelajahi), dan lencana. Semua dihitung dari data lokal, tanpa backend.
- **Pustaka AI (Knowledge Hub)** — asisten cerdas bertenaga **Claude**:
  - **Tanya Asisten** (`/pustaka-ai`) — chat tanya-jawab demokrasi/pemilu + rekomendasi
    buku, dijawab berdasar katalog (judul yang disebut menjadi tautan).
  - **Pencarian Cerdas** — ketik kebutuhan bahasa natural, AI memilihkan judul relevan.
  - **Tanya AI per buku** — ringkasan otomatis & tanya-jawab di halaman detail buku.
  - Aman untuk situs statis: panggilan LLM lewat **Supabase Edge Function** (`pustaka-ai`)
    yang menyimpan `ANTHROPIC_API_KEY` di server. Tanpa kunci, UI menampilkan mode
    "AI sedang disiapkan". Setup: lihat `SETUP-BACKEND.md`.
- **Integrasi WhatsApp**:
  - **Saluran WhatsApp (Channel)** — banner ajakan mengikuti saluran broadcast untuk info
    koleksi & e-book baru (di Beranda dan footer).
  - **Tombol mengambang WhatsApp** — menu cepat untuk chat Customer Care + ikuti saluran,
    tampil di seluruh halaman (kecuali reader layar penuh).
  - **Bagikan via WhatsApp** — tombol di halaman detail buku untuk menyebar judul + tautan
    ke chat, grup, atau status.
  - Semua nomor & tautan diatur lewat env (`VITE_WA_PHONE`, `VITE_WA_CHANNEL_URL`,
    `VITE_WA_CHANNEL_NAME`, `VITE_SITE_URL`) — lihat `.env.example`. Banner/tombol saluran
    otomatis tersembunyi selama tautan saluran masih placeholder.

## 🏛️ Sub-aplikasi: AI Planning Document Factory — KPU

Aplikasi mandiri (PWA, vanilla JS, offline-first) untuk **perencanaan dokumen
pemerintah** di KPU Provinsi Jawa Barat. Mengubah satu ide kegiatan menjadi
**seluruh dokumen perencanaan** (Nota Dinas, KAK, TOR, RAB, Jadwal, SK Tim, SPT,
Matriks Risiko) secara otomatis — sesuai regulasi — dengan **validasi anggaran**,
**alur persetujuan berjenjang**, dan **TTE + arsip elektronik**.

- 📂 Lokasi: `public/perencanaan-kpu/` → akses di `…/perencanaan-kpu/`
  ([demo](https://yunikepuspita-sudo.github.io/ReNamer-Pro/perencanaan-kpu/)).
- 💰 **Pilihan sumber anggaran**: **APBN (Rupiah Murni)** atau **HNP 2026
  (Hibah / HLD, Reg. 22S6FR8A)** — berbasis data DIPA KPU Jabar TA 2026 (Rev 8,
  pagu Rp 25.427.437.000). Sumber anggaran menentukan dasar hukum, akun belanja,
  aturan validasi SBM/SHBJ, dan dokumen tambahan (mis. SP2HL/SPHL & pengadaan).
- 🤖 Fitur: AI Requirement Analyzer · Knowledge Base Regulasi · **Bagan Akun
  Standar (BAS)** · RAB Generator + AI Budget Validator (kepatuhan SBM, deteksi
  duplikasi, simulasi efisiensi) · AI Review Assistant (Compliance/Quality/Risk) ·
  Workflow Approval (6 jenjang) · TTE (hash SHA-256 + QR verifikasi) · Dashboard.
- 📄 **Template dokumen nyata KPU Jabar**: Nota Dinas (format `PP.05-ND/32`),
  KAK/RAB Pengadaan (pola SAE PISAN), KAK Swakelola Tipe I & Kontrak Swakelola.
- 🧠 **Mode AI (Claude)** opsional: AI Copilot (kalimat → formulir) & penulisan
  narasi dokumen bertenaga Claude, lewat **Supabase Edge Function**
  (`perencanaan-ai`, kunci di server) atau kunci langsung. Tanpa kunci, aplikasi
  tetap berjalan memakai generator template.

Detail lengkap: lihat `public/perencanaan-kpu/README.md`.

## 🎓 Sub-aplikasi: LMS Kepemiluan — *Tiered Facilitation Model* (KPU)

**Learning Management System berjenjang** (PWA, vanilla JS, offline-first) untuk
**pengembangan kompetensi Komisioner KPU**, mengoperasionalkan *Policy Brief*
**"Tiered Facilitation Model"**. Kerangka fitur LMS terinspirasi
[Frappe LMS](https://github.com/frappe/lms).

- 📂 Lokasi: `public/lms-kpu/` → akses di `…/lms-kpu/`
  ([demo](https://yunikepuspita-sudo.github.io/ReNamer-Pro/lms-kpu/)).
- 🪜 **Berjenjang (3 tier)** — modul **Tahap 2 dipersonalisasi** per jenjang:
  **KPU RI** (strategis & visioner) · **Provinsi** (operasional regional) ·
  **Kabupaten/Kota** (operasional lapangan).
- 🔄 **Alur 7 tahap**: Orientasi & Self-Assessment → Penguatan Kompetensi sesuai
  Jenjang → Peer Learning → Etika & Integritas → Pembelajaran Adaptif → Manajemen
  Pengetahuan → Refleksi Akhir & Peer Review.
- 🎯 Fitur: **peta kompetensi** (radar awal vs akhir) · **Bank Kasus** kepemiluan
  (memori institusional, dapat dikontribusi) · direktori **Fasilitator** (*critical
  partner*) · **evaluasi berbasis dampak** · kuis (ambang 70%) · **sertifikat** cetak/PDF.
- 📐 Arsitektur & pemetaan ke Policy Brief: lihat `public/lms-kpu/ARCHITECTURE.md`.

Detail lengkap: lihat `public/lms-kpu/README.md`.

## 🛠️ Teknologi

- **React 18** + **TypeScript**
- **Vite** (build & dev server)
- **React Router** (HashRouter, cocok untuk hosting statis)
- CSS murni (tanpa framework) — sampul buku dirender sebagai gradien, tanpa aset gambar eksternal.

## 🚀 Menjalankan

```bash
npm install      # pasang dependensi
npm run dev      # mode pengembangan (http://localhost:5173)
npm run build    # build produksi ke folder dist/
npm run preview  # pratinjau hasil build
```

## 📁 Struktur

```
src/
  main.tsx               # entry + provider + router
  App.tsx                # definisi rute
  types.ts               # tipe data (Book, Chapter, ReaderTheme, …)
  data/books.ts          # data koleksi (buku, majalah, koran) bertema pemilu
  data/themes.ts         # kategori Tema Pemilu + helper penelusuran
  context/AppContext.tsx # state global: pustaka, premium, progres (localStorage)
  components/            # Navbar, Footer, BookCard, BookCover, Shelf
  pages/                 # Home, Store, Themes, ThemeDetail, BookDetail, Reader,
                         #   Library, Premium, NotFound
```
