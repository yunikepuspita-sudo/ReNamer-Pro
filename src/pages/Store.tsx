import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CATEGORIES } from '../data/books'
import { useCatalog } from '../context/CatalogContext'
import type { ContentType } from '../types'
import BookCard from '../components/BookCard'

type SortKey = 'populer' | 'terbaru' | 'termurah' | 'judul'

const TYPE_LABELS: Record<ContentType | 'semua', string> = {
  semua: 'Semua',
  buku: 'Buku',
  jurnal: 'Jurnal',
  peraturan: 'Peraturan',
  majalah: 'Majalah',
  koran: 'Koran',
}

export default function Store() {
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [type, setType] = useState<ContentType | 'semua'>('semua')
  const [category, setCategory] = useState<string>('semua')
  const [onlyFree, setOnlyFree] = useState(false)
  const [sort, setSort] = useState<SortKey>('populer')
  const { books: BOOKS } = useCatalog()

  // Sinkron dengan parameter pencarian dari navbar.
  useEffect(() => {
    setQuery(params.get('q') ?? '')
  }, [params])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = BOOKS.filter((b) => {
      if (type !== 'semua' && b.type !== type) return false
      if (category !== 'semua' && b.category !== category) return false
      if (onlyFree && b.price !== 0) return false
      if (q) {
        const hay = `${b.title} ${b.author} ${b.publisher} ${b.category}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'terbaru':
          return b.year - a.year
        case 'termurah':
          return a.price - b.price
        case 'judul':
          return a.title.localeCompare(b.title, 'id')
        default:
          return b.rating - a.rating
      }
    })
    return list
  }, [BOOKS, query, type, category, onlyFree, sort])

  return (
    <div className="store">
      <div className="store__head">
        <h1>Toko</h1>
        <input
          className="store__search"
          type="search"
          placeholder="Cari judul, penulis, penerbit…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setParams(e.target.value ? { q: e.target.value } : {})
          }}
        />
      </div>

      <div className="store__layout">
        <aside className="filters">
          <div className="filters__group">
            <h4>Jenis</h4>
            {(['semua', 'buku', 'jurnal', 'peraturan', 'majalah', 'koran'] as const).map((t) => (
              <label key={t} className="filters__radio">
                <input
                  type="radio"
                  name="type"
                  checked={type === t}
                  onChange={() => setType(t)}
                />
                {TYPE_LABELS[t]}
              </label>
            ))}
          </div>

          <div className="filters__group">
            <h4>Kategori</h4>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="semua">Semua kategori</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filters__group">
            <label className="filters__check">
              <input
                type="checkbox"
                checked={onlyFree}
                onChange={(e) => setOnlyFree(e.target.checked)}
              />
              Hanya yang gratis
            </label>
          </div>

          <div className="filters__group">
            <h4>Urutkan</h4>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              <option value="populer">Paling populer</option>
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="judul">Judul A–Z</option>
            </select>
          </div>
        </aside>

        <div className="store__results">
          <p className="store__count">{results.length} hasil ditemukan</p>
          {results.length === 0 ? (
            <p className="empty-state">Tidak ada hasil. Coba ubah kata kunci atau filter.</p>
          ) : (
            <div className="grid">
              {results.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
