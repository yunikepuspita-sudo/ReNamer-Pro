import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { isPaymentEnabled, type PremiumPlan } from '../lib/payments'
import QrisCheckout from '../components/QrisCheckout'

const PLANS: { id: PremiumPlan; name: string; price: string; per: string; highlight: boolean; note?: string }[] = [
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
  const { user, enabled } = useAuth()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<PremiumPlan>('tahunan')
  const [checkout, setCheckout] = useState(false)

  // Pembayaran nyata aktif bila Supabase + payment dikonfigurasi.
  const realPayment = isPaymentEnabled

  function handleSubscribe() {
    // Pembayaran nyata butuh login.
    if (realPayment && enabled) {
      if (!user) {
        navigate('/masuk')
        return
      }
      setCheckout(true)
    } else {
      // Mode demo (tanpa backend pembayaran).
      setPremium(true)
      navigate('/toko')
    }
  }

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

          {realPayment && !user && (
            <p className="muted center">
              Anda perlu <Link to="/masuk">masuk</Link> untuk berlangganan Premium.
            </p>
          )}

          <button className="btn btn--primary btn--block" onClick={handleSubscribe}>
            {realPayment
              ? `Berlangganan ${PLANS.find((p) => p.id === selected)?.name} dengan QRIS`
              : `Berlangganan ${PLANS.find((p) => p.id === selected)?.name} sekarang`}
          </button>
          {!realPayment && (
            <p className="muted center">Demo: langganan diaktifkan secara lokal, tanpa pembayaran nyata.</p>
          )}
        </>
      )}

      {checkout && (
        <QrisCheckout
          plan={selected}
          title={`Premium ${PLANS.find((p) => p.id === selected)?.name}`}
          onClose={() => setCheckout(false)}
          onPaid={() => {
            // Webhook mengaktifkan premium di akun; aktifkan juga lokal agar instan.
            setPremium(true)
            setCheckout(false)
            navigate('/toko')
          }}
        />
      )}
    </div>
  )
}
