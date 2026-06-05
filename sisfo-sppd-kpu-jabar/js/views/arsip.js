/* ===========================================================================
   views/arsip.js — Arsip digital perjalanan dinas yang telah selesai/ditolak
   (kebutuhan audit BPK & Inspektorat).
   ========================================================================= */

import { store } from '../store.js';
import { esc, rupiah, tanggal, debounce, statusBadge } from '../ui.js';
import { renderSppdList, emptyState, pegawaiName } from './shared.js';

export function renderArsip(root) {
  let q = '';
  const all = () => store.list('sppd')
    .filter((s) => ['SELESAI', 'DITOLAK'].includes(s.status))
    .sort((a, b) => b.updatedTs - a.updatedTs);

  root.innerHTML = `
  <div class="page-head"><div><h1>Arsip Digital</h1>
    <p class="desc">Dokumen perjalanan dinas terarsip permanen — siap untuk audit BPK & Inspektorat.</p></div></div>
  <div class="toolbar"><input class="input search" id="q" placeholder="🔍 Cari perihal, pemohon, nomor dokumen, SP2D…"></div>
  <div id="list"></div>`;

  const listEl = root.querySelector('#list');
  function apply() {
    let data = all();
    if (q) {
      const k = q.toLowerCase();
      data = data.filter((s) => (s.perihal + ' ' + pegawaiName(s.pemohonId) + ' ' + (s.documents?.suratTuganNo || '') + ' ' + (s.documents?.sppdNo || '') + ' ' + (s.pembayaran?.buktiNo || '')).toLowerCase().includes(k));
    }
    if (!data.length) { listEl.innerHTML = emptyState('🗄️', 'Arsip kosong', 'Belum ada dokumen yang diarsipkan.'); return; }
    listEl.innerHTML = `<div class="table-wrap"><table class="tbl">
      <thead><tr><th>No. SPPD</th><th>Perihal</th><th>Pemohon</th><th>Tanggal</th><th>Status</th><th class="num">Nilai</th></tr></thead>
      <tbody>${data.map((s) => `<tr class="clickable" data-go="/sppd/${s.id}">
        <td class="nowrap">${esc(s.documents?.sppdNo || '—')}</td>
        <td>${esc(s.perihal)}</td>
        <td>${esc((pegawaiName(s.pemohonId) || '').split(',')[0])}</td>
        <td class="nowrap">${tanggal(s.tanggalBerangkat)}</td>
        <td>${statusBadge(s.status)}</td>
        <td class="num">${rupiah(s.pembayaran?.nominal || s.totalBiaya)}</td></tr>`).join('')}</tbody>
    </table></div>`;
    listEl.querySelectorAll('[data-go]').forEach((el) => el.onclick = () => location.hash = el.getAttribute('data-go'));
  }
  root.querySelector('#q').addEventListener('input', debounce((e) => { q = e.target.value; apply(); }, 200));
  apply();
}
