/* ============================================================================
 * SiPINTER KPU · sync.js — Data Portability & Headless Sync
 * Mewujudkan modul "Mobile Offline → Sinkronisasi saat online" dan jalur
 * produksi "PWA sebagai front-end headless atas Frappe LMS".
 *
 * Tiga fungsi:
 *   1) EXPORT/IMPORT — unduh/muat seluruh progres (JSON) untuk pindah perangkat
 *      atau cadangan. Sepenuhnya offline, tanpa backend.
 *   2) FRAPPE CONNECTOR — konfigurasi & uji koneksi ke Frappe LMS via REST
 *      (token auth). Best-effort: bila backend belum ada, gagal dengan pesan
 *      jelas dan aplikasi tetap berjalan offline-first.
 *   3) PEMETAAN — helper memetakan model 10 tier / 7 tahap ke doctype Frappe LMS.
 * ==========================================================================*/
window.LMSSync = (function () {
  'use strict';

  const STORE = 'lms_kpu_v1';
  const AI_CFG = 'lms_kpu_ai_cfg_v1';
  const FRAPPE_CFG = 'lms_kpu_frappe_cfg_v1';
  const VERSION = 2;

  /* ── EXPORT / IMPORT ────────────────────────────────────────────────────*/
  function snapshot() {
    let app = null, ai = null, frappe = null;
    try { app = JSON.parse(localStorage.getItem(STORE)); } catch {}
    try { ai = JSON.parse(localStorage.getItem(AI_CFG)); } catch {}
    try { frappe = JSON.parse(localStorage.getItem(FRAPPE_CFG)); } catch {}
    // Jangan ikutkan rahasia (apiKey/secret) dalam ekspor.
    if (ai) ai = { provider: ai.provider, edgeUrl: ai.edgeUrl, model: ai.model };
    if (frappe) frappe = { baseUrl: frappe.baseUrl };
    return { app: 'SiPINTER KPU', version: VERSION, exportedAt: new Date().toISOString(), data: app, aiConfig: ai, frappeConfig: frappe };
  }
  function exportText() { return JSON.stringify(snapshot(), null, 2); }

  function download(filename, text) {
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename || 'sipinter-kpu-backup.json';
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }
  function exportDownload() {
    const stamp = new Date().toISOString().slice(0, 10);
    download(`sipinter-kpu-${stamp}.json`, exportText());
  }

  // Validasi minimal lalu tulis ke localStorage. Mengembalikan {ok, msg}.
  function importText(text) {
    let parsed;
    try { parsed = JSON.parse(text); } catch { return { ok: false, msg: 'Berkas bukan JSON valid.' }; }
    const d = parsed && parsed.data ? parsed.data : parsed; // toleransi: data mentah
    if (!d || typeof d !== 'object') return { ok: false, msg: 'Struktur berkas tidak dikenali.' };
    if (!('tier' in d) && !('done' in d)) return { ok: false, msg: 'Bukan berkas progres SiPINTER KPU.' };
    try {
      localStorage.setItem(STORE, JSON.stringify(d));
      if (parsed.aiConfig && parsed.aiConfig.provider) {
        const cur = safe(AI_CFG); localStorage.setItem(AI_CFG, JSON.stringify({ ...cur, ...parsed.aiConfig }));
      }
      if (parsed.frappeConfig && parsed.frappeConfig.baseUrl) {
        const cur = safe(FRAPPE_CFG); localStorage.setItem(FRAPPE_CFG, JSON.stringify({ ...cur, ...parsed.frappeConfig }));
      }
      return { ok: true, msg: 'Progres berhasil dimuat.' };
    } catch (e) { return { ok: false, msg: 'Gagal menyimpan: ' + (e.message || e) }; }
  }
  function safe(k) { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch { return {}; } }

  /* ── FRAPPE LMS CONNECTOR (headless, best-effort) ──────────────────────*/
  function getFrappe() {
    const c = safe(FRAPPE_CFG);
    return { baseUrl: '', apiKey: '', apiSecret: '', ...c };
  }
  function setFrappe(c) { localStorage.setItem(FRAPPE_CFG, JSON.stringify(c)); }
  function authHeader(c) {
    return c.apiKey && c.apiSecret ? { Authorization: 'token ' + c.apiKey + ':' + c.apiSecret } : {};
  }

  // Uji koneksi: panggil endpoint ringan Frappe. Mengembalikan {ok, msg}.
  async function testConnection() {
    const c = getFrappe();
    if (!c.baseUrl) return { ok: false, msg: 'Base URL Frappe belum diisi.' };
    const base = c.baseUrl.replace(/\/+$/, '');
    try {
      const res = await fetch(base + '/api/method/frappe.auth.get_logged_user', {
        headers: { Accept: 'application/json', ...authHeader(c) },
      });
      if (res.status === 401 || res.status === 403)
        return { ok: false, msg: 'Terhubung, tetapi otentikasi ditolak (cek API key/secret).' };
      if (!res.ok) return { ok: false, msg: 'Server menjawab ' + res.status + '.' };
      const body = await res.json().catch(() => ({}));
      return { ok: true, msg: 'Terhubung sebagai: ' + (body.message || 'pengguna Frappe') };
    } catch (e) {
      return { ok: false, msg: 'Tidak dapat menjangkau server (offline/CORS/URL salah).' };
    }
  }

  // Tarik katalog kursus Frappe LMS (demonstrasi headless). Best-effort.
  async function pullCourses() {
    const c = getFrappe();
    if (!c.baseUrl) return { ok: false, msg: 'Base URL Frappe belum diisi.' };
    const base = c.baseUrl.replace(/\/+$/, '');
    const url = base + '/api/resource/LMS%20Course?fields=["name","title"]&limit_page_length=20';
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json', ...authHeader(c) } });
      if (!res.ok) return { ok: false, msg: 'Gagal menarik kursus (server ' + res.status + ').' };
      const body = await res.json().catch(() => ({}));
      const list = (body.data || []).map((x) => x.title || x.name);
      return { ok: true, msg: list.length + ' kursus ditemukan.', courses: list };
    } catch (e) {
      return { ok: false, msg: 'Tidak dapat menjangkau server (offline/CORS/URL salah).' };
    }
  }

  /* ── PEMETAAN model lokal → doctype Frappe LMS ─────────────────────────*/
  const FRAPPE_MAP = [
    { lokal: 'Tier (10 jenjang)', frappe: 'LMS Batch / Audience', ket: 'Kohort per periode/jenjang.' },
    { lokal: 'Alur 7 tahap', frappe: 'LMS Course (Learning Path)', ket: 'Tiap tahap = course/chapter.' },
    { lokal: 'Modul', frappe: 'Course Chapter', ket: 'Pengelompokan materi.' },
    { lokal: 'Materi (lesson)', frappe: 'Course Lesson', ket: 'baca/video/refleksi/studi-kasus.' },
    { lokal: 'Kuis', frappe: 'LMS Quiz', ket: 'Ambang lulus 70%.' },
    { lokal: 'Progres & CPD', frappe: 'LMS Enrollment / Course Progress', ket: 'Sinkron dua arah.' },
    { lokal: 'Sertifikat', frappe: 'LMS Certificate', ket: '+ QR validation (roadmap).' },
    { lokal: 'Knowledge Hub', frappe: 'Wiki / Knowledge Base', ket: 'Bank kasus & lesson learned.' },
  ];

  return { exportText, exportDownload, importText, getFrappe, setFrappe, testConnection, pullCourses, FRAPPE_MAP, STORE };
})();
