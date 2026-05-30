import { BOOKS } from './books'
import type { Book } from '../types'

export interface Theme {
  id: string
  name: string
  /** Deskripsi singkat tema. */
  tagline: string
  /** Emoji ikon untuk kartu kategori. */
  icon: string
  /** Dua warna gradien kartu. */
  color: [string, string]
}

/** Kategori bertema Pemilu — dipakai untuk menelusuri koleksi berdasarkan tema. */
export const THEMES: Theme[] = [
  {
    id: 'demokrasi',
    name: 'Demokrasi & Kewarganegaraan',
    tagline: 'Dasar-dasar demokrasi dan peran warga negara',
    icon: '🏛️',
    color: ['#1e3a8a', '#3b82f6'],
  },
  {
    id: 'pemilu',
    name: 'Pemilu & Pilkada',
    tagline: 'Seluk-beluk pemilihan umum dan kepala daerah',
    icon: '🗳️',
    color: ['#047857', '#10b981'],
  },
  {
    id: 'hukum-konstitusi',
    name: 'Hukum & Konstitusi',
    tagline: 'UUD 1945, regulasi, dan aturan main pemilu',
    icon: '⚖️',
    color: ['#581c87', '#a855f7'],
  },
  {
    id: 'kampanye',
    name: 'Kampanye & Politik Gagasan',
    tagline: 'Kontestasi yang bersih dan beradu program',
    icon: '📣',
    color: ['#0e7490', '#06b6d4'],
  },
  {
    id: 'literasi-digital',
    name: 'Literasi Digital & Anti-Hoaks',
    tagline: 'Menyaring informasi dan melawan disinformasi',
    icon: '🛡️',
    color: ['#9d174d', '#ec4899'],
  },
  {
    id: 'pemilih-muda',
    name: 'Pemilih Muda',
    tagline: 'Peran anak muda menentukan masa depan bangsa',
    icon: '🧑‍🎓',
    color: ['#c2410c', '#fbbf24'],
  },
  {
    id: 'pengawasan',
    name: 'Integritas & Pengawasan',
    tagline: 'Etika penyelenggara dan pengawasan pemilu',
    icon: '🔍',
    color: ['#155e75', '#22d3ee'],
  },
  {
    id: 'sejarah',
    name: 'Sejarah Pemilu',
    tagline: 'Perjalanan pemilu Indonesia dari masa ke masa',
    icon: '📜',
    color: ['#7c2d12', '#ea580c'],
  },
]

export function getTheme(id: string): Theme | undefined {
  return THEMES.find((t) => t.id === id)
}

export function booksByTheme(themeId: string): Book[] {
  return BOOKS.filter((b) => b.themes.includes(themeId))
}

export function themeCount(themeId: string): number {
  return BOOKS.reduce((n, b) => (b.themes.includes(themeId) ? n + 1 : n), 0)
}
