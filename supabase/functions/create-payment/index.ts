// Edge Function: create-payment
// Membuat transaksi QRIS via Midtrans Core API dan mencatat order di Supabase.
// Mendukung 2 jenis: pembelian buku (bookId) & langganan Premium (plan).
//
// Deploy: supabase functions deploy create-payment --no-verify-jwt
// Secret: MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION ("true"/"false")
//   (SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY disediakan otomatis)
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Harga Premium ditetapkan di server (Rupiah).
const PREMIUM_PRICES: Record<string, { amount: number; label: string; days: number }> = {
  bulanan: { amount: 49000, label: 'Premium Bulanan', days: 30 },
  tahunan: { amount: 399000, label: 'Premium Tahunan', days: 365 },
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const body = await req.json()
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    let amount = 0
    let itemId = ''
    let itemName = ''
    let orderPrefix = ''
    let bookId: string | null = null
    let userId: string | null = null
    let kind = 'book'

    if (body.plan) {
      // ---- Langganan Premium (butuh pengguna login) ----
      const plan = PREMIUM_PRICES[body.plan]
      if (!plan) return json({ error: 'Paket tidak dikenal' }, 400)

      // Identifikasi pengguna dari token Authorization (JWT).
      const authHeader = req.headers.get('Authorization') ?? ''
      const token = authHeader.replace('Bearer ', '')
      const { data: u } = await supabase.auth.getUser(token)
      if (!u?.user) return json({ error: 'Anda harus masuk untuk berlangganan.' }, 401)

      userId = u.user.id
      amount = plan.amount
      itemId = `premium-${body.plan}`
      itemName = plan.label
      orderPrefix = 'PRM'
      kind = 'premium'
    } else if (body.bookId) {
      // ---- Pembelian buku ----
      const { data: book, error: be } = await supabase
        .from('books')
        .select('id, title, price')
        .eq('id', body.bookId)
        .single()
      if (be || !book) return json({ error: 'Buku tidak ditemukan' }, 404)
      if (!book.price || book.price <= 0) return json({ error: 'Buku ini gratis' }, 400)
      amount = book.price
      itemId = book.id
      itemName = book.title.slice(0, 50)
      orderPrefix = 'EPP'
      bookId = book.id
    } else {
      return json({ error: 'bookId atau plan wajib diisi' }, 400)
    }

    const orderId = `${orderPrefix}-${itemId.slice(0, 8)}-${Date.now()}`
    const { error: oe } = await supabase.from('orders').insert({
      id_str: orderId,
      book_id: bookId,
      user_id: userId,
      kind,
      plan: body.plan ?? null,
      amount,
      status: 'pending',
      provider: 'midtrans',
    })
    if (oe) return json({ error: 'Gagal membuat order: ' + oe.message }, 500)

    const SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!
    const IS_PROD = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'
    const apiBase = IS_PROD ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
    const auth = btoa(SERVER_KEY + ':')
    const mres = await fetch(`${apiBase}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: { order_id: orderId, gross_amount: amount },
        item_details: [{ id: itemId, price: amount, quantity: 1, name: itemName }],
        qris: { acquirer: 'gopay' },
      }),
    })
    const m = await mres.json()
    if (!mres.ok) return json({ error: 'Midtrans: ' + (m.status_message ?? 'gagal') }, 502)

    const qr = (m.actions ?? []).find((a: { name: string }) => a.name === 'generate-qr-code')
    return json({
      orderId,
      qrImageUrl: qr?.url ?? null,
      amount,
      expiry: m.expiry_time ?? null,
    })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
