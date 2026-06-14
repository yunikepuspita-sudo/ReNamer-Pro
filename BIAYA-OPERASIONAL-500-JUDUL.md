# Perhitungan Biaya Operasional E-Pustaka — 500 Judul Buku

> Estimasi biaya menjalankan **E-Pustaka Pemilu** dengan katalog **500 judul buku**
> agar berjalan lancar (tanpa pause, tanpa kehabisan kuota, fitur AI aktif).
>
> Kurs acuan: **1 USD ≈ Rp 16.500** (perkiraan 2026 — sesuaikan saat membaca).
> Angka di bawah adalah estimasi perencanaan, bukan tagihan resmi.

---

## 1. Arsitektur & Komponen Biaya

Aplikasi memakai stack berikut (lihat `README.md` & `SETUP-BACKEND.md`):

| Lapisan | Layanan | Model biaya |
|---|---|---|
| **Frontend** | GitHub Pages (PWA, React+Vite) | **Gratis** (custom domain `pustaka.yunikepuspita.com`) |
| **Database + Auth** | Supabase Postgres + Auth | Termasuk paket Supabase |
| **Penyimpanan PDF** | Supabase Storage (bucket `ebooks`) | Storage + egress (bandwidth) |
| **Logika server** | Supabase Edge Functions (`create-payment`, `payment-webhook`, `pustaka-ai`) | Per-invokasi |
| **Pembayaran** | Midtrans QRIS | Fee per transaksi (MDR) |
| **Pustaka AI** | Claude `claude-opus-4-8` (via Anthropic) | Per-token (input/output) |
| **Domain** | `.com` / `.id` | Per tahun |

**Penggerak biaya utama untuk 500 judul:** penyimpanan PDF + **egress (bandwidth)**
saat pembaca mengunduh/membaca PDF, lalu **token AI**. Sisanya kecil/tetap.

---

## 2. Asumsi Dasar

| Parameter | Nilai asumsi | Catatan |
|---|---|---|
| Jumlah judul | **500** | Target |
| Ukuran rata-rata PDF | **8 MB/judul** | Buku/panduan pemilu berbasis teks; kisaran 5–15 MB |
| Total storage konten | **500 × 8 MB ≈ 4 GB** | Melebihi kuota gratis Supabase (1 GB) |
| Cover/aset | < 0,5 GB | Diabaikan/kecil |
| Pembaca aktif bulanan (MAU) | Skenario A/B/C di §5 | Penentu egress & AI |
| Rata-rata buku dibaca/pengguna/bulan | 5 judul | — |

> **Konsekuensi penting:** dengan ~4 GB konten, **paket Supabase gratis tidak cukup**
> (storage gratis hanya 1 GB, egress 5 GB, dan project di-*pause* setelah idle).
> Agar "berjalan lancar" → **wajib Supabase Pro**.

---

## 3. Biaya Tetap (Fixed) — per bulan

| Item | Biaya USD | Biaya Rp | Keterangan |
|---|---|---|---|
| **Supabase Pro** | $25 | **± Rp 412.500** | Sudah termasuk: 8 GB DB, **100 GB storage**, **250 GB egress**, 100k MAU, 2 juta invokasi Edge Function. Project tidak di-pause. |
| GitHub Pages | $0 | Rp 0 | Hosting frontend gratis |
| Domain (`.com`, diamortisasi) | ~$1 | ± Rp 16.500 | ~Rp 200rb/tahun ÷ 12 |
| **Subtotal tetap** | **~$26** | **± Rp 429.000** | |

Kuota storage 100 GB pada Pro **jauh** di atas kebutuhan 4 GB — **500 judul aman**,
bahkan bisa tumbuh sampai ribuan judul tanpa biaya storage tambahan.

---

## 4. Biaya Variabel (Variable) — bergantung trafik

### 4a. Egress / Bandwidth (Supabase)
Setiap pembacaan PDF mengunduh file. Paket Pro sudah termasuk **250 GB egress/bulan**;
kelebihannya **$0,09/GB** (± Rp 1.485/GB).

Estimasi: `MAU × buku dibaca × ukuran PDF`.

### 4b. Token AI — Claude `claude-opus-4-8`
Harga: **input $5 / 1 juta token**, **output $25 / 1 juta token**.

Per pertanyaan AI (katalog diringkas maks. 80 judul + pertanyaan + jawaban):
- Input ~2.000 token → $0,010
- Output ~500 token → $0,0125
- **≈ $0,0225 / pertanyaan ≈ Rp 370 / pertanyaan**

> Sudah hemat by design: `claude-opus-4-8` dengan *thinking* dimatikan + *effort* rendah,
> dan katalog dikirim ringkas (maks. 80 judul). Aktifkan **prompt caching** untuk
> konteks katalog agar input berulang ~10× lebih murah bila trafik AI tinggi.

### 4c. Edge Functions
Pembayaran + webhook + AI = beberapa invokasi/transaksi. Kuota Pro **2 juta/bulan**
praktis tak terlampaui pada skala ini → **anggap Rp 0** (sudah termasuk).

### 4d. Fee Midtrans QRIS
**MDR QRIS ± 0,7% per transaksi** — dipotong dari pendapatan, **bukan** biaya operasional
murni. Contoh: Premium Rp 49.000 → fee ± Rp 343. (Tidak dijumlahkan ke total biaya di
bawah karena sifatnya potongan pendapatan.)

---

## 5. Tiga Skenario Total Bulanan

| | **A — Kecil** | **B — Menengah** | **C — Besar** |
|---|---|---|---|
| Pembaca aktif (MAU) | 500 | 2.000 | 8.000 |
| Buku dibaca/bulan (×5) | 2.500 | 10.000 | 40.000 |
| **Egress PDF** (×8 MB) | ~20 GB | ~80 GB | ~313 GB |
| Egress melebihi 250 GB? | tidak | tidak | ya (~63 GB) |
| Biaya egress ekstra | Rp 0 | Rp 0 | ~63 × Rp 1.485 ≈ **Rp 93.500** |
| Pertanyaan AI/bulan | 500 | 2.500 | 10.000 |
| Biaya AI (×Rp 370) | ± Rp 185.000 | ± Rp 925.000 | ± Rp 3.700.000 |
| **Biaya tetap** | Rp 429.000 | Rp 429.000 | Rp 429.000 |
| **TOTAL / bulan** | **± Rp 614.000** | **± Rp 1.354.000** | **± Rp 4.222.500** |
| **TOTAL / bulan (USD)** | ~$37 | ~$82 | ~$256 |

> **Catatan:** komponen **AI** mendominasi biaya variabel. Bila fitur Pustaka AI
> dibatasi/dinonaktifkan, biaya skenario B turun ke **± Rp 429.000/bulan** (praktis hanya
> biaya tetap Supabase Pro).

---

## 6. Rekomendasi Agar "Berjalan Lancar"

1. **Pakai Supabase Pro ($25/bln).** Storage 100 GB & egress 250 GB memberi ruang besar
   untuk 500 judul; project tidak di-pause sehingga koleksi & login selalu aktif.
2. **Kompres PDF** sebelum unggah (target ≤ 8 MB/judul, hilangkan gambar beresolusi
   berlebih). Memangkas egress = penghematan langsung di skenario besar.
3. **Aktifkan caching agresif** di service worker PWA (PDF yang sudah diunduh tidak
   diunduh ulang) → egress turun untuk pembaca berulang.
4. **Batasi/anggarkan kuota AI:** terapkan rate-limit per pengguna, dan nyalakan
   **prompt caching** konteks katalog. Ini mengubah AI dari biaya tak terduga menjadi
   terkendali.
5. **Pantau dashboard Supabase** (Storage & Egress) tiap bulan; pasang alert saat egress
   mendekati 250 GB agar tidak ada kejutan overage.
6. **Premium menutup biaya:** ± **18 pelanggan Premium bulanan** (Rp 49.000, setelah fee
   QRIS ~0,7%) sudah menutup biaya skenario B (~Rp 1,35 juta/bln).

---

## 7. Ringkasan Cepat

| Pertanyaan | Jawaban |
|---|---|
| Bisa pakai paket gratis untuk 500 judul? | **Tidak** — storage/egress gratis terlampaui & project di-pause. |
| Biaya minimum agar lancar? | **± Rp 429.000/bulan** (Supabase Pro + domain), tanpa/AI minim. |
| Estimasi realistis (2.000 pembaca + AI aktif)? | **± Rp 1,35 juta/bulan**. |
| Komponen paling mahal? | **Token AI**, lalu **egress** saat trafik sangat besar. |
| Storage 500 judul jadi masalah? | **Tidak** — 4 GB dari 100 GB kuota Pro. |

---

*Dokumen estimasi perencanaan. Verifikasi harga terbaru di dashboard Supabase, Midtrans,
dan console.anthropic.com sebelum mengambil keputusan anggaran.*
