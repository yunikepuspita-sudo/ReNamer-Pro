/* ===========================================================================
   views/pembayaran.js — Daftar pencairan (Bendahara): siap bayar & riwayat.
   ========================================================================= */

import { store } from '../store.js';
import { esc, rupiah, rupiahShort, tanggal } from '../ui.js';
import { renderSppdList, emptyState, pegawaiName } from './shared.js';

export function renderPembayaran(root) {
  const all = store.list('sppd');
  const siap = all.filter((s) => s.status === 'SPJ_DISETUJUI').sort((a, b) => b.updatedTs - a.updatedTs);
  const dibayar = all.filter((s) => s.status === 'SELESAI').sort((a, b) => new Date(b.pembayaran?.tgl || 0) - new Date(a.pembayaran?.tgl || 0));
  const totalDibayar = dibayar.reduce((t, s) => t + (s.pembayaran?.nominal || 0), 0);
  const totalSiap = siap.reduce((t, s) => t + (s.spj?.totalRealisasi || s.totalBiaya), 0);

  root.innerHTML = `
  <div class="page-head"><div><h1>Pembayaran & Pencairan</h1>
    <p class="desc">Cairkan uang harian/reimbursement atas SPJ yang telah disahkan.</p></div></div>

  <div class="grid grid-3">
    <div class="stat accent-gold"><span class="ico">⏳</span><div class="label">Siap Dibayar</div><div class="value">${siap.length}</div><div class="delta muted">${rupiahShort(totalSiap)}</div></div>
    <div class="stat accent-green"><span class="ico">✅</span><div class="label">Telah Dibayar</div><div class="value">${dibayar.length}</div><div class="delta muted">tahun berjalan</div></div>
    <div class="stat accent-navy"><span class="ico">💰</span><div class="label">Total Tersalurkan</div><div class="value sm">${rupiahShort(totalDibayar)}</div></div>
  </div>

  <h3 class="card-title" style="margin:20px 0 10px"><span class="ico">💳</span> Siap Dibayar</h3>
  <div id="siap"></div>

  <h3 class="card-title" style="margin:22px 0 10px"><span class="ico">🧾</span> Riwayat Pembayaran</h3>
  <div id="riwayat"></div>`;

  const siapEl = root.querySelector('#siap');
  if (siap.length) renderSppdList(siapEl, siap, { showPemohon: true });
  else siapEl.innerHTML = emptyState('🎉', 'Tidak ada antrean', 'Tidak ada SPJ yang menunggu pencairan.');

  const rw = root.querySelector('#riwayat');
  rw.innerHTML = dibayar.length ? `<div class="table-wrap"><table class="tbl">
    <thead><tr><th>Tanggal</th><th>No. SP2D/Bukti</th><th>Pemohon</th><th>Perihal</th><th>Metode</th><th class="num">Nominal</th></tr></thead>
    <tbody>${dibayar.map((s) => `<tr class="clickable" data-go="/sppd/${s.id}">
      <td class="nowrap">${tanggal(s.pembayaran?.tgl)}</td>
      <td class="nowrap">${esc(s.pembayaran?.buktiNo || '-')}</td>
      <td>${esc((pegawaiName(s.pemohonId) || '').split(',')[0])}</td>
      <td>${esc(s.perihal)}</td>
      <td class="nowrap">${esc(s.pembayaran?.metode || '-')}</td>
      <td class="num">${rupiah(s.pembayaran?.nominal || 0)}</td></tr>`).join('')}</tbody></table></div>`
    : emptyState('🗂️', 'Belum ada pembayaran', 'Riwayat pencairan akan tampil di sini.');

  root.querySelectorAll('[data-go]').forEach((el) => el.onclick = () => location.hash = el.getAttribute('data-go'));
}
