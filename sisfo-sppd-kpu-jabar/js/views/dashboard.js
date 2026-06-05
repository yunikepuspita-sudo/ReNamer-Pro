/* ===========================================================================
   views/dashboard.js — Ringkasan & monitoring sesuai peran pengguna.
   ========================================================================= */

import { currentUser, roleLabel } from '../auth.js';
import { globalStats, anggaranSummary, inboxFor, mySppd } from '../domain.js';
import { store } from '../store.js';
import { esc, rupiah, rupiahShort, tanggalJam, relatif } from '../ui.js';
import { sppdCard, wireGo, pegawaiName, emptyState } from './shared.js';

export function renderDashboard(root) {
  const u = currentUser();
  const st = globalStats();
  const inbox = inboxFor(u);
  const mine = mySppd(u);
  const anggaran = anggaranSummary();
  const totalPagu = anggaran.reduce((t, a) => t + a.pagu, 0);
  const totalReal = anggaran.reduce((t, a) => t + a.realisasi, 0);
  const persenReal = totalPagu ? Math.round((totalReal / totalPagu) * 100) : 0;
  const audit = store.list('audit').slice(0, 8);

  const greeting = (() => { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'; })();

  root.innerHTML = `
  <div class="page-head">
    <div>
      <h1>${greeting}, ${esc(u.nama.split(',')[0])} 👋</h1>
      <p class="desc">Anda masuk sebagai <b>${esc(roleLabel(u.role))}</b> · ${esc(u.unit)}</p>
    </div>
    <div class="actions">
      ${u.role === 'pegawai' ? `<a class="btn btn-primary" href="#/pengajuan">➕ Ajukan Perjalanan Dinas</a>` : ''}
      ${inbox.length ? `<a class="btn btn-gold" href="#/approval">✅ ${inbox.length} menunggu tindakan Anda</a>` : ''}
    </div>
  </div>

  <div class="grid grid-4">
    <div class="stat accent-navy"><span class="ico">🧳</span><div class="label">Total Perjalanan Dinas</div><div class="value">${st.total}</div><div class="delta muted">tahun anggaran berjalan</div></div>
    <div class="stat accent-gold"><span class="ico">⏳</span><div class="label">Dalam Proses Pengajuan</div><div class="value">${st.pengajuan}</div><div class="delta muted">menunggu persetujuan</div></div>
    <div class="stat accent-green"><span class="ico">✅</span><div class="label">Selesai & Dibayar</div><div class="value">${st.selesai}</div><div class="delta muted">${rupiahShort(st.nilaiSelesai)} tersalurkan</div></div>
    <div class="stat accent-red"><span class="ico">🧾</span><div class="label">Tahap SPJ</div><div class="value">${st.spj}</div><div class="delta muted">pertanggungjawaban</div></div>
  </div>

  <div class="grid grid-2 mt-16" style="grid-template-columns: 1.4fr 1fr">
    <div class="card card-pad">
      <div class="flex between center" style="margin-bottom:10px">
        <div class="card-title"><span class="ico">📁</span> Serapan Anggaran Perjalanan Dinas (DIPA)</div>
        <a class="small" href="#/anggaran">Lihat detail →</a>
      </div>
      <div class="flex between center" style="margin-bottom:6px">
        <span class="muted small">Realisasi keseluruhan</span>
        <span class="bold">${rupiahShort(totalReal)} / ${rupiahShort(totalPagu)} (${persenReal}%)</span>
      </div>
      <div class="progress" style="margin-bottom:14px"><span style="width:${Math.min(100, persenReal)}%"></span></div>
      ${anggaran.map((a) => `
        <div style="margin-bottom:11px">
          <div class="flex between small"><span><span class="tag-akun">${esc(a.kode)}</span> ${esc(a.nama)}</span><span class="bold">${a.persen}%</span></div>
          <div class="progress" style="margin-top:4px"><span style="width:${Math.min(100, a.persen)}%"></span></div>
        </div>`).join('')}
    </div>

    <div class="card card-pad">
      <div class="card-title" style="margin-bottom:10px"><span class="ico">🔔</span> Perlu Tindakan Anda</div>
      <div id="inboxMini"></div>
    </div>
  </div>

  <div class="grid grid-2 mt-16" style="grid-template-columns: 1fr 1fr">
    <div class="card card-pad">
      <div class="flex between center" style="margin-bottom:10px">
        <div class="card-title"><span class="ico">🧳</span> ${u.role === 'pegawai' ? 'Perjalanan Dinas Saya' : 'Perjalanan Dinas Terbaru'}</div>
        <a class="small" href="#/daftar">Semua →</a>
      </div>
      <div id="recentList"></div>
    </div>

    <div class="card card-pad">
      <div class="flex between center" style="margin-bottom:10px">
        <div class="card-title"><span class="ico">🛡️</span> Aktivitas Terbaru (Audit Trail)</div>
        ${['kpa', 'auditor'].includes(u.role) ? `<a class="small" href="#/audit">Semua →</a>` : ''}
      </div>
      ${audit.length ? `<ul class="timeline">${audit.map((a) => `
        <li><span class="tl-dot done"></span>
          <div class="tl-title">${esc(a.action)}</div>
          <div class="tl-meta">${esc((pegawaiName(a.actorId) || '').split(',')[0])} · ${relatif(a.ts)}</div>
        </li>`).join('')}</ul>` : `<p class="muted small">Belum ada aktivitas.</p>`}
    </div>
  </div>`;

  // Inbox mini
  const inboxMini = root.querySelector('#inboxMini');
  if (inbox.length) {
    inboxMini.innerHTML = `<div class="list">${inbox.slice(0, 4).map((s) => sppdCard(s)).join('')}</div>` +
      (inbox.length > 4 ? `<a class="btn btn-block btn-sm mt-12" href="#/approval">Lihat semua (${inbox.length})</a>` : '');
    wireGo(inboxMini);
  } else {
    inboxMini.innerHTML = emptyState('🎉', 'Tidak ada antrean', 'Tidak ada item yang menunggu tindakan Anda saat ini.');
  }

  // Recent list
  const recent = root.querySelector('#recentList');
  const recentData = (u.role === 'pegawai' ? mine : store.list('sppd').sort((a, b) => b.updatedTs - a.updatedTs)).slice(0, 4);
  if (recentData.length) {
    recent.innerHTML = `<div class="list">${recentData.map((s) => sppdCard(s, { showPemohon: u.role !== 'pegawai' })).join('')}</div>`;
    wireGo(recent);
  } else {
    recent.innerHTML = emptyState('🗂️', 'Belum ada data', u.role === 'pegawai' ? 'Anda belum mengajukan perjalanan dinas.' : 'Belum ada perjalanan dinas.');
  }
}
