import { supabase, isSupabaseEnabled } from './supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Apakah pembayaran QRIS (Edge Functions) bisa dipakai. */
export const isPaymentEnabled = isSupabaseEnabled

export interface QrisCharge {
  orderId: string
  qrImageUrl: string | null
  amount: number
  expiry: string | null
}

async function callFn<T>(name: string, payload: unknown): Promise<T> {
  if (!url || !anon) throw new Error('Pembayaran belum dikonfigurasi.')
  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anon}`,
      apikey: anon,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Permintaan gagal')
  return data as T
}

/** Membuat transaksi QRIS untuk sebuah buku. */
export function createQrisCharge(bookId: string): Promise<QrisCharge> {
  return callFn<QrisCharge>('create-payment', { bookId })
}

/** Mengecek status order (pending | paid | failed). */
export function getOrderStatus(orderId: string): Promise<{ status: string; bookId: string }> {
  return callFn('payment-status', { orderId })
}

// Re-ekspor supabase agar pemanggil bisa cek bila perlu.
export { supabase }
