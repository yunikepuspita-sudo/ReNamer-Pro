import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { usePageShare } from '../components/SharePageWhatsApp'
import type { Book, ReaderTheme } from '../types'

const THEMES: { key: ReaderTheme; label: string; swatch: string }[] = [
  { key: 'terang', label: 'Terang', swatch: '#ffffff' },
  { key: 'gelap', label: 'Gelap', swatch: '#1a1a1a' },
  { key: 'sepia', label: 'Sepia', swatch: '#f4ecd8' },
  { key: 'hijau', label: 'Hijau', swatch: '#e6f4ea' },
]

const READER_PREFS_KEY = 'e-pustaka-pemilu-reader'

function loadPrefs(): { theme: ReaderTheme; fontSize: number } {
  try {
    const raw = localStorage.getItem(READER_PREFS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return { theme: 'terang', fontSize: 19 }
}

export default function TextReader({ book }: { book: Book }) {
  const navigate = useNavigate()
  const { inLibrary, premium, progress, setProgress } = useApp()
  const { href: shareHref } = usePageShare(book.title)

  const prefs = loadPrefs()
  const [theme, setTheme] = useState<ReaderTheme>(prefs.theme)
  const [fontSize, setFontSize] = useState<number>(prefs.fontSize)
  const [chapterIndex, setChapterIndex] = useState<number>(progress[book.id] ?? 0)
  const [tocOpen, setTocOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState<number[]>([])

  const owned = inLibrary(book.id)
  // Pengguna yang belum memiliki & non-premium hanya bisa membaca bab pertama (cuplikan).
  const previewOnly = book.premium && !premium && !owned
  const maxChapter = useMemo(() => {
    if (previewOnly) return 0
    if (!owned && book.price > 0) return 0 // berbayar: cuplikan 1 bab
    return book.chapters.length - 1
  }, [book, previewOnly, owned])

  useEffect(() => {
    localStorage.setItem(READER_PREFS_KEY, JSON.stringify({ theme, fontSize }))
  }, [theme, fontSize])

  useEffect(() => {
    setProgress(book.id, chapterIndex)
    window.scrollTo({ top: 0 })
  }, [chapterIndex, book, setProgress])

  const chapter = book.chapters[Math.min(chapterIndex, book.chapters.length - 1)]
  const atFirst = chapterIndex <= 0
  const atLast = chapterIndex >= maxChapter
  const totalReadable = maxChapter + 1
  const percent = Math.round(((chapterIndex + 1) / totalReadable) * 100)

  function toggleBookmark() {
    setBookmarks((prev) =>
      prev.includes(chapterIndex) ? prev.filter((x) => x !== chapterIndex) : [...prev, chapterIndex],
    )
  }

  return (
    <div className={`reader reader--${theme}`} style={{ fontSize }}>
      <div className="reader__topbar">
        <button className="reader__icon" onClick={() => navigate(`/buku/${book.id}`)} title="Kembali">
          ←
        </button>
        <span className="reader__booktitle">{book.title}</span>
        <div className="reader__topbar-right">
          <a
            className="reader__icon"
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
            title="Bagikan via WhatsApp"
            aria-label="Bagikan via WhatsApp"
          >
            📲
          </a>
          <button className="reader__icon" onClick={() => setTocOpen(true)} title="Daftar Isi">☰</button>
          <button
            className={`reader__icon ${bookmarks.includes(chapterIndex) ? 'is-active' : ''}`}
            onClick={toggleBookmark}
            title="Penanda"
          >
            🔖
          </button>
          <button className="reader__icon" onClick={() => setSettingsOpen((v) => !v)} title="Pengaturan">
            Aa
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="reader__settings">
          <div className="reader__settings-row">
            <span>Tema</span>
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
          </div>
          <div className="reader__settings-row">
            <span>Ukuran huruf</span>
            <div className="font-controls">
              <button onClick={() => setFontSize((s) => Math.max(14, s - 1))}>A−</button>
              <span>{fontSize}px</span>
              <button onClick={() => setFontSize((s) => Math.min(28, s + 1))}>A+</button>
            </div>
          </div>
        </div>
      )}

      <article className="reader__page">
        <h1 className="reader__chapter-title">{chapter.title}</h1>
        {chapter.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}

        {previewOnly && (
          <div className="reader__paywall">
            <h3>Lanjutkan dengan Premium</h3>
            <p>Judul ini termasuk koleksi Premium. Berlangganan untuk membaca seluruh bab.</p>
            <Link to="/premium" className="btn btn--primary">Berlangganan Premium</Link>
          </div>
        )}
        {!previewOnly && !owned && book.price > 0 && (
          <div className="reader__paywall">
            <h3>Ini baru cuplikan</h3>
            <p>Tambahkan ke pustaka untuk membaca seluruh isi buku.</p>
            <Link to={`/buku/${book.id}`} className="btn btn--primary">Lihat Detail & Beli</Link>
          </div>
        )}
      </article>

      <div className="reader__bottombar">
        <button className="btn btn--ghost" disabled={atFirst} onClick={() => setChapterIndex((i) => i - 1)}>
          ‹ Sebelumnya
        </button>
        <div className="reader__progress">
          <div className="reader__progress-bar">
            <div style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}%</span>
        </div>
        <button className="btn btn--ghost" disabled={atLast} onClick={() => setChapterIndex((i) => i + 1)}>
          Selanjutnya ›
        </button>
      </div>

      {tocOpen && (
        <div className="reader__drawer-backdrop" onClick={() => setTocOpen(false)}>
          <div className="reader__drawer" onClick={(e) => e.stopPropagation()}>
            <h3>Daftar Isi</h3>
            <ul>
              {book.chapters.map((c, i) => {
                const locked = i > maxChapter
                return (
                  <li key={i}>
                    <button
                      className={`${i === chapterIndex ? 'is-active' : ''} ${locked ? 'is-locked' : ''}`}
                      disabled={locked}
                      onClick={() => {
                        setChapterIndex(i)
                        setTocOpen(false)
                      }}
                    >
                      {c.title}
                      {locked && <span className="lock"> 🔒</span>}
                      {bookmarks.includes(i) && <span className="lock"> 🔖</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
