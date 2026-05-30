// Edge Function: payment-webhook
// Menerima notifikasi dari Midtrans dan memperbarui status order.
// Mem-verifikasi signature_key agar tidak bisa dipalsukan.
//
// Deploy: supabase functions deploy payment-webhook --no-verify-jwt
// Daftarkan URL fungsi ini di Midtrans Dashboard → Settings → Configuration →
//   Payment Notification URL.
import { createClient } from 'jsr:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  try {
    const body = await req.json()
    const { order_id, status_code, gross_amount, signature_key, transaction_status } = body

    const SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')!

    // Verifikasi signature: sha512(order_id + status_code + gross_amount + server_key)
    const expected = await sha512(`${order_id}${status_code}${gross_amount}${SERVER_KEY}`)
    if (expected !== signature_key) {
      return new Response('Invalid signature', { status: 403 })
    }

    // Petakan status Midtrans → status order kita.
    let status: 'paid' | 'pending' | 'failed' = 'pending'
    if (transaction_status === 'settlement' || transaction_status === 'capture') status = 'paid'
    else if (['deny', 'cancel', 'expire', 'failure'].includes(transaction_status)) status = 'failed'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    await supabase
      .from('orders')
      .update({ status, provider_ref: order_id })
      .eq('id_str', order_id)

    return new Response('OK', { status: 200 })
  } catch (e) {
    return new Response('Error: ' + String(e), { status: 500 })
  }
})

async function sha512(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-512', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
