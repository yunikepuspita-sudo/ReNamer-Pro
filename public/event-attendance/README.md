# 📋 Smart Attendance Event (PWA)

Aplikasi absensi acara berbasis **QR Code** yang berjalan sepenuhnya dari **HP Android**
tanpa laptop dan tanpa biaya lisensi. Alur lengkap:

```
Surat Undangan (PDF) → QR RSVP → Konfirmasi Kehadiran → QR Peserta
   → Scan Panitia (Check-in/Check-out) → Rekap Kehadiran (Spreadsheet)
```

Cocok untuk Rakor, Bimtek, Sosialisasi, FGD, dan Workshop — dapat direplikasi di
KPU Provinsi maupun KPU Kabupaten/Kota.

---

## ✨ Fitur

| Modul | Halaman | Keterangan |
|------|---------|-----------|
| 1. Input Undangan | `admin.html` | Panitia membuat kegiatan: nomor surat, nama, tanggal, lokasi, link PDF. |
| 2. Konfirmasi Kehadiran (RSVP) | `index.html?rsvp=<id>` | Peserta scan QR undangan → isi form (nama, NIP/NIK, instansi, jabatan, WA, email, bersedia hadir). |
| 3. Generate QR Peserta | `index.html?ticket=<id>` | QR unik otomatis dibuat, bisa diunduh / dikirim via **WhatsApp** / **Email**. |
| 4. Scan Panitia | `checkin.html` | Kamera HP memindai QR peserta → **check-in** tercatat dengan jam. |
| 5. Check-out | `checkin.html` | Scan ulang QR yang sama → **check-out** + hitung **durasi**. |
| Dashboard | `admin.html` | Statistik Konfirmasi / Hadir / Belum hadir / Tidak hadir. |
| Export | `admin.html` | **CSV**, **Excel (.xlsx)**, dan **PDF / Cetak** daftar hadir. |
| Validasi GPS | opsional per kegiatan | Check-in hanya valid dalam radius (mis. 100 m) dari lokasi — mengurangi titip absen. |
| Multi Event | bawaan | Satu aplikasi untuk banyak kegiatan sekaligus. |
| PWA / Offline | semua | Dapat dipasang ke layar utama (Add to Home Screen) & app-shell tersimpan offline. |

---

## 🗂️ Struktur

```
event-attendance/
├── index.html          # Peserta: landing, RSVP, tiket QR
├── checkin.html        # Panitia: scanner check-in / check-out
├── admin.html          # Panitia: buat kegiatan, dashboard, peserta, export, pengaturan
├── app.js              # Inti: data layer (online/demo), GPS, export, helper
├── qr.js               # Generate QR (QRCode.js) & scan kamera (html5-qrcode)
├── styles.css          # Tampilan
├── manifest.json       # Metadata PWA
├── service-worker.js   # Cache app-shell (offline)
├── icons/              # Ikon aplikasi (SVG + PNG 192/512)
└── apps-script/        # Backend Google (opsional, untuk sinkron antar-HP)
    ├── Code.gs
    └── SheetService.gs
```

---

## 🚀 Menjalankan

Karena murni statis (HTML/JS), cukup buka lewat HTTP. Beberapa cara:

```bash
# dari root repo
npx serve event-attendance          # lalu buka http://localhost:3000
# atau
cd event-attendance && python3 -m http.server 8080
```

> **Catatan:** kamera & PWA hanya aktif di **HTTPS** atau **localhost**.
> Saat di-deploy ke GitHub Pages, akses di `…/event-attendance/`.

---

## 🔌 Dua Mode Data

### Mode Demo (default, tanpa setup)
Bila URL backend kosong, seluruh data (kegiatan, peserta, check-in) disimpan di
**localStorage perangkat ini**. Cocok untuk uji coba — namun data tidak tersinkron
antar HP (mis. HP peserta dan HP panitia berbeda).

### Mode Online (Google Sheets) — direkomendasikan untuk acara nyata
Hubungkan ke **Google Apps Script + Google Sheets** agar semua perangkat berbagi
data yang sama:

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru.
2. **Extensions → Apps Script**. Hapus isi default, buat dua file dan tempel isi dari
   folder `apps-script/`: `Code.gs` dan `SheetService.gs`.
3. **Deploy → New deployment → Web app**
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   - Salin URL yang berakhiran `…/exec`.
4. Di PWA: **Admin → Pengaturan**, tempel URL tersebut → **Simpan** → **Tes Koneksi**.

Sheet `Events` dan `Participants` dibuat otomatis pada penggunaan pertama. Kolom
`Participants` itulah **rekap kehadiran** (ID, Nama, Instansi, Check In, Check Out, dst).

---

## 📲 Mengirim QR ke Peserta

Setelah RSVP, peserta langsung mendapat halaman tiket QR (`?ticket=<id>`). Tombol
**WhatsApp** membuka `wa.me` dengan pesan + tautan tiket; tombol **Email** membuka
`mailto:` — keduanya tanpa biaya API. Untuk pengiriman massal otomatis, integrasikan
WhatsApp Business API / layanan email di Apps Script (opsional, di luar lingkup dasar).

---

## 🔒 Privasi

Mode demo menyimpan data hanya di perangkat. Mode online menyimpan data di Google
Sheets milik Anda sendiri. Tidak ada server pihak ketiga lain yang menerima data peserta.
