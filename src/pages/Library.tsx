import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useApp } from '../context/AppContext'
import BookCover from '../components/BookCover'
import { addUpload, deleteUpload, listUploads, uploadCover, type UploadRecord } from '../lib/uploads'
import { suggestFileName } from '../lib/aiRename'
import { aiEnabled, aiErrorMessage } from '../lib/pustakaAi'
import type { Book, ContentType } from '../types'

function formatSize(bytes: number): string {
  if (bytes > 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  return Math.max(1, Math.round(bytes / 1024)) + ' KB'
}

export default function Library() {
  const { library, progress, synced } = useApp()
  const { books: BOOKS } = useCatalog()
  const items = BOOKS.filter((b) => library.includes(b.id))

  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [type, setType] = useState<ContentType>('buku')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiMsg, setAiMsg] = useState('')
  const [suggestedName, setSuggestedName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSuggest() {
    setErr('')
    setAiMsg('')
    setSuggestedName('')
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setErr('Pilih file PDF terlebih dahulu.')
      return
    }
    try {
      setAiBusy(true)
      const res = await suggestFileName(file)
      if (res.error || !res.data) {
        setAiMsg(res.error === 'no_text' ? res.message ?? 'Gagal membaca PDF.' : aiErrorMessage(res.error!))
        return
      }
      const { year, author, title, filename } = res.data
      if (title) setTitle(title)
      if (author) setAuthor(author)
      setSuggestedName(filename)
      setAiMsg(`Saran nama: ${filename}.pdf${year ? '' : ' · tahun tidak terdeteksi'}`)
    } finally {
      setAiBusy(false)
    }
  }

  function refresh() {
    listUploads().then(setUploads)
  }
  useEffect(() => {
    refresh()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    const file = fileRef.current?.files?.[0]
    if (!file) {
      setErr('Pilih file PDF terlebih dahulu.')
      return
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErr('Hanya file PDF yang didukung.')
      return
    }
    try {
      setBusy(true)
      await addUpload(file, { title, author, type, filename: suggestedName })
      setTitle('')
      setAuthor('')
      setType('buku')
      setSuggestedName('')
      setAiMsg('')
      if (fileRef.current) fileRef.current.value = ''
      setOpen(false)
      refresh()
    } catch {
      setErr('Gagal menyimpan file. Coba lagi.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus ebook ini dari perangkat Anda?')) return
    await deleteUpload(id)
    refresh()
  }

  return (
    <div className="library">
      <div className="library__head">
        <h1>
          Pustaka Saya
          {synced && <span className="synced-badge" title="Tersimpan di akun Anda">☁ Tersinkron</span>}
        </h1>
        <button className="btn btn--primary" onClick={() => setOpen((v) => !v)}>
          ＋ Unggah Ebook
        </button>
      </div>

      {open && (
        <form className="upload-form" onSubmit={handleSubmit}>
          <p className="upload-form__hint">
            Unggah file <strong>PDF</strong> dari perangkat Anda. File tersimpan secara lokal di
            browser ini (tidak diunggah ke server / tidak dibagikan ke publik).
          </p>
          <div className="upload-form__grid">
            <label>
              File PDF
              <input
                ref={fileRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={() => {
                  setSuggestedName('')
                  setAiMsg('')
                }}
              />
            </label>
            <label>
              Judul
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Opsional — default dari nama file" />
            </label>
            <label>
              Penulis
              <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Opsional" />
            </label>
            <label>
              Jenis
              <select value={type} onChange={(e) => setType(e.target.value as ContentType)}>
                <option value="buku">Buku</option>
                <option value="jurnal">Jurnal</option>
                <option value="peraturan">Peraturan</option>
                <option value="modul">Modul</option>
                <option value="majalah">Majalah</option>
                <option value="koran">Koran</option>
              </select>
            </label>
          </div>
          {aiEnabled && (
            <div className="upload-form__ai">
              <button
                className="btn btn--ghost btn--sm"
                type="button"
                onClick={handleSuggest}
                disabled={aiBusy || busy}
              >
                {aiBusy ? '✨ Membaca PDF…' : '✨ Sarankan nama (AI)'}
              </button>
              <span className="muted">
                AI membaca halaman awal PDF lalu mengisi Judul/Penulis &amp; menyusun nama berkas{' '}
                <code>Tahun_Penulis_Judul</code>.
              </span>
            </div>
          )}
          {aiMsg && <p className="upload-form__ai-msg">{aiMsg}</p>}
          {err && <p className="upload-form__err">{err}</p>}
          <div className="upload-form__actions">
            <button className="btn btn--primary" type="submit" disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan ke Pustaka'}
            </button>
            <button className="btn btn--ghost" type="button" onClick={() => setOpen(false)}>
              Batal
            </button>
          </div>
        </form>
      )}

      {uploads.length > 0 && (
        <section className="library__section">
          <h2>📤 Ebook Unggahan Saya</h2>
          <div className="grid">
            {uploads.map((u) => {
              const cover = { title: u.title, author: u.author, type: u.type, premium: false, cover: uploadCover(u.id) } as Book
              return (
                <div key={u.id} className="library__item">
                  <Link to={`/baca/${u.id}`}>
                    <BookCover book={cover} />
                  </Link>
                  <div className="library__item-body">
                    <h3>{u.title}</h3>
                    {u.filename && u.filename !== u.title && (
                      <code className="library__filename" title={u.filename}>{u.filename}</code>
                    )}
                    <span className="muted">PDF · {formatSize(u.size)}</span>
                    <div className="library__item-actions">
                      <Link to={`/baca/${u.id}`} className="btn btn--ghost btn--sm">Baca</Link>
                      <button className="btn btn--ghost btn--sm" onClick={() => handleDelete(u.id)}>Hapus</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="library__section">
        <h2>📚 Koleksi dari Toko</h2>
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Belum ada judul dari toko.</p>
            <p className="muted">Tambahkan buku gratis atau berlangganan Premium untuk mulai membaca.</p>
            <Link to="/toko" className="btn btn--primary">Jelajahi Toko</Link>
          </div>
        ) : (
          <div className="grid">
            {items.map((b) => {
              const ch = progress[b.id] ?? 0
              const percent = Math.round(((ch + 1) / b.chapters.length) * 100)
              return (
                <Link key={b.id} to={`/baca/${b.id}`} className="library__item">
                  <BookCover book={b} />
                  <div className="library__item-body">
                    <h3>{b.title}</h3>
                    <div className="reader__progress-bar">
                      <div style={{ width: `${percent}%` }} />
                    </div>
                    <span className="muted">{percent}% · lanjut membaca</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
