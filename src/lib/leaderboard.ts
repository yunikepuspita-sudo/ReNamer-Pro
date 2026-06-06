// ──────────────────────────────────────────────────────────────────────────
// Papan Peringkat (Leaderboard) E-Pustaka Pemilu
//
// Logika murni untuk dua peringkat, mengikuti konsep dasar sistem leaderboard
// (skor → urut → ranking dengan tie-breaker):
//
//   1) Peringkat Buku   — koleksi diperingkat berdasarkan skor popularitas
//                         (diturunkan dari rating pembaca).
//   2) Level Pembaca    — gamifikasi aktivitas baca pengguna saat ini
//                         (poin, level, lencana) dari data lokal.
//
// Semua fungsi di sini murni & deterministik agar mudah diuji dan dipakai
// ulang. Tidak ada I/O — data dipasok pemanggil (CatalogContext / AppContext).
// ──────────────────────────────────────────────────────────────────────────

import type { Book } from '../types'

// ── 1) Peringkat Buku ───────────────────────────────────────────────────────

export interface RankedBook {
  book: Book
  /** Skor popularitas 0–100 (diturunkan dari rating). */
  score: number
  /** Peringkat mulai dari 1. Skor sama → peringkat sama (standard competition). */
  rank: number
}

/** Skor popularitas 0–100 dari rating bintang (0–5). */
export function bookScore(book: Book): number {
  return Math.round((book.rating || 0) * 20)
}

/**
 * Urutkan & beri peringkat buku berdasarkan skor (desc).
 * Tie-breaker: tahun lebih baru → halaman lebih banyak → judul A-Z.
 * Peringkat memakai metode "standard competition" (1,2,2,4).
 */
export function rankBooks(books: Book[]): RankedBook[] {
  const scored = books
    .map((book) => ({ book, score: bookScore(book) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      if (b.book.year !== a.book.year) return b.book.year - a.book.year
      if (b.book.pages !== a.book.pages) return b.book.pages - a.book.pages
      return a.book.title.localeCompare(b.book.title, 'id')
    })

  let lastScore = Number.NaN
  let lastRank = 0
  return scored.map((row, i) => {
    const rank = row.score === lastScore ? lastRank : i + 1
    lastScore = row.score
    lastRank = rank
    return { ...row, rank }
  })
}

// ── 2) Level Pembaca (gamifikasi) ───────────────────────────────────────────

export interface ReaderStats {
  owned: number
  finished: number
  pagesRead: number
  distinctThemes: number
  distinctTypes: number
  premium: boolean
  points: number
  level: number
  levelName: string
  levelIcon: string
  /** Poin ambang level berikutnya, atau null bila sudah level tertinggi. */
  nextLevelPoints: number | null
  /** Progres menuju level berikutnya, 0–100. */
  progressPct: number
}

interface LevelTier {
  min: number
  name: string
  icon: string
}

/** Tingkatan level berdasarkan total poin. */
export const LEVELS: LevelTier[] = [
  { min: 0, name: 'Pembaca Baru', icon: '🌱' },
  { min: 100, name: 'Pembaca Aktif', icon: '📖' },
  { min: 300, name: 'Kutu Buku', icon: '🐛' },
  { min: 600, name: 'Penggemar Literasi', icon: '📚' },
  { min: 1000, name: 'Pustakawan Muda', icon: '🎓' },
  { min: 1600, name: 'Maestro Literasi', icon: '🏆' },
]

/** Apakah sebuah buku dianggap "selesai" dibaca dari progres babnya. */
function isFinished(book: Book, chapterIndex: number | undefined): boolean {
  if (chapterIndex === undefined) return false
  const total = book.chapters?.length ?? 0
  if (total <= 1) return chapterIndex >= 0 // buku/PDF satu bagian: ada progres = selesai
  return chapterIndex >= total - 1
}

/** Estimasi halaman yang sudah dibaca pada satu buku. */
function pagesReadFor(book: Book, chapterIndex: number | undefined): number {
  if (chapterIndex === undefined) return 0
  const total = book.chapters?.length ?? 0
  if (isFinished(book, chapterIndex)) return book.pages || 0
  if (total <= 1) return Math.round((book.pages || 0) * 0.5)
  return Math.round(((book.pages || 0) * (chapterIndex + 1)) / total)
}

/**
 * Hitung statistik & level pembaca dari pustaka + progres baca.
 * @param library  ID buku yang dimiliki pengguna.
 * @param progress Map id → indeks bab terakhir.
 * @param books    Katalog penuh (untuk mencari metadata buku).
 * @param premium  Status langganan Premium.
 */
export function computeReaderStats(
  library: string[],
  progress: Record<string, number>,
  books: Book[],
  premium: boolean,
): ReaderStats {
  const byId = new Map(books.map((b) => [b.id, b]))
  const owned = library.map((id) => byId.get(id)).filter((b): b is Book => Boolean(b))

  let finished = 0
  let pagesRead = 0
  const themes = new Set<string>()
  const types = new Set<string>()

  for (const book of owned) {
    const p = progress[book.id]
    if (isFinished(book, p)) finished++
    pagesRead += pagesReadFor(book, p)
    book.themes?.forEach((t) => themes.add(t))
    types.add(book.type)
  }

  const points = finished * 100 + owned.length * 20 + Math.floor(pagesRead / 10)

  let tierIdx = 0
  for (let i = 0; i < LEVELS.length; i++) if (points >= LEVELS[i].min) tierIdx = i
  const tier = LEVELS[tierIdx]
  const next = LEVELS[tierIdx + 1] ?? null
  const progressPct = next
    ? Math.round(((points - tier.min) / (next.min - tier.min)) * 100)
    : 100

  return {
    owned: owned.length,
    finished,
    pagesRead,
    distinctThemes: themes.size,
    distinctTypes: types.size,
    premium,
    points,
    level: tierIdx + 1,
    levelName: tier.name,
    levelIcon: tier.icon,
    nextLevelPoints: next ? next.min : null,
    progressPct,
  }
}

// ── Lencana (badges) ────────────────────────────────────────────────────────

export interface Badge {
  id: string
  icon: string
  label: string
  hint: string
  earned: (s: ReaderStats) => boolean
}

export const BADGES: Badge[] = [
  { id: 'mulai', icon: '📖', label: 'Langkah Pertama', hint: 'Tambahkan 1 buku ke pustaka', earned: (s) => s.owned >= 1 },
  { id: 'tuntas', icon: '✅', label: 'Tuntas Pertama', hint: 'Selesaikan 1 buku', earned: (s) => s.finished >= 1 },
  { id: 'kolektor', icon: '🗃️', label: 'Kolektor', hint: 'Miliki 5 buku', earned: (s) => s.owned >= 5 },
  { id: 'pelahap', icon: '🔥', label: 'Pelahap Buku', hint: 'Selesaikan 5 buku', earned: (s) => s.finished >= 5 },
  { id: 'tema', icon: '🗳️', label: 'Penjelajah Tema', hint: 'Koleksi mencakup 3 tema pemilu', earned: (s) => s.distinctThemes >= 3 },
  { id: 'format', icon: '🧭', label: 'Lintas Format', hint: 'Koleksi mencakup 3 jenis bahan', earned: (s) => s.distinctTypes >= 3 },
  { id: 'premium', icon: '✦', label: 'Anggota Premium', hint: 'Berlangganan Premium', earned: (s) => s.premium },
]
