import { useEffect, useRef, useState } from 'react'
import {
  createQrisCharge,
  createPremiumCharge,
  getOrderStatus,
  type QrisCharge,
  type PremiumPlan,
} from '../lib/payments'
import { formatRupiah } from '../data/books'

type Phase = 'loading' | 'show-qr' | 'paid' | 'error'

/**
 * Modal pembayaran QRIS. Membuat transaksi (buku via bookId, atau Premium via
 * plan), menampilkan QR, lalu polling status hingga lunas.
 */
export default function QrisCheckout({
  bookId,
  plan,
  title,
  onClose,
  onPaid,
}: {
  bookId?: string
  plan?: PremiumPlan
  title: string
  onClose: () => void
  onPaid: () => void
}) {
  const [phase, setPhase] = useState<Phase>('loading')
  const [charge, setCharge] = useState<QrisCharge | null>(null)
  const [error, setError] = useState('')
  const pollRef = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    const create = plan ? createPremiumCharge(plan) : createQrisCharge(bookId!)
    create
      .then((c) => {
        if (!active) return
        setCharge(c)
        setPhase('show-qr')
      })
      .catch((e) => {
        if (!active) return
        setError(String(e.message ?? e))
        setPhase('error')
      })
    return () => {
      active = false
    }
  }, [bookId, plan])

  // Polling status tiap 3 detik selama QR ditampilkan.
  useEffect(() => {
    if (phase !== 'show-qr' || !charge) return
    pollRef.current = window.setInterval(async () => {
      try {
        const { status } = await getOrderStatus(charge.orderId)
        if (status === 'paid') {
          setPhase('paid')
          onPaid()
        } else if (status === 'failed') {
          setError('Pembayaran gagal atau kedaluwarsa.')
          setPhase('error')
        }
      } catch {
        /* abaikan error sementara saat polling */
      }
    }, 3000)
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [phase, charge, onPaid])

  return (
    <div className="reader__drawer-backdrop" onClick={onClose}>
      <div className="qris" onClick={(e) => e.stopPropagation()}>
        <button className="qris__close" onClick={onClose} aria-label="Tutup">✕</button>
        <h3>Bayar dengan QRIS</h3>
        <p className="muted">{title}</p>

        {phase === 'loading' && <p className="pdf-loading">Membuat kode QR…</p>}

        {phase === 'show-qr' && charge && (
          <>
            <p className="qris__amount">{formatRupiah(charge.amount)}</p>
            {charge.qrImageUrl ? (
              <img className="qris__img" src={charge.qrImageUrl} alt="Kode QRIS" />
            ) : (
              <p className="upload-form__err">Kode QR tidak tersedia.</p>
            )}
            <p className="muted center">
              Scan dengan GoPay, DANA, OVO, ShopeePay, atau m-banking apa pun yang
              mendukung QRIS. Halaman ini akan terbuka otomatis setelah pembayaran.
            </p>
            <p className="qris__waiting">⏳ Menunggu pembayaran…</p>
          </>
        )}

        {phase === 'paid' && (
          <div className="center">
            <p className="qris__success">✓ Pembayaran berhasil!</p>
            <p className="muted">Buku sudah terbuka. Selamat membaca.</p>
            <button className="btn btn--primary" onClick={onClose}>Tutup</button>
          </div>
        )}

        {phase === 'error' && (
          <div className="center">
            <p className="upload-form__err">{error}</p>
            <button className="btn btn--ghost" onClick={onClose}>Tutup</button>
          </div>
        )}
      </div>
    </div>
  )
}
