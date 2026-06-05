/* ===========================================================================
   auth.js — Sesi pengguna & peran (role-based access).
   Demo: login dengan memilih akun pegawai. Kata sandi bersifat opsional
   (lingkungan demo). Sesi disimpan di localStorage.
   ========================================================================= */

import { store } from './store.js';

export const ROLES = {
  pegawai:   { label: 'Pegawai Pemohon',     short: 'Pegawai',   desc: 'Mengajukan perjalanan dinas & SPJ' },
  atasan:    { label: 'Atasan Langsung',     short: 'Atasan',    desc: 'Verifikasi kebutuhan tugas' },
  keuangan:  { label: 'Kasubbag Keuangan',   short: 'Keuangan',  desc: 'Verifikasi ketersediaan anggaran' },
  ppk:       { label: 'PPK',                 short: 'PPK',       desc: 'Persetujuan teknis & administrasi' },
  kpa:       { label: 'KPA / Sekretaris',    short: 'KPA',       desc: 'Pengesahan akhir & penerbitan dokumen' },
  bendahara: { label: 'Bendahara Pengeluaran', short: 'Bendahara', desc: 'Verifikasi bukti & pembayaran' },
  auditor:   { label: 'Auditor / Inspektorat', short: 'Auditor', desc: 'Monitoring & audit trail' },
};

export function roleLabel(role) { return ROLES[role]?.label || role; }

let _current = null;

export function currentUser() {
  if (_current) return _current;
  const id = store.pref('sessionUserId');
  if (!id) return null;
  _current = store.find('pegawai', id);
  return _current;
}

export function login(userId) {
  const u = store.find('pegawai', userId);
  if (!u) return null;
  store.pref('sessionUserId', userId);
  _current = u;
  return u;
}

export function logout() {
  store.pref('sessionUserId', null);
  _current = null;
}

export function hasRole(...roles) {
  const u = currentUser();
  return !!u && roles.includes(u.role);
}
