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
