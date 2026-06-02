# 📱 Android (APK) + Capgo Live Update

Panduan membangun aplikasi Android dari E-Pustaka Pemilu dan mengaktifkan
**update OTA via GitHub** menggunakan [Capgo](https://capgo.app).

## Konsep singkat

APK = **cangkang native (Android)** + **isi web (React)**.

| Bagian | Cara update |
|---|---|
| **Isi web** (UI, logika, data) | ✅ Otomatis via Capgo — push ke GitHub, APK terpasang ikut ter-update |
| **Cangkang native** (versi Android, ikon, izin, plugin native) | ❌ Wajib build & install ulang APK |

Jadi: perubahan UI/logika sehari-hari cukup `git push` → sampai ke HP otomatis.
Hanya saat menambah plugin native atau ganti ikon/izin perlu rebuild APK.

---

## 1. Persiapan satu kali

### a. Akun Capgo
1. Daftar di https://app.capgo.app
2. Buat **API Key** (Account → API Keys → tipe **upload** / **all**).
3. Login lokal & daftarkan app:
   ```bash
   npx @capgo/cli@latest login <API_KEY>
   npx @capgo/cli@latest app add com.yunikepuspita.epustaka
   npx @capgo/cli@latest channel add production com.yunikepuspita.epustaka --default
   ```

### b. Secret GitHub
Di repo: **Settings → Secrets and variables → Actions → New repository secret**
- Nama: `CAPGO_TOKEN`
- Nilai: API Key dari langkah di atas.

(Workflow `.github/workflows/capgo.yml` memakai secret ini untuk upload bundle.)

---

## 2. Build APK pertama (hanya butuh sekali, lalu saat ubah native saja)

Butuh **Android Studio** + **JDK 17** terpasang di komputer.

```bash
npm install              # pasang dependensi
npm run cap:sync         # build web + sinkron ke proyek Android
npm run cap:open         # buka di Android Studio → Build > Build APK(s)
```

Atau via terminal (debug APK):
```bash
npm run cap:sync
cd android && ./gradlew assembleDebug
# hasil: android/app/build/outputs/apk/debug/app-debug.apk
```

Untuk rilis (perlu keystore penandatanganan):
```bash
npm run android:build    # assembleRelease
```

Install APK ke HP, lalu sebarkan / unggah ke Play Store sesuai kebutuhan.

---

## 3. Update via GitHub (sehari-hari) 🚀

Cukup ubah kode lalu:
```bash
git push
```

Saat ada push ke `main`, GitHub Actions akan:
1. Build ulang isi web (`npm run build`).
2. Upload bundle baru ke channel `production` di Capgo.

APK yang sudah terpasang akan **mengunduh & menerapkan bundle baru otomatis**
saat aplikasi dibuka kembali (lihat `src/lib/liveUpdates.ts`).

> Catatan: naikkan `version` di `package.json` saat rilis besar agar mudah
> dilacak di dashboard Capgo (bundle ditandai dengan versi tersebut).

---

## 4. Kapan TETAP harus rebuild APK?

- Menamb/menghapus **plugin Capacitor native** (mis. kamera, push notification).
- Ganti **ikon, nama, atau izin (permissions)** aplikasi.
- Update **versi Capacitor** atau target SDK Android.

Perubahan murni di sisi web (React/CSS/data) **tidak** perlu rebuild.

---

## Ringkasan file yang relevan

| File | Fungsi |
|---|---|
| `capacitor.config.ts` | Konfigurasi app native + plugin Capgo |
| `src/lib/liveUpdates.ts` | Inisialisasi Capgo (notifyAppReady + cek update) |
| `.github/workflows/capgo.yml` | Auto-upload bundle ke Capgo tiap push |
| `android/` | Proyek Android native (untuk build APK) |
