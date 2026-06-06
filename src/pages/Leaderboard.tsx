import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContentType } from '../types'
import { useCatalog } from '../context/CatalogContext'
import { useApp } from '../context/AppContext'
import {
  rankBooks,
  computeReaderStats,
  BADGES,
  LEVELS,
  type RankedBook,
} from '../lib/leaderboard'
import PdfCover from '../components/PdfCover'

const TYPE_TABS: { value: 'semua' | ContentType; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'buku', label: 'Buku' },
  { value: 'jurnal', label: 'Jurnal' },
  { value: 'peraturan', label: 'Peraturan' },
  { value: 'modul', label: 'Modul' },
  { value: 'majalah', label: 'Majalah' },
  { value: 'koran', label: 'Koran' },
]

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const { books } = useCatalog()
  const { library, progress, premium } = useApp()
  const [tab, setTab] = useState<'semua' | ContentType>('semua')

  const ranked: RankedBook[] = useMemo(() => {
    const pool = tab === 'semua' ? books : books.filter((b) => b.type === tab)
    return rankBooks(pool).slice(0, 20)
  }, [books, tab])

  const stats = useMemo(
    () => computeReaderStats(library, progress, books, premium),
    [library, progress, books, premium],
  )

  return (
    <div className="leaderboard">
      <header className="leaderboard__head">
        <span className="hero__eyebrow">PAPAN PERINGKAT</span>
        <h1>🏆 Peringkat E-Pustaka</h1>
        <p>Buku terpopuler pilihan pembaca, dan level baca kamu sendiri.</p>
      </header>

      {/* ── Level Pembaca ─────────────────────────────────────────────── */}
      <section className="lvl-card">
        <div className="lvl-card__main">
          <div className="lvl-card__badge" aria-hidden="true">{stats.levelIcon}</div>
          <div className="lvl-card__info">
            <span className="lvl-card__eyebrow">Level {stats.level} · Pembaca</span>
            <h2>{stats.levelName}</h2>
            <div className="lvl-card__bar" aria-hidden="true">
              <span style={{ width: `${stats.progressPct}%` }} />
            </div>
            <p className="lvl-card__next">
              {stats.nextLevelPoints !== null ? (
                <>
                  <strong>{stats.points}</strong> poin · {stats.nextLevelPoints - stats.points} poin lagi
                  menuju <strong>{LEVELS[stats.level]?.name}</strong>
                </>
              ) : (
                <><strong>{stats.points}</strong> poin · level tertinggi tercapai! 🎉</>
              )}
            </p>
          </div>
        </div>

        <div className="lvl-card__stats">
          <div><strong>{stats.owned}</strong><span>Buku dimiliki</span></div>
          <div><strong>{stats.finished}</strong><span>Selesai dibaca</span></div>
          <div><strong>{stats.pagesRead.toLocaleString('id-ID')}</strong><span>Halaman dibaca</span></div>
          <div><strong>{stats.distinctThemes}</strong><span>Tema dijelajahi</span></div>
        </div>

        <div className="lvl-card__badges">
          {BADGES.map((b) => {
            const earned = b.earned(stats)
            return (
              <div key={b.id} className={`badge ${earned ? 'badge--on' : 'badge--off'}`} title={b.hint}>
                <span className="badge__icon">{b.icon}</span>
                <span className="badge__label">{b.label}</span>
              </div>
            )
          })}
        </div>

        {stats.owned === 0 && (
          <p className="lvl-card__empty">
            Belum ada aktivitas. <Link to="/toko">Jelajahi toko</Link> dan mulai baca untuk naik level!
          </p>
        )}
      </section>

      {/* ── Peringkat Buku ────────────────────────────────────────────── */}
      <section className="lb-books">
        <div className="lb-books__head">
          <h2>📈 Buku Terpopuler</h2>
          <div className="lb-tabs" role="tablist">
            {TYPE_TABS.map((t) => (
              <button
                key={t.value}
                role="tab"
                aria-selected={tab === t.value}
                className={`lb-tab ${tab === t.value ? 'is-active' : ''}`}
                onClick={() => setTab(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {ranked.length === 0 ? (
          <p className="empty-state">Belum ada judul pada kategori ini.</p>
        ) : (
          <ol className="lb-list">
            {ranked.map(({ book, score, rank }) => (
              <li key={book.id} className={`lb-row ${rank <= 3 ? 'lb-row--top' : ''}`}>
                <span className="lb-row__rank">{MEDAL[rank] ?? rank}</span>
                <Link to={`/buku/${book.id}`} className="lb-row__cover">
                  <PdfCover book={book} size="sm" />
                </Link>
                <div className="lb-row__info">
                  <Link to={`/buku/${book.id}`} className="lb-row__title">{book.title}</Link>
                  <span className="lb-row__author">{book.author}</span>
                  <span className="lb-row__meta">{book.category} · {book.type.toUpperCase()} · {book.year}</span>
                </div>
                <div className="lb-row__score">
                  <span className="lb-row__stars">★ {book.rating.toFixed(1)}</span>
                  <div className="lb-row__bar" aria-hidden="true"><span style={{ width: `${score}%` }} /></div>
                  <span className="lb-row__pts">skor {score}</span>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="lb-books__note">Peringkat dihitung dari rating pembaca. Tie-breaker: terbaru → paling tebal → judul.</p>
      </section>
    </div>
  )
}
