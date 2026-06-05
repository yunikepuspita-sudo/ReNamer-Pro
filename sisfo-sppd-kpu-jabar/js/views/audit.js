/* ===========================================================================
   views/audit.js — Jejak audit (audit trail) seluruh aktivitas sistem.
   ========================================================================= */

import { store } from '../store.js';
import { roleLabel } from '../auth.js';
import { esc, tanggalJam, debounce } from '../ui.js';
import { pegawaiName } from './shared.js';

export function renderAudit(root) {
  let q = '';
  const log = store.list('audit');

  root.innerHTML = `
  <div class="page-head"><div><h1>Audit Trail</h1>
    <p class="desc">Catatan tak-terhapus seluruh tindakan: pengajuan, persetujuan, SPJ, hingga pembayaran.</p></div></div>
  <div class="toolbar"><input class="input search" id="q" placeholder="🔍 Cari aksi, pelaku, atau perihal…">
    <span class="badge badge-blue">${log.length} entri</span></div>
  <div id="list"></div>`;

  const listEl = root.querySelector('#list');
  function apply() {
    let data = log;
    if (q) {
      const k = q.toLowerCase();
      data = data.filter((a) => (a.action + ' ' + pegawaiName(a.actorId) + ' ' + a.detail + ' ' + roleLabel(a.role)).toLowerCase().includes(k));
    }
    if (!data.length) { listEl.innerHTML = `<div class="empty"><div class="big">🛡️</div><h3>Tidak ada entri</h3></div>`; return; }
    listEl.innerHTML = `<div class="table-wrap"><table class="tbl">
      <thead><tr><th>Waktu</th><th>Pelaku</th><th>Peran</th><th>Aksi</th><th>Keterangan</th></tr></thead>
      <tbody>${data.map((a) => `<tr class="clickable" data-go="/sppd/${a.entityId}">
        <td class="nowrap">${tanggalJam(a.ts)}</td>
        <td>${esc((pegawaiName(a.actorId) || a.actorId).split(',')[0])}</td>
        <td class="nowrap">${esc(roleLabel(a.role))}</td>
        <td>${esc(a.action)}</td>
        <td class="muted">${esc(a.detail)}</td></tr>`).join('')}</tbody>
    </table></div>`;
    listEl.querySelectorAll('[data-go]').forEach((el) => el.onclick = () => { if (el.getAttribute('data-go') !== '/sppd/-') location.hash = el.getAttribute('data-go'); });
  }
  root.querySelector('#q').addEventListener('input', debounce((e) => { q = e.target.value; apply(); }, 200));
  apply();
}
