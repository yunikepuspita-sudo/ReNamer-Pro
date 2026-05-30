import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Klien Supabase. Bernilai `null` bila variabel lingkungan belum diset,
 * sehingga aplikasi tetap berjalan memakai data statis (mode demo).
 *
 * Setel di file `.env` (lihat .env.example):
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseEnabled = Boolean(supabase)

/** Nama bucket Storage untuk file PDF koleksi. */
export const PDF_BUCKET = 'ebooks'
