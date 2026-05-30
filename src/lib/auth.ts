import { supabase } from './supabase'
import type { Session } from '@supabase/supabase-js'

export async function signIn(email: string, password: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase belum dikonfigurasi.' }
  const { error } = await supabase.auth.signInWithPassword({ email, password })
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
