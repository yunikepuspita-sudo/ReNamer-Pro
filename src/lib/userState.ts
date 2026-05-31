import { supabase } from './supabase'

export interface AppPersisted {
  library: string[]
  premium: boolean
  progress: Record<string, number>
}

export const EMPTY_STATE: AppPersisted = { library: [], premium: false, progress: {} }

/** Ambil state pengguna dari Supabase (baris per user_id). */
export async function loadRemoteState(userId: string): Promise<AppPersisted | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_state')
    .select('library, premium, progress')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return null
  return {
    library: data.library ?? [],
    premium: data.premium ?? false,
    progress: data.progress ?? {},
  }
}

/** Simpan state pengguna ke Supabase (upsert). */
export async function saveRemoteState(userId: string, state: AppPersisted): Promise<void> {
  if (!supabase) return
  await supabase.from('user_state').upsert(
    {
      user_id: userId,
      library: state.library,
      premium: state.premium,
      progress: state.progress,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )
}

/** Gabungkan state lokal + remote (union pustaka, premium bila salah satu true). */
export function mergeState(a: AppPersisted, b: AppPersisted): AppPersisted {
  return {
    library: Array.from(new Set([...a.library, ...b.library])),
    premium: a.premium || b.premium,
    progress: { ...a.progress, ...b.progress },
  }
}
