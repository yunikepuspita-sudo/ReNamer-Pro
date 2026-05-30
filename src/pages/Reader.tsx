import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useCatalog } from '../context/CatalogContext'
import { useApp } from '../context/AppContext'
import { getUpload, type UploadRecord } from '../lib/uploads'
import TextReader from './TextReader'
import PdfReader from '../components/PdfReader'

/** Jumlah halaman cuplikan untuk PDF berbayar/premium yang belum dimiliki. */
const PREVIEW_PAGES = 2

/** Memilih jenis reader yang tepat berdasarkan sumber buku. */
export default function Reader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getBook } = useCatalog()
  const { inLibrary, premium } = useApp()
  const staticBook = id ? getBook(id) : undefined

  // undefined = belum dicek, null = tidak ada
  const [upload, setUpload] = useState<UploadRecord | null | undefined>(undefined)

  useEffect(() => {
    let active = true
    if (!staticBook && id) {
      getUpload(id).then((rec) => active && setUpload(rec ?? null))
    } else {
      setUpload(null)
    }
    return () => {
      active = false
    }
  }, [id, staticBook])

  // Buku katalog berformat PDF (repo lokal maupun unggahan admin via Supabase).
  if (staticBook?.pdfUrl) {
    // URL absolut (Supabase Storage) dipakai apa adanya; path relatif diberi base.
    const url = /^https?:\/\//.test(staticBook.pdfUrl)
      ? staticBook.pdfUrl
      : import.meta.env.BASE_URL + staticBook.pdfUrl

    // Terkunci jika berbayar/premium dan belum dimiliki (bukan pelanggan premium).
    const owned = inLibrary(staticBook.id)
    const needsPurchase = staticBook.price > 0 || staticBook.premium
    const locked = needsPurchase && !owned && !(staticBook.premium && premium)

    return (
      <PdfReader
        source={url}
        title={staticBook.title}
        onBack={() => navigate(`/buku/${staticBook.id}`)}
        previewPages={locked ? PREVIEW_PAGES : undefined}
        onUnlock={locked ? () => navigate(`/buku/${staticBook.id}`) : undefined}
      />
    )
  }

  // Buku katalog berformat teks.
  if (staticBook) {
    return <TextReader book={staticBook} />
  }

  // Sedang memuat data unggahan dari IndexedDB.
  if (upload === undefined) {
    return <div className="empty-state"><p>Memuat…</p></div>
  }

  // Ebook unggahan pengguna (Opsi B).
  if (upload) {
    return <PdfReader source={upload.blob} title={upload.title} onBack={() => navigate('/pustaka')} />
  }

  return (
    <div className="empty-state">
      <p>Judul tidak ditemukan.</p>
      <Link to="/toko" className="btn btn--primary">Kembali ke Toko</Link>
    </div>
  )
}
