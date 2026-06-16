# SAE SURVEI — Prototipe UI

Prototipe antarmuka (UI) **SAE SURVEI** (*Smart Analytics & Evaluation for Survey,
Reputation, Value, Engagement, and Index*) — platform survei digital. Aplikasi ini
**PWA mandiri** (vanilla JS, offline-first, data contoh di memori) dan dapat
diakses di `/sae-survei/`.

> Ini **prototipe tampilan**, belum tersambung basis data. Tujuannya memberi
> gambaran visual nyata atas arsitektur di `ARSITEKTUR-SAE-SURVEI.md`.

## Layar yang tersedia

1. **📈 Dashboard** — kartu ringkas (Nilai IKM, total responden, survei aktif, NPS),
   *score dial* IKM + kategori mutu (A–D), nilai per-unsur (NRR), tren 6 bulan, dan
   *heatmap* kepuasan per unit.
2. **🗂️ Daftar Survei** — daftar survei (IKM, Pegawai/Engagement, Stakeholder, NPS,
   Integritas, Evaluasi Kegiatan) dengan status & indeks, serta panel **Distribusi
   multi-kanal** (QR ilustrasi, Link, Email, WhatsApp, SMS, Kiosk).
3. **📝 Isi Survei** — tampilan sisi responden: pertanyaan **Likert** (emoji),
   **rating bintang**, isian terbuka, dan **branching logic** (jika ada nilai ≤ 2,
   muncul pertanyaan keluhan). Kirim → layar terima kasih.
4. **🤖 Analitik AI** — *sentiment analysis* (bar positif/netral/negatif + klasifikasi
   komentar), *topic clustering*, dan *recommendation generator*.
5. **📄 Laporan** — *AI Report Generator*: pilih PDF/Word/PowerPoint untuk melihat
   pratinjau ringkasan eksekutif otomatis.

## Menjalankan

Bagian dari repo E-Pustaka. Jalankan dari root:

```bash
npm run dev      # buka http://localhost:5173/sae-survei/
```

Atau buka langsung berkas `public/sae-survei/index.html` (semua dependensi lokal,
tanpa proses build).

## Struktur

```
public/sae-survei/
  index.html          # app-shell + topbar + footer
  styles.css          # gaya (tema cyan/teal, sejalur dengan perencanaan-kpu)
  data.js             # data contoh: unsur IKM, unit, tren, survei, komentar, rekomendasi
  app.js              # router tab + render tiap layar + interaksi
  manifest.json       # PWA manifest
  service-worker.js   # cache app-shell (network-first)
  icons/              # icon.svg + PNG 192/512
```

> **Catatan:** QR pada layar Distribusi adalah ilustrasi deterministik (bukan QR
> asli) agar aplikasi tetap berjalan tanpa koneksi/pustaka eksternal.
