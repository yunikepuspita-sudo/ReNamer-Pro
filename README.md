# 📚 E-Pustaka Pemilu

Aplikasi **perpustakaan digital & toko buku (bookstore)** bertema **demokrasi dan pemilihan umum**,
terinspirasi oleh aplikasi **Gramedia Digital**. Pengguna dapat menjelajahi toko, mencari dan
memfilter koleksi, membeli/menambahkan judul ke pustaka pribadi, lalu membacanya di dalam
**reader bergaya EPUB** dengan tema warna, ukuran huruf, dan penanda halaman yang bisa disesuaikan.

> Proyek demonstrasi non-komersial. Seluruh judul, penulis, dan konten bersifat fiktif/edukatif.

## ✨ Fitur

- **Beranda** dengan rak: Paling Populer, Terbaru, Gratis Dibaca, serta Majalah & Koran.
- **Toko (Bookstore)** dengan pencarian teks + filter jenis (buku/majalah/koran), kategori,
  filter "gratis", dan pengurutan (populer/terbaru/termurah/judul).
- **Detail judul**: sinopsis, daftar isi, rating, harga, dan rekomendasi kategori serupa.
- **Reader EPUB** layar penuh:
  - 4 tema baca — **Terang, Gelap, Sepia, Hijau** (seperti mode baca Gramedia).
  - Atur **ukuran huruf**, navigasi antar bab, **progress bar**, **daftar isi**, dan **penanda (bookmark)**.
  - Cuplikan untuk judul berbayar/Premium yang belum dimiliki (paywall).
- **Pustaka Saya**: rak pribadi dengan progres baca per judul.
- **Premium — All You Can Read**: paket langganan bulanan/tahunan membuka koleksi Premium.
- **Persistensi lokal** (localStorage): pustaka, status Premium, progres baca, dan preferensi reader.

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
  context/AppContext.tsx # state global: pustaka, premium, progres (localStorage)
  components/            # Navbar, Footer, BookCard, BookCover, Shelf
  pages/                 # Home, Store, BookDetail, Reader, Library, Premium, NotFound
```
