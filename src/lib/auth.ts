import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

/** Normalisasi nomor WA Indonesia ke format 62xxxxxxxxxx (hanya angka). */
export function normalizePhone(input: string): string {
  let p = (input || '').replace(/[^\d]/g, '')
  if (p.startsWith('0')) p = '62' + p.slice(1)
  else if (p.startsWith('8')) p = '62' + p
  else if (p.startsWith('620')) p = '62' + p.slice(3)
  return p
}

export function isValidPhone(input: string): boolean {
  const p = normalizePhone(input)
  return /^62\d{8,13}$/.test(p)
}

/**
 * Login/Daftar via nomor WhatsApp (TANPA OTP).
 * Nomor diubah menjadi email & sandi sintetis yang deterministik, sehingga
 * pengguna dengan nomor sama selalu kembali ke akun yang sama.
 * Catatan: ini untuk pendataan pengunjung, bukan keamanan ketat.
 */
export async function signInWithWhatsApp(
  name: string,
  phoneInput: string,
): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  if (!isValidPhone(phoneInput)) return { error: 'Nomor WhatsApp tidak valid.' }

  const phone = normalizePhone(phoneInput)
  const email = `wa${phone}@epustaka.local`
  const password = `EPP-wa-${phone}` // deterministik dari nomor

  // Coba masuk; bila belum ada akun, daftar lalu masuk.
  const inAttempt = await supabase.auth.signInWithPassword({ email, password })
  if (!inAttempt.error) return {}

  const up = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name.trim(), wa_phone: phone } },
  })
  if (up.error) {
    // Nomor sudah terdaftar tapi sandi beda (kasus langka) → anggap login gagal.
    return { error: 'Gagal masuk. Coba lagi.' }
  }
  // Bila konfirmasi email aktif, signUp tak memberi session — coba sign in lagi.
  if (!up.data.session) {
    const retry = await supabase.auth.signInWithPassword({ email, password })
    if (retry.error) return { error: 'Akun dibuat. Coba masuk lagi sebentar.' }
  }
  // Perbarui nama bila perlu.
  await supabase.auth.updateUser({ data: { full_name: name.trim(), wa_phone: phone } })
  return {}
}

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? { error: error.message } : {}
}

export async function signUp(
  email: string,
  password: string,
  name?: string,
): Promise<{ error?: string; needsConfirm?: boolean }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: name ? { full_name: name } : undefined },
  })
  if (error) return { error: error.message }
  // Bila konfirmasi email diaktifkan, session belum ada sampai email diverifikasi.
  return { needsConfirm: !data.session }
}

/** Login dengan Google (OAuth). Mengarahkan ke Google lalu kembali ke app. */
export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname },
  })
  return error ? { error: error.message } : {}
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange((_e, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

/** Nama tampilan pengguna (dari metadata Google atau email). */
export function displayName(user: User | null | undefined): string {
  if (!user) return ''
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined
  return meta?.full_name || meta?.name || user.email?.split('@')[0] || 'Pengguna'
}
