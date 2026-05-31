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

## Akun Pengguna (Sign up / Login)

Login **email + kata sandi** langsung berfungsi begitu Supabase aktif
(halaman `/#/masuk`). Pengguna bisa daftar & masuk untuk menyimpan koleksi.

> Opsional: di Supabase → **Authentication → Providers → Email**, Anda bisa
> menyalakan/mematikan "Confirm email". Jika dinyalakan, pengguna harus
> klik tautan di email sebelum bisa masuk.

### Mengaktifkan "Lanjutkan dengan Google" (opsional)
Tombol Google sudah ada di UI, tetapi perlu didaftarkan dulu:

1. **Google Cloud Console** (https://console.cloud.google.com) → buat project →
   **APIs & Services → Credentials → Create OAuth client ID** → tipe **Web**.
2. Tambahkan **Authorized redirect URI**:
   `https://ujrfymsvcxiwuqlvoodv.supabase.co/auth/v1/callback`
3. Salin **Client ID** & **Client Secret**.
4. Di **Supabase → Authentication → Providers → Google** → tempel Client ID &
   Secret → **Enable** → Save.
5. Di **Authentication → URL Configuration**, set **Site URL** ke
   `https://pustaka.yunikepuspita.com` dan tambahkan ke **Redirect URLs**.

Setelah itu tombol "Lanjutkan dengan Google" akan berfungsi.

## Premium dengan Pembayaran Nyata (QRIS)

Langganan Premium kini memakai QRIS (Midtrans) dan **terikat ke akun**:
1. Pengguna **harus login** untuk berlangganan.
2. Klik paket → **Berlangganan dengan QRIS** → scan QR → bayar.
3. Webhook Midtrans menandai order `paid` lalu **mengaktifkan `premium=true`**
   di `user_state` pengguna (dengan `premium_until`).

Prasyarat (lihat bagian QRIS di bawah): Midtrans aktif + 3 Edge Functions
ter-deploy + webhook terdaftar. Setelah mengubah Edge Functions, **deploy ulang**:

```bash
supabase functions deploy create-payment  --no-verify-jwt
supabase functions deploy payment-webhook --no-verify-jwt
```

Dan jalankan ulang `supabase/schema.sql` (idempoten) untuk kolom baru
(`orders.kind`, `orders.plan`, `user_state.premium_until`).

> Harga Premium ditetapkan di server (Edge Function): Bulanan Rp 49.000,
> Tahunan Rp 399.000 — ubah di `create-payment/index.ts` bila perlu.

## Buku Berbayar (cuplikan + beli)

- Di panel `/admin`, isi kolom **Harga** (mis. `25000`) dan/atau centang **Premium**.
- Buku PDF berbayar/premium yang **belum dimiliki** hanya bisa dibaca **2 halaman
  pertama** (cuplikan), lalu muncul ajakan membeli.
- Tombol **Beli** saat ini bersifat **simulasi**: menekan "Beli" langsung memberi
  akses (tanpa uang nyata). Setelah "dibeli", buku tampil penuh & masuk Pustaka.
- Pelanggan **Premium** otomatis bisa membaca penuh buku bertanda Premium.
- Pembayaran sungguhan = **Fase 2** di bawah.

## FASE 2 — Pembayaran QRIS (Midtrans) ✅ KODE SIAP

Alur: tombol **Beli (QRIS)** → Edge Function membuat transaksi QRIS di Midtrans →
app menampilkan **kode QR** + polling status → pengguna scan (GoPay/DANA/OVO/
ShopeePay/m-banking) → Midtrans kirim **webhook** → order ditandai `paid` →
buku terbuka otomatis.

### 1. Daftar Midtrans
1. Daftar di https://midtrans.com (atau https://dashboard.sandbox.midtrans.com
   untuk **uji coba gratis** tanpa verifikasi).
2. **Settings → Access Keys**: catat **Server Key** dan **Client Key**.
3. **Settings → Payment** : aktifkan **QRIS**.
4. Produksi (uang nyata) butuh verifikasi usaha/identitas: KTP, rekening bank,
   kadang NPWP/badan usaha. Sandbox tidak butuh ini.

### 2. Set Secrets di Supabase (untuk Edge Functions)
Hanya **dua** secret yang perlu diset (via CLI atau Dashboard → Edge Functions → Secrets):

```
supabase secrets set MIDTRANS_SERVER_KEY=<Server Key Midtrans>
supabase secrets set MIDTRANS_IS_PRODUCTION=false   # true bila sudah live
```

> CATATAN: `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` **TIDAK perlu diset** —
> Supabase otomatis menyediakannya ke setiap Edge Function. (Nama berawalan
> `SUPABASE_` memang ditolak oleh CLI karena sudah dipesan sistem.)

### 3. Jalankan ulang skema (kolom baru `id_str`)
Jalankan kembali `supabase/schema.sql` di SQL Editor (idempoten/aman diulang) —
menambahkan kolom `id_str` pada tabel `orders`.

### 4. Deploy Edge Functions
Pasang **Supabase CLI** (https://supabase.com/docs/guides/cli), lalu:

```bash
supabase login
supabase link --project-ref <ref>
supabase functions deploy create-payment  --no-verify-jwt
supabase functions deploy payment-status  --no-verify-jwt
supabase functions deploy payment-webhook --no-verify-jwt
```

### 5. Daftarkan URL webhook di Midtrans
Midtrans Dashboard → **Settings → Configuration → Payment Notification URL**:

```
https://<ref>.supabase.co/functions/v1/payment-webhook
```

### 6. Selesai — uji
Buka buku berbayar → **Beli (QRIS)** → scan dengan simulator Midtrans (sandbox)
atau e-wallet (produksi). Setelah lunas, modal otomatis menandai berhasil dan
buku masuk Pustaka.

**Berkas terkait:**
- `supabase/functions/create-payment/`  — buat transaksi QRIS
- `supabase/functions/payment-status/`  — cek status (dipakai polling)
- `supabase/functions/payment-webhook/` — terima notifikasi Midtrans (verifikasi signature)
- `src/lib/payments.ts`, `src/components/QrisCheckout.tsx` — sisi frontend

**Catatan:** pengguna app belum punya akun login, jadi akses buku setelah bayar
terbuka di perangkat tersebut (order tetap tercatat di tabel `orders` untuk
pembukuan). Kepemilikan lintas-perangkat memerlukan fitur login pengguna —
bisa ditambahkan menyusul.
