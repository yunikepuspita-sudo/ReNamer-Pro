import { Link } from 'react-router-dom'
import { BOOKS } from '../data/books'
import { useApp } from '../context/AppContext'
import BookCover from '../components/BookCover'

export default function Library() {
  const { library, progress } = useApp()
  const items = BOOKS.filter((b) => library.includes(b.id))

  return (
    <div className="library">
      <h1>Pustaka Saya</h1>
      {items.length === 0 ? (
        <div className="empty-state">
          <p>Rak Anda masih kosong.</p>
          <p className="muted">Tambahkan buku gratis atau berlangganan Premium untuk mulai membaca.</p>
          <Link to="/toko" className="btn btn--primary">Jelajahi Toko</Link>
        </div>
      ) : (
        <div className="grid">
          {items.map((b) => {
            const ch = progress[b.id] ?? 0
            const percent = Math.round(((ch + 1) / b.chapters.length) * 100)
            return (
              <Link key={b.id} to={`/baca/${b.id}`} className="library__item">
                <BookCover book={b} />
                <div className="library__item-body">
                  <h3>{b.title}</h3>
                  <div className="reader__progress-bar">
                    <div style={{ width: `${percent}%` }} />
                  </div>
                  <span className="muted">{percent}% · lanjut membaca</span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
