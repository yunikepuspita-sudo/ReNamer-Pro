/* ============================================================================
 * AI Planning Document Factory — KPU · ai.js
 * Klien "Mode AI" (Claude / Anthropic). Dua jalur:
 *   • edge   — memanggil Supabase Edge Function `perencanaan-ai` (kunci API di
 *              server; AMAN, direkomendasikan untuk produksi).
 *   • direct — memanggil Anthropic API langsung dari browser memakai kunci yang
 *              disimpan lokal (cepat untuk uji coba internal; kunci tersimpan di
 *              localStorage perangkat ini saja).
 * Tanpa konfigurasi → AI nonaktif, aplikasi tetap memakai generator template.
 *
 * Mode AI memperkaya narasi dokumen (Nota Dinas, KAK, dll) dengan di-grounding
 * pada blueprint dokumen contoh KPU Jabar (templates.js) + data form, sumber
 * anggaran, BAS, dan RAB. Output divalidasi tetap memakai validator lokal.
 * ==========================================================================*/
window.KPAI = (function () {
  'use strict';

  const KB = window.KB;
  const GEN = window.GEN;
  const TPL = window.TPL;
  const CFG_KEY = 'kpu_ai_cfg_v1';
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
  function isEnabled() {
    const c = getConfig();
    if (c.provider === 'direct') return !!c.apiKey;
    if (c.provider === 'edge') return !!c.edgeUrl;
    return false;
  }

  // ── Pemanggilan model (mengembalikan teks) ─────────────────────────────────
  async function callClaude({ system, messages, max_tokens = 2000 }) {
    const c = getConfig();
    const model = c.model || DEFAULT_MODEL;

    if (c.provider === 'edge') {
      const res = await fetch(c.edgeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${c.edgeAnon || ''}`,
          apikey: c.edgeAnon || '',
        },
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
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': c.apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({ model, max_tokens, system, messages }),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error('Anthropic API ' + res.status + ': ' + t.slice(0, 200));
      }
      const body = await res.json();
      return (body.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    }

    throw new Error('Mode AI nonaktif.');
  }

  // ── Util konteks ───────────────────────────────────────────────────────────
  function basRingkas() {
    return KB.BAS.kelompok.map((k) =>
      `${k.kode} ${k.nama}: ` + k.jenis.map((j) => j.akun.map((a) => a.kode + '=' + a.nama).join('; ')).join('; ')
    ).join('\n');
  }
  function rabRingkas(rab) {
    if (!rab) return '(belum ada RAB)';
    return rab.items.map((it) => `- ${it.uraian} | akun ${it.akun} | ${it.vol} ${it.satuan || ''} x ${GEN.rupiah(it.harga)} = ${GEN.rupiah(it.jumlah)}`).join('\n') + `\nTOTAL: ${GEN.rupiah(rab.total)}`;
  }
  function konteksForm(f) {
    const s = KB.SUMBER[f.sumber] || {};
    return [
      `Nama kegiatan: ${f.nama}`,
      `Jenis: ${(KB.JENIS_KEGIATAN[f.jenis] || {}).label || f.jenis}${f.mekanisme ? ' (' + f.mekanisme + ')' : ''}`,
      `Tujuan: ${f.tujuan}`,
      `Output: ${f.output}`,
      `Sasaran: ${f.sasaran}`,
      `Lokasi: ${f.lokasi}`,
      `Tanggal mulai: ${f.tanggal} · Jumlah hari: ${f.hari} · Peserta: ${f.peserta}`,
      `Pemrakarsa: ${f.pemrakarsa}`,
      `Sumber anggaran: ${s.label} (kode ${s.sumberDanaKode}${s.register ? ', Register ' + s.register : ''})`,
      `Dasar hukum sumber: ${(s.dasar || []).join('; ')}`,
    ].join('\n');
  }

  const SYS_DOC =
    'Anda adalah penyusun dokumen perencanaan resmi di Sekretariat KPU Provinsi Jawa Barat. ' +
    'Tulis dokumen dalam Bahasa Indonesia baku, formal, lugas, dan PATUH regulasi pemerintah ' +
    '(SBM/PMK, Perpres PBJ, PKPU). Jangan mengarang dasar hukum atau angka di luar yang diberikan. ' +
    'Keluaran HARUS berupa potongan HTML untuk badan dokumen (TANPA kop surat, TANPA <html>/<body>), ' +
    'memakai hanya tag: <h2 class="doc-title">, <p class="doc-nomor">, <p>, <b>, <i>, ' +
    '<ol class="doc-ol">, <ul>, <li>, dan blok tanda tangan <div class="doc-ttd">…</div>. ' +
    'Mulai dengan <h2 class="doc-title">JUDUL</h2> lalu <p class="doc-nomor">…</p>, ' +
    'akhiri dengan blok tanda tangan. Jangan menambahkan penjelasan di luar HTML.';

  function blueprintFor(docId) {
    const map = {
      nota_dinas: 'nota_dinas', kak: 'kak_pengadaan', kak_pengadaan: 'kak_pengadaan',
      kak_swakelola: 'kak_swakelola', kontrak_swakelola: 'kontrak_swakelola',
    };
    const bp = TPL && TPL.BLUEPRINT[map[docId]];
    if (!bp) return '';
    return `Acuan struktur (${bp.sumber}) — JUDUL: ${bp.judul}\nUrutan bagian: ${bp.bagian.join(' → ')}` +
      (bp.contohDasar ? `\nContoh dasar hukum: ${bp.contohDasar.join('; ')}` : '');
  }

  // ── Generate satu dokumen (badan HTML) ─────────────────────────────────────
  async function generateDocument(docId, f, m) {
    const namaDoc = {
      nota_dinas: 'Nota Dinas', kak: 'KAK', kak_pengadaan: 'KAK Pengadaan (Penyedia)',
      kak_swakelola: 'KAK Swakelola', kontrak_swakelola: 'Kontrak Swakelola (Pokok Perjanjian)',
      tor: 'TOR', matriks_risiko: 'Matriks Risiko',
    }[docId] || docId;

    const user =
      `Susun dokumen: ${namaDoc}\n\n` +
      `=== DATA KEGIATAN ===\n${konteksForm(f)}\n\n` +
      `=== NOMOR DOKUMEN (pakai persis) ===\n${GEN.nomorDok(docId === 'kontrak_swakelola' ? 'kontrak' : docId === 'nota_dinas' ? 'nota_dinas' : 'kak', m)}\n\n` +
      `=== RAB / ANGGARAN ===\n${rabRingkas(m.rab)}\n\n` +
      `=== BAGAN AKUN STANDAR (BAS) yang relevan ===\n${basRingkas()}\n\n` +
      `=== ACUAN TEMPLATE KPU JABAR ===\n${blueprintFor(docId)}\n\n` +
      `Instansi: KPU Provinsi Jawa Barat. Tahun anggaran ${KB.RKA.tahun}. ` +
      `Tanggal dokumen: ${GEN.tglID(m.tglDok)}. Tulis lengkap, rinci, dan profesional.`;

    const text = await callClaude({ system: SYS_DOC, messages: [{ role: 'user', content: user }], max_tokens: 2600 });
    return GEN.kop(f) + stripFence(text);
  }

  // ── AI Copilot Perencanaan: brief bebas → field form ───────────────────────
  async function copilot(brief) {
    const sys =
      'Anda asisten perencanaan KPU. Dari kalimat kebutuhan pengguna, ekstrak parameter kegiatan. ' +
      'Balas HANYA JSON valid (tanpa markdown) dengan kunci: nama, tujuan, output, lokasi, hari (angka), ' +
      'peserta (angka), sasaran, jenis (salah satu: bimtek, sosialisasi, rakor, fgd, rdk, pengadaan), ' +
      'mekanisme (penyedia|swakelola|"" jika bukan pengadaan), sumber (APBN|HNP). ' +
      'Jika tak disebut, beri nilai wajar. Default sumber APBN, lokasi "Kota Bandung".';
    const text = await callClaude({ system: sys, messages: [{ role: 'user', content: brief }], max_tokens: 700 });
    return JSON.parse(stripFence(text));
  }

  // ── Ringkasan Approval (AI Approval Summary 1 halaman) ─────────────────────
  async function approvalSummary(f, rab, validasi) {
    const sys =
      'Anda menyusun "Ringkasan Persetujuan" 1 paragraf + poin untuk pimpinan KPU. ' +
      'Bahasa Indonesia formal, ringkas. Keluaran HTML sederhana (<p>, <ul>, <li>, <b>). ' +
      'Sertakan: tujuan, total biaya, sumber anggaran, risiko utama, manfaat, dan rekomendasi AI.';
    const user = `=== KEGIATAN ===\n${konteksForm(f)}\n\n=== RAB ===\n${rabRingkas(rab)}\n\n` +
      `=== TEMUAN VALIDASI ===\n${(validasi.temuan || []).map((t) => t.pesan).join('; ') || 'tidak ada'}`;
    const text = await callClaude({ system: sys, messages: [{ role: 'user', content: user }], max_tokens: 900 });
    return stripFence(text);
  }

  // Buang pagar kode ```html ... ``` bila model menyertakannya.
  function stripFence(t) {
    return String(t || '').replace(/^```[a-zA-Z]*\s*/m, '').replace(/```\s*$/m, '').trim();
  }

  return { getConfig, setConfig, isEnabled, callClaude, generateDocument, copilot, approvalSummary, DEFAULT_MODEL };
})();
