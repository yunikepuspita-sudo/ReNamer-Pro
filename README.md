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
