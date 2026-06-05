/* ===========================================================================
   ui.js — Utilitas tampilan: pembuat elemen, format (rupiah/tanggal), badge,
   toast, modal/konfirmasi, dan pembaca berkas → data URL.
   ========================================================================= */

import { statusInfo } from './domain.js';

/* Escape teks agar aman dimasukkan ke innerHTML. */
export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* Tag template ringan: html`...` mengembalikan string (auto-escape ${}). */
export function html(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (i < values.length ? escVal(values[i]) : ''), '');
}
function escVal(v) {
  if (v == null) return '';
  if (v && v.__raw) return v.html;       // tandai aman via raw()
  if (Array.isArray(v)) return v.map(escVal).join('');
  return esc(v);
}
export function raw(htmlStr) { return { __raw: true, html: htmlStr }; }

/* Buat elemen dari HTML string. */
export function elFromHTML(htmlStr) {
  const t = document.createElement('template');
  t.innerHTML = htmlStr.trim();
  return t.content.firstElementChild;
}

/* ----- Format ----- */
export const rupiah = (n) =>
  'Rp ' + (Math.round(+n || 0)).toLocaleString('id-ID');
export const rupiahShort = (n) => {
  n = +n || 0;
  if (Math.abs(n) >= 1e9) return 'Rp ' + (n / 1e9).toFixed(2).replace(/\.00$/, '') + ' M';
  if (Math.abs(n) >= 1e6) return 'Rp ' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' jt';
  return rupiah(n);
};

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const BULAN_FULL = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function tanggal(d, full = false) {
  if (!d) return '-';
  const x = new Date(d);
  if (isNaN(x)) return '-';
  return `${x.getDate()} ${(full ? BULAN_FULL : BULAN)[x.getMonth()]} ${x.getFullYear()}`;
}
export function tanggalJam(d) {
  if (!d) return '-';
  const x = new Date(d);
  return `${tanggal(d)} ${String(x.getHours()).padStart(2, '0')}.${String(x.getMinutes()).padStart(2, '0')}`;
}
export function rentangTanggal(a, b) {
  const x = new Date(a), y = new Date(b);
  if (x.getMonth() === y.getMonth() && x.getFullYear() === y.getFullYear())
    return `${x.getDate()}–${y.getDate()} ${BULAN[y.getMonth()]} ${y.getFullYear()}`;
  return `${tanggal(a)} – ${tanggal(b)}`;
}
export function relatif(d) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'baru saja';
  if (m < 60) return `${m} mnt lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const hr = Math.round(h / 24);
  if (hr < 30) return `${hr} hari lalu`;
  return tanggal(d);
}

export function initials(nama) {
  const parts = String(nama || '').replace(/[^A-Za-z. ]/g, '').split(' ').filter((p) => p && !p.endsWith('.'));
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'U';
}

export function statusBadge(status) {
  const s = statusInfo(status);
  return `<span class="badge ${s.badge}"><span class="dot"></span>${esc(s.label)}</span>`;
}

/* ----- Toast ----- */
export function toast(msg, type = '') {
  const host = document.getElementById('toast-host');
  const t = elFromHTML(`<div class="toast ${type}">${esc(msg)}</div>`);
  host.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

/* ----- Modal ----- */
export function modal({ title, body, footer, onMount, size }) {
  const host = document.getElementById('modal-host');
  host.innerHTML = `
    <div class="modal" style="${size === 'lg' ? 'max-width:760px' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${esc(title)}</h3><button class="x" aria-label="Tutup">&times;</button></div>
      <div class="modal-body">${body}</div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  host.hidden = false;
  const close = () => { host.hidden = true; host.innerHTML = ''; };
  host.querySelector('.x').onclick = close;
  host.onclick = (e) => { if (e.target === host) close(); };
  if (onMount) onMount(host.querySelector('.modal'), close);
  return close;
}

export function confirmDialog({ title, message, confirmText = 'Ya, lanjutkan', danger = false }) {
  return new Promise((resolve) => {
    const close = modal({
      title,
      body: `<p style="margin:0">${esc(message)}</p>`,
      footer: `<button class="btn" data-no>Batal</button>
               <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(confirmText)}</button>`,
      onMount: (root, c) => {
        root.querySelector('[data-no]').onclick = () => { c(); resolve(false); };
        root.querySelector('[data-yes]').onclick = () => { c(); resolve(true); };
      },
    });
  });
}

/* Modal dengan kolom catatan (untuk approve/revisi/tolak). */
export function notePrompt({ title, label = 'Catatan', placeholder = '', required = false, confirmText = 'Kirim', danger = false }) {
  return new Promise((resolve) => {
    modal({
      title,
      body: `<div class="field"><label class="lbl">${esc(label)}${required ? ' <span class="req">*</span>' : ''}</label>
             <textarea class="textarea" id="np-note" placeholder="${esc(placeholder)}"></textarea>
             <span class="field-error" id="np-err" hidden>Wajib diisi.</span></div>`,
      footer: `<button class="btn" data-no>Batal</button>
               <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-yes>${esc(confirmText)}</button>`,
      onMount: (root, c) => {
        root.querySelector('[data-no]').onclick = () => { c(); resolve(null); };
        root.querySelector('[data-yes]').onclick = () => {
          const v = root.querySelector('#np-note').value.trim();
          if (required && !v) { root.querySelector('#np-err').hidden = false; return; }
          c(); resolve(v);
        };
      },
    });
  });
}

/* Baca File → data URL (untuk simpan lampiran/foto di localStorage). */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export const fmtBytes = (b) => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';

export function debounce(fn, ms = 250) {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}
