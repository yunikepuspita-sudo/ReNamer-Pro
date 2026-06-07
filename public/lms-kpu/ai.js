/* ============================================================================
 * SiPINTER KPU · ai.js — AI Learning Assistant
 * Dua lapis:
 *   1) OFFLINE (selalu aktif) — pencarian "semantic-ish" berbasis kata kunci
 *      atas Knowledge Base (window.LMS.KNOWLEDGE) + FAQ. Berjalan tanpa jaringan.
 *   2) LIVE (opsional) — Claude (Anthropic) via:
 *        • edge   : Supabase Edge Function `lms-ai` (kunci API aman di server).
 *        • direct : Anthropic API langsung dari browser (kunci di localStorage).
 *      Jawaban LIVE di-grounding pada hasil retrieval offline (pola RAG ringan).
 *
 * Tanpa konfigurasi LIVE → asisten tetap menjawab dari Knowledge Base (offline).
 * ==========================================================================*/
window.LMSAI = (function () {
  'use strict';

  const CFG_KEY = 'lms_kpu_ai_cfg_v1';
  const DEFAULT_MODEL = 'claude-sonnet-4-6';
  const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
  const ANTHROPIC_VERSION = '2023-06-01';

  function getConfig() {
    try {
      const c = JSON.parse(localStorage.getItem(CFG_KEY)) || {};
      return { provider: 'off', edgeUrl: '', edgeAnon: '', apiKey: '', model: DEFAULT_MODEL, ...c };
    } catch { return { provider: 'off', model: DEFAULT_MODEL }; }
  }
  function setConfig(c) { localStorage.setItem(CFG_KEY, JSON.stringify(c)); }
  function isLive() {
    const c = getConfig();
    if (c.provider === 'direct') return !!c.apiKey;
    if (c.provider === 'edge') return !!c.edgeUrl;
    return false;
  }

  /* ── Retrieval offline (kata kunci sederhana, bobot judul+tag) ─────────── */
  const STOP = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'apa', 'itu', 'untuk', 'pada', 'dengan', 'atau', 'adalah', 'bagaimana', 'kenapa', 'mengapa', 'saya', 'kami', 'tentang']);
  function tokens(s) {
    return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  }
  function retrieve(query, k = 4) {
    const KB = (window.LMS && window.LMS.KNOWLEDGE) || [];
    const qt = tokens(query);
    if (!qt.length) return [];
    const scored = KB.map((e) => {
      const hay = (e.judul + ' ' + e.isi + ' ' + (e.tags || []).join(' ') + ' ' + e.pelajaran).toLowerCase();
      const tagset = new Set((e.tags || []).map((t) => t.toLowerCase()));
      let s = 0;
      qt.forEach((t) => {
        if (e.judul.toLowerCase().includes(t)) s += 3;
        if (tagset.has(t)) s += 3;
        if (hay.includes(t)) s += 1;
      });
      return { e, s };
    }).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.slice(0, k).map((x) => x.e);
  }
  function catLabel(id) {
    const c = (window.LMS && window.LMS.KN_CATS || []).find((x) => x.id === id);
    return c ? c.label : id;
  }
  function offlineAnswer(query) {
    const hits = retrieve(query);
    if (!hits.length) {
      return { mode: 'offline', text:
        'Belum menemukan entri relevan di Knowledge Base lokal. Coba kata kunci lain ' +
        '(mis. "sengketa", "coklit", "kode etik", "rekapitulasi"), atau aktifkan Mode AI ' +
        'Live untuk jawaban yang lebih luas.', sumber: [] };
    }
    const text = hits.map((h, i) =>
      `${i + 1}. [${catLabel(h.cat)}] ${h.judul}\n${h.isi}\n→ Pelajaran: ${h.pelajaran}`).join('\n\n');
    return { mode: 'offline', text, sumber: hits };
  }

  /* ── Pemanggilan model live ─────────────────────────────────────────────*/
  async function callClaude({ system, messages, max_tokens = 1200 }) {
    const c = getConfig();
    const model = c.model || DEFAULT_MODEL;
    if (c.provider === 'edge') {
      const res = await fetch(c.edgeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${c.edgeAnon || ''}`, apikey: c.edgeAnon || '' },
        body: JSON.stringify({ system, messages, max_tokens, model }),
      });
      if (res.status === 503) throw new Error('AI di server belum dikonfigurasi (ANTHROPIC_API_KEY kosong).');
      if (!res.ok) throw new Error('Gangguan layanan AI (server ' + res.status + ').');
      const body = await res.json();
      return (body.text || body.reply || '').trim();
    }
    if (c.provider === 'direct') {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': c.apiKey, 'anthropic-version': ANTHROPIC_VERSION, 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model, max_tokens, system, messages }),
      });
      if (!res.ok) { const t = await res.text().catch(() => ''); throw new Error('Anthropic API ' + res.status + ': ' + t.slice(0, 160)); }
      const body = await res.json();
      return (body.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    }
    throw new Error('Mode AI Live nonaktif.');
  }

  const SYS_ASSIST =
    'Anda "Asisten Pembelajaran SiPINTER KPU", asisten kepemiluan untuk penyelenggara pemilu Indonesia. ' +
    'Jawab dalam Bahasa Indonesia yang jelas, akurat, dan netral/non-partisan. Utamakan KONTEKS yang diberikan ' +
    '(kutipan Knowledge Base) dan JANGAN mengarang dasar hukum, nomor putusan, atau angka. Bila konteks tak ' +
    'memadai, katakan dengan jujur dan sarankan merujuk sumber resmi (JDIH KPU, DKPP, MK). Ringkas, terstruktur, ' +
    'dan tautkan jawaban ke tahapan/jenjang bila relevan.';

  /* ── API tingkat tinggi ─────────────────────────────────────────────────*/
  async function ask(query, opts = {}) {
    const ret = retrieve(query);
    if (!isLive()) return offlineAnswer(query);
    const ctx = ret.length
      ? ret.map((h, i) => `[${i + 1}] (${catLabel(h.cat)}) ${h.judul}: ${h.isi} (Pelajaran: ${h.pelajaran})`).join('\n')
      : '(tidak ada entri Knowledge Base yang cocok)';
    const tierNote = opts.tierLabel ? `Pengguna pada jenjang: ${opts.tierLabel}.` : '';
    const user = `${tierNote}\nPERTANYAAN: ${query}\n\n=== KONTEKS KNOWLEDGE BASE ===\n${ctx}`;
    const text = await callClaude({ system: SYS_ASSIST, messages: [{ role: 'user', content: user }], max_tokens: 1100 });
    return { mode: 'live', text, sumber: ret };
  }

  // AI Quiz Generator — dari teks materi (live), fallback offline = template.
  async function generateQuiz(topik, n = 3) {
    if (!isLive()) {
      return { mode: 'offline', note: 'Aktifkan Mode AI Live untuk generator kuis otomatis.' };
    }
    const sys = 'Anda penyusun kuis kepemiluan. Balas HANYA JSON valid: {"soal":[{"t":"...","o":["..","..","..",".."],"j":<index benar>}]}. ' +
      'Bahasa Indonesia, akurat, non-partisan, 4 opsi per soal.';
    const text = await callClaude({ system: sys, messages: [{ role: 'user', content: `Buat ${n} soal pilihan ganda tentang: ${topik}` }], max_tokens: 900 });
    return { mode: 'live', data: JSON.parse(stripFence(text)) };
  }

  // AI Summarizer Regulasi (live), fallback offline = retrieval ringkas.
  async function summarize(query) {
    const ret = retrieve(query);
    if (!isLive()) {
      const t = ret.length ? ret.map((h) => `• ${h.judul}: ${h.pelajaran}`).join('\n') : 'Tidak ada entri relevan.';
      return { mode: 'offline', text: t, sumber: ret };
    }
    const ctx = ret.map((h) => `${h.judul}: ${h.isi}`).join('\n') || '(kosong)';
    const text = await callClaude({ system: SYS_ASSIST, messages: [{ role: 'user', content: `Ringkas poin-poin penting terkait: ${query}\n\nKONTEKS:\n${ctx}` }], max_tokens: 700 });
    return { mode: 'live', text, sumber: ret };
  }

  function stripFence(t) { return String(t || '').replace(/^```[a-zA-Z]*\s*/m, '').replace(/```\s*$/m, '').trim(); }

  return { getConfig, setConfig, isLive, ask, summarize, generateQuiz, retrieve, offlineAnswer, DEFAULT_MODEL };
})();
