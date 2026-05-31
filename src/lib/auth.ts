import { supabase } from './supabase'
import type { Session, User } from '@supabase/supabase-js'

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
