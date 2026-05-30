import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

interface AppState {
  /** ID buku yang ada di rak/pustaka pengguna. */
  library: string[]
  /** Apakah pengguna berlangganan Premium. */
  premium: boolean
  /** Progress baca per buku: id -> indeks bab terakhir. */
  progress: Record<string, number>
  addToLibrary: (id: string) => void
  removeFromLibrary: (id: string) => void
  inLibrary: (id: string) => boolean
  setPremium: (value: boolean) => void
  setProgress: (id: string, chapterIndex: number) => void
}

const AppContext = createContext<AppState | null>(null)

const STORAGE_KEY = 'e-pustaka-pemilu-state'

interface Persisted {
  library: string[]
  premium: boolean
  progress: Record<string, number>
}

function loadState(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Persisted
  } catch {
    /* ignore */
  }
  return { library: [], premium: false, progress: {} }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const initial = loadState()
  const [library, setLibrary] = useState<string[]>(initial.library)
  const [premium, setPremiumState] = useState<boolean>(initial.premium)
  const [progress, setProgressState] = useState<Record<string, number>>(initial.progress)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ library, premium, progress }))
  }, [library, premium, progress])

  const value = useMemo<AppState>(
    () => ({
      library,
      premium,
      progress,
      addToLibrary: (id) => setLibrary((prev) => (prev.includes(id) ? prev : [...prev, id])),
      removeFromLibrary: (id) => setLibrary((prev) => prev.filter((x) => x !== id)),
      inLibrary: (id) => library.includes(id),
      setPremium: (v) => setPremiumState(v),
      setProgress: (id, chapterIndex) =>
        setProgressState((prev) => ({ ...prev, [id]: chapterIndex })),
    }),
    [library, premium, progress],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppState {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider')
  return ctx
}
