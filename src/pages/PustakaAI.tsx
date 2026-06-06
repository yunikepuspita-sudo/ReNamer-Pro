import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import {
  aiEnabled,
  askPustaka,
  searchPustaka,
  aiErrorMessage,
  type ChatTurn,
  type SearchHit,
} from '../lib/pustakaAi'
import PdfCover from '../components/PdfCover'

const SUGGESTIONS = [
  'Rekomendasi buku untuk pemilih pemula',
  'Apa itu pemilu yang jujur dan adil?',
  'Buku tentang melawan hoaks saat pemilu',
  'Bahan sosialisasi untuk pemilih muda',
]

export default function PustakaAI() {
  const { books } = useCatalog()
  const [tab, setTab] = useState<'tanya' | 'cari'>('tanya')

  return (
    <div className="ai">
      <header className="ai__head">
        <span className="hero__eyebrow">KNOWLEDGE HUB</span>
        <h1>✨ Pustaka AI</h1>
        <p>Tanyakan apa saja seputar koleksi, demokrasi & pemilu — dijawab berdasarkan katalog kami.</p>
      </header>

      <div className="ai__tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'tanya'} className={`ai__tab ${tab === 'tanya' ? 'is-active' : ''}`} onClick={() => setTab('tanya')}>
          💬 Tanya Asisten
        </button>
        <button role="tab" aria-selected={tab === 'cari'} className={`ai__tab ${tab === 'cari' ? 'is-active' : ''}`} onClick={() => setTab('cari')}>
          🔎 Pencarian Cerdas
        </button>
      </div>

      {!aiEnabled && <NotConfigured />}

      {tab === 'tanya' ? <ChatPanel books={books} /> : <SearchPanel books={books} />}
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="ai__notice">
      <strong>AI sedang disiapkan.</strong> Fitur ini memakai Claude lewat Supabase Edge Function.
      Untuk mengaktifkannya: deploy fungsi <code>pustaka-ai</code> lalu set secret <code>ANTHROPIC_API_KEY</code>.
      Lihat <code>SETUP-BACKEND.md</code>. Anda tetap bisa menjelajah koleksi lewat <Link to="/toko">Toko</Link>.
    </div>
  )
}

// ── Tab: Tanya Asisten (chat) ────────────────────────────────────────────────
function ChatPanel({ books }: { books: ReturnType<typeof useCatalog>['books'] }) {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scroller = useRef<HTMLDivElement>(null)

  // Cocokkan judul katalog yang muncul di jawaban → tautan yang bisa diklik.
  const titles = useMemo(() => books.map((b) => ({ id: b.id, title: b.title })), [books])
  function mentioned(text: string) {
    const lower = text.toLowerCase()
    return titles.filter((t) => t.title.length > 4 && lower.includes(t.title.toLowerCase())).slice(0, 4)
  }

  async function send(q: string) {
    const question = q.trim()
    if (!question || loading) return
    setError(null)
    const history = turns.slice(-8)
    const next = [...turns, { role: 'user' as const, content: question }]
    setTurns(next)
    setInput('')
    setLoading(true)
    const res = await askPustaka(question, history, books)
    setLoading(false)
    if (res.error) {
      setError(aiErrorMessage(res.error))
      return
    }
    setTurns([...next, { role: 'assistant', content: res.data!.reply }])
    requestAnimationFrame(() => scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' }))
  }

  return (
    <div className="ai__chat">
      <div className="ai__thread" ref={scroller}>
        {turns.length === 0 && (
          <div className="ai__empty">
            <p>Coba salah satu pertanyaan ini:</p>
            <div className="ai__chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="ai__chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {turns.map((t, i) => (
          <div key={i} className={`ai__msg ai__msg--${t.role}`}>
            <div className="ai__bubble">
              {t.content.split('\n').map((line, j) => (
                <p key={j}>{line}</p>
              ))}
              {t.role === 'assistant' && mentioned(t.content).length > 0 && (
                <div className="ai__refs">
                  {mentioned(t.content).map((m) => (
                    <Link key={m.id} to={`/buku/${m.id}`} className="ai__ref">📖 {m.title}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && <div className="ai__msg ai__msg--assistant"><div className="ai__bubble ai__typing">Pustaka AI sedang mengetik…</div></div>}
        {error && <p className="ai__error">{error}</p>}
      </div>

      <form className="ai__form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tulis pertanyaanmu…"
          aria-label="Pertanyaan"
          disabled={loading}
        />
        <button type="submit" className="btn btn--primary" disabled={loading || !input.trim()}>Kirim</button>
      </form>
    </div>
  )
}

// ── Tab: Pencarian Cerdas ────────────────────────────────────────────────────
function SearchPanel({ books }: { books: ReturnType<typeof useCatalog>['books'] }) {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hits, setHits] = useState<SearchHit[] | null>(null)

  const byId = useMemo(() => new Map(books.map((b) => [b.id, b])), [books])

  async function run(e: React.FormEvent) {
    e.preventDefault()
    if (!q.trim() || loading) return
    setError(null)
    setLoading(true)
    const res = await searchPustaka(q.trim(), books)
    setLoading(false)
    if (res.error) {
      setError(aiErrorMessage(res.error))
      setHits(null)
      return
    }
    setHits(res.data!.results.filter((h) => byId.has(h.id)))
  }

  return (
    <div className="ai__search">
      <form className="ai__form" onSubmit={run}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Jelaskan kebutuhanmu, mis. 'buku ringan soal hak pilih untuk pemula'"
          aria-label="Pencarian cerdas"
          disabled={loading}
        />
        <button type="submit" className="btn btn--primary" disabled={loading || !q.trim()}>Cari</button>
      </form>

      {loading && <p className="ai__typing">Mencari koleksi yang paling cocok…</p>}
      {error && <p className="ai__error">{error}</p>}

      {hits && !loading && (
        hits.length === 0 ? (
          <p className="ai__empty">Belum ada judul yang cocok. Coba kata kunci yang berbeda.</p>
        ) : (
          <ol className="ai__hits">
            {hits.map((h) => {
              const book = byId.get(h.id)!
              return (
                <li key={h.id} className="ai__hit">
                  <Link to={`/buku/${h.id}`} className="ai__hit-cover"><PdfCover book={book} size="sm" /></Link>
                  <div className="ai__hit-info">
                    <Link to={`/buku/${h.id}`} className="ai__hit-title">{book.title}</Link>
                    <span className="ai__hit-author">{book.author}</span>
                    <p className="ai__hit-reason">💡 {h.reason}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )
      )}
    </div>
  )
}
