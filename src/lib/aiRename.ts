// ──────────────────────────────────────────────────────────────────────────
// AI rename — saran nama berkas dari isi PDF.
//
// Alur (terinspirasi PDFs-AI-rename, diadaptasi ke stack web + Claude):
//   1. Ekstrak teks halaman-halaman awal PDF di browser (pdf.js / react-pdf).
//   2. Kirim teks ke Edge Function `pustaka-ai` mode "rename" → Claude
//      mengembalikan { year, author, title }.
//   3. Susun nama berkas dengan konvensi: Tahun_Penulis_Judul
//      • "_" memisahkan antar-field utama (mudah di-parse mesin)
//      • "-" memisahkan kata di dalam satu field (rapi tanpa spasi)
// ──────────────────────────────────────────────────────────────────────────

import { pdfjs } from './pdf'
import { suggestRename, type AiError, type RenameMeta } from './pustakaAi'

/** Ambil teks dari beberapa halaman pertama PDF (cukup untuk metadata). */
export async function extractPdfText(file: Blob, maxPages = 5, maxChars = 6000): Promise<string> {
  const data = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data }).promise
  try {
    const pages = Math.min(doc.numPages, maxPages)
    let out = ''
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      out += content.items.map((it) => ('str' in it ? it.str : '')).join(' ') + '\n'
      if (out.length >= maxChars) break
    }
    return out.slice(0, maxChars).trim()
  } finally {
    doc.destroy()
  }
}

/** Slug untuk SATU field: huruf/angka dipertahankan, spasi → "-". */
export function fieldSlug(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // buang diakritik
    .replace(/[^\w\s-]/g, ' ') // karakter aneh → spasi
    .trim()
    .replace(/\s+/g, '-') // spasi → hyphen
    .replace(/-+/g, '-') // rapikan hyphen ganda
}

/** Susun nama berkas `Tahun_Penulis_Judul` dari metadata. */
export function buildFileName(meta: RenameMeta): string {
  const parts = [meta.year.trim(), fieldSlug(meta.author), fieldSlug(meta.title)].filter(Boolean)
  return parts.join('_') || 'Dokumen'
}

export interface RenameResult extends RenameMeta {
  filename: string
}

export interface RenameOutcome {
  data?: RenameResult
  error?: AiError | 'no_text'
  message?: string
}

/** Pipeline lengkap: PDF → teks → Claude → nama berkas tersaran. */
export async function suggestFileName(file: Blob): Promise<RenameOutcome> {
  let text = ''
  try {
    text = await extractPdfText(file)
  } catch {
    return { error: 'no_text', message: 'Gagal membaca isi PDF.' }
  }
  if (!text) {
    return {
      error: 'no_text',
      message: 'Tidak ada teks yang bisa dibaca (mungkin PDF hasil scan/gambar).',
    }
  }

  const res = await suggestRename(text)
  if (res.error || !res.data) return { error: res.error, message: res.message }

  return { data: { ...res.data, filename: buildFileName(res.data) } }
}
