import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseEnabled } from '../lib/supabase'
import { getSession, onAuthChange, signIn, signOut } from '../lib/auth'
import { createBook, deleteBook, fetchCatalog, type NewBookInput } from '../lib/catalog'
import { CATEGORIES } from '../data/books'
import { THEMES } from '../data/themes'
import type { Book, ContentType } from '../types'

const EMPTY: NewBookInput = {
  title: '',
  author: '',
  publisher: 'E-Pustaka Pemilu',
  type: 'buku',
  category: 'Politik',
  themes: [],
  year: new Date().getFullYear(),
  price: 0,
  premium: false,
  synopsis: '',
  cover: ['#1e3a8a', '#3b82f6'],
  pdfFile: null,
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getSession().then((s) => {
      setSession(s)
      setReady(true)
    })
    return onAuthChange(setSession)
  }, [])

  if (!isSupabaseEnabled) {
    return (
      <div className="admin">
        <h1>Panel Admin</h1>
        <div className="reader__paywall">
          <h3>Backend belum dikonfigurasi</h3>
          <p>
            Fitur admin memerlukan Supabase. Setel <code>VITE_SUPABASE_URL</code> dan{' '}
            <code>VITE_SUPABASE_ANON_KEY</code>, lalu jalankan skema di{' '}
            <code>supabase/schema.sql</code>. Lihat <code>SETUP-BACKEND.md</code>.
          </p>
          <Link to="/" className="btn btn--primary">Kembali ke Beranda</Link>
        </div>
      </div>
    )
  }

  if (!ready) return <div className="empty-state"><p>Memuat…</p></div>
  if (!session) return <LoginForm />
  return <AdminPanel onSignOut={() => signOut()} email={session.user.email ?? ''} />
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setBusy(true)
    const { error } = await signIn(email, password)
    if (error) setErr(error)
    setBusy(false)
  }

  return (
    <div className="admin admin--login">
      <h1>Masuk Admin</h1>
      <form className="upload-form" onSubmit={submit}>
        <div className="upload-form__grid">
          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Kata sandi
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {err && <p className="upload-form__err">{err}</p>}
        <div className="upload-form__actions">
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
          <Link to="/" className="btn btn--ghost">Batal</Link>
        </div>
      </form>
      <p className="muted center">
        Akun admin dibuat dari dashboard Supabase (Authentication → Users).
      </p>
    </div>
  )
}

function AdminPanel({ onSignOut, email }: { onSignOut: () => void; email: string }) {
  const [form, setForm] = useState<NewBookInput>(EMPTY)
  const [books, setBooks] = useState<Book[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  function refresh() {
    fetchCatalog().then(setBooks)
  }
  useEffect(() => {
    refresh()
  }, [])

  function set<K extends keyof NewBookInput>(key: K, val: NewBookInput[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    setMsg('')
    if (!form.title.trim() || !form.author.trim()) {
      setErr('Judul dan penulis wajib diisi.')
      return
    }
    setBusy(true)
    const { error } = await createBook(form)
    setBusy(false)
    if (error) {
      setErr(error)
      return
    }
    setMsg('Koleksi berhasil ditambahkan.')
    setForm(EMPTY)
    refresh()
  }

  async function remove(id: string) {
    if (!confirm('Hapus koleksi ini dari katalog?')) return
    const { error } = await deleteBook(id)
    if (error) setErr(error)
    else refresh()
  }

  function toggleTheme(id: string) {
    set('themes', form.themes.includes(id) ? form.themes.filter((t) => t !== id) : [...form.themes, id])
  }

  return (
    <div className="admin">
      <div className="library__head">
        <h1>Panel Admin</h1>
        <div className="admin__user">
          <span className="muted">{email}</span>
          <button className="btn btn--ghost btn--sm" onClick={onSignOut}>Keluar</button>
        </div>
      </div>

      <section className="library__section">
        <h2>➕ Tambah Koleksi</h2>
        <form className="upload-form" onSubmit={submit}>
          <div className="upload-form__grid">
            <label>Judul<input value={form.title} onChange={(e) => set('title', e.target.value)} /></label>
            <label>Penulis<input value={form.author} onChange={(e) => set('author', e.target.value)} /></label>
            <label>Penerbit<input value={form.publisher} onChange={(e) => set('publisher', e.target.value)} /></label>
            <label>
              Jenis
              <select value={form.type} onChange={(e) => set('type', e.target.value as ContentType)}>
                <option value="buku">Buku</option>
                <option value="majalah">Majalah</option>
                <option value="koran">Koran</option>
              </select>
            </label>
            <label>
              Kategori
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>Tahun<input type="number" value={form.year} onChange={(e) => set('year', Number(e.target.value))} /></label>
            <label>Harga (Rp, 0 = gratis)<input type="number" value={form.price} onChange={(e) => set('price', Number(e.target.value))} /></label>
            <label className="filters__check" style={{ marginTop: 24 }}>
              <input type="checkbox" checked={form.premium} onChange={(e) => set('premium', e.target.checked)} />
              Koleksi Premium
            </label>
          </div>

          <label style={{ display: 'block', marginTop: 14 }}>
            Sinopsis
            <textarea
              rows={3}
              value={form.synopsis}
              onChange={(e) => set('synopsis', e.target.value)}
              style={{ width: '100%', borderRadius: 8, border: '1.5px solid var(--border)', padding: 10, fontFamily: 'inherit' }}
            />
          </label>

          <div style={{ marginTop: 12 }}>
            <span className="muted">Tema Pemilu:</span>
            <div className="theme-chips" style={{ marginTop: 8 }}>
              {THEMES.map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className="theme-chip"
                  onClick={() => toggleTheme(t.id)}
                  style={form.themes.includes(t.id) ? { borderColor: 'var(--brand)', color: 'var(--brand)' } : undefined}
                >
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>

          <label style={{ display: 'block', marginTop: 14 }}>
            File PDF (opsional)
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => set('pdfFile', e.target.files?.[0] ?? null)}
            />
          </label>

          {err && <p className="upload-form__err">{err}</p>}
          {msg && <p style={{ color: '#059669', fontWeight: 600 }}>{msg}</p>}
          <div className="upload-form__actions">
            <button className="btn btn--primary" disabled={busy}>
              {busy ? 'Menyimpan…' : 'Simpan Koleksi'}
            </button>
          </div>
        </form>
      </section>

      <section className="library__section">
        <h2>📚 Koleksi ({books.length})</h2>
        <table className="admin__table">
          <thead>
            <tr><th>Judul</th><th>Jenis</th><th>Harga</th><th></th></tr>
          </thead>
          <tbody>
            {books.map((b) => (
              <tr key={b.id}>
                <td>{b.title}<br /><span className="muted">{b.author}</span></td>
                <td>{b.type}</td>
                <td>{b.price === 0 ? 'Gratis' : 'Rp ' + b.price.toLocaleString('id-ID')}</td>
                <td>
                  {b.id.startsWith('up-') || !isManaged(b) ? (
                    <span className="muted">bawaan</span>
                  ) : (
                    <button className="btn btn--ghost btn--sm" onClick={() => remove(b.id)}>Hapus</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

/** Buku statis bawaan punya id berbasis slug; buku Supabase memakai UUID. */
function isManaged(b: Book): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(b.id)
}
