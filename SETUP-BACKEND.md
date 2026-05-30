# Setup Backend — Admin & Transaksi

Aplikasi tetap **berjalan tanpa backend** (memakai data statis). Backend hanya
diperlukan bila Anda ingin:
- Admin menambah koleksi yang langsung tampil ke **semua pengguna**, dan/atau
- **Pembayaran nyata** (Fase 2).

---

## FASE 1 — Supabase (Admin & Koleksi Online)

### 1. Buat project Supabase (gratis)
1. Daftar di https://supabase.com → **New project**.
2. Catat **Project URL** dan **anon public key** dari **Project Settings → API**.

### 2. Jalankan skema database
1. Buka **SQL Editor → New query**.
2. Tempel seluruh isi `supabase/schema.sql` → **Run**.
   - Membuat tabel `books`, `orders`, bucket Storage `ebooks`, dan kebijakan
     keamanan (Row-Level Security): publik bisa membaca, hanya admin (login)
     yang bisa menulis.

### 3. Buat akun admin
- **Authentication → Users → Add user** → isi email & password.
- Email/password inilah yang dipakai login di halaman `/admin`.

### 4. Hubungkan ke aplikasi
Buat file `.env` di root project (lihat `.env.example`):

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi....
```

> Untuk **deploy GitHub Pages**: simpan kedua nilai itu sebagai
> **Repository Secrets** (Settings → Secrets and variables → Actions), lalu
> teruskan sebagai env saat langkah build di workflow. (Bilang ke saya kalau
> mau saya update workflow deploy untuk membaca secret ini.)

### 5. Selesai
- Jalankan `npm run dev`, buka `/#/admin`, login, lalu **Tambah Koleksi**
  (termasuk unggah PDF). Koleksi tampil untuk semua pengunjung.

**Keamanan:** `anon key` aman dipakai di browser karena dibatasi oleh RLS.
**JANGAN** pernah memakai `service_role key` di frontend.

---

## FASE 2 — Pembayaran Nyata (Midtrans / Xendit)

> Belum diaktifkan. Ini ringkasan rencana — perlu langkah pendaftaran dari Anda.

Pembayaran nyata **tidak bisa** sepenuhnya di sisi browser karena *secret key*
gateway harus dirahasiakan. Arsitektur yang dipakai:

1. **Akun gateway**: daftar Midtrans atau Xendit (perlu verifikasi usaha/identitas,
   rekening bank; untuk Indonesia biasanya KTP, kadang NPWP/badan usaha).
2. **Supabase Edge Function** (server kecil) untuk:
   - Membuat transaksi / Snap token (memakai *server key* rahasia).
   - Menerima **webhook** notifikasi pembayaran → menandai `orders.status = 'paid'`.
3. **Frontend**: tombol "Beli" memanggil Edge Function, membuka halaman bayar
   gateway, lalu membuka akses buku setelah status `paid`.

Tabel `orders` pada skema sudah disiapkan untuk ini. Saat siap, beri tahu saya
gateway pilihan Anda (Midtrans/Xendit) dan saya buatkan Edge Function +
integrasi tombolnya.
