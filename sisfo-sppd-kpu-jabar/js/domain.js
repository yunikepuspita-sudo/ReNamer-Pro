/* ===========================================================================
   domain.js — Aturan bisnis SPPD: mesin status alur persetujuan, perhitungan
   biaya berbasis SBM, penerbitan dokumen + QR, SPJ, pembayaran, audit trail,
   ringkasan anggaran (DIPA), dan deteksi duplikasi klaim.
   ========================================================================= */

import { store, uid, nextNumber } from './store.js';
import { currentUser } from './auth.js';

/* ----- Definisi status & badge ----- */
export const STATUS = {
  DRAFT:                 { label: 'Draf',                 badge: 'badge-gray',  group: 'draft' },
  MENUNGGU_ATASAN:       { label: 'Menunggu Atasan',      badge: 'badge-amber', group: 'pengajuan', role: 'atasan' },
  MENUNGGU_KEUANGAN:     { label: 'Verifikasi Keuangan',  badge: 'badge-amber', group: 'pengajuan', role: 'keuangan' },
  MENUNGGU_PPK:          { label: 'Persetujuan PPK',      badge: 'badge-amber', group: 'pengajuan', role: 'ppk' },
  MENUNGGU_KPA:          { label: 'Pengesahan KPA',       badge: 'badge-amber', group: 'pengajuan', role: 'kpa' },
  REVISI:                { label: 'Perlu Revisi',         badge: 'badge-red',   group: 'pengajuan', role: null },
  DITOLAK:               { label: 'Ditolak',              badge: 'badge-red',   group: 'selesai' },
  TERBIT:                { label: 'Dokumen Terbit',       badge: 'badge-blue',  group: 'pelaksanaan' },
  PELAKSANAAN:           { label: 'Pelaksanaan',          badge: 'badge-blue',  group: 'pelaksanaan' },
  SPJ_MENUNGGU_BENDAHARA:{ label: 'SPJ — Verif Bendahara',badge: 'badge-amber', group: 'spj', role: 'bendahara' },
  SPJ_MENUNGGU_PPK:      { label: 'SPJ — Persetujuan PPK', badge: 'badge-amber', group: 'spj', role: 'ppk' },
  SPJ_MENUNGGU_KPA:      { label: 'SPJ — Pengesahan KPA', badge: 'badge-amber', group: 'spj', role: 'kpa' },
  SPJ_REVISI:            { label: 'SPJ — Perlu Revisi',   badge: 'badge-red',   group: 'spj', role: null },
  SPJ_DISETUJUI:         { label: 'SPJ Disetujui',        badge: 'badge-gold',  group: 'spj', role: 'bendahara' },
  SELESAI:               { label: 'Selesai & Dibayar',    badge: 'badge-green', group: 'selesai' },
};

export function statusInfo(s) { return STATUS[s] || { label: s, badge: 'badge-gray' }; }

/* Peran yang harus bertindak pada status tertentu (null = tidak ada). */
export function pendingRole(status) { return STATUS[status]?.role || null; }

/* Urutan langkah alur persetujuan pengajuan (untuk tampilan stepper). */
export const PENGAJUAN_FLOW = ['MENUNGGU_ATASAN', 'MENUNGGU_KEUANGAN', 'MENUNGGU_PPK', 'MENUNGGU_KPA', 'TERBIT'];
export const SPJ_FLOW = ['SPJ_MENUNGGU_BENDAHARA', 'SPJ_MENUNGGU_PPK', 'SPJ_MENUNGGU_KPA', 'SPJ_DISETUJUI', 'SELESAI'];

const APPROVE_NEXT = {
  MENUNGGU_ATASAN: 'MENUNGGU_KEUANGAN',
  MENUNGGU_KEUANGAN: 'MENUNGGU_PPK',
  MENUNGGU_PPK: 'MENUNGGU_KPA',
  MENUNGGU_KPA: 'TERBIT',
  SPJ_MENUNGGU_BENDAHARA: 'SPJ_MENUNGGU_PPK',
  SPJ_MENUNGGU_PPK: 'SPJ_MENUNGGU_KPA',
  SPJ_MENUNGGU_KPA: 'SPJ_DISETUJUI',
};

const APPROVE_ACTION = {
  MENUNGGU_ATASAN: 'Menyetujui (atasan langsung)',
  MENUNGGU_KEUANGAN: 'Memverifikasi ketersediaan anggaran',
  MENUNGGU_PPK: 'Menyetujui (teknis & administrasi)',
  MENUNGGU_KPA: 'Mengesahkan & menerbitkan dokumen',
  SPJ_MENUNGGU_BENDAHARA: 'Memverifikasi bukti SPJ',
  SPJ_MENUNGGU_PPK: 'Menyetujui SPJ',
  SPJ_MENUNGGU_KPA: 'Mengesahkan SPJ',
};

/* ----- Data master & util ----- */
export function sbmFor(provinsi) {
  return store.list('sbm').find((s) => s.provinsi === provinsi) || null;
}

export function hitungLamaHari(berangkat, kembali) {
  if (!berangkat || !kembali) return 1;
  return Math.max(1, Math.round((new Date(kembali) - new Date(berangkat)) / 86400000) + 1);
}

export function hitungBiaya(provinsi, lamaHari, transport = 0, lainnya = 0) {
  const sbm = sbmFor(provinsi);
  const uangHarian = (sbm ? sbm.uangHarian : 400000) * lamaHari;
  const penginapan = (sbm ? sbm.penginapan : 700000) * Math.max(0, lamaHari - 1);
  const rincian = { uangHarian, penginapan, transport: +transport || 0, lainnya: +lainnya || 0 };
  const total = rincian.uangHarian + rincian.penginapan + rincian.transport + rincian.lainnya;
  return { rincian, total };
}

/* ----- Audit ----- */
export function logAudit(action, sppd, note = '', actor = currentUser()) {
  const audit = store.list('audit');
  audit.unshift({
    id: uid('log-'), ts: new Date().toISOString(),
    actorId: actor?.id || 'system', role: actor?.role || 'system',
    action, entity: 'SPPD', entityId: sppd?.id || '-',
    detail: `${sppd?.perihal || ''}${note ? ' — ' + note : ''}`,
  });
  store.set('audit', audit.slice(0, 500));
}

function pushHistory(sppd, action, status, note, actor) {
  sppd.history = sppd.history || [];
  sppd.history.push({ ts: new Date().toISOString(), actorId: actor.id, role: actor.role, action, status, note: note || '' });
  sppd.updatedTs = Date.now();
}

function save(sppd) { store.upsert('sppd', sppd); return sppd; }

/* ----- Aksi: pengajuan ----- */
export function submitPengajuan(sppd, actor = currentUser()) {
  sppd.status = 'MENUNGGU_ATASAN';
  pushHistory(sppd, 'Mengajukan perjalanan dinas', sppd.status, '', actor);
  logAudit('Mengajukan perjalanan dinas', sppd, '', actor);
  return save(sppd);
}

export function approve(sppd, note = '', actor = currentUser()) {
  const from = sppd.status;
  const to = APPROVE_NEXT[from];
  if (!to) throw new Error('Status tidak dapat disetujui: ' + from);
  const action = APPROVE_ACTION[from] || 'Menyetujui';

  if (to === 'TERBIT') issueDocuments(sppd, actor);
  if (from === 'MENUNGGU_KEUANGAN') sppd.biayaDisetujui = sppd.totalBiaya; // kunci nilai disetujui
  if (to === 'SPJ_DISETUJUI' && sppd.spj) sppd.spj.status = 'DISETUJUI';

  sppd.status = to;
  pushHistory(sppd, action, to, note, actor);
  logAudit(action, sppd, note, actor);
  return save(sppd);
}

export function requestRevision(sppd, note, actor = currentUser()) {
  const isSpj = sppd.status.startsWith('SPJ');
  sppd.status = isSpj ? 'SPJ_REVISI' : 'REVISI';
  if (isSpj && sppd.spj) sppd.spj.status = 'REVISI';
  pushHistory(sppd, 'Meminta revisi', sppd.status, note, actor);
  logAudit('Meminta revisi', sppd, note, actor);
  return save(sppd);
}

export function reject(sppd, note, actor = currentUser()) {
  sppd.status = 'DITOLAK';
  pushHistory(sppd, 'Menolak pengajuan', 'DITOLAK', note, actor);
  logAudit('Menolak pengajuan', sppd, note, actor);
  return save(sppd);
}

export function resubmit(sppd, actor = currentUser()) {
  const isSpj = sppd.status === 'SPJ_REVISI';
  sppd.status = isSpj ? 'SPJ_MENUNGGU_BENDAHARA' : 'MENUNGGU_ATASAN';
  if (isSpj && sppd.spj) sppd.spj.status = 'DIAJUKAN';
  pushHistory(sppd, 'Mengirim ulang setelah revisi', sppd.status, '', actor);
  logAudit('Mengirim ulang setelah revisi', sppd, '', actor);
  return save(sppd);
}

/* ----- Penerbitan dokumen + QR ----- */
function pad3(n) { return String(n).padStart(3, '0'); }

export function issueDocuments(sppd, actor = currentUser()) {
  const st = nextNumber('ST');
  const spd = nextNumber('SPD');
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase();
  sppd.documents = {
    suratTuganNo: `${pad3(st.seq)}/ST/PP.05-SD/32/${st.year}`,
    sppdNo: `${pad3(spd.seq)}/SPD/PP.05-SD/32/${spd.year}`,
    tglTerbit: new Date().toISOString(),
    qrToken: `STKPUJABAR-${pad3(st.seq)}-${st.year}-${rand}`,
  };
  return sppd;
}

/* ----- Pelaksanaan ----- */
export function addCheckin(sppd, data, actor = currentUser()) {
  sppd.pelaksanaan = sppd.pelaksanaan || { checkin: [], bukti: [], catatan: '' };
  sppd.pelaksanaan.checkin.push({ ts: new Date().toISOString(), ...data });
  if (sppd.status === 'TERBIT') sppd.status = 'PELAKSANAAN';
  pushHistory(sppd, 'Check-in lokasi kegiatan', sppd.status, data.lokasi || '', actor);
  logAudit('Check-in lokasi kegiatan', sppd, data.lokasi || '', actor);
  return save(sppd);
}

/* ----- SPJ ----- */
export function submitSPJ(sppd, spjData, actor = currentUser()) {
  sppd.spj = { ...spjData, status: 'DIAJUKAN', diajukanTs: new Date().toISOString() };
  sppd.status = 'SPJ_MENUNGGU_BENDAHARA';
  pushHistory(sppd, 'Mengajukan pertanggungjawaban (SPJ)', sppd.status, '', actor);
  logAudit('Mengajukan pertanggungjawaban (SPJ)', sppd, '', actor);
  return save(sppd);
}

/* ----- Pembayaran ----- */
export function recordPayment(sppd, payment, actor = currentUser()) {
  sppd.pembayaran = { ...payment, tgl: new Date().toISOString() };
  sppd.status = 'SELESAI';
  if (sppd.spj) sppd.spj.status = 'DIBAYAR';
  pushHistory(sppd, 'Mencairkan pembayaran', 'SELESAI', payment.buktiNo || '', actor);
  logAudit('Mencairkan pembayaran', sppd, payment.buktiNo || '', actor);
  return save(sppd);
}

/* ----- Kuasa akses ----- */
export function canAct(sppd, user = currentUser()) {
  if (!user) return false;
  const need = pendingRole(sppd.status);
  if (!need) return false;
  if (need !== user.role) return false;
  // Atasan langsung idealnya hanya atasan dari pemohon; dilonggarkan untuk demo.
  return true;
}

/* Kotak masuk (item yang menunggu tindakan pengguna). */
export function inboxFor(user = currentUser()) {
  if (!user) return [];
  return store.list('sppd').filter((s) => canAct(s, user))
    .sort((a, b) => new Date(a.tanggalBerangkat) - new Date(b.tanggalBerangkat));
}

/* SPPD milik pengguna (sebagai pemohon). */
export function mySppd(user = currentUser()) {
  if (!user) return [];
  return store.list('sppd').filter((s) => s.pemohonId === user.id)
    .sort((a, b) => b.updatedTs - a.updatedTs);
}

/* ----- Ringkasan anggaran (DIPA) ----- */
export function anggaranSummary() {
  const akun = store.list('anggaran');
  const sppd = store.list('sppd');
  return akun.map((a) => {
    const realisasiSppd = sppd
      .filter((s) => s.akun === a.kode && (s.status === 'SELESAI'))
      .reduce((t, s) => t + (s.pembayaran?.nominal || s.biayaDisetujui || s.totalBiaya || 0), 0);
    const komitmen = sppd
      .filter((s) => s.akun === a.kode && ['TERBIT', 'PELAKSANAAN', 'SPJ_MENUNGGU_BENDAHARA', 'SPJ_MENUNGGU_PPK', 'SPJ_MENUNGGU_KPA', 'SPJ_DISETUJUI', 'SPJ_REVISI'].includes(s.status))
      .reduce((t, s) => t + (s.biayaDisetujui || s.totalBiaya || 0), 0);
    const realisasi = a.realisasiAwal + realisasiSppd;
    return { ...a, realisasi, komitmen, sisa: a.pagu - realisasi - komitmen, persen: a.pagu ? Math.round((realisasi / a.pagu) * 100) : 0 };
  });
}

/* Cek ketersediaan anggaran untuk sebuah nilai pada akun tertentu. */
export function cekAnggaran(kodeAkun, nilai) {
  const a = anggaranSummary().find((x) => x.kode === kodeAkun);
  if (!a) return { ok: false, alasan: 'Akun tidak ditemukan', sisa: 0 };
  return { ok: a.sisa >= nilai, sisa: a.sisa, akun: a };
}

/* ----- Deteksi duplikasi klaim ----- */
export function detectDuplicate(sppd) {
  const others = store.list('sppd').filter((s) => s.id !== sppd.id && s.pemohonId === sppd.pemohonId && s.status !== 'DITOLAK');
  const aStart = new Date(sppd.tanggalBerangkat), aEnd = new Date(sppd.tanggalKembali);
  return others.filter((s) => {
    const bStart = new Date(s.tanggalBerangkat), bEnd = new Date(s.tanggalKembali);
    return aStart <= bEnd && bStart <= aEnd; // tanggal beririsan
  });
}

/* ----- Statistik untuk dashboard ----- */
export function globalStats() {
  const all = store.list('sppd');
  const isPengajuan = (s) => ['MENUNGGU_ATASAN', 'MENUNGGU_KEUANGAN', 'MENUNGGU_PPK', 'MENUNGGU_KPA', 'REVISI'].includes(s.status);
  const isPelaksanaan = (s) => ['TERBIT', 'PELAKSANAAN'].includes(s.status);
  const isSpj = (s) => s.status.startsWith('SPJ');
  return {
    total: all.length,
    pengajuan: all.filter(isPengajuan).length,
    pelaksanaan: all.filter(isPelaksanaan).length,
    spj: all.filter(isSpj).length,
    selesai: all.filter((s) => s.status === 'SELESAI').length,
    ditolak: all.filter((s) => s.status === 'DITOLAK').length,
    nilaiSelesai: all.filter((s) => s.status === 'SELESAI').reduce((t, s) => t + (s.pembayaran?.nominal || 0), 0),
  };
}
