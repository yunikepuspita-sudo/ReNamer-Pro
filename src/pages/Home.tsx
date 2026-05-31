import { Link } from 'react-router-dom'
import { THEMES, themeCount } from '../data/themes'
import { useCatalog } from '../context/CatalogContext'
import Shelf from '../components/Shelf'

export default function Home() {
  const { books: BOOKS } = useCatalog()
  const populer = [...BOOKS].sort((a, b) => b.rating - a.rating).slice(0, 8)
  const gratis = BOOKS.filter((b) => b.price === 0)
  const jurnal = BOOKS.filter((b) => b.type === 'jurnal')
  const peraturan = BOOKS.filter((b) => b.type === 'peraturan')
  const buku = BOOKS.filter((b) => b.type === 'buku')
  const majalahKoran = BOOKS.filter((b) => b.type === 'majalah' || b.type === 'koran')
  const modul = BOOKS.filter((b) => b.type === 'modul')
  const terbaru = [...BOOKS].sort((a, b) => b.year - a.year).slice(0, 8)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero__text">
          <span className="hero__eyebrow">PERPUSTAKAAN DIGITAL</span>
          <h1>
            Baca buku, majalah & koran <br />
            seputar <span>Demokrasi & Pemilu</span>
          </h1>
          <p>
            Lebih dari ribuan judul edukatif untuk pemilih cerdas. Nikmati pengalaman membaca
            dengan tema warna, ukuran huruf, dan penanda halaman yang bisa disesuaikan.
          </p>
          <div className="hero__cta">
            <Link to="/toko" className="btn btn--primary">Jelajahi Toko</Link>
            <Link to="/premium" className="btn btn--ghost">Coba Premium</Link>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__book" style={{ background: 'linear-gradient(145deg,#1e3a8a,#3b82f6)' }} />
          <div className="hero__book" style={{ background: 'linear-gradient(145deg,#047857,#10b981)' }} />
          <div className="hero__book" style={{ background: 'linear-gradient(145deg,#b91c1c,#f59e0b)' }} />
        </div>
      </section>

      <section className="home-themes">
        <div className="home-themes__head">
          <h2>🗳️ Telusuri Tema Pemilu</h2>
          <Link to="/tema" className="home-themes__all">Lihat semua →</Link>
        </div>
        <div className="home-themes__row">
          {THEMES.map((t) => (
            <Link
              key={t.id}
              to={`/tema/${t.id}`}
              className="theme-pill"
              style={{ background: `linear-gradient(145deg, ${t.color[0]}, ${t.color[1]})` }}
            >
              <span className="theme-pill__icon">{t.icon}</span>
              <span className="theme-pill__name">{t.name}</span>
              <span className="theme-pill__count">{themeCount(t.id)} judul</span>
            </Link>
          ))}
        </div>
      </section>

      <Shelf title="📈 Paling Populer" books={populer} />
      <Shelf title="🆕 Terbaru" books={terbaru} />
      <Shelf title="🎁 Gratis Dibaca" books={gratis} />
      <Shelf title="📕 Buku & Bahan Pustaka" books={buku} />
      <Shelf title="📚 Jurnal" books={jurnal} />
      <Shelf title="⚖️ Peraturan" books={peraturan} />
      <Shelf title="📦 Modul & Sosialisasi" books={modul} />
      <Shelf title="📰 Majalah & Koran" books={majalahKoran} />
    </div>
  )
}
