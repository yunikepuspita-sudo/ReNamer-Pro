/* ============================================================================
 * SiPINTER KPU — generator mockup screenshot PWA (SVG → PNG via rsvg-convert).
 * Jalankan:  node generate.mjs <outDir>
 * Lalu:      rsvg-convert -w W -h H <out>.svg -o screenshots/<name>.png
 * (lihat build.sh). Tanpa emoji (font emoji tak tersedia) — memakai ikon vektor.
 * ==========================================================================*/
import { writeFileSync, mkdirSync } from 'node:fs';

const out = process.argv[2] || '.';
mkdirSync(out, { recursive: true });

const C = { bg: '#f1f5f9', panel: '#ffffff', ink: '#0f172a', muted: '#64748b', line: '#e2e8f0',
  brand: '#1d4ed8', brand2: '#047857', amber: '#fbbf24', soft: '#eff6ff', green: '#16a34a', chipbg: '#ffffff' };
const F = 'DejaVu Sans';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.s || 22}" ` +
  `font-weight="${o.w || 400}" fill="${o.c || C.ink}" text-anchor="${o.a || 'start'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 14}" ` +
  `fill="${o.fill || C.panel}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''} ${o.op ? `opacity="${o.op}"` : ''}/>`;
const panel = (x, y, w, h, accent) => rect(x, y, w, h, { fill: C.panel, stroke: C.line }) +
  (accent ? `<rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="${accent}"/>` : '');

// Topbar (gradient) + judul
function topbar(W, sub) {
  return `<defs><linearGradient id="tb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.brand}"/><stop offset="1" stop-color="#3b82f6"/></linearGradient>
    <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1d4ed8"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>
    <rect x="0" y="0" width="${W}" height="118" fill="url(#tb)"/>
    <g transform="translate(34 30)"><rect width="60" height="60" rx="14" fill="#ffffff" opacity="0.18"/>
      <g transform="translate(8 10) scale(0.16)"><path d="M256 150 L392 206 L256 262 L120 206 Z" fill="#fff"/>
      <path d="M256 262 L350 224 L350 300 C350 332 308 350 256 350 C204 350 162 332 162 300 L162 224 Z" fill="#fff" opacity="0.6"/>
      <circle cx="392" cy="300" r="12" fill="${C.amber}"/></g></g>
    ${T(112, 56, 'SiPINTER KPU', { s: 32, w: 700, c: '#fff' })}
    ${T(112, 88, sub, { s: 19, c: '#dbeafe' })}`;
}
// Baris tab
function tabs(x, y, items, active) {
  let cx = x, out = '';
  items.forEach((it) => { const w = it.length * 11 + 34; const on = it === active;
    out += `<rect x="${cx}" y="${y}" width="${w}" height="46" rx="23" fill="${on ? C.brand : '#fff'}" stroke="${on ? C.brand : C.line}"/>` +
      T(cx + w / 2, y + 30, it, { s: 18, w: on ? 700 : 600, c: on ? '#fff' : C.muted, a: 'middle' }); cx += w + 10; });
  return out;
}
function chip(x, y, label, on) { const w = label.length * 10.5 + 30; return `<rect x="${x}" y="${y}" width="${w}" height="40" rx="20" fill="${on ? C.brand : '#fff'}" stroke="${on ? C.brand : C.line}"/>` + T(x + w / 2, y + 26, label, { s: 17, w: 600, c: on ? '#fff' : '#334155', a: 'middle' }) + `<!--w:${w}-->`; }
function stat(x, y, w, n, l) { return panel(x, y, w, 120) + T(x + w / 2, y + 64, n, { s: 40, w: 800, c: C.brand, a: 'middle' }) + T(x + w / 2, y + 96, l, { s: 17, c: C.muted, a: 'middle' }); }
function bar(x, y, w, label, pct, col) {
  const tw = w - 470; return T(x, y + 18, label, { s: 18, c: '#334155' }) +
    `<rect x="${x + 360}" y="${y + 4}" width="${tw}" height="16" rx="8" fill="#eef2f7"/>` +
    `<rect x="${x + 360}" y="${y + 4}" width="${Math.round(tw * pct / 100)}" height="16" rx="8" fill="${col}"/>` +
    T(x + w, y + 18, pct + '%', { s: 18, w: 700, a: 'end' });
}
function svg(W, H, body) { return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${C.bg}"/>${body}</svg>`; }

/* ── 01 Beranda (narrow) ───────────────────────────────────────────────── */
function beranda() {
  const W = 1080, H = 1920, P = 36; let b = topbar(W, 'Election Knowledge & Competency Platform');
  b += tabs(P, 150, ['Beranda', 'Alur', 'Kompetensi', 'Knowledge', 'AI'], 'Beranda');
  let y = 230;
  b += panel(P, y, W - 2 * P, 110, C.brand) + T(P + 28, y + 46, 'Komisioner KPU RI', { s: 28, w: 700 }) +
    T(P + 28, y + 80, 'Tier 1 · Komisioner — Kepemimpinan strategis & visioner', { s: 18, c: C.muted });
  y += 142; const sw = (W - 2 * P - 3 * 18) / 4;
  [['62%', 'Alur selesai'], ['18/29', 'Materi'], ['4/6', 'Kuis'], ['84', 'CPD Point']].forEach((s, i) => { b += stat(P + i * (sw + 18), y, sw, s[0], s[1]); });
  y += 152; const ph = 560; b += panel(P, y, W - 2 * P, ph) + T(P + 28, y + 50, 'Progres Alur 7 Tahap', { s: 26, w: 700 });
  const stages = [['T1 Orientasi & Evaluasi Mandiri', 100], ['T2 Penguatan Kompetensi Strategis', 80], ['T3 Peer Learning & Mentoring', 60], ['T4 Etika, Integritas & Independensi', 50], ['T5 Pembelajaran Adaptif', 40], ['T6 Manajemen Pengetahuan', 20], ['T7 Refleksi Akhir & Peer Review', 0]];
  stages.forEach((s, i) => { b += bar(P + 28, y + 90 + i * 58, W - 2 * P - 56, s[0], s[1], C.brand); });
  b += `<rect x="${P + 28}" y="${y + ph - 78}" width="${W - 2 * P - 56}" height="58" rx="12" fill="${C.brand}"/>` + T(W / 2, y + ph - 40, 'Buka Alur Pembelajaran', { s: 22, w: 700, c: '#fff', a: 'middle' });
  y += ph + 22; b += rect(P, y, W - 2 * P, 200, { fill: '#eef6ff', stroke: '#c7d2fe' }) +
    T(P + 28, y + 48, 'Lanjutkan dari sini', { s: 24, w: 700, c: C.brand }) +
    T(P + 28, y + 84, 'Tahap 2 · Desain Kebijakan Pemilu Nasional', { s: 18, c: C.muted }) +
    T(P + 28, y + 120, 'Studi kasus: merancang kebijakan tahapan pemilu nasional', { s: 19, w: 600 }) +
    `<rect x="${P + 28}" y="${y + 138}" width="220" height="50" rx="12" fill="${C.brand}"/>` + T(P + 138, y + 171, 'Mulai materi', { s: 19, w: 700, c: '#fff', a: 'middle' });
  return svg(W, H, b);
}

/* ── 02 Alur 7 Tahap (narrow) ──────────────────────────────────────────── */
function alur() {
  const W = 1080, H = 1920, P = 36; let b = topbar(W, 'Tiered Facilitation Model · Alur 7 Tahap');
  b += tabs(P, 150, ['Beranda', 'Alur', 'Kompetensi', 'Knowledge', 'AI'], 'Alur');
  let y = 224; const steps = ['1', '2', '3', '4', '5', '6', '7']; let cx = P;
  steps.forEach((s, i) => { const st = i < 1 ? 'done' : i < 3 ? 'on' : ''; const col = st === 'done' ? C.brand2 : st === 'on' ? C.brand : '#e2e8f0';
    b += `<rect x="${cx}" y="${y}" width="128" height="52" rx="26" fill="#fff" stroke="${st === 'on' ? C.brand : C.line}"/>` +
      `<circle cx="${cx + 28}" cy="${y + 26}" r="15" fill="${col}"/>` + T(cx + 28, y + 32, s, { s: 18, w: 700, c: st ? '#fff' : C.muted, a: 'middle' }) +
      T(cx + 52, y + 32, 'Tahap', { s: 16, c: C.muted }); cx += 138; });
  y += 86;
  // Stage card
  const sh = 760; b += panel(P, y, W - 2 * P, sh, C.brand) +
    `<circle cx="${P + 50}" cy="${y + 50}" r="26" fill="${C.brand}"/>` + T(P + 50, y + 58, '2', { s: 26, w: 800, c: '#fff', a: 'middle' }) +
    T(P + 92, y + 44, 'Penguatan Kompetensi Strategis', { s: 25, w: 700 }) +
    T(P + 92, y + 74, 'Inti pembelajaran · dipersonalisasi per jenjang', { s: 17, c: C.muted });
  // module
  let my = y + 110; b += rect(P + 24, my, W - 2 * P - 48, 300, { fill: '#fbfdff', stroke: C.line }) +
    T(P + 48, my + 42, 'Modul: Desain Kebijakan Pemilu Nasional', { s: 21, w: 700 }) +
    T(P + 48, my + 74, 'Metode: studi kasus strategis · workshop reflektif', { s: 16, c: C.muted });
  const lessons = [['Merancang kebijakan tahapan pemilu nasional', 'studi-kasus · 25 mnt', true], ['Tata kelola data pemilih berskala besar', 'baca · 20 mnt', false], ['Penetapan hasil & antisipasi sengketa', 'video · 18 mnt', false]];
  lessons.forEach((l, i) => { const ly = my + 100 + i * 62; b += rect(P + 48, ly, W - 2 * P - 96, 52, { fill: '#fff', stroke: l[2] ? '#bbf7d0' : C.line, r: 10 }) +
    `<circle cx="${P + 78}" cy="${ly + 26}" r="9" fill="${l[2] ? C.brand2 : C.line}"/>` +
    T(P + 100, ly + 24, l[0], { s: 18, w: 600 }) + T(P + 100, ly + 44, l[1], { s: 15, c: C.muted }) +
    (l[2] ? T(W - P - 70, ly + 33, 'selesai', { s: 16, w: 700, c: C.brand2, a: 'end' }) : ''); });
  // quiz row
  let qy = my + 320; b += `<line x1="${P + 48}" y1="${qy}" x2="${W - P - 48}" y2="${qy}" stroke="${C.line}" stroke-dasharray="4 4"/>` +
    T(P + 48, qy + 36, 'Kuis Kebijakan Nasional · 1 soal', { s: 19, w: 600 }) +
    `<rect x="${W - P - 230}" y="${qy + 12}" width="100" height="42" rx="10" fill="#dcfce7"/>` + T(W - P - 180, qy + 39, 'Skor 100%', { s: 16, w: 700, c: '#15803d', a: 'middle' }) +
    `<rect x="${W - P - 120}" y="${qy + 12}" width="100" height="42" rx="10" fill="${C.brand}"/>` + T(W - P - 70, qy + 39, 'Ulangi', { s: 17, w: 700, c: '#fff', a: 'middle' });
  // second module hint
  let m2 = y + 110 + 340; b += rect(P + 24, m2, W - 2 * P - 48, 250, { fill: '#fbfdff', stroke: C.line }) +
    T(P + 48, m2 + 42, 'Modul: Manajemen Krisis & Komunikasi Nasional', { s: 21, w: 700 }) +
    T(P + 48, m2 + 74, 'Metode: workshop reflektif · simulasi krisis', { s: 16, c: C.muted });
  [['Simulasi manajemen krisis pemilu nasional', 'studi-kasus · 25 mnt'], ['Strategi komunikasi publik nasional saat krisis', 'baca · 15 mnt']].forEach((l, i) => { const ly = m2 + 100 + i * 62;
    b += rect(P + 48, ly, W - 2 * P - 96, 52, { fill: '#fff', stroke: C.line, r: 10 }) + `<circle cx="${P + 78}" cy="${ly + 26}" r="9" fill="${C.line}"/>` +
      T(P + 100, ly + 24, l[0], { s: 18, w: 600 }) + T(P + 100, ly + 44, l[1], { s: 15, c: C.muted }); });
  return svg(W, H, b);
}

/* ── 03 Knowledge Hub (narrow) ─────────────────────────────────────────── */
function knowledge() {
  const W = 1080, H = 1920, P = 36; let b = topbar(W, 'Knowledge Management System');
  b += tabs(P, 150, ['Knowledge', 'AI', 'Talent', 'Analytics'], 'Knowledge');
  let y = 224; b += panel(P, y, W - 2 * P, 250) + T(P + 28, y + 48, 'Knowledge Management System', { s: 26, w: 700 }) +
    T(P + 28, y + 84, 'Bank kasus sengketa, putusan DKPP/MK, PKPU/JDIH, best practice,', { s: 18, c: C.muted }) +
    T(P + 28, y + 110, 'lesson learned, digital library & FAQ — lintas periode.', { s: 18, c: C.muted });
  // search
  b += rect(P + 28, y + 138, W - 2 * P - 250, 56, { fill: '#fff', stroke: C.line, r: 12 }) +
    `<circle cx="${P + 60}" cy="${y + 166}" r="11" fill="none" stroke="${C.muted}" stroke-width="3"/><line x1="${P + 69}" y1="${y + 175}" x2="${P + 80}" y2="${y + 186}" stroke="${C.muted}" stroke-width="3"/>` +
    T(P + 88, y + 173, 'Cari (AI semantic): sengketa, coklit, kode etik…', { s: 18, c: C.muted }) +
    `<rect x="${W - P - 200}" y="${y + 138}" width="172" height="56" rx="12" fill="${C.brand}"/>` + T(W - P - 114, y + 173, '+ Kontribusi', { s: 18, w: 700, c: '#fff', a: 'middle' });
  // cats
  let cx = P, cy = y + 290; ['Semua', 'Sengketa', 'DKPP', 'MK', 'PKPU/JDIH'].forEach((cat, i) => { const w = cat.length * 11 + 34; b += chip(cx, cy, cat, i === 0).split('<!--')[0]; cx += w + 12; });
  // cards
  const cards = [
    ['Putusan MK', 'KPU RI', 'Lonjakan sengketa Pilkada 2024 (±309 perkara di MK)', 'Titik rawan rekapitulasi & penetapan; perkuat antisipasi sengketa sejak tahapan.'],
    ['Putusan DKPP', 'KPU Kab', 'Pelanggaran kode etik & independensi penyelenggara', 'Integritas dibangun lewat kesadaran moral & refleksi, bukan hanya pengawasan.'],
    ['Best Practice', 'KPPS', 'Bimtek serentak pungut-hitung-rekap (2024)', 'Standarisasi teknis berhasil; perlu dilembagakan agar tidak insidental.'],
    ['FAQ', 'PPS', 'Apa itu Coklit?', 'Pencocokan & penelitian data pemilih; akurasi mengurangi sengketa.'],
  ];
  cards.forEach((c, i) => { const col = i % 2, row = Math.floor(i / 2); const cw = (W - 2 * P - 24) / 2; const x = P + col * (cw + 24); const yy = y + 360 + row * 410;
    b += panel(x, yy, cw, 380) + `<rect x="${x + 22}" y="${yy + 22}" width="${c[0].length * 11 + 26}" height="36" rx="18" fill="#e2e8f0"/>` + T(x + 35, yy + 46, c[0], { s: 16, w: 700, c: '#475569' }) +
      T(x + 22, yy + 100, wrapFit(c[2], 26), { s: 22, w: 700 }) + wrapText(x + 22, yy + 150, c[3], 30, 26, C.muted, 18) +
      rect(x + 22, yy + 300, cw - 44, 60, { fill: '#f8fafc', stroke: C.line, r: 10 }) + T(x + 38, yy + 326, 'Pelajaran:', { s: 16, w: 700, c: C.brand }) + T(x + 38, yy + 348, wrapFit(c[3], 36), { s: 15, c: '#334155' }); });
  return svg(W, H, b);
}

/* ── 04 AI Assistant (narrow) ──────────────────────────────────────────── */
function ai() {
  const W = 1080, H = 1920, P = 36; let b = topbar(W, 'AI Learning Assistant · RAG + Claude');
  b += tabs(P, 150, ['Knowledge', 'AI', 'Talent', 'Analytics'], 'AI');
  let y = 224; b += panel(P, y, W - 2 * P, 320) + T(P + 28, y + 50, 'AI Learning Assistant', { s: 28, w: 700 }) +
    `<rect x="${W - P - 250}" y="${y + 24}" width="222" height="44" rx="22" fill="#dcfce7"/>` + T(W - P - 139, y + 53, 'Live (Claude)', { s: 18, w: 700, c: '#15803d', a: 'middle' }) +
    T(P + 28, y + 92, 'Tanya regulasi, tahapan, atau sengketa. Jawaban di-grounding pada', { s: 18, c: C.muted }) +
    T(P + 28, y + 118, 'Knowledge Base (RAG ringan). Tetap menjawab saat offline.', { s: 18, c: C.muted });
  const q = ['Apa itu Coklit?', 'Bedanya PPK, PPS, KPPS?', 'Mengapa sengketa 2024 melonjak?']; let qx = P + 28;
  q.forEach((qq) => { const w = qq.length * 10.5 + 30; b += chip(qx, y + 150, qq, false).split('<!--')[0]; qx += w + 12; });
  b += rect(P + 28, y + 218, W - 2 * P - 200, 56, { fill: '#fff', stroke: C.line, r: 12 }) + T(P + 52, y + 253, 'Ketik pertanyaan kepemiluan…', { s: 18, c: C.muted }) +
    `<rect x="${W - P - 150}" y="${y + 218}" width="122" height="56" rx="12" fill="${C.brand}"/>` + T(W - P - 89, y + 253, 'Tanya', { s: 19, w: 700, c: '#fff', a: 'middle' });
  // chat bubbles
  let cy = y + 360;
  const chats = [
    ['Apa itu Coklit?', 'Knowledge Base (offline)', 'Coklit (Pencocokan dan Penelitian) adalah pemutakhiran data pemilih dengan mendatangi pemilih untuk mencocokkan & meneliti data, menangani pemilih TMS dan pemilih baru. Akurasi data menekan potensi sengketa administratif.', 'Apa itu Coklit? · Bedanya tugas PPK, PPS, KPPS'],
    ['Mengapa sengketa Pilkada 2024 melonjak?', 'Claude (live)', 'MK meregistrasi sekitar 309 perkara sengketa Pilkada Serentak 2024 — menandai titik rawan prosedural pada rekapitulasi & penetapan, serta menuntut penguatan kapasitas analisis kebijakan & manajemen risiko penyelenggara.', 'Lonjakan sengketa Pilkada 2024'],
  ];
  chats.forEach((ch) => { const bh = 290; b += panel(P, cy, W - 2 * P, bh) +
    T(P + 28, cy + 46, 'Tanya: ' + ch[0], { s: 21, w: 700 }) +
    rect(P + 28, cy + 64, W - 2 * P - 56, bh - 86, { fill: '#f8fafc', stroke: C.line, r: 12 }) +
    T(P + 48, cy + 98, ch[1], { s: 15, w: 700, c: C.muted }) +
    wrapText(P + 48, cy + 130, ch[2], 70, 30, C.ink, 19) +
    T(P + 48, cy + bh - 26, 'Sumber: ' + ch[3], { s: 15, c: C.muted }); cy += bh + 24; });
  return svg(W, H, b);
}

/* ── 05 Arsitektur (wide) ──────────────────────────────────────────────── */
function arsitektur() {
  const W = 1920, H = 1080, P = 48; let b = topbar(W, 'Blueprint Platform · 8 Layer · Tiered Competency Engine');
  let y = 150; const colW = 1180;
  const layers = [['PWA Frontend', 'Android · iOS · Tablet · Desktop · Offline-first'], ['API Gateway', 'REST · GraphQL · SSO KPU · OAuth2'], ['Core LMS Engine — Frappe LMS', 'Courses · Learning Path · Quiz · Exam · Certificate'], ['Tiered Competency Engine', '10 tier penyelenggara → publik · alur 7 tahap'], ['Knowledge Management System', 'Bank Kasus · DKPP/MK · Best Practice · AI Semantic Search'], ['Certification & Talent System', 'Sertifikasi · Badge · CPD · Talent Pool · Succession'], ['AI Learning Assistant', 'Chatbot · Tutor · Quiz Gen · Recommendation · Summarizer'], ['Analytics Center', 'Dashboard · Heatmap Kompetensi · Predictive Talent']];
  const lh = 96;
  layers.forEach((l, i) => { const yy = y + i * (lh + 14); b += rect(P, yy, colW, lh, { fill: '#eff6ff', stroke: '#c7d2fe' }) +
    T(P + 28, yy + 42, l[0], { s: 26, w: 700, c: C.brand }) + T(P + 28, yy + 74, l[1], { s: 18, c: '#334155' });
    if (i < layers.length - 1) b += T(P + colW / 2, yy + lh + 12, '▼', { s: 18, c: '#94a3b8', a: 'middle' }); });
  // side: 10 tiers
  const sx = P + colW + 40, sw = W - sx - P; b += panel(sx, y, sw, H - y - 40) + T(sx + 28, y + 46, 'Tiered Competency Engine — 10 Tier', { s: 24, w: 700 });
  const tiers = [['T1', 'Komisioner KPU RI', C.brand], ['T2', 'Komisioner KPU Provinsi', C.brand], ['T3', 'Komisioner KPU Kab/Kota', C.brand], ['T4', 'Sekretariat Provinsi', '#0369a1'], ['T5', 'Sekretariat Kab/Kota', '#0369a1'], ['T6', 'PPK', C.brand2], ['T7', 'PPS', C.brand2], ['T8', 'KPPS', C.brand2], ['T9', 'Relawan Demokrasi', '#b45309'], ['T10', 'Masyarakat Umum', '#b45309']];
  tiers.forEach((t, i) => { const yy = y + 78 + i * 76; b += rect(sx + 28, yy, sw - 56, 62, { fill: '#fff', stroke: C.line, r: 10 }) +
    `<rect x="${sx + 28}" y="${yy}" width="6" height="62" rx="3" fill="${t[2]}"/>` +
    T(sx + 52, yy + 38, t[0], { s: 20, w: 800, c: C.muted }) + T(sx + 110, yy + 38, t[1], { s: 21, w: 600 }); });
  return svg(W, H, b);
}

/* ── 06 Sertifikasi & Talent (wide) ────────────────────────────────────── */
function talent() {
  const W = 1920, H = 1080, P = 48; let b = topbar(W, 'Certification & Talent System · CPD · Succession');
  let y = 150; const sw = (W - 2 * P - 3 * 20) / 4;
  [['84', 'CPD Point'], ['6', 'Badge'], ['72', 'Skor Talenta'], ['Siap', 'Kesiapan']].forEach((s, i) => { b += stat(P + i * (sw + 20), y, sw, s[0], s[1]); });
  y += 150;
  // badges panel
  b += panel(P, y, W - 2 * P, 200) + T(P + 28, y + 46, 'Digital Badges', { s: 26, w: 700 });
  const badges = ['Tahap 1', 'Tahap 2', 'Hukum', 'Kepemimpinan', 'Etika', 'Tersertifikasi'];
  badges.forEach((bd, i) => { const x = P + 28 + i * 200; b += rect(x, y + 70, 180, 100, { fill: '#fff', stroke: C.line, r: 14 }) +
    `<circle cx="${x + 90}" cy="${y + 108}" r="22" fill="#eff6ff" stroke="${C.brand}" stroke-width="2"/>` + T(x + 90, y + 116, '★', { s: 24, c: C.amber, a: 'middle' }) +
    T(x + 90, y + 156, bd, { s: 16, w: 700, a: 'middle', c: '#334155' }); });
  y += 224;
  // gauge + pipeline
  b += panel(P, y, W - 2 * P, H - y - 40) + T(P + 28, y + 46, 'Talent Pool & Succession Planning', { s: 26, w: 700 }) +
    T(P + 28, y + 80, 'Kesiapan menapaki leadership pipeline (kelompok Komisioner).', { s: 18, c: C.muted });
  b += `<rect x="${P + 28}" y="${y + 104}" width="${W - 2 * P - 56}" height="22" rx="11" fill="#eef2f7"/>` +
    `<rect x="${P + 28}" y="${y + 104}" width="${Math.round((W - 2 * P - 56) * 0.72)}" height="22" rx="11" fill="${C.brand}"/>` +
    T(P + 28, y + 156, '72/100 · Siap', { s: 20, w: 700 });
  const ladder = [['T3', 'KPU Kab'], ['T2', 'KPU Prov'], ['T1', 'KPU RI']]; let px = P + 28;
  ladder.forEach((n, i) => { const cur = i === 0; const nw = 260; b += rect(px, y + 200, nw, 130, { fill: cur ? '#f8fbff' : '#fff', stroke: cur ? C.brand : C.line, sw: cur ? 3 : 1 }) +
    T(px + nw / 2, y + 248, n[0], { s: 22, w: 800, c: C.muted, a: 'middle' }) + T(px + nw / 2, y + 286, n[1], { s: 24, w: 700, a: 'middle' }) +
    (cur ? T(px + nw / 2, y + 314, 'Anda di sini', { s: 17, w: 700, c: C.brand, a: 'middle' }) : '');
    if (i < ladder.length - 1) b += T(px + nw + 30, y + 270, '→', { s: 34, w: 800, c: C.muted, a: 'middle' }); px += nw + 60; });
  return svg(W, H, b);
}

// Util pembungkus teks
function wrapFit(s, max) { return s.length > max ? s.slice(0, max - 1) + '…' : s; }
function wrapText(x, y, s, max, lh, col, size) {
  const words = s.split(' '); const lines = []; let cur = '';
  words.forEach((w) => { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; });
  if (cur.trim()) lines.push(cur.trim());
  return lines.slice(0, 4).map((ln, i) => T(x, y + i * lh, ln, { s: size || 18, c: col || C.ink })).join('');
}

const screens = { '01-beranda': beranda(), '02-alur': alur(), '03-knowledge': knowledge(), '04-ai': ai(), '05-arsitektur': arsitektur(), '06-talent': talent() };
for (const [name, content] of Object.entries(screens)) { writeFileSync(`${out}/${name}.svg`, content); console.log('wrote', name); }
