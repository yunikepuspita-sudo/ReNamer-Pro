import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { BOOKS as STATIC_BOOKS } from '../data/books'
import { fetchCatalog } from '../lib/catalog'
import type { Book } from '../types'

interface CatalogState {
  books: Book[]
  loading: boolean
  getBook: (id: string) => Book | undefined
  refresh: () => void
}

const CatalogContext = createContext<CatalogState | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  // Mulai dengan data statis agar UI langsung tampil, lalu gabung dengan remote.
  const [books, setBooks] = useState<Book[]>(STATIC_BOOKS)
  const [loading, setLoading] = useState(true)

  function refresh() {
    setLoading(true)
    fetchCatalog()
      .then(setBooks)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refresh()
  }, [])

  const value: CatalogState = {
    books,
    loading,
    getBook: (id) => books.find((b) => b.id === id),
    refresh,
  }
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog harus dipakai di dalam CatalogProvider')
  return ctx
}
