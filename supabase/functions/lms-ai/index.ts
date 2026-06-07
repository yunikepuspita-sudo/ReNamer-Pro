// Edge Function: lms-ai
// Relay AI untuk "SiPINTER KPU — Election Knowledge & Competency Platform".
// Menerima prompt yang sudah dirangkai klien (system + messages, sudah di-grounding
// pada Knowledge Base) lalu memanggil Claude (Anthropic). Menjaga ANTHROPIC_API_KEY
// tetap di server (tidak di browser).
//
// SECRET (Supabase Dashboard → Edge Functions → Manage secrets):
//   ANTHROPIC_API_KEY = sk-ant-...
// Selama secret belum diisi, fungsi mengembalikan 503 {error:"not_configured"}.
//
// Deploy: supabase functions deploy lms-ai --no-verify-jwt

import Anthropic from 'npm:@anthropic-ai/sdk'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ALLOWED = new Set(['claude-sonnet-4-6', 'claude-opus-4-8', 'claude-haiku-4-5-20251001'])
const DEFAULT_MODEL = 'claude-sonnet-4-6'

interface Turn { role: 'user' | 'assistant'; content: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
    if (!apiKey) {
      return json({ error: 'not_configured', message: 'ANTHROPIC_API_KEY belum diset di Supabase.' }, 503)
    }

    const body = await req.json().catch(() => ({}))
    const system: string = String(body.system ?? '').slice(0, 20000)
    const model: string = ALLOWED.has(body.model) ? body.model : DEFAULT_MODEL
    const max_tokens: number = Math.min(Math.max(Number(body.max_tokens) || 1200, 256), 4000)
    const messages: Turn[] = Array.isArray(body.messages)
      ? body.messages
          .slice(-12)
          .map((m: Turn) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: String(m.content ?? '').slice(0, 24000),
          }))
      : []

    if (!messages.length) return json({ error: 'messages wajib diisi' }, 400)

    const client = new Anthropic({ apiKey })
    const resp = await client.messages.create({
      model,
      max_tokens,
      thinking: { type: 'disabled' },
      output_config: { effort: 'medium' },
      system,
      messages,
    })
    return json({ text: textOf(resp) })
  } catch (e) {
    return json({ error: 'server_error', message: String(e) }, 500)
  }
})

// deno-lint-ignore no-explicit-any
function textOf(resp: any): string {
  return (resp?.content ?? [])
    .filter((b: any) => b.type === 'text')
    .map((b: any) => b.text)
    .join('')
    .trim()
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}
