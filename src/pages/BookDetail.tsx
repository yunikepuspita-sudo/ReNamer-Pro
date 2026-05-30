import { Link, useParams, useNavigate } from 'react-router-dom'
import { BOOKS, getBook, formatRupiah } from '../data/books'
import { getTheme } from '../data/themes'
import { useApp } from '../context/AppContext'
import BookCover from '../components/BookCover'
import Shelf from '../components/Shelf'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const book = id ? getBook(id) : undefined
  const { inLibrary, addToLibrary, removeFromLibrary, premium } = useApp()

  if (!book) {
    return (
      <div className="empty-state">
        <p>Judul tidak ditemukan.</p>
        <Link to="/toko" className="btn btn--primary">Kembali ke Toko</Link>
      </div>
    )
  }

  const owned = inLibrary(book.id)
  const locked = book.premium && !premium && !owned
  const related = BOOKS.filter((b) => b.category === book.category && b.id !== book.id).slice(0, 6)

  function handleAcquire() {
    if (!book) return
    addToLibrary(book.id)
  }

  return (
    <div className="detail">
      <div className="detail__main">
        <div className="detail__cover">
          <BookCover book={book} size="lg" />
        </div>

        <div className="detail__info">
          <span className="detail__category">{book.category} · {book.type.toUpperCase()}</span>
          <h1>{book.title}</h1>
          <p className="detail__author">oleh {book.author}</p>

          <div className="detail__stats">
            <span>★ {book.rating.toFixed(1)}</span>
            <span>{book.pages} halaman</span>
            <span>{book.year}</span>
            <span>{book.publisher}</span>
          </div>

          <p className="detail__price">{formatRupiah(book.price)}</p>

          {book.premium && (
            <p className="detail__premium-tag">
              ✦ Termasuk dalam langganan Premium — All You Can Read
            </p>
          )}

          <div className="detail__actions">
            {owned ? (
              <>
                <button className="btn btn--primary" onClick={() => navigate(`/baca/${book.id}`)}>
                  Baca Sekarang
                </button>
                <button className="btn btn--ghost" onClick={() => removeFromLibrary(book.id)}>
                  Hapus dari Pustaka
                </button>
              </>
            ) : locked ? (
              <>
                <Link to="/premium" className="btn btn--primary">Berlangganan Premium</Link>
                <button className="btn btn--ghost" onClick={() => navigate(`/baca/${book.id}`)}>
                  Baca Cuplikan
                </button>
              </>
            ) : (
              <>
                <button className="btn btn--primary" onClick={handleAcquire}>
                  {book.price === 0 ? 'Tambahkan ke Pustaka' : `Beli · ${formatRupiah(book.price)}`}
                </button>
                <button className="btn btn--ghost" onClick={() => navigate(`/baca/${book.id}`)}>
                  Baca Cuplikan
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="detail__section">
        <h2>Sinopsis</h2>
        <p>{book.synopsis}</p>
      </section>

      {book.themes.length > 0 && (
        <section className="detail__section">
          <h2>Tema Pemilu</h2>
          <div className="theme-chips">
            {book.themes.map((tid) => {
              const t = getTheme(tid)
              if (!t) return null
              return (
                <Link key={tid} to={`/tema/${tid}`} className="theme-chip">
                  {t.icon} {t.name}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="detail__section">
        <h2>Daftar Isi</h2>
        <ol className="toc">
          {book.chapters.map((c, i) => (
            <li key={i}>{c.title}</li>
          ))}
        </ol>
      </section>

      {related.length > 0 && <Shelf title="Kategori Serupa" books={related} />}
    </div>
  )
}
