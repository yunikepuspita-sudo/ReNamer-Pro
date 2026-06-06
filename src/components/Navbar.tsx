import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { displayName, signOut } from '../lib/auth'
import InstallButton from './InstallButton'

export default function Navbar() {
  const { premium } = useApp()
  const { user, enabled } = useAuth()
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
          <NavLink to="/peringkat">Peringkat</NavLink>
          <NavLink to="/pustaka">Pustaka Saya</NavLink>
          <NavLink to="/premium" className="navlink-premium">
            {premium ? '★ Premium' : 'Premium'}
          </NavLink>
          {enabled && (
            user ? (
              <span className="navbar__user">
                <span className="navbar__avatar" title={displayName(user)}>
                  {displayName(user).charAt(0).toUpperCase()}
                </span>
                <button
                  className="navbar__logout"
                  onClick={async () => {
                    await signOut()
                    navigate('/')
                  }}
                >
                  Keluar
                </button>
              </span>
            ) : (
              <NavLink to="/masuk" className="btn btn--primary btn--sm navbar__login">Masuk</NavLink>
            )
          )}
          <InstallButton />
        </nav>
      </div>
    </header>
  )
}
