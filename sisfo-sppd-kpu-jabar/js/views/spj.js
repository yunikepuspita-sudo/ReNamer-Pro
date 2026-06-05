/* ===========================================================================
   views/spj.js — Daftar SPJ milik pemohon: perlu diisi & sedang diproses.
   ========================================================================= */

import { currentUser } from '../auth.js';
import { mySppd } from '../domain.js';
import { renderSppdList, emptyState } from './shared.js';

export function renderSpj(root) {
  const u = currentUser();
  const mine = mySppd(u);
  const perlu = mine.filter((s) => ['TERBIT', 'PELAKSANAAN', 'SPJ_REVISI'].includes(s.status));
  const proses = mine.filter((s) => ['SPJ_MENUNGGU_BENDAHARA', 'SPJ_MENUNGGU_PPK', 'SPJ_MENUNGGU_KPA', 'SPJ_DISETUJUI'].includes(s.status));
  const selesai = mine.filter((s) => s.status === 'SELESAI');

  root.innerHTML = `
  <div class="page-head"><div><h1>Pertanggungjawaban (SPJ)</h1>
    <p class="desc">Lengkapi laporan & bukti perjalanan dinas yang telah dilaksanakan.</p></div></div>

  <h3 class="card-title" style="margin:6px 0 10px"><span class="ico">📝</span> Perlu Disusun / Diperbaiki (${perlu.length})</h3>
  <div id="perlu"></div>
  <h3 class="card-title" style="margin:22px 0 10px"><span class="ico">⏳</span> Dalam Proses Verifikasi (${proses.length})</h3>
  <div id="proses"></div>
  <h3 class="card-title" style="margin:22px 0 10px"><span class="ico">✅</span> Selesai (${selesai.length})</h3>
  <div id="selesai"></div>`;

  const wrap = (sel, data, empty) => {
    const el = root.querySelector(sel);
    if (!data.length) { el.innerHTML = emptyState('🗂️', 'Tidak ada', empty); return; }
    renderSppdList(el, data, { showPemohon: false });
  };
  wrap('#perlu', perlu, 'Tidak ada SPPD yang menunggu SPJ.');
  wrap('#proses', proses, 'Tidak ada SPJ dalam verifikasi.');
  wrap('#selesai', selesai, 'Belum ada SPJ yang selesai.');
}
