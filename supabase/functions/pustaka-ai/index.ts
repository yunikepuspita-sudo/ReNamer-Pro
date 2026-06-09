// Edge Function: pustaka-ai
// Knowledge Hub AI untuk E-Pustaka Pemilu — memanggil Claude (Anthropic).
//
// Menangani empat mode:
//   • chat   — Asisten Pustaka (tanya-jawab + rekomendasi dari katalog)
//   • search — Pencarian cerdas (mengembalikan daftar id buku relevan)
//   • book   — Tanya-Jawab / ringkasan untuk satu buku
//   • rename — Ekstrak metadata (tahun, penulis, judul) dari teks PDF untuk penamaan berkas
//
// SECRET yang diperlukan (Supabase Dashboard → Edge Functions → Manage secrets):
//   ANTHROPIC_API_KEY = sk-ant-...
// Selama secret belum diisi, fungsi mengembalikan 503 {error:"not_configured"}
// sehingga frontend menampilkan mode "AI belum dikonfigurasi" dengan rapi.
//
// Deploy: supabase functions deploy pustaka-ai --no-verify-jwt

import Anthropic from 'npm:@anthropic-ai/sdk'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Claude Opus 4.8 — model paling cakap. Thinking dimatikan + effort "low" agar
// respons asisten perpustakaan tetap cepat dan hemat biaya.
const MODEL = 'claude-opus-4-8'

interface BookLite {
  id: string
  title: string
  author: string
  type: string
  category: string
  themes?: string[]
  year?: number
  price?: number
  synopsis?: string
  chapters?: string[]
}

interface Turn {
  role: 'user' | 'assistant'
  content: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return json({ error: 'not_configured', message: 'ANTHROPIC_API_KEY belum diset di Supabase.' }, 503)
    }

    const body = await req.json().catch(() => ({}))
    const mode: string = body.mode ?? 'chat'
    const message: string = String(body.message ?? '').slice(0, 2000)
    const books: BookLite[] = Array.isArray(body.books) ? body.books.slice(0, 80) : []

    const client = new Anthropic({ apiKey })

    if (mode === 'book') return await handleBook(client, body.book as BookLite | undefined, message)
    if (mode === 'rename') return await handleRename(client, String(body.text ?? ''))
    if (!message.trim()) return json({ error: 'message wajib diisi' }, 400)
    if (mode === 'search') return await handleSearch(client, message, renderCatalog(books))

    const history: Turn[] = Array.isArray(body.history) ? body.history.slice(-8) : []
    return await handleChat(client, message, history, renderCatalog(books))
  } catch (e) {
    return json({ error: 'server_error', message: String(e) }, 500)
  }
})

// ── Mode: chat (Asisten Pustaka) ─────────────────────────────────────────────
async function handleChat(client: Anthropic, message: string, history: Turn[], catalog: string) {
  const system =
    `Kamu "Pustaka AI", asisten ramah perpustakaan digital "E-Pustaka Pemilu" — koleksi ` +
    `bertema demokrasi, pemilihan umum, dan kewarganegaraan di Indonesia.\n\n` +
    `Aturan:\n` +
    `- Jawab dalam Bahasa Indonesia yang ringkas, hangat, dan akurat.\n` +
    `- Saat merekomendasikan, gunakan HANYA judul yang ADA di KATALOG dan tulis judulnya persis. ` +
    `Jangan pernah mengarang judul atau penulis.\n` +
    `- Bila tidak ada koleksi yang relevan, katakan jujur dan sarankan membuka halaman Toko.\n` +
    `- Tetap pada topik perpustakaan, buku, demokrasi, pemilu, dan literasi.\n` +
    `- Berikan langsung jawaban final; jangan menampilkan proses berpikir.\n\n` +
    `KATALOG (id | judul | penulis | jenis/kategori | tahun | tema | sinopsis):\n${catalog}`

  const messages = [
    ...history.map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: String(h.content).slice(0, 2000),
    })),
    { role: 'user', content: message },
  ]

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    system,
    messages,
  })
  return json({ reply: textOf(resp) })
}

// ── Mode: search (Pencarian cerdas) ──────────────────────────────────────────
async function handleSearch(client: Anthropic, message: string, catalog: string) {
  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            id: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['id', 'reason'],
        },
      },
    },
    required: ['results'],
  }

  const system =
    `Kamu mesin pencari cerdas untuk perpustakaan "E-Pustaka Pemilu". Dari KATALOG di bawah, ` +
    `pilih hingga 6 judul yang paling relevan dengan kebutuhan pengguna. Gunakan HANYA "id" yang ` +
    `benar-benar ada di katalog. Isi "reason" dengan alasan singkat (maksimal ~120 karakter) dalam ` +
    `Bahasa Indonesia. Jika tidak ada yang relevan, kembalikan results kosong.\n\n` +
    `KATALOG (id | judul | penulis | jenis/kategori | tahun | tema | sinopsis):\n${catalog}`

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: message }],
  })

  let parsed: { results?: unknown } = {}
  try {
    parsed = JSON.parse(textOf(resp))
  } catch {
    parsed = { results: [] }
  }
  return json({ results: Array.isArray(parsed.results) ? parsed.results : [] })
}

// ── Mode: book (Tanya-Jawab / ringkasan satu buku) ───────────────────────────
async function handleBook(client: Anthropic, book: BookLite | undefined, message: string) {
  if (!book?.title) return json({ error: 'book wajib diisi' }, 400)

  const ctx =
    `Judul: ${book.title}\n` +
    `Penulis: ${book.author}\n` +
    `Jenis: ${book.type} · ${book.category}\n` +
    `Tahun: ${book.year ?? '-'}\n` +
    `Sinopsis: ${book.synopsis ?? '-'}\n` +
    `Daftar isi: ${(book.chapters ?? []).join('; ') || '-'}`

  const ask = message.trim()
    ? message
    : 'Ringkas buku ini dalam 3–4 kalimat, lalu sebutkan untuk siapa buku ini paling cocok.'

  const system =
    `Kamu asisten baca "E-Pustaka Pemilu". Jawab dalam Bahasa Indonesia, ringkas dan akurat, ` +
    `HANYA berdasarkan informasi buku di bawah. Bila ditanya hal yang tidak tercakup, katakan ` +
    `bahwa informasinya tidak tersedia pada ringkasan buku ini. Berikan langsung jawaban final.\n\n` +
    `INFORMASI BUKU:\n${ctx}`

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low' },
    system,
    messages: [{ role: 'user', content: ask }],
  })
  return json({ reply: textOf(resp) })
}

// ── Mode: rename (Ekstrak metadata untuk penamaan berkas) ────────────────────
async function handleRename(client: Anthropic, text: string) {
  const sample = text.trim().slice(0, 6000)
  if (!sample) return json({ error: 'teks PDF kosong' }, 400)

  const schema = {
    type: 'object',
    additionalProperties: false,
    properties: {
      year: { type: 'string' },
      author: { type: 'string' },
      title: { type: 'string' },
    },
    required: ['year', 'author', 'title'],
  }

  const system =
    `Kamu pengkatalog perpustakaan. Dari cuplikan teks halaman-halaman awal sebuah dokumen PDF, ` +
    `ekstrak metadata untuk penamaan berkas. Kembalikan JSON dengan field berikut:\n` +
    `- "year": tahun terbit 4 digit (mis. "2024"). Bila tidak ditemukan, isi "".\n` +
    `- "author": nama penulis/lembaga penerbit utama. Untuk perorangan gunakan nama belakang saja ` +
    `(mis. "Sutanto"); untuk lembaga gunakan akronim/nama ringkas (mis. "KPU"). Bila tidak ada, isi "".\n` +
    `- "title": judul dokumen yang ringkas dan jelas (maksimal ~8 kata), tanpa anak judul yang panjang.\n` +
    `Gunakan Bahasa Indonesia. JANGAN mengarang; bila ragu, kosongkan field tersebut.`

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    thinking: { type: 'disabled' },
    output_config: { effort: 'low', format: { type: 'json_schema', schema } },
    system,
    messages: [{ role: 'user', content: sample }],
  })

  let parsed: { year?: unknown; author?: unknown; title?: unknown } = {}
  try {
    parsed = JSON.parse(textOf(resp))
  } catch {
    parsed = {}
  }
  return json({
    year: String(parsed.year ?? '').trim(),
    author: String(parsed.author ?? '').trim(),
    title: String(parsed.title ?? '').trim(),
  })
}

// ── Util ─────────────────────────────────────────────────────────────────────
function renderCatalog(books: BookLite[]): string {
  if (!books.length) return '(katalog kosong)'
  return books
    .map(
      (b) =>
        `- [${b.id}] "${b.title}" — ${b.author} | ${b.type}/${b.category} | ${b.year ?? '-'} | ` +
        `tema: ${(b.themes ?? []).join(',') || '-'} | ${b.synopsis ? b.synopsis.slice(0, 160) : ''}`,
    )
    .join('\n')
}

// deno-lint-ignore no-explicit-any
function textOf(resp: any): string {
  return (resp?.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
    .trim()
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
