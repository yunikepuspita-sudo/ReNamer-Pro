import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import {
  EMPTY_STATE,
  loadRemoteState,
  mergeState,
  saveRemoteState,
  type AppPersisted,
} from '../lib/userState'

interface AppState {
  /** ID buku yang ada di rak/pustaka pengguna. */
  library: string[]
  /** Apakah pengguna berlangganan Premium. */
  premium: boolean
  /** Progress baca per buku: id -> indeks bab terakhir. */
  progress: Record<string, number>
  /** True bila state tersimpan ke akun (login), bukan hanya lokal. */
  synced: boolean
  addToLibrary: (id: string) => void
  removeFromLibrary: (id: string) => void
  inLibrary: (id: string) => boolean
  setPremium: (value: boolean) => void
  setProgress: (id: string, chapterIndex: number) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEY = 'e-pustaka-pemilu-state'

function loadLocal(): AppPersisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as AppPersisted
  } catch {
    /* ignore */
  }
  return { ...EMPTY_STATE }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const initial = loadLocal()
  const [library, setLibrary] = useState<string[]>(initial.library)
  const [premium, setPremiumState] = useState<boolean>(initial.premium)
  const [progress, setProgressState] = useState<Record<string, number>>(initial.progress)
  const [synced, setSynced] = useState(false)

  // Hindari menulis ke remote sebelum proses gabung-awal selesai.
  const hydratedFor = useRef<string | null>(null)

  // Saat login: gabungkan state lokal dengan state akun, lalu pakai akun.
  useEffect(() => {
    let active = true
    if (!user) {
      setSynced(false)
      hydratedFor.current = null
      return
    }
    ;(async () => {
      const remote = await loadRemoteState(user.id)
      if (!active) return
      const local: AppPersisted = { library, premium, progress }
      const merged = remote ? mergeState(local, remote) : local
      setLibrary(merged.library)
      setPremiumState(merged.premium)
      setProgressState(merged.progress)
      hydratedFor.current = user.id
      setSynced(true)
      // Tulis hasil gabungan kembali ke akun.
      await saveRemoteState(user.id, merged)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Persist: selalu ke localStorage; ke akun bila login & sudah ter-hydrate.
  useEffect(() => {
    const state: AppPersisted = { library, premium, progress }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    if (user && hydratedFor.current === user.id) {
      void saveRemoteState(user.id, state)
    }
  }, [library, premium, progress, user])

  const value = useMemo<AppState>(
    () => ({
      library,
      premium,
      progress,
      synced,
      addToLibrary: (id) => setLibrary((prev) => (prev.includes(id) ? prev : [...prev, id])),
      removeFromLibrary: (id) => setLibrary((prev) => prev.filter((x) => x !== id)),
      inLibrary: (id) => library.includes(id),
      setPremium: (v) => setPremiumState(v),
      setProgress: (id, chapterIndex) =>
        setProgressState((prev) => ({ ...prev, [id]: chapterIndex })),
    }),
    [library, premium, progress, synced],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider')
  return ctx
}
