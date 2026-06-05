/* ===========================================================================
   views/daftar.js — Daftar seluruh perjalanan dinas (cari, filter, status).
   ========================================================================= */

import { store } from '../store.js';
import { currentUser } from '../auth.js';
import { statusInfo } from '../domain.js';
import { esc, debounce } from '../ui.js';
import { renderSppdList, pegawaiName } from './shared.js';

const GROUPS = {
  all: () => true,
  pengajuan: (s) => statusInfo(s.status).group === 'pengajuan',
  pelaksanaan: (s) => statusInfo(s.status).group === 'pelaksanaan',
  spj: (s) => statusInfo(s.status).group === 'spj',
  selesai: (s) => statusInfo(s.status).group === 'selesai',
};

export function renderDaftar(root) {
  const u = currentUser();
  let filter = { q: '', group: 'all', mine: u.role === 'pegawai' };

  root.innerHTML = `
  <div class="page-head">
    <div><h1>Perjalanan Dinas</h1><p class="desc">Lacak status seluruh pengajuan dari awal hingga pembayaran.</p></div>
    <div class="actions">${u.role === 'pegawai' ? `<a class="btn btn-primary" href="#/pengajuan">➕ Ajukan</a>` : ''}</div>
  </div>

  <div class="toolbar">
    <input class="input search" id="q" placeholder="🔍 Cari perihal, kota, pemohon, nomor dokumen…">
    <div class="seg" id="grp">
      <button data-g="all" class="active">Semua</button>
      <button data-g="pengajuan">Pengajuan</button>
      <button data-g="pelaksanaan">Pelaksanaan</button>
      <button data-g="spj">SPJ</button>
      <button data-g="selesai">Selesai</button>
    </div>
    <label class="btn btn-sm" style="gap:8px"><input type="checkbox" id="mine" ${filter.mine ? 'checked' : ''}> Hanya milik saya</label>
  </div>
  <div id="list"></div>`;

  const listEl = root.querySelector('#list');

  function apply() {
    let data = store.list('sppd');
    if (filter.mine) data = data.filter((s) => s.pemohonId === u.id);
    data = data.filter(GROUPS[filter.group]);
    if (filter.q) {
      const q = filter.q.toLowerCase();
      data = data.filter((s) =>
        (s.perihal + ' ' + s.lokasiKota + ' ' + s.lokasiProvinsi + ' ' + pegawaiName(s.pemohonId) + ' ' +
         (s.documents?.suratTuganNo || '') + ' ' + (s.documents?.sppdNo || '')).toLowerCase().includes(q));
    }
    data.sort((a, b) => b.updatedTs - a.updatedTs);
    renderSppdList(listEl, data, { showPemohon: !filter.mine, emptyDesc: 'Tidak ada perjalanan dinas yang cocok dengan filter.' });
  }

  root.querySelector('#q').addEventListener('input', debounce((e) => { filter.q = e.target.value; apply(); }, 200));
  root.querySelectorAll('#grp button').forEach((b) => b.onclick = () => {
    root.querySelectorAll('#grp button').forEach((x) => x.classList.remove('active'));
    b.classList.add('active'); filter.group = b.dataset.g; apply();
  });
  root.querySelector('#mine').onchange = (e) => { filter.mine = e.target.checked; apply(); };

  apply();
}
