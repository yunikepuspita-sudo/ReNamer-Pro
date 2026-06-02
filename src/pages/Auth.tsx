import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { isSupabaseEnabled } from '../lib/supabase'
import { signInWithWhatsApp, isValidPhone } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // Tujuan setelah login (mis. kembali ke halaman baca yang diminta).
  const next = params.get('next') || '/pustaka'

  if (user) {
    navigate(next)
  }

  if (!isSupabaseEnabled) {
    return (
      <div className="auth">
        <h1>Masuk</h1>
        <div className="reader__paywall">
          <h3>Login belum aktif</h3>
          <p>Fitur akun memerlukan Supabase. Lihat <code>SETUP-BACKEND.md</code>.</p>
          <Link to="/" className="btn btn--primary">Kembali ke Beranda</Link>
        </div>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!name.trim()) return setErr('Nama wajib diisi.')
    if (!isValidPhone(phone)) return setErr('Masukkan nomor WhatsApp yang valid (mis. 0812xxxxxxx).')
    setBusy(true)
    const { error } = await signInWithWhatsApp(name, phone)
    setBusy(false)
    if (error) return setErr(error)
    navigate(next)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1>Masuk</h1>
        <p className="muted">
          Masuk dengan nomor WhatsApp untuk membaca koleksi dan menyimpan pustaka Anda.
        </p>

        <form onSubmit={submit}>
          <label className="auth__field">
            Nama
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" required />
          </label>
          <label className="auth__field">
            Nomor WhatsApp
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="cth: 08123456789"
              required
            />
          </label>

          {err && <p className="upload-form__err">{err}</p>}

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>

        <p className="muted center" style={{ marginTop: 14, fontSize: 13 }}>
          Dengan masuk, Anda menyetujui penggunaan data nama & nomor WhatsApp untuk
          keperluan layanan perpustakaan ini.
        </p>
      </div>
    </div>
  )
}
