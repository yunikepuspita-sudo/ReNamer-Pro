import { supabase, isSupabaseEnabled } from './supabase'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Apakah pembayaran QRIS (Edge Functions) bisa dipakai. */
export const isPaymentEnabled = isSupabaseEnabled

export type PremiumPlan = 'bulanan' | 'tahunan'

export interface QrisCharge {
  orderId: string
  qrImageUrl: string | null
  amount: number
  expiry: string | null
}

/** Token sesi pengguna (untuk transaksi premium yang terikat akun). */
async function authToken(): Promise<string | null> {
  if (!supabase) return null
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}

async function callFn<T>(name: string, payload: unknown, userToken?: string | null): Promise<T> {
  if (!url || !anon) throw new Error('Pembayaran belum dikonfigurasi.')
  const res = await fetch(`${url}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Token pengguna bila ada (premium), jika tidak pakai anon key.
      Authorization: `Bearer ${userToken ?? anon}`,
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

/** Membuat transaksi QRIS untuk langganan Premium (terikat akun pengguna). */
export async function createPremiumCharge(plan: PremiumPlan): Promise<QrisCharge> {
  const token = await authToken()
  if (!token) throw new Error('Anda harus masuk untuk berlangganan Premium.')
  return callFn<QrisCharge>('create-payment', { plan }, token)
}

/** Mengecek status order (pending | paid | failed). */
export function getOrderStatus(orderId: string): Promise<{ status: string; bookId: string }> {
  return callFn('payment-status', { orderId })
}

export { supabase }
