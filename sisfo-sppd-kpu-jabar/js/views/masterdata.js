/* ===========================================================================
   views/masterdata.js — Master data: Pegawai, SBM, Akun Anggaran (DIPA),
   serta info penyimpanan & reset data demo.
   ========================================================================= */

import { store } from '../store.js';
import { roleLabel, ROLES } from '../auth.js';
import { esc, rupiah, toast, modal, confirmDialog, fmtBytes } from '../ui.js';

export function renderMasterData(root) {
  let tab = 'pegawai';

  function render() {
    root.innerHTML = `
    <div class="page-head"><div><h1>Master Data</h1><p class="desc">Kelola data referensi sistem.</p></div></div>
    <div class="tabs">
      <button data-t="pegawai" class="${tab === 'pegawai' ? 'active' : ''}">👤 Pegawai</button>
      <button data-t="sbm" class="${tab === 'sbm' ? 'active' : ''}">💰 Standar Biaya (SBM)</button>
      <button data-t="anggaran" class="${tab === 'anggaran' ? 'active' : ''}">📁 Akun Anggaran</button>
      <button data-t="sistem" class="${tab === 'sistem' ? 'active' : ''}">⚙️ Sistem</button>
    </div>
    <div id="body"></div>`;
    root.querySelectorAll('.tabs button').forEach((b) => b.onclick = () => { tab = b.dataset.t; render(); });
    const body = root.querySelector('#body');
    if (tab === 'pegawai') body.innerHTML = pegawaiTbl();
    else if (tab === 'sbm') { body.innerHTML = sbmTbl(); wireSbm(body); }
    else if (tab === 'anggaran') { body.innerHTML = anggaranTbl(); wireAnggaran(body); }
    else sistem(body);
  }

  function pegawaiTbl() {
    const list = store.list('pegawai');
    return `<div class="table-wrap"><table class="tbl">
      <thead><tr><th>Nama</th><th>NIP</th><th>Jabatan</th><th>Gol.</th><th>Unit</th><th>Peran Sistem</th></tr></thead>
      <tbody>${list.map((p) => `<tr>
        <td>${esc(p.nama)}</td><td class="nowrap">${esc(p.nip)}</td><td>${esc(p.jabatan)}</td>
        <td>${esc(p.golongan)}</td><td>${esc(p.unit)}</td>
        <td><span class="badge badge-blue">${esc(roleLabel(p.role))}</span></td></tr>`).join('')}</tbody>
    </table></div>`;
  }

  function sbmTbl() {
    const list = store.list('sbm');
    return `<p class="muted small">Tarif uang harian & batas tertinggi penginapan per provinsi tujuan. Klik untuk mengubah.</p>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>Provinsi</th><th class="num">Uang Harian / hari</th><th class="num">Penginapan / malam</th><th></th></tr></thead>
      <tbody>${list.map((s) => `<tr>
        <td>${esc(s.provinsi)}</td><td class="num">${rupiah(s.uangHarian)}</td><td class="num">${rupiah(s.penginapan)}</td>
        <td class="num"><button class="btn btn-sm" data-edit="${s.id}">✏️</button></td></tr>`).join('')}</tbody>
    </table></div>`;
  }
  function wireSbm(body) {
    body.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => {
      const s = store.find('sbm', b.dataset.edit);
      modal({ title: `Ubah SBM — ${s.provinsi}`,
        body: `<div class="field"><label class="lbl">Uang Harian (Rp/hari)</label><input class="input" id="uh" type="number" value="${s.uangHarian}"></div>
               <div class="field mt-12"><label class="lbl">Penginapan (Rp/malam)</label><input class="input" id="pg" type="number" value="${s.penginapan}"></div>`,
        footer: `<button class="btn" data-no>Batal</button><button class="btn btn-primary" data-yes>Simpan</button>`,
        onMount: (r, close) => {
          r.querySelector('[data-no]').onclick = close;
          r.querySelector('[data-yes]').onclick = () => { s.uangHarian = +r.querySelector('#uh').value; s.penginapan = +r.querySelector('#pg').value; store.upsert('sbm', s); close(); toast('SBM diperbarui.', 'ok'); render(); };
        } });
    });
  }

  function anggaranTbl() {
    const list = store.list('anggaran');
    return `<p class="muted small">Pagu anggaran per akun belanja perjalanan dinas (DIPA). Klik untuk mengubah pagu.</p>
    <div class="table-wrap"><table class="tbl">
      <thead><tr><th>Kode</th><th>Uraian</th><th class="num">Pagu</th><th></th></tr></thead>
      <tbody>${list.map((a) => `<tr>
        <td><span class="tag-akun">${esc(a.kode)}</span></td><td>${esc(a.nama)}</td><td class="num">${rupiah(a.pagu)}</td>
        <td class="num"><button class="btn btn-sm" data-edit="${a.id}">✏️</button></td></tr>`).join('')}</tbody>
    </table></div>`;
  }
  function wireAnggaran(body) {
    body.querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => {
      const a = store.find('anggaran', b.dataset.edit);
      modal({ title: `Ubah Pagu — ${a.kode}`,
        body: `<p class="small muted">${esc(a.nama)}</p><div class="field"><label class="lbl">Pagu (Rp)</label><input class="input" id="pg" type="number" value="${a.pagu}"></div>`,
        footer: `<button class="btn" data-no>Batal</button><button class="btn btn-primary" data-yes>Simpan</button>`,
        onMount: (r, close) => {
          r.querySelector('[data-no]').onclick = close;
          r.querySelector('[data-yes]').onclick = () => { a.pagu = +r.querySelector('#pg').value; store.upsert('anggaran', a); close(); toast('Pagu diperbarui.', 'ok'); render(); };
        } });
    });
  }

  function sistem(body) {
    const meta = store.meta();
    body.innerHTML = `
    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:10px"><span class="ico">💾</span> Penyimpanan Lokal</div>
      <dl class="dl">
        <dt>Mode</dt><dd>Offline-first (localStorage) — data tersimpan di perangkat ini.</dd>
        <dt>Perkiraan terpakai</dt><dd>${fmtBytes(meta.bytes)}</dd>
        <dt>Jumlah SPPD</dt><dd>${store.list('sppd').length}</dd>
        <dt>Entri Audit</dt><dd>${store.list('audit').length}</dd>
      </dl>
      <div class="divider"></div>
      <button class="btn btn-danger" id="reset">🗑️ Reset Data Demo</button>
      <p class="hint mt-8">Menghapus seluruh data lokal dan memuat ulang data contoh awal.</p>
    </div>`;
    body.querySelector('#reset').onclick = async () => {
      if (await confirmDialog({ title: 'Reset Data Demo', message: 'Seluruh data lokal akan dihapus dan diganti data contoh. Lanjutkan?', danger: true, confirmText: 'Ya, Reset' })) {
        store.reset(); toast('Data direset. Memuat ulang…', 'ok'); setTimeout(() => location.reload(), 700);
      }
    };
  }

  render();
}
