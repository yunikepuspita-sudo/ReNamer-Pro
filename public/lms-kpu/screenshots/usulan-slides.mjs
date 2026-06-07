/* ============================================================================
 * Slide sisipan untuk "Usulan Optimalisasi HNP Rp 4,28 M" (KPU Jabar TA 2026).
 * Menghasilkan 2 slide 1920x1080 bergaya deck:
 *   A) usulan-sipinter-slide  — halaman aplikasi SiPINTER KPU (gaya app-detail).
 *   B) usulan-akronim-slide   — cheat sheet akronim 7 aplikasi (gaya dark).
 * Jalankan: node usulan-slides.mjs <outDir>   lalu rsvg-convert ke PNG.
 * ==========================================================================*/
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const out = process.argv[2] || '.';
mkdirSync(out, { recursive: true });
const here = resolve('.');
const preview = 'file://' + resolve(here, '05-arsitektur.png'); // pratinjau platform

const D = { navy: '#13294d', navy2: '#1c3a60', gold: '#f4a922', light: '#f3f6fb', card: '#ffffff',
  line: '#e2e8f0', ink: '#1b3a5b', muted: '#5b6b80', brand: '#1d4ed8', green: '#46a04e' };
const F = 'DejaVu Sans';
const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const T = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-family="${F}" font-size="${o.s || 24}" font-weight="${o.w || 400}" fill="${o.c || D.ink}" text-anchor="${o.a || 'start'}" ${o.ls ? `letter-spacing="${o.ls}"` : ''}>${esc(s)}</text>`;
const rect = (x, y, w, h, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${o.r ?? 16}" fill="${o.fill || D.card}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 1}"` : ''} ${o.op ? `opacity="${o.op}"` : ''}/>`;
const wrap = (x, y, s, max, lh, o = {}) => { const w = s.split(' '), L = []; let c = ''; w.forEach((ww) => { if ((c + ' ' + ww).trim().length > max) { L.push(c.trim()); c = ww; } else c += ' ' + ww; }); if (c.trim()) L.push(c.trim()); return L.map((ln, i) => T(x, y + i * lh, ln, o)).join(''); };

/* ── A) Slide aplikasi SiPINTER (gaya app-detail, light) ───────────────── */
function sipinter() {
  const W = 1920, H = 1080; let b = `<rect width="${W}" height="${H}" fill="${D.light}"/>`;
  b += rect(0, 0, W, 8, { r: 0, fill: D.brand });
  b += T(64, 70, 'SOLUSI — KEGIATAN 13 · KNOWLEDGE MANAGEMENT', { s: 20, w: 700, c: D.brand, ls: 1 });
  b += T(64, 132, 'SiPINTER KPU — Election Learning & Succession Academy', { s: 46, w: 700, c: D.ink });
  b += `<rect x="64" y="150" width="240" height="6" rx="3" fill="${D.gold}"/>`;
  b += T(64, 188, 'Sistem Pembelajaran Integratif, Terstruktur & Berjenjang (alias ELSA)', { s: 24, c: D.muted });

  // Preview card (kiri) — embed screenshot arsitektur
  const px = 64, py = 226, pw = 1060, ph = 700;
  b += rect(px, py, pw, ph, { stroke: D.line });
  b += `<clipPath id="cl"><rect x="${px + 24}" y="${py + 24}" width="${pw - 48}" height="${ph - 96}" rx="10"/></clipPath>`;
  b += `<image x="${px + 24}" y="${py + 24}" width="${pw - 48}" height="${ph - 96}" href="${preview}" preserveAspectRatio="xMidYMid slice" clip-path="url(#cl)"/>`;
  b += T(px + 24, py + ph - 30, 'Pratinjau platform (tab Arsitektur) — data ilustratif', { s: 18, c: D.muted });

  // Bullets (kanan)
  const bx = 1180, bw = W - bx - 64; let by = 250;
  const bullets = [
    ['Pembelajaran berjenjang — 10 tier', 'Komisioner RI→Kab/Kota, Sekretariat, PPK/PPS/KPPS, Relawan Demokrasi & masyarakat; alur 7 tahap Tiered Facilitation Model.'],
    ['Memori institusi & bank kasus (Keg 13)', 'Putusan DKPP/MK, PKPU/JDIH, praktik baik & lesson learned — pengetahuan strategis tak hilang antar-periode komisioner.'],
    ['AI Assistant + sertifikasi & talenta', 'Tanya regulasi (RAG/Claude), kuis, CPD point, digital badge, sertifikat — talent pool & succession planning.'],
    ['Offline-first & terintegrasi', 'PWA ringan; siap sinkron Frappe LMS, SIAKBA, JDIH, SIMPEG — melengkapi PUSAKA pada penguatan memori institusi.'],
  ];
  bullets.forEach((bl) => { b += `<circle cx="${bx + 10}" cy="${by - 8}" r="9" fill="${D.brand}"/>`;
    b += T(bx + 34, by, bl[0], { s: 27, w: 700, c: D.ink });
    b += wrap(bx + 34, by + 36, bl[1], 46, 32, { s: 21, c: D.muted }); by += 170; });

  // Demo box
  const dy = 854; b += rect(bx, dy, bw, 150, { fill: D.navy });
  b += T(bx + 30, dy + 52, '▶  DEMO LANGSUNG', { s: 24, w: 700, c: D.gold });
  b += T(bx + 30, dy + 100, 'yunikepuspita-sudo.github.io/ReNamer-Pro/lms-kpu/', { s: 21, c: '#cfe0f5' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${b}</svg>`;
}

/* ── B) Cheat sheet akronim (dark) ─────────────────────────────────────── */
function akronim() {
  const W = 1920, H = 1080; let b = `<rect width="${W}" height="${H}" fill="${D.navy}"/>`;
  b += rect(0, 0, W, 8, { r: 0, fill: D.gold });
  b += T(64, 86, 'CHEAT SHEET PRESENTASI', { s: 20, w: 700, c: D.gold, ls: 2 });
  b += T(64, 150, 'Akronim Ekosistem Digital KPU Jabar', { s: 46, w: 700, c: '#ffffff' });
  b += `<rect x="64" y="168" width="240" height="6" rx="3" fill="${D.gold}"/>`;
  b += T(64, 206, '7 aplikasi — ingat: nama merek → kepanjangan → fungsi singkat', { s: 22, c: '#9fb3cc' });

  const apps = [
    ['SAE PISAN', '#e89a2b', 'Smart Attendance Event', 'e-Presensi kegiatan (QR), anti titip-absen, rekap otomatis.'],
    ['SIPANDU', '#159b86', 'Sistem Informasi Perjalanan Dinas Terpadu', 'e-SPPD: pengajuan→SPJ digital, SBM otomatis, audit trail.'],
    ['SIPLENO', '#2f6fb0', 'Sistem Informasi Pleno KPU', 'e-Pleno: presensi QR, notulensi AI, voting, BA + TTE.'],
    ['RANCAGÉ', '#6c63d8', 'AI Planning Document Factory', 'Satu form → ND/KAK/TOR/RAB; validasi SBM & approval elektronik.'],
    ['PUSAKA', '#46a04e', 'Pustaka Aspirasi Kebangsaan', 'Knowledge management: perpustakaan digital literasi demokrasi.'],
    ['SEHAT', '#d6473f', 'Health, Analytics & Telemedicine', 'Kesejahteraan pegawai: skrining, deteksi burnout, analitik anonim.'],
    ['SiPINTER KPU', '#1d4ed8', 'Sistem Pembelajaran Integratif, Terstruktur & Berjenjang', 'LMS berjenjang + sertifikasi & succession (alias ELSA). Keg 13.'],
  ];
  let y = 250; const rh = 104, rw = W - 128;
  apps.forEach((a) => { b += rect(64, y, rw, rh - 16, { fill: D.navy2 });
    b += `<rect x="64" y="${y}" width="8" height="${rh - 16}" rx="4" fill="${a[1]}"/>`;
    b += rect(92, y + 18, 290, rh - 52, { fill: a[1], r: 10 });
    b += T(92 + 145, y + 18 + (rh - 52) / 2 + 9, a[0], { s: a[0].length > 9 ? 23 : 27, w: 700, c: '#fff', a: 'middle' });
    b += T(410, y + 40, a[2], { s: 25, w: 700, c: '#ffffff' });
    b += T(410, y + 74, a[3], { s: 20, c: '#a9bdd6' }); y += rh; });

  // strip istilah pendukung
  const sy = 1004; b += T(64, sy, 'Istilah pendukung:', { s: 18, w: 700, c: D.gold });
  b += T(255, sy, 'HNP = Hibah · KPA = Kuasa Pengguna Anggaran · SBM = Standar Biaya Masukan · TTE = Tanda Tangan Elektronik · RAG = Retrieval-Augmented Generation · CPD = Continuing Professional Development', { s: 17, c: '#9fb3cc' });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${b}</svg>`;
}

const screens = { 'usulan-sipinter-slide': sipinter(), 'usulan-akronim-slide': akronim() };
for (const [name, content] of Object.entries(screens)) { writeFileSync(`${out}/${name}.svg`, content); console.log('wrote', name); }
