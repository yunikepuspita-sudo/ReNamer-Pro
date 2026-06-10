import { useLocation } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { getTheme } from '../data/themes'
import { waShareLink, shareBookText, sharePageText } from '../lib/whatsapp'

/** Judul ramah untuk rute statis situs. */
const PAGE_TITLES: Record<string, string> = {
  '/': 'Beranda',
  '/toko': 'Toko Buku',
  '/tema': 'Telusuri Tema',
  '/pustaka': 'Pustaka Saya',
  '/peringkat': 'Papan Peringkat Membaca',
  '/pustaka-ai': 'Pustaka AI',
  '/premium': 'Langganan Premium',
  '/masuk': 'Masuk / Daftar',
  '/admin': 'Halaman Admin',
}

/**
 * Menyusun tautan "bagikan via chat WhatsApp" untuk halaman yang sedang dibuka.
 * Judul buku/tema dideteksi otomatis dari rute; `overrideTitle` dipakai bila
 * rute tidak dikenali tetapi halaman punya judul sendiri (mis. ebook unggahan
 * pengguna di reader).
 */
export function usePageShare(overrideTitle?: string): { href: string; pageTitle: string } {
  const { pathname } = useLocation()
  const { getBook } = useCatalog()

  const bookId = pathname.match(/^\/(?:buku|baca)\/([^/]+)/)?.[1]
  const book = bookId ? getBook(decodeURIComponent(bookId)) : undefined
  if (book) {
    return { href: waShareLink(shareBookText(book)), pageTitle: book.title }
  }

  const themeId = pathname.match(/^\/tema\/([^/]+)/)?.[1]
  const theme = themeId ? getTheme(decodeURIComponent(themeId)) : undefined

  const pageTitle = theme
    ? `Tema ${theme.name}`
    : PAGE_TITLES[pathname] ?? overrideTitle ?? 'E-Pustaka Pemilu'
  return { href: waShareLink(sharePageText({ title: pageTitle, path: pathname })), pageTitle }
}

/**
 * Tombol "Bagikan via WhatsApp" untuk halaman yang sedang dibuka.
 * Membuka WhatsApp dengan teks + tautan halaman, siap dikirim ke chat,
 * grup, atau status.
 */
export default function SharePageWhatsApp({
  className = 'btn btn--ghost',
  title,
}: {
  className?: string
  /** Judul halaman bila deteksi otomatis dari rute tidak cukup. */
  title?: string
}) {
  const { href, pageTitle } = usePageShare(title)
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Bagikan halaman ${pageTitle} via WhatsApp`}
    >
      <span aria-hidden="true">📲</span> Bagikan via WhatsApp
    </a>
  )
}
