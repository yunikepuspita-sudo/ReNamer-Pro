// Edge Function: payment-status
// Mengembalikan status sebuah order agar frontend bisa polling.
//
// Deploy: supabase functions deploy payment-status --no-verify-jwt
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { orderId } = await req.json()
    if (!orderId) return json({ error: 'orderId wajib diisi' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data, error } = await supabase
      .from('orders')
      .select('status, book_id')
      .eq('id_str', orderId)
      .single()
    if (error || !data) return json({ error: 'Order tidak ditemukan' }, 404)
    return json({ status: data.status, bookId: data.book_id })
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
