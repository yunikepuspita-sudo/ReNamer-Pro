import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const PLANS = [
  { id: 'bulanan', name: 'Bulanan', price: 'Rp 49.000', per: '/bulan', highlight: false },
  { id: 'tahunan', name: 'Tahunan', price: 'Rp 399.000', per: '/tahun', highlight: true, note: 'Hemat 32%' },
]

const BENEFITS = [
  'Akses tak terbatas ke seluruh koleksi Premium',
  'Baca buku, majalah, dan koran tanpa batas',
  'Bebas iklan, sinkron di semua perangkat',
  'Tema baca, atur ukuran huruf, dan penanda halaman',
  'Tidak ada biaya pembatalan',
]

export default function Premium() {
  const { premium, setPremium } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState('tahunan')

  return (
    <div className="premium">
      <section className="premium__hero">
        <span className="hero__eyebrow">PREMIUM — ALL YOU CAN READ</span>
        <h1>Langganan sekali, baca semua</h1>
        <p>Akses ke puluhan ribu judul paling populer dan buku eksklusif tanpa batas.</p>
      </section>

      {premium ? (
        <div className="premium__active">
          <h2>★ Anda sudah berlangganan Premium</h2>
          <p>Selamat menikmati seluruh koleksi tanpa batas.</p>
          <div className="premium__active-actions">
            <button className="btn btn--primary" onClick={() => navigate('/toko')}>Mulai Membaca</button>
            <button className="btn btn--ghost" onClick={() => setPremium(false)}>Batalkan Langganan</button>
          </div>
        </div>
      ) : (
        <>
          <div className="plans">
            {PLANS.map((p) => (
              <button
                key={p.id}
                className={`plan ${p.highlight ? 'plan--highlight' : ''} ${selected === p.id ? 'is-selected' : ''}`}
                onClick={() => setSelected(p.id)}
              >
                {p.note && <span className="plan__badge">{p.note}</span>}
                <h3>{p.name}</h3>
                <p className="plan__price">
                  {p.price}
                  <small>{p.per}</small>
                </p>
              </button>
            ))}
          </div>

          <ul className="benefits">
            {BENEFITS.map((b) => (
              <li key={b}>✓ {b}</li>
            ))}
          </ul>

          <button
            className="btn btn--primary btn--block"
            onClick={() => {
              setPremium(true)
              navigate('/toko')
            }}
          >
            Berlangganan {PLANS.find((p) => p.id === selected)?.name} sekarang
          </button>
          <p className="muted center">Demo: langganan diaktifkan secara lokal, tanpa pembayaran nyata.</p>
        </>
      )}
    </div>
  )
}
