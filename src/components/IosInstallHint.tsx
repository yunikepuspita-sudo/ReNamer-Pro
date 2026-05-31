import { useEffect, useState } from 'react'

/** Deteksi perangkat iOS (iPhone/iPad). */
function isIos(): boolean {
  const ua = window.navigator.userAgent.toLowerCase()
  const iOSDevice = /iphone|ipad|ipod/.test(ua)
  // iPad iOS 13+ menyamar sebagai Mac; deteksi lewat touch.
  const iPadOS = ua.includes('macintosh') && 'ontouchend' in document
  return iOSDevice || iPadOS
}

/** Apakah app sedang berjalan dalam mode terpasang (standalone). */
function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari iOS memakai properti non-standar ini.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

const DISMISS_KEY = 'e-pustaka-ios-install-dismissed'

/**
 * Banner petunjuk pemasangan untuk iPhone/iPad. Safari iOS tidak menyediakan
 * tombol install otomatis, jadi kita pandu manual: Bagikan → Tambah ke Layar Utama.
 */
export default function IosInstallHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIos() || isStandalone()) return
    if (localStorage.getItem(DISMISS_KEY)) return
    setShow(true)
  }, [])

  if (!show) return null

  return (
    <div className="ios-hint" role="dialog" aria-label="Cara memasang aplikasi">
      <button
        className="ios-hint__close"
        aria-label="Tutup"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, '1')
          setShow(false)
        }}
      >
        ✕
      </button>
      <div className="ios-hint__icon">eP</div>
      <div className="ios-hint__body">
        <strong>Pasang E-Pustaka di iPhone</strong>
        <p>
          Tap tombol Bagikan <span className="ios-hint__share">⬆️</span> di Safari, lalu pilih{' '}
          <strong>“Tambahkan ke Layar Utama”</strong>.
        </p>
      </div>
    </div>
  )
}
