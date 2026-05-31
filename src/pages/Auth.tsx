import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isSupabaseEnabled } from '../lib/supabase'
import { signIn, signUp, signInWithGoogle } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

type Mode = 'masuk' | 'daftar'

export default function Auth() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mode, setMode] = useState<Mode>('masuk')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  // Sudah login → arahkan ke pustaka.
  if (user) {
    navigate('/pustaka')
  }

  if (!isSupabaseEnabled) {
    return (
      <div className="auth">
        <h1>Masuk / Daftar</h1>
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
    setMsg('')
    setBusy(true)
    if (mode === 'masuk') {
      const { error } = await signIn(email, password)
      setBusy(false)
      if (error) return setErr(terjemah(error))
      navigate('/pustaka')
    } else {
      const { error, needsConfirm } = await signUp(email, password, name)
      setBusy(false)
      if (error) return setErr(terjemah(error))
      if (needsConfirm) {
        setMsg('Akun dibuat! Cek email Anda untuk konfirmasi sebelum masuk.')
      } else {
        navigate('/pustaka')
      }
    }
  }

  async function google() {
    setErr('')
    const { error } = await signInWithGoogle()
    if (error) setErr(terjemah(error))
    // Bila berhasil, browser akan diarahkan ke Google.
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1>{mode === 'masuk' ? 'Masuk' : 'Daftar Akun'}</h1>
        <p className="muted">
          {mode === 'masuk'
            ? 'Masuk untuk menyimpan koleksi dan melanjutkan membaca.'
            : 'Buat akun gratis untuk mulai membaca.'}
        </p>

        <button className="btn btn--google btn--block" onClick={google}>
          <span className="g-icon">G</span> Lanjutkan dengan Google
        </button>

        <div className="auth__divider"><span>atau</span></div>

        <form onSubmit={submit}>
          {mode === 'daftar' && (
            <label className="auth__field">
              Nama
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Anda" />
            </label>
          )}
          <label className="auth__field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="auth__field">
            Kata sandi
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
            />
          </label>

          {err && <p className="upload-form__err">{err}</p>}
          {msg && <p className="auth__ok">{msg}</p>}

          <button className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'Memproses…' : mode === 'masuk' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="auth__switch">
          {mode === 'masuk' ? (
            <>Belum punya akun?{' '}
              <button onClick={() => { setMode('daftar'); setErr(''); setMsg('') }}>Daftar</button>
            </>
          ) : (
            <>Sudah punya akun?{' '}
              <button onClick={() => { setMode('masuk'); setErr(''); setMsg('') }}>Masuk</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

/** Terjemahkan pesan error Supabase yang umum ke Bahasa Indonesia. */
function terjemah(msg: string): string {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'Email atau kata sandi salah.'
  if (m.includes('already registered') || m.includes('already exists'))
    return 'Email sudah terdaftar. Silakan masuk.'
  if (m.includes('password')) return 'Kata sandi minimal 6 karakter.'
  if (m.includes('email')) return 'Email tidak valid.'
  return msg
}
