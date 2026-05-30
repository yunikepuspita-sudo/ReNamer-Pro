import { Link } from 'react-router-dom'
import { BOOKS } from '../data/books'
import Shelf from '../components/Shelf'

export default function Home() {
  const populer = [...BOOKS].sort((a, b) => b.rating - a.rating).slice(0, 8)
  const gratis = BOOKS.filter((b) => b.price === 0)
  const majalahKoran = BOOKS.filter((b) => b.type !== 'buku')
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

      <Shelf title="📈 Paling Populer" books={populer} />
      <Shelf title="🆕 Terbaru" books={terbaru} />
      <Shelf title="🎁 Gratis Dibaca" books={gratis} />
      <Shelf title="📰 Majalah & Koran" books={majalahKoran} />
    </div>
  )
}
