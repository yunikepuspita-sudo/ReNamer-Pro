import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { premium } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')

  function submit(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/toko?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="brand">
          <span className="brand__mark">eP</span>
          <span className="brand__name">
            E-Pustaka <strong>Pemilu</strong>
          </span>
        </Link>

        <form className="search" onSubmit={submit} role="search">
          <input
            type="search"
            placeholder="Cari buku, majalah, atau koran…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Cari"
          />
          <button type="submit" aria-label="Cari">🔍</button>
        </form>

        <nav className="navbar__links">
          <NavLink to="/" end>Beranda</NavLink>
          <NavLink to="/toko">Toko</NavLink>
          <NavLink to="/tema">Tema Pemilu</NavLink>
          <NavLink to="/pustaka">Pustaka Saya</NavLink>
          <NavLink to="/premium" className="navlink-premium">
            {premium ? '★ Premium' : 'Premium'}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
