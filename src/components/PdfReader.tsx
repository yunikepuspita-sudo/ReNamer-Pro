import { useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import '../lib/pdf'
import type { ReaderTheme } from '../types'

const THEMES: { key: ReaderTheme; label: string; swatch: string }[] = [
  { key: 'terang', label: 'Terang', swatch: '#ffffff' },
  { key: 'gelap', label: 'Gelap', swatch: '#1a1a1a' },
  { key: 'sepia', label: 'Sepia', swatch: '#f4ecd8' },
  { key: 'hijau', label: 'Hijau', swatch: '#e6f4ea' },
]

export default function PdfReader({
  source,
  title,
  onBack,
  previewPages,
  onUnlock,
}: {
  /** URL string atau Blob/File untuk file PDF. */
  source: string | Blob
  title: string
  onBack: () => void
  /** Bila diisi, pembaca hanya boleh membuka sampai N halaman (cuplikan). */
  previewPages?: number
  /** Aksi saat pengguna menekan tombol buka/beli di paywall. */
  onUnlock?: () => void
}) {
  const [numPages, setNumPages] = useState(0)
  const [page, setPage] = useState(1)
  const [scale, setScale] = useState(1)
  const [theme, setTheme] = useState<ReaderTheme>('terang')
  const [error, setError] = useState<string | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(800)

  // react-pdf menerima URL string maupun Blob/File secara langsung; referensi distabilkan.
  const file = useMemo(() => source, [source])

  useEffect(() => {
    function measure() {
      if (wrapRef.current) setWidth(Math.min(900, wrapRef.current.clientWidth - 32))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // Halaman maksimal yang boleh dibuka: dibatasi cuplikan bila terkunci.
  const maxPage = previewPages && numPages ? Math.min(previewPages, numPages) : numPages
  const locked = Boolean(previewPages)
  const atPreviewEnd = locked && page >= maxPage

  const atFirst = page <= 1
  const atLast = page >= maxPage
  const percent = numPages ? Math.round((page / numPages) * 100) : 0

  return (
    <div className={`reader reader--${theme}`}>
      <div className="reader__topbar">
        <button className="reader__icon" onClick={onBack} title="Kembali">←</button>
        <span className="reader__booktitle">
          {title}
          {locked && <span className="pdf-preview-badge">CUPLIKAN</span>}
        </span>
        <div className="reader__topbar-right">
          <div className="theme-swatches">
            {THEMES.map((t) => (
              <button
                key={t.key}
                className={`swatch ${theme === t.key ? 'is-active' : ''}`}
                style={{ background: t.swatch }}
                onClick={() => setTheme(t.key)}
                title={t.label}
                aria-label={t.label}
              />
            ))}
          </div>
          <button className="reader__icon" onClick={() => setScale((s) => Math.max(0.6, s - 0.15))} title="Perkecil">−</button>
          <button className="reader__icon" onClick={() => setScale((s) => Math.min(2.5, s + 0.15))} title="Perbesar">+</button>
        </div>
      </div>

      <div className="pdf-stage" ref={wrapRef}>
        {error ? (
          <div className="reader__paywall">
            <h3>Gagal memuat PDF</h3>
            <p>{error}</p>
          </div>
        ) : (
          <Document
            file={file}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages)
              setError(null)
            }}
            onLoadError={(e) => setError(e.message)}
            loading={<p className="pdf-loading">Memuat PDF…</p>}
          >
            <Page
              pageNumber={page}
              width={width * scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={<p className="pdf-loading">Memuat halaman…</p>}
            />
          </Document>
        )}

        {atPreviewEnd && (
          <div className="reader__paywall pdf-paywall">
            <h3>🔒 Ini baru cuplikan</h3>
            <p>
              Anda membaca {maxPage} halaman pertama. Beli buku ini untuk membaca seluruh
              {numPages ? ` ${numPages}` : ''} halaman.
            </p>
            {onUnlock && (
              <button className="btn btn--primary" onClick={onUnlock}>
                Beli untuk Membaca Penuh
              </button>
            )}
          </div>
        )}
      </div>

      <div className="reader__bottombar">
        <button className="btn btn--ghost" disabled={atFirst} onClick={() => setPage((p) => p - 1)}>‹ Sebelumnya</button>
        <div className="reader__progress">
          <div className="reader__progress-bar">
            <div style={{ width: `${percent}%` }} />
          </div>
          <span>{numPages ? `Hal ${page} / ${numPages}` : '…'}</span>
        </div>
        <button className="btn btn--ghost" disabled={atLast} onClick={() => setPage((p) => p + 1)}>Selanjutnya ›</button>
      </div>
    </div>
  )
}
