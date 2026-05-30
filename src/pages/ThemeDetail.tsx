import { Link, useParams } from 'react-router-dom'
import { booksByTheme, getTheme, THEMES } from '../data/themes'
import BookCard from '../components/BookCard'

export default function ThemeDetail() {
  const { id } = useParams()
  const theme = id ? getTheme(id) : undefined

  if (!theme) {
    return (
      <div className="empty-state">
        <p>Tema tidak ditemukan.</p>
        <Link to="/tema" className="btn btn--primary">Lihat Semua Tema</Link>
      </div>
    )
  }

  const books = booksByTheme(theme.id)
  const others = THEMES.filter((t) => t.id !== theme.id)

  return (
    <div className="theme-detail">
      <header
        className="theme-detail__banner"
        style={{ background: `linear-gradient(145deg, ${theme.color[0]}, ${theme.color[1]})` }}
      >
        <span className="theme-detail__icon">{theme.icon}</span>
        <div>
          <h1>{theme.name}</h1>
          <p>{theme.tagline}</p>
        </div>
      </header>

      <nav className="theme-chips">
        {others.map((t) => (
          <Link key={t.id} to={`/tema/${t.id}`} className="theme-chip">
            {t.icon} {t.name}
          </Link>
        ))}
      </nav>

      <p className="store__count">{books.length} judul dalam tema ini</p>
      {books.length === 0 ? (
        <p className="empty-state">Belum ada judul untuk tema ini.</p>
      ) : (
        <div className="grid">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </div>
  )
}
