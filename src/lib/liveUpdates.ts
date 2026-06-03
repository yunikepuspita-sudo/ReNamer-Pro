import { Capacitor } from '@capacitor/core'
import { CapacitorUpdater } from '@capgo/capacitor-updater'
import { App } from '@capacitor/app'

/**
 * Inisialisasi Capgo Live Update.
 *
 * - Di web/PWA: tidak melakukan apa-apa (Capacitor tidak berjalan native).
 * - Di APK Android: memberi tahu Capgo bahwa bundle berhasil dimuat
 *   (`notifyAppReady`) sehingga tidak di-rollback, lalu memeriksa bundle baru
 *   setiap aplikasi kembali ke foreground.
 *
 * Bundle baru di-upload otomatis oleh GitHub Actions ke server Capgo setiap
 * ada perubahan kode (lihat .github/workflows/capgo.yml). Dengan begitu APK
 * yang sudah terpasang ikut ter-update tanpa install ulang.
 */
export function initLiveUpdates(): void {
  if (!Capacitor.isNativePlatform()) return

  // Bersihkan service worker + cache PWA yang mungkin sudah terdaftar dari versi
  // sebelumnya — di webview native SW membuat halaman beku/tidak bisa di-tap.
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {})
    }
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {})
    }
  } catch {
    /* abaikan */
  }

  // Tandai bundle aktif sebagai "berhasil" agar Capgo tidak mengembalikannya.
  CapacitorUpdater.notifyAppReady().catch((err) => {
    console.warn('[liveUpdates] notifyAppReady gagal:', err)
  })

  // Periksa & terapkan update saat aplikasi kembali aktif (kembali ke foreground).
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      CapacitorUpdater.getLatest().catch(() => {
        /* offline atau belum ada update — abaikan dengan tenang */
      })
    }
  })
}
