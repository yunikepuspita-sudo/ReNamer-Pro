/* ===========================================================================
   views/anggaran.js — Monitoring serapan anggaran perjalanan dinas (DIPA).
   ========================================================================= */

import { store } from '../store.js';
import { anggaranSummary } from '../domain.js';
import { ORG } from '../seed.js';
import { esc, rupiah, rupiahShort } from '../ui.js';

export function renderAnggaran(root) {
  const data = anggaranSummary();
  const sppd = store.list('sppd');
  const totalPagu = data.reduce((t, a) => t + a.pagu, 0);
  const totalReal = data.reduce((t, a) => t + a.realisasi, 0);
  const totalKom = data.reduce((t, a) => t + a.komitmen, 0);
  const persen = totalPagu ? Math.round((totalReal / totalPagu) * 100) : 0;

  root.innerHTML = `
  <div class="page-head"><div><h1>Anggaran Perjalanan Dinas (DIPA)</h1>
    <p class="desc">${esc(ORG.satker)} · Tahun Anggaran ${ORG.tahunAnggaran}</p></div></div>

  <div class="grid grid-4">
    <div class="stat accent-navy"><span class="ico">📁</span><div class="label">Total Pagu</div><div class="value sm">${rupiahShort(totalPagu)}</div></div>
    <div class="stat accent-green"><span class="ico">✅</span><div class="label">Realisasi</div><div class="value sm">${rupiahShort(totalReal)}</div><div class="delta muted">${persen}% terserap</div></div>
    <div class="stat accent-gold"><span class="ico">🔒</span><div class="label">Komitmen (proses)</div><div class="value sm">${rupiahShort(totalKom)}</div></div>
    <div class="stat accent-red"><span class="ico">💼</span><div class="label">Sisa Pagu</div><div class="value sm">${rupiahShort(totalPagu - totalReal - totalKom)}</div></div>
  </div>

  <div class="card card-pad mt-16">
    <div class="card-title" style="margin-bottom:6px"><span class="ico">📊</span> Realisasi Keseluruhan</div>
    <div class="flex between small"><span class="muted">${rupiah(totalReal)} dari ${rupiah(totalPagu)}</span><b>${persen}%</b></div>
    <div class="progress mt-8"><span style="width:${Math.min(100, persen)}%"></span></div>
  </div>

  <div class="table-wrap mt-16"><table class="tbl">
    <thead><tr><th>Akun</th><th>Uraian</th><th class="num">Pagu</th><th class="num">Realisasi</th><th class="num">Komitmen</th><th class="num">Sisa</th><th>Serapan</th></tr></thead>
    <tbody>${data.map((a) => `<tr>
      <td><span class="tag-akun">${esc(a.kode)}</span></td>
      <td>${esc(a.nama)}</td>
      <td class="num">${rupiah(a.pagu)}</td>
      <td class="num">${rupiah(a.realisasi)}</td>
      <td class="num muted">${rupiah(a.komitmen)}</td>
      <td class="num">${rupiah(a.sisa)}</td>
      <td style="min-width:140px"><div class="flex center gap-8"><div class="progress" style="flex:1"><span style="width:${Math.min(100, a.persen)}%"></span></div><b class="small">${a.persen}%</b></div></td>
    </tr>`).join('')}</tbody>
  </table></div>

  <p class="muted small mt-12">Realisasi dihitung dari pembayaran SPPD berstatus <b>Selesai</b> ditambah realisasi awal DIPA; komitmen mencakup SPPD yang dokumennya telah terbit namun belum dibayar.</p>`;
}
