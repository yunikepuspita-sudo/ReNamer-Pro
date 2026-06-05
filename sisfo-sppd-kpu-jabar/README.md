# 🧳 SISFO SPPD — KPU Jawa Barat

**Sistem Informasi Perjalanan Dinas** — aplikasi **PWA gratis** untuk *pengajuan* dan
*pertanggungjawaban (SPJ)* perjalanan dinas pegawai pada instansi pemerintah, dengan
pendekatan **paperless, mobile-first, dan akuntabel**.

> Dirancang untuk **KPU Provinsi Jawa Barat** (dan dapat dipakai KPU Kabupaten/Kota maupun
> instansi pemerintah lain). Bersifat **100% gratis & open-source**, berjalan sepenuhnya di
> sisi klien (tanpa biaya server), dan dapat di-*hosting* gratis di **GitHub Pages**.

---

## ✨ Fitur Utama

Mengikuti arsitektur proses bisnis perjalanan dinas pemerintah:

| Tahap | Fitur dalam aplikasi |
| --- | --- |
| **Pengajuan** | Form input tujuan/lokasi/tanggal/kegiatan, unggah Undangan/TOR, **estimasi biaya otomatis dari SBM**, cek ketersediaan pagu, **deteksi duplikasi klaim** |
| **Verifikasi berjenjang** | Alur **Atasan → Kasubbag Keuangan → PPK → KPA** dengan aksi *Setuju / Revisi / Tolak* + catatan |
| **Generate dokumen** | **Surat Tugas** & **SPPD elektronik** otomatis, lengkap **QR Code validasi** & penanda TTE (BSrE) — siap **cetak/Simpan PDF** |
| **Pelaksanaan** | **Check-in lokasi**, **geotagging GPS**, unggah **dokumentasi foto** |
| **SPJ Digital** | Laporan, **realisasi biaya riil**, unggah bukti (boarding pass, tiket, invoice hotel, daftar hadir) via kamera/berkas |
| **Verifikasi SPJ** | Alur **Bendahara → PPK → KPA** |
| **Pembayaran & Arsip** | Pencairan/reimbursement, **arsip digital permanen**, **dashboard monitoring serapan anggaran (DIPA) realtime** |
| **Akuntabilitas** | **Audit trail** lengkap & tak-terhapus untuk kebutuhan audit BPK/Inspektorat |

### Inovasi digital yang sudah diimplementasikan
✅ QR Code validasi pada Surat Tugas & SPPD · ✅ penanda Tanda Tangan Elektronik (BSrE) ·
✅ Geotagging lokasi · ✅ Upload SPJ via kamera HP · ✅ Dashboard realtime serapan anggaran ·
✅ Deteksi duplikasi klaim biaya · ✅ Arsip digital permanen · ✅ **Bekerja offline (PWA, installable)**

---

## 🛠️ Teknologi

- **Vanilla JavaScript (ES Modules)** — tanpa framework, **tanpa proses build**.
- **PWA** — Web App Manifest + Service Worker (offline-first, installable di ponsel/desktop).
- **CSS murni** bertema KPU (navy/emas/merah), responsif & *mobile-first*.
- **Penyimpanan lokal** (localStorage) — *offline-first*, tanpa backend berbayar.
- Pustaka **QR** dimuat dari CDN (di-cache Service Worker untuk dukungan offline).

> Karena hanya berkas statis, aplikasi ini **gratis selamanya** untuk di-host (GitHub Pages,
> Netlify, Cloudflare Pages, atau server statis internal instansi).

---

## 🚀 Menjalankan Secara Lokal

Tidak perlu `npm install` atau build. Cukup jalankan server statis apa pun:

```bash
# Opsi 1 — Python
python3 -m http.server 8080

# Opsi 2 — Node (npx)
npx serve .
```

Lalu buka `http://localhost:8080`.

> Service Worker & instalasi PWA membutuhkan konteks aman (`https://` atau `http://localhost`).

---

## 👤 Akun Demo (mode tanpa kata sandi)

Di halaman masuk, pilih **peran** untuk mencoba seluruh alur:

| Peran | Nama | Kewenangan |
| --- | --- | --- |
| Pegawai Pemohon | Andi Nugraha | Mengajukan perjalanan dinas & SPJ |
| Atasan Langsung | Dewi Lestari | Verifikasi kebutuhan tugas |
| Kasubbag Keuangan | Rudi Hartono | Verifikasi anggaran |
| PPK | Bambang Susanto | Persetujuan teknis & administrasi |
| KPA / Sekretaris | Hendra Wijaya | Pengesahan akhir & penerbitan dokumen |
| Bendahara | Siti Aminah | Verifikasi bukti & pembayaran |
| Auditor/Inspektorat | Maya Sari | Monitoring & audit trail |

> 💡 Untuk mencoba alur penuh: masuk sebagai **Pegawai** → ajukan → ganti peran ke
> **Atasan/Keuangan/PPK/KPA** untuk menyetujui → kembali sebagai **Pegawai** untuk check-in & isi SPJ
> → **Bendahara/PPK/KPA** verifikasi SPJ → **Bendahara** catat pembayaran.

---

## 🌐 Deploy ke GitHub Pages (gratis)

Repositori ini menyertakan workflow `.github/workflows/deploy.yml`. Setelah di-push ke repo:

1. Buka **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Setiap push ke branch utama akan otomatis ter-*deploy*.

Karena memakai **hash routing** (`#/...`), seluruh tautan dalam aplikasi aman pada hosting statis
(tidak ada masalah 404 pada *deep link*).

---

## 🗂️ Struktur Proyek

```
sisfo-sppd-kpu-jabar/
├─ index.html              # App shell
├─ manifest.webmanifest    # Metadata PWA
├─ sw.js                   # Service Worker (offline-first)
├─ css/styles.css          # Tema KPU, responsif
├─ icons/                  # Ikon PWA (192/512/maskable)
└─ js/
   ├─ app.js               # Bootstrap, shell, navigasi berbasis peran, routing
   ├─ router.js            # Hash router
   ├─ store.js             # Lapisan data (localStorage)
   ├─ seed.js              # Data demo (pegawai, SBM, DIPA, contoh SPPD)
   ├─ auth.js              # Sesi & peran (RBAC)
   ├─ domain.js            # Mesin status alur, biaya SBM, anggaran, audit
   ├─ ui.js                # Util tampilan (format, modal, toast)
   ├─ qr.js                # Render QR Code validasi
   └─ views/               # Halaman: dashboard, pengajuan, daftar, detail,
                           #   approval, spj, pembayaran, anggaran, arsip,
                           #   audit, masterdata, login
```

---

## 🔭 Roadmap / Integrasi (produksi)

Lapisan data saat ini (localStorage) dapat diganti API tanpa mengubah antarmuka pemanggilnya,
sehingga siap diintegrasikan dengan:

- **SIASN** (data kepegawaian), **SAKTI** (keuangan/DIPA), **E-Office**, **E-Sign BSrE**,
  sistem **presensi**, dan **Google Workspace / Microsoft 365**.
- **AI OCR** untuk membaca tiket, boarding pass, & invoice hotel secara otomatis.
- Notifikasi **WhatsApp/Telegram** pada setiap tahap approval.

---

## 🔐 Catatan Privasi & Data

Pada versi demo, **seluruh data tersimpan lokal di perangkat** (tidak dikirim ke mana pun).
Lampiran/foto disimpan sebagai data lokal — gunakan berkas berukuran kecil pada mode demo.
Menu **Master Data → Sistem → Reset Data Demo** mengembalikan ke data contoh awal.

---

## 📄 Lisensi

[MIT](LICENSE) — bebas digunakan, dimodifikasi, dan disebarluaskan, termasuk untuk kebutuhan
instansi pemerintah. Nama instansi, pegawai, nomor dokumen, dan angka anggaran pada data demo
bersifat **fiktif/ilustratif**.

---

<sub>Dibuat sebagai purwarupa sistem perjalanan dinas paperless untuk lingkungan KPU Jawa Barat.</sub>
