// Edge Function: create-payment
// Membuat transaksi QRIS via Midtrans Core API dan mencatat order di Supabase.
//
// Deploy: supabase functions deploy create-payment --no-verify-jwt
// Secret yang dibutuhkan (lihat SETUP-BACKEND.md):
//   MIDTRANS_SERVER_KEY, MIDTRANS_IS_PRODUCTION ("true"/"false"),
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { bookId } = await req.json()
    if (!bookId) return json({ error: 'bookId wajib diisi' }, 400)

    const SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!
    const IS_PROD = Deno.env.get('MIDTRANS_IS_PRODUCTION') === 'true'
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Ambil harga dari DB (jangan percaya harga dari klien).
    const { data: book, error: be } = await supabase
      .from('books')
      .select('id, title, price, premium')
      .eq('id', bookId)
      .single()
    if (be || !book) return json({ error: 'Buku tidak ditemukan' }, 404)
    if (!book.price || book.price <= 0) return json({ error: 'Buku ini gratis' }, 400)

    // Catat order berstatus pending.
    const orderId = `EPP-${book.id.slice(0, 8)}-${Date.now()}`
    const { error: oe } = await supabase.from('orders').insert({
      id_str: orderId,
      book_id: book.id,
      amount: book.price,
      status: 'pending',
      provider: 'midtrans',
    })
    if (oe) return json({ error: 'Gagal membuat order: ' + oe.message }, 500)

    // Panggil Midtrans Core API untuk membuat transaksi QRIS.
    const base = IS_PROD ? 'https://api.midtrans.com' : 'https://api.sandbox.midtrans.com'
    const auth = btoa(SERVER_KEY + ':')
    const mres = await fetch(`${base}/v2/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        payment_type: 'qris',
        transaction_details: { order_id: orderId, gross_amount: book.price },
        item_details: [{ id: book.id, price: book.price, quantity: 1, name: book.title.slice(0, 50) }],
        qris: { acquirer: 'gopay' },
      }),
    })
    const m = await mres.json()
    if (!mres.ok) return json({ error: 'Midtrans: ' + (m.status_message ?? 'gagal') }, 502)

    // URL gambar QR ada di salah satu actions.
    const qr = (m.actions ?? []).find((a: { name: string }) => a.name === 'generate-qr-code')
    return json({
      orderId,
      qrImageUrl: qr?.url ?? null,
      amount: book.price,
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
