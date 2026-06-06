import { useState } from 'react'
import type { Book } from '../types'
import { aiEnabled, askBook, aiErrorMessage } from '../lib/pustakaAi'

/**
 * Panel "Tanya AI" pada halaman detail buku.
 * Bisa meminta ringkasan otomatis atau mengetik pertanyaan tentang buku ini.
 * Tersembunyi total bila lapisan AI belum tersedia (tidak mengganggu halaman).
 */
export default function BookAiPanel({ book }: { book: Book }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!aiEnabled) return null

  async function ask(message: string) {
    if (loading) return
    setError(null)
    setAnswer('')
    setLoading(true)
    const res = await askBook(book, message)
    setLoading(false)
    if (res.error) {
      setError(aiErrorMessage(res.error))
      return
    }
    setAnswer(res.data!.reply)
  }

  return (
    <section className="detail__section book-ai">
      <h2>✨ Tanya AI tentang buku ini</h2>

      {!open ? (
        <button className="btn btn--ghost" onClick={() => { setOpen(true); ask('') }}>
          Ringkas & jelaskan dengan AI
        </button>
      ) : (
        <>
          {loading && <p className="ai__typing">AI sedang membaca buku ini…</p>}
          {error && <p className="ai__error">{error}</p>}
          {answer && (
            <div className="book-ai__answer">
              {answer.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}

          <form
            className="ai__form book-ai__form"
            onSubmit={(e) => { e.preventDefault(); if (q.trim()) ask(q.trim()) }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tanya sesuatu tentang buku ini…"
              aria-label="Pertanyaan tentang buku"
              disabled={loading}
            />
            <button type="submit" className="btn btn--primary" disabled={loading || !q.trim()}>Tanya</button>
          </form>
          <p className="book-ai__note">Jawaban dibuat AI berdasarkan sinopsis & daftar isi; bisa keliru.</p>
        </>
      )}
    </section>
  )
}
