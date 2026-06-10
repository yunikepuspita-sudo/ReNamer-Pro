import { useEffect, useRef, useState } from 'react'
import { waChatLink, waChannelLink, hasChannel, WA_CHANNEL_NAME } from '../lib/whatsapp'
import { usePageShare } from './SharePageWhatsApp'

/** Ikon resmi WhatsApp (inline SVG, tanpa aset gambar eksternal). */
function WaIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
      <path d="M16.04 4C9.96 4 5.02 8.94 5.02 15.02c0 1.94.51 3.84 1.48 5.51L4.9 27l6.63-1.55a11 11 0 0 0 4.5.96h.01c6.08 0 11.02-4.94 11.02-11.02C27.06 8.94 22.12 4 16.04 4Zm0 20.02h-.01a9.14 9.14 0 0 1-4.65-1.27l-.33-.2-3.93.92.84-3.83-.22-.35a9.1 9.1 0 0 1-1.4-4.86c0-5.05 4.11-9.16 9.17-9.16 2.45 0 4.75.96 6.48 2.69a9.1 9.1 0 0 1 2.68 6.48c0 5.06-4.11 9.17-9.3 9.17Zm5.03-6.86c-.28-.14-1.63-.8-1.88-.9-.25-.09-.43-.14-.62.14-.18.27-.71.9-.87 1.08-.16.18-.32.2-.6.07-.28-.14-1.16-.43-2.21-1.36-.82-.73-1.37-1.63-1.53-1.9-.16-.28-.02-.43.12-.57.13-.12.28-.32.41-.48.14-.16.18-.27.28-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.5-.85-2.05-.22-.53-.45-.46-.62-.47l-.53-.01c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.35.98 2.66 1.12 2.84.14.18 1.94 2.96 4.7 4.15.66.28 1.17.45 1.57.58.66.21 1.26.18 1.74.11.53-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.18-.53-.32Z" />
    </svg>
  )
}

/**
 * Tombol mengambang WhatsApp di pojok kanan-bawah.
 * Diklik → menu kecil: hubungi customer care + ikuti Saluran WhatsApp.
 */
export default function WhatsAppFab() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { href: shareHref, pageTitle } = usePageShare()

  // Tutup menu saat klik di luar atau tekan Escape.
  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const csMessage = 'Halo E-Pustaka Pemilu, saya ingin bertanya tentang koleksi dan layanan.'

  return (
    <div className="wa-fab" ref={ref}>
      {open && (
        <div className="wa-fab__menu" role="menu">
          <p className="wa-fab__title">Butuh bantuan?</p>
          <a
            className="wa-fab__item"
            href={waChatLink(csMessage)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
          >
            <span className="wa-fab__item-icon">💬</span>
            <span>
              <strong>Chat Customer Care</strong>
              <small>Tanya koleksi, akun, atau pembayaran</small>
            </span>
          </a>
          {hasChannel && (
            <a
              className="wa-fab__item"
              href={waChannelLink()}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
            >
              <span className="wa-fab__item-icon">📢</span>
              <span>
                <strong>Ikuti Saluran WhatsApp</strong>
                <small>Info koleksi & e-book baru dari {WA_CHANNEL_NAME}</small>
              </span>
            </a>
          )}
          <a
            className="wa-fab__item"
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <span className="wa-fab__item-icon">📲</span>
            <span>
              <strong>Bagikan Halaman Ini</strong>
              <small>Kirim tautan {pageTitle} ke chat WhatsApp</small>
            </span>
          </a>
        </div>
      )}

      <button
        className="wa-fab__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label="Hubungi kami via WhatsApp"
        aria-expanded={open}
      >
        <WaIcon />
      </button>
    </div>
  )
}
