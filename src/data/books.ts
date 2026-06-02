import type { Book } from '../types'
import { AI_PROMPT_BOOK } from './aiPromptBook'

/**
 * Koleksi utama berasal dari database (Supabase) lewat panel /admin. Di sini
 * hanya ada ebook gratis bawaan yang selalu tersedia.
 */
export const BOOKS: Book[] = [AI_PROMPT_BOOK]

/** Daftar kategori tetap untuk dropdown admin & filter toko. */
export const CATEGORIES = [
  'Politik',
  'Pendidikan',
  'Sejarah',
  'Hukum',
  'Teknologi',
  'Sosial',
  'Berita',
  'Analisis',
  'Umum',
]

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id)
}

export function formatRupiah(value: number): string {
  if (value === 0) return 'Gratis'
  return 'Rp ' + value.toLocaleString('id-ID')
}
