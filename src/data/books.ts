import type { Book } from '../types'

/**
 * Katalog buku contoh bawaan dikosongkan — seluruh koleksi kini berasal dari
 * database (Supabase) yang dikelola lewat panel /admin. Tambahkan buku di sana.
 */
export const BOOKS: Book[] = []

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
