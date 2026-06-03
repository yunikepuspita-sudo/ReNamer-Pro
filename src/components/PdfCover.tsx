import { useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { pdfjs } from '../lib/pdf'
import type { Book } from '../types'
import BookCover from './BookCover'

const heights = { sm: 150, md: 210, lg: 320 } as const

// Di aplikasi native (Capacitor), merender banyak sampul dari PDF sekaligus
// memberatkan webview dan bisa membekukan halaman. Pakai sampul gradien saja.
const usesPdfCover = !Capacitor.isNativePlatform()

/** Cache hasil render halaman pertama agar tidak diulang antar komponen. */
const coverCache = new Map<string, string>()

/**
 * Sampul yang menampilkan HALAMAN PERTAMA PDF sebagai gambar.
 * Bila buku tak punya pdfUrl atau render gagal, jatuh ke sampul gradien biasa.
 */
export default function PdfCover({
  book,
  size = 'md',
}: {
  book: Book
  size?: 'sm' | 'md' | 'lg'
}) {
  const [img, setImg] = useState<string | null>(book.pdfUrl ? coverCache.get(book.pdfUrl) ?? null : null)
  const [failed, setFailed] = useState(false)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!usesPdfCover) return
    if (!book.pdfUrl || img || failed || startedRef.current) return
    startedRef.current = true
    let cancelled = false

    async function render(url: string) {
      try {
        const loadingTask = pdfjs.getDocument(url)
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        const viewport = page.getViewport({ scale: 1 })
        const targetW = 400
        const scale = targetW / viewport.width
        const scaled = page.getViewport({ scale })
        const canvas = document.createElement('canvas')
        canvas.width = scaled.width
        canvas.height = scaled.height
        const ctx = canvas.getContext('2d')!
        await page.render({ canvasContext: ctx, viewport: scaled, canvas }).promise
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        if (!cancelled) {
          coverCache.set(url, dataUrl)
          setImg(dataUrl)
        }
      } catch {
        if (!cancelled) setFailed(true)
      }
    }

    render(book.pdfUrl)
    return () => {
      cancelled = true
    }
  }, [book.pdfUrl, img, failed])

  // Native, tidak ada PDF, atau render gagal → sampul gradien biasa.
  if (!usesPdfCover || !book.pdfUrl || failed) return <BookCover book={book} size={size} />

  // Belum selesai render → tampilkan gradien sebagai placeholder.
  if (!img) return <BookCover book={book} size={size} />

  return (
    <div
      className="pdf-cover"
      style={{ height: heights[size] }}
      aria-label={`Sampul ${book.title}`}
    >
      <img src={img} alt="" loading="lazy" />
      {book.premium && <span className="book-cover__premium">PREMIUM</span>}
    </div>
  )
}
