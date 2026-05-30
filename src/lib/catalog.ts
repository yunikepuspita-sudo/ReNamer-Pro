import { BOOKS as STATIC_BOOKS } from '../data/books'
import { supabase, isSupabaseEnabled, PDF_BUCKET } from './supabase'
import type { Book, ContentType } from '../types'

/** Baris tabel `books` di Supabase. */
interface BookRow {
  id: string
  title: string
  author: string
  publisher: string | null
  type: ContentType
  category: string | null
  themes: string[] | null
  year: number | null
  price: number | null
  rating: number | null
  premium: boolean | null
  cover: [string, string] | null
  synopsis: string | null
  pages: number | null
  pdf_url: string | null
  created_at?: string
}

function rowToBook(r: BookRow): Book {
  return {
    id: r.id,
    title: r.title,
    author: r.author,
    publisher: r.publisher ?? 'E-Pustaka Pemilu',
    type: r.type,
    category: r.category ?? 'Umum',
    themes: r.themes ?? [],
    year: r.year ?? new Date().getFullYear(),
    price: r.price ?? 0,
    rating: r.rating ?? 0,
    premium: r.premium ?? false,
    cover: r.cover ?? ['#1e3a8a', '#3b82f6'],
    synopsis: r.synopsis ?? '',
    pages: r.pages ?? 0,
    pdfUrl: r.pdf_url ?? undefined,
    chapters: r.pdf_url
      ? [{ title: r.title, paragraphs: ['Dokumen ini dibaca sebagai PDF.'] }]
      : [{ title: r.title, paragraphs: [r.synopsis ?? ''] }],
  }
}

/**
 * Mengambil seluruh koleksi: buku statis (bawaan) + buku dari Supabase
 * (bila dikonfigurasi). Buku Supabase ditandai agar bisa dikelola admin.
 */
export async function fetchCatalog(): Promise<Book[]> {
  if (!isSupabaseEnabled || !supabase) return STATIC_BOOKS
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return STATIC_BOOKS
  const remote = (data as BookRow[]).map(rowToBook)
  // Buku remote tampil lebih dulu, lalu buku statis sebagai contoh bawaan.
  return [...remote, ...STATIC_BOOKS]
}

export interface NewBookInput {
  title: string
  author: string
  publisher: string
  type: ContentType
  category: string
  themes: string[]
  year: number
  price: number
  premium: boolean
  synopsis: string
  cover: [string, string]
  pdfFile?: File | null
}

/** Membuat buku baru di Supabase, mengunggah PDF bila ada. */
export async function createBook(input: NewBookInput): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }

  let pdf_url: string | null = null
  if (input.pdfFile) {
    const path = `${Date.now()}-${input.pdfFile.name.replace(/[^\w.-]/g, '_')}`
    const up = await supabase.storage.from(PDF_BUCKET).upload(path, input.pdfFile, {
      contentType: 'application/pdf',
      upsert: false,
    })
    if (up.error) return { error: 'Gagal unggah PDF: ' + up.error.message }
    pdf_url = supabase.storage.from(PDF_BUCKET).getPublicUrl(path).data.publicUrl
  }

  const { error } = await supabase.from('books').insert({
    title: input.title,
    author: input.author,
    publisher: input.publisher,
    type: input.type,
    category: input.category,
    themes: input.themes,
    year: input.year,
    price: input.price,
    premium: input.premium,
    synopsis: input.synopsis,
    cover: input.cover,
    pages: 0,
    rating: 0,
    pdf_url,
  })
  if (error) return { error: error.message }
  return {}
}

export async function deleteBook(id: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  const { error } = await supabase.from('books').delete().eq('id', id)
  return error ? { error: error.message } : {}
}
