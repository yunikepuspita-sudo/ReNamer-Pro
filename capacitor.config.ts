import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.yunikepuspita.epustaka',
  appName: 'E-Pustaka Pemilu',
  // Hasil build Vite (lihat "npm run build") menjadi isi web yang dibungkus APK.
  webDir: 'dist',
  plugins: {
    // Capgo Live Update — mengunduh bundle web terbaru secara OTA (over-the-air)
    // tanpa perlu install ulang APK. Bundle baru di-upload oleh GitHub Actions
    // setiap ada perubahan (lihat .github/workflows/capgo.yml).
    CapacitorUpdater: {
      autoUpdate: true,
      // Terapkan update saat aplikasi kembali ke foreground / dibuka lagi.
      directUpdate: false,
      resetWhenUpdate: true,
    },
  },
}

export default config
