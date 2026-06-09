// ──────────────────────────────────────────────────────────────────────────
// Klien frontend untuk Knowledge Hub AI ("Pustaka AI").
//
// Memanggil Edge Function `pustaka-ai` (yang menyimpan ANTHROPIC_API_KEY dan
// memanggil Claude di sisi server — kunci API TIDAK pernah ada di browser).
//
// Degradasi anggun:
//   • Supabase belum dikonfigurasi  → { error: 'disabled' }
//   • Secret API belum diisi (503)  → { error: 'not_configured' }
//   • Gangguan jaringan/server      → { error: 'network' | 'server' }
// ──────────────────────────────────────────────────────────────────────────

import { isSupabaseEnabled } from './supabase'
import type { Book } from '../types'

/** Apakah lapisan AI berpotensi tersedia (butuh Supabase terkonfigurasi). */
export const aiEnabled = isSupabaseEnabled

const FN_URL = `${(import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? ''}/functions/v1/pustaka-ai`
const ANON = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? ''

export type AiError = 'disabled' | 'not_configured' | 'network' | 'server'
export interface AiResult<T> {
  data?: T
  error?: AiError
  message?: string
}

async function callAi<T>(payload: Record<string, unknown>): Promise<AiResult<T>> {
  if (!isSupabaseEnabled) return { error: 'disabled' }

  let res: Response
  try {
    res = await fetch(FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANON}`,
        apikey: ANON,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    return { error: 'network' }
  }

  let body: any = null
  try {
    body = await res.json()
  } catch {
    /* abaikan body non-JSON */
  }

  if (res.status === 503 || body?.error === 'not_configured') return { error: 'not_configured' }
  if (!res.ok || body?.error) return { error: 'server', message: body?.message }
  return { data: body as T }
}

/** Ringkas katalog menjadi muatan kecil untuk konteks model. */
function digest(books: Book[]) {
  return books.slice(0, 80).map((b) => ({
    id: b.id,
    title: b.title,
    author: b.author,
    type: b.type,
    category: b.category,
    themes: b.themes,
    year: b.year,
    price: b.price,
    synopsis: b.synopsis,
  }))
}

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/** Asisten Pustaka (chat) — tanya-jawab + rekomendasi dari katalog. */
export function askPustaka(message: string, history: ChatTurn[], books: Book[]) {
  return callAi<{ reply: string }>({ mode: 'chat', message, history, books: digest(books) })
}

export interface SearchHit {
  id: string
  reason: string
}

/** Pencarian cerdas — mengembalikan daftar id buku relevan + alasan. */
export function searchPustaka(message: string, books: Book[]) {
  return callAi<{ results: SearchHit[] }>({ mode: 'search', message, books: digest(books) })
}

/** Tanya-Jawab / ringkasan untuk satu buku. Pesan kosong → ringkasan otomatis. */
export function askBook(book: Book, message = '') {
  return callAi<{ reply: string }>({
    mode: 'book',
    message,
    book: {
      id: book.id,
      title: book.title,
      author: book.author,
      type: book.type,
      category: book.category,
      year: book.year,
      synopsis: book.synopsis,
      chapters: (book.chapters ?? []).map((c) => c.title),
    },
  })
}

export interface RenameMeta {
  year: string
  author: string
  title: string
}

/** Ekstrak metadata (tahun, penulis, judul) dari teks awal sebuah PDF. */
export function suggestRename(text: string) {
  return callAi<RenameMeta>({ mode: 'rename', text: text.slice(0, 6000) })
}

/** Pesan ramah untuk tiap jenis error AI. */
export function aiErrorMessage(error: AiError): string {
  switch (error) {
    case 'disabled':
      return 'Fitur AI belum aktif — backend Supabase belum dikonfigurasi.'
    case 'not_configured':
      return 'AI sedang disiapkan. Kunci API Claude (ANTHROPIC_API_KEY) belum diisi di server.'
    case 'network':
      return 'Gagal menghubungi layanan AI. Periksa koneksi internet lalu coba lagi.'
    case 'server':
    default:
      return 'Maaf, terjadi gangguan pada layanan AI. Coba lagi sebentar.'
  }
}
