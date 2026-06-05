/* ===========================================================================
   views/shared.js — Komponen tampilan yang dipakai banyak halaman.
   ========================================================================= */

import { store } from '../store.js';
import { statusBadge, rentangTanggal, rupiah, rupiahShort, esc, relatif } from '../ui.js';
import { roleLabel } from '../auth.js';

export function pegawai(id) { return store.find('pegawai', id); }
export function pegawaiName(id) { return pegawai(id)?.nama || '—'; }

export function emptyState(icon, title, desc, actionHTML = '') {
  return `<div class="empty"><div class="big">${icon}</div><h3>${esc(title)}</h3>
    <p class="muted">${esc(desc)}</p>${actionHTML}</div>`;
}

/* Kartu ringkas satu SPPD (klik → detail). */
export function sppdCard(s, { showPemohon = true } = {}) {
  const p = pegawai(s.pemohonId);
  return `<div class="list-item" data-go="/sppd/${s.id}">
    <div class="li-top">
      <div>
        <div class="li-title">${esc(s.perihal)}</div>
        <div class="li-meta">${esc(s.lokasiKota)}, ${esc(s.lokasiProvinsi)} · ${rentangTanggal(s.tanggalBerangkat, s.tanggalKembali)} · ${s.lamaHari} hari</div>
      </div>
      ${statusBadge(s.status)}
    </div>
    <div class="li-foot">
      ${showPemohon ? `<span class="muted">👤 ${esc((p?.nama || '').split(',')[0])}</span>` : ''}
      <span class="tag-akun">${esc(s.akun)}</span>
      <span class="bold" style="margin-left:auto">${rupiah(s.totalBiaya)}</span>
    </div>
  </div>`;
}

/* Daftar kartu + delegasi klik ke detail. */
export function renderSppdList(container, list, opts) {
  if (!list.length) {
    container.innerHTML = emptyState('🗂️', 'Belum ada data', opts?.emptyDesc || 'Tidak ada perjalanan dinas pada kategori ini.');
    return;
  }
  container.innerHTML = `<div class="list">${list.map((s) => sppdCard(s, opts)).join('')}</div>`;
  wireGo(container);
}

/* Aktifkan navigasi untuk elemen ber-atribut data-go. */
export function wireGo(root) {
  root.querySelectorAll('[data-go]').forEach((elm) => {
    elm.style.cursor = 'pointer';
    elm.addEventListener('click', () => { location.hash = elm.getAttribute('data-go'); });
  });
}

export { rupiah, rupiahShort, esc, rentangTanggal, relatif, roleLabel, statusBadge };
