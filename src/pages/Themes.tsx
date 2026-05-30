import { Link } from 'react-router-dom'
import { THEMES, themeCount } from '../data/themes'

export default function Themes() {
  return (
    <div className="themes">
      <header className="themes__head">
        <span className="hero__eyebrow">TELUSURI BERDASARKAN TEMA</span>
        <h1>Tema Pemilu</h1>
        <p className="muted">
          Jelajahi koleksi yang dikelompokkan berdasarkan tema seputar demokrasi dan pemilihan umum.
        </p>
      </header>

      <div className="themes__grid">
        {THEMES.map((t) => (
          <Link
            key={t.id}
            to={`/tema/${t.id}`}
            className="theme-card"
            style={{ background: `linear-gradient(145deg, ${t.color[0]}, ${t.color[1]})` }}
          >
            <span className="theme-card__icon">{t.icon}</span>
            <h3 className="theme-card__name">{t.name}</h3>
            <p className="theme-card__tagline">{t.tagline}</p>
            <span className="theme-card__count">{themeCount(t.id)} judul</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
