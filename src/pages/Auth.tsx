import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { isSupabaseEnabled } from '../lib/supabase'
import { signInWithWhatsApp, isValidPhone, normalizePhone } from '../lib/auth'
import { waChatLink } from '../lib/whatsapp'
import { useAuth } from '../context/AuthContext'

type Step = 'isi' | 'verifikasi'

/** Buat kode verifikasi 4 digit. */
function genCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000))
}

export default function Auth() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('isi')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [code] = useState(genCode())
  const [inputCode, setInputCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const next = params.get('next') || '/pustaka'

  // Tautan WhatsApp ke admin berisi kode verifikasi.
  const waLink = useMemo(
    () =>
      waChatLink(
        `Halo E-Pustaka Pemilu. Saya ${name || '(nama)'} ingin verifikasi akun. ` +
          `Kode saya: ${code} (WA: ${phone || '-'})`,
      ),
    [name, phone, code],
  )

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

  // Langkah 1 → validasi data, lanjut ke verifikasi.
  function lanjut(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!name.trim()) return setErr('Nama wajib diisi.')
    if (!isValidPhone(phone)) return setErr('Masukkan nomor WhatsApp yang valid (mis. 0812xxxxxxx).')
    setStep('verifikasi')
  }

  // Langkah 2 → cocokkan kode lalu masuk.
  async function verifikasi(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (inputCode.trim() !== code) {
      setErr('Kode verifikasi tidak cocok. Pastikan Anda memasukkan kode yang sama.')
      return
    }
    setBusy(true)
    const { error } = await signInWithWhatsApp(name, phone)
    setBusy(false)
    if (error) return setErr(error)
    navigate(next)
  }

  return (
    <div className="auth">
      <div className="auth__card">
        {step === 'isi' ? (
          <>
            <h1>Masuk</h1>
            <p className="muted">
              Masuk dengan nomor WhatsApp untuk membaca koleksi dan menyimpan pustaka Anda.
            </p>
            <form onSubmit={lanjut}>
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
              <button className="btn btn--primary btn--block">Lanjut</button>
            </form>
          </>
        ) : (
          <>
            <h1>Verifikasi WhatsApp</h1>
            <p className="muted">
              Untuk memverifikasi, kirim kode di bawah ini ke WhatsApp kami, lalu masukkan
              kembali kode tersebut di sini.
            </p>

            <div className="wa-code">{code}</div>

            <a
              className="btn btn--block wa-send-btn"
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSent(true)}
            >
              💬 Kirim kode via WhatsApp
            </a>

            <form onSubmit={verifikasi} style={{ marginTop: 16 }}>
              <label className="auth__field">
                Masukkan kembali kode
                <input
                  inputMode="numeric"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="4 digit"
                  required
                />
              </label>
              {err && <p className="upload-form__err">{err}</p>}
              {!sent && (
                <p className="muted center" style={{ fontSize: 13 }}>
                  Tekan tombol di atas dulu untuk mengirim kode lewat WhatsApp.
                </p>
              )}
              <button className="btn btn--primary btn--block" disabled={busy}>
                {busy ? 'Memproses…' : 'Verifikasi & Masuk'}
              </button>
            </form>

            <button
              className="auth__switch"
              style={{ background: 'none', border: 0, marginTop: 12, color: 'var(--brand)', cursor: 'pointer' }}
              onClick={() => { setStep('isi'); setErr('') }}
            >
              ← Ubah nama / nomor
            </button>
          </>
        )}

        <p className="muted center" style={{ marginTop: 14, fontSize: 13 }}>
          Dengan masuk, Anda menyetujui penggunaan data nama & nomor WhatsApp ({normalizePhone(phone) || '—'})
          untuk keperluan layanan perpustakaan ini.
        </p>
      </div>
    </div>
  )
}
