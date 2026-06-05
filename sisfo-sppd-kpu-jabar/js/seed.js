/* ===========================================================================
   seed.js — Data awal (demo) yang ditanam sekali saat aplikasi pertama dibuka.
   Berisi profil instansi, master pegawai (sekaligus akun login per peran),
   Standar Biaya Masukan (SBM), pagu anggaran (DIPA), dan beberapa contoh SPPD.
   ========================================================================= */

import { store, uid } from './store.js';

export const ORG = {
  instansi: 'KOMISI PEMILIHAN UMUM',
  satker: 'KPU PROVINSI JAWA BARAT',
  alamat: 'Jl. Garut No. 11, Kota Bandung, Jawa Barat 40271',
  telp: '(022) 7273750',
  email: 'jabar@kpu.go.id',
  tahunAnggaran: 2026,
  provinsiAsal: 'Jawa Barat',
  kotaAsal: 'Bandung',
};

/* Standar Biaya Masukan — tarif uang harian & batas penginapan per provinsi
   tujuan (angka representatif untuk demo, mengacu pola Permenkeu SBM). */
const SBM = [
  { id: 'sbm-jabar', provinsi: 'Jawa Barat', uangHarian: 430000, penginapan: 730000 },
  { id: 'sbm-dki', provinsi: 'DKI Jakarta', uangHarian: 530000, penginapan: 1490000 },
  { id: 'sbm-jateng', provinsi: 'Jawa Tengah', uangHarian: 370000, penginapan: 750000 },
  { id: 'sbm-jatim', provinsi: 'Jawa Timur', uangHarian: 410000, penginapan: 910000 },
  { id: 'sbm-banten', provinsi: 'Banten', uangHarian: 370000, penginapan: 718000 },
  { id: 'sbm-yogya', provinsi: 'DI Yogyakarta', uangHarian: 420000, penginapan: 845000 },
  { id: 'sbm-bali', provinsi: 'Bali', uangHarian: 480000, penginapan: 1230000 },
  { id: 'sbm-sumut', provinsi: 'Sumatera Utara', uangHarian: 430000, penginapan: 1100000 },
  { id: 'sbm-sulsel', provinsi: 'Sulawesi Selatan', uangHarian: 460000, penginapan: 1100000 },
  { id: 'sbm-kaltim', provinsi: 'Kalimantan Timur', uangHarian: 430000, penginapan: 1100000 },
];

/* Akun belanja perjalanan dinas (DIPA) beserta pagu tahun anggaran. */
const ANGGARAN = [
  { id: 'akun-524111', kode: '524111', nama: 'Belanja Perjalanan Dinas Biasa', pagu: 1850000000, realisasiAwal: 612400000 },
  { id: 'akun-524113', kode: '524113', nama: 'Belanja Perjalanan Dinas Dalam Kota', pagu: 420000000, realisasiAwal: 98750000 },
  { id: 'akun-524114', kode: '524114', nama: 'Belanja Perjalanan Dinas Paket Meeting Dalam Kota', pagu: 560000000, realisasiAwal: 175300000 },
  { id: 'akun-524119', kode: '524119', nama: 'Belanja Perjalanan Dinas Paket Meeting Luar Kota', pagu: 980000000, realisasiAwal: 322100000 },
];

/* Master pegawai. Setiap entri juga merupakan akun login (sesuai peran). */
const PEGAWAI = [
  { id: 'peg-kpa',  nip: '197505102000031001', nama: 'Drs. Hendra Wijaya, M.Si.', jabatan: 'Sekretaris / Kuasa Pengguna Anggaran (KPA)', eselon: 'III', golongan: 'IV/b', unit: 'Sekretariat', role: 'kpa',       atasanId: null },
  { id: 'peg-ppk',  nip: '198008152006041002', nama: 'Bambang Susanto, S.E., M.M.', jabatan: 'Pejabat Pembuat Komitmen (PPK)',           eselon: 'IV', golongan: 'III/d', unit: 'Sekretariat', role: 'ppk',       atasanId: 'peg-kpa' },
  { id: 'peg-keu',  nip: '198203202008012003', nama: 'Rudi Hartono, S.E.',          jabatan: 'Kasubbag Keuangan, Umum & Logistik',         eselon: 'IV', golongan: 'III/d', unit: 'Subbag Keuangan', role: 'keuangan', atasanId: 'peg-kpa' },
  { id: 'peg-ben',  nip: '198611252010012004', nama: 'Siti Aminah, S.Ak.',          jabatan: 'Bendahara Pengeluaran',                     eselon: '-',  golongan: 'III/b', unit: 'Subbag Keuangan', role: 'bendahara', atasanId: 'peg-keu' },
  { id: 'peg-ata',  nip: '198404102009012005', nama: 'Dewi Lestari, S.IP., M.A.',   jabatan: 'Kasubbag Teknis & Hupmas',                  eselon: 'IV', golongan: 'III/d', unit: 'Subbag Teknis', role: 'atasan',  atasanId: 'peg-kpa' },
  { id: 'peg-aud',  nip: '198709012011012006', nama: 'Maya Sari, S.H.',             jabatan: 'Pengawas Internal / Inspektorat',           eselon: '-',  golongan: 'III/c', unit: 'Inspektorat', role: 'auditor',  atasanId: 'peg-kpa' },
  { id: 'peg-and',  nip: '199203152015031007', nama: 'Andi Nugraha, S.Kom.',        jabatan: 'Pranata Komputer Ahli Pertama',             eselon: '-',  golongan: 'III/b', unit: 'Subbag Teknis', role: 'pegawai',  atasanId: 'peg-ata' },
  { id: 'peg-rin',  nip: '199407222019022008', nama: 'Rina Marlina, S.Sos.',        jabatan: 'Analis Hukum',                              eselon: '-',  golongan: 'III/a', unit: 'Subbag Teknis', role: 'pegawai',  atasanId: 'peg-ata' },
  { id: 'peg-faj',  nip: '199001052014031009', nama: 'Fajar Ramadhan, A.Md.',       jabatan: 'Pengelola Data Pemilih',                    eselon: '-',  golongan: 'II/c',  unit: 'Subbag Teknis', role: 'pegawai',  atasanId: 'peg-ata' },
];

function daysBetween(a, b) {
  return Math.max(1, Math.round((new Date(b) - new Date(a)) / 86400000) + 1);
}
function iso(d) { return new Date(d).toISOString(); }
function plusDays(base, n) { const d = new Date(base); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }

/* Bangun satu record SPPD lengkap untuk data contoh. */
function buildSppd(o) {
  const sbm = SBM.find((s) => s.provinsi === o.provinsi);
  const lama = daysBetween(o.berangkat, o.kembali);
  const uangHarian = (sbm ? sbm.uangHarian : 400000) * lama;
  const penginapan = (sbm ? sbm.penginapan : 700000) * Math.max(0, lama - 1);
  const rincian = { uangHarian, penginapan, transport: o.transport ?? 1200000, lainnya: o.lainnya ?? 0 };
  const total = rincian.uangHarian + rincian.penginapan + rincian.transport + rincian.lainnya;
  const now = Date.now();
  return {
    id: uid('sppd-'),
    pemohonId: o.pemohonId,
    perihal: o.perihal,
    kegiatan: o.kegiatan,
    lokasiKota: o.kota,
    lokasiProvinsi: o.provinsi,
    tanggalBerangkat: o.berangkat,
    tanggalKembali: o.kembali,
    lamaHari: lama,
    alatAngkut: o.alatAngkut || 'Pesawat / Kendaraan Dinas',
    akun: o.akun || '524111',
    pengikut: o.pengikut || [],
    rincianBiaya: rincian,
    totalBiaya: total,
    biayaDisetujui: o.status === 'SELESAI' || o.status?.startsWith('SPJ') ? total : total,
    lampiran: [{ nama: 'Undangan/TOR-kegiatan.pdf', tipe: 'application/pdf', size: 184320, dataUrl: null }],
    status: o.status,
    history: o.history || [],
    documents: o.documents || null,
    pelaksanaan: o.pelaksanaan || { checkin: [], bukti: [], catatan: '' },
    spj: o.spj || null,
    pembayaran: o.pembayaran || null,
    createdTs: o.createdTs || (now - (o.ageDays || 1) * 86400000),
    updatedTs: now - (o.ageHours || 1) * 3600000,
  };
}

export function seedIfEmpty() {
  if (store.pref('seeded')) return;

  store.set('org', ORG);
  store.set('sbm', SBM);
  store.set('anggaran', ANGGARAN);
  store.set('pegawai', PEGAWAI);

  const today = new Date();
  const mk = (n) => plusDays(today, n);

  const samples = [
    buildSppd({
      pemohonId: 'peg-and', perihal: 'Rapat Koordinasi Pemutakhiran Data Pemilih Berkelanjutan',
      kegiatan: 'Mengikuti Rakor PDPB tingkat nasional bersama KPU RI.',
      kota: 'Jakarta Pusat', provinsi: 'DKI Jakarta', berangkat: mk(7), kembali: mk(9),
      akun: '524111', status: 'MENUNGGU_ATASAN', ageDays: 1, ageHours: 4,
      history: [{ ts: iso(today) , actorId: 'peg-and', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' }],
    }),
    buildSppd({
      pemohonId: 'peg-rin', perihal: 'Bimbingan Teknis Penanganan Pelanggaran Pemilu',
      kegiatan: 'Bimtek penanganan pelanggaran dan sengketa proses.',
      kota: 'Surabaya', provinsi: 'Jawa Timur', berangkat: mk(10), kembali: mk(12),
      akun: '524119', status: 'MENUNGGU_KEUANGAN', ageDays: 3, ageHours: 20,
      history: [
        { ts: iso(plusDays(today, -2)), actorId: 'peg-rin', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' },
        { ts: iso(plusDays(today, -1)), actorId: 'peg-ata', role: 'atasan', action: 'Menyetujui', status: 'MENUNGGU_KEUANGAN', note: 'Sesuai kebutuhan tugas.' },
      ],
    }),
    buildSppd({
      pemohonId: 'peg-faj', perihal: 'Supervisi Logistik Pemilu ke KPU Kabupaten',
      kegiatan: 'Supervisi kesiapan gudang dan distribusi logistik.',
      kota: 'Cirebon', provinsi: 'Jawa Barat', berangkat: mk(4), kembali: mk(5), transport: 600000,
      akun: '524113', status: 'MENUNGGU_PPK', ageDays: 4, ageHours: 30,
      history: [
        { ts: iso(plusDays(today, -3)), actorId: 'peg-faj', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' },
        { ts: iso(plusDays(today, -2)), actorId: 'peg-ata', role: 'atasan', action: 'Menyetujui', status: 'MENUNGGU_KEUANGAN', note: '' },
        { ts: iso(plusDays(today, -1)), actorId: 'peg-keu', role: 'keuangan', action: 'Memverifikasi anggaran', status: 'MENUNGGU_PPK', note: 'Pagu mencukupi, akun sesuai.' },
      ],
    }),
    buildSppd({
      pemohonId: 'peg-and', perihal: 'Konsinyering Penyusunan Laporan Tahapan Pemilu',
      kegiatan: 'Konsinyering penyusunan laporan evaluasi tahapan.',
      kota: 'Bandung', provinsi: 'Jawa Barat', berangkat: mk(-3), kembali: mk(-1), transport: 0,
      akun: '524114', status: 'TERBIT', ageDays: 8, ageHours: 50,
      documents: { suratTuganNo: '094/ST/PP.05-SD/32/2026', sppdNo: '094/SPD/PP.05-SD/32/2026', tglTerbit: iso(plusDays(today, -5)), qrToken: 'STKPUJABAR-094-2026-7F3A21' },
      history: [
        { ts: iso(plusDays(today, -7)), actorId: 'peg-and', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' },
        { ts: iso(plusDays(today, -7)), actorId: 'peg-ata', role: 'atasan', action: 'Menyetujui', status: 'MENUNGGU_KEUANGAN', note: '' },
        { ts: iso(plusDays(today, -6)), actorId: 'peg-keu', role: 'keuangan', action: 'Memverifikasi anggaran', status: 'MENUNGGU_PPK', note: '' },
        { ts: iso(plusDays(today, -6)), actorId: 'peg-ppk', role: 'ppk', action: 'Menyetujui (teknis & administrasi)', status: 'MENUNGGU_KPA', note: '' },
        { ts: iso(plusDays(today, -5)), actorId: 'peg-kpa', role: 'kpa', action: 'Mengesahkan & menerbitkan dokumen', status: 'TERBIT', note: 'Surat Tugas & SPPD terbit.' },
      ],
    }),
    buildSppd({
      pemohonId: 'peg-rin', perihal: 'Sosialisasi Peraturan KPU kepada Stakeholder',
      kegiatan: 'Sosialisasi PKPU terbaru kepada partai politik & media.',
      kota: 'Yogyakarta', provinsi: 'DI Yogyakarta', berangkat: mk(-12), kembali: mk(-10),
      akun: '524111', status: 'SPJ_MENUNGGU_BENDAHARA', ageDays: 16, ageHours: 28,
      documents: { suratTuganNo: '081/ST/PP.05-SD/32/2026', sppdNo: '081/SPD/PP.05-SD/32/2026', tglTerbit: iso(plusDays(today, -14)), qrToken: 'STKPUJABAR-081-2026-A19C03' },
      pelaksanaan: { checkin: [{ ts: iso(plusDays(today, -12)), lokasi: 'Hotel Grand Yogya', lat: -7.7956, lng: 110.3695, note: 'Tiba di lokasi kegiatan.' }], bukti: [], catatan: 'Kegiatan terlaksana penuh 3 hari.' },
      spj: {
        status: 'DIAJUKAN', laporan: 'Kegiatan sosialisasi berjalan lancar, dihadiri 48 peserta. Seluruh agenda tercapai.',
        realisasi: { uangHarian: 420000 * 3, penginapan: 845000 * 2, transport: 1100000, lainnya: 0 },
        totalRealisasi: 420000 * 3 + 845000 * 2 + 1100000,
        bukti: [
          { kategori: 'Tiket/Boarding Pass', nama: 'boarding-pass.jpg', nominal: 1100000, dataUrl: null },
          { kategori: 'Invoice Hotel', nama: 'invoice-hotel.pdf', nominal: 845000 * 2, dataUrl: null },
          { kategori: 'Daftar Hadir', nama: 'daftar-hadir.pdf', nominal: 0, dataUrl: null },
        ],
        diajukanTs: iso(plusDays(today, -1)),
      },
      history: [
        { ts: iso(plusDays(today, -16)), actorId: 'peg-rin', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' },
        { ts: iso(plusDays(today, -16)), actorId: 'peg-ata', role: 'atasan', action: 'Menyetujui', status: 'MENUNGGU_KEUANGAN', note: '' },
        { ts: iso(plusDays(today, -15)), actorId: 'peg-keu', role: 'keuangan', action: 'Memverifikasi anggaran', status: 'MENUNGGU_PPK', note: '' },
        { ts: iso(plusDays(today, -15)), actorId: 'peg-ppk', role: 'ppk', action: 'Menyetujui', status: 'MENUNGGU_KPA', note: '' },
        { ts: iso(plusDays(today, -14)), actorId: 'peg-kpa', role: 'kpa', action: 'Menerbitkan dokumen', status: 'TERBIT', note: '' },
        { ts: iso(plusDays(today, -1)), actorId: 'peg-rin', role: 'pegawai', action: 'Mengajukan SPJ', status: 'SPJ_MENUNGGU_BENDAHARA', note: '' },
      ],
    }),
    buildSppd({
      pemohonId: 'peg-faj', perihal: 'Rapat Evaluasi Anggaran Triwulan bersama KPU RI',
      kegiatan: 'Evaluasi serapan anggaran triwulan.',
      kota: 'Jakarta Selatan', provinsi: 'DKI Jakarta', berangkat: mk(-25), kembali: mk(-23),
      akun: '524111', status: 'SELESAI', ageDays: 30, ageHours: 120,
      documents: { suratTuganNo: '067/ST/PP.05-SD/32/2026', sppdNo: '067/SPD/PP.05-SD/32/2026', tglTerbit: iso(plusDays(today, -27)), qrToken: 'STKPUJABAR-067-2026-5D8E44' },
      pelaksanaan: { checkin: [{ ts: iso(plusDays(today, -25)), lokasi: 'Kantor KPU RI', lat: -6.2297, lng: 106.8253, note: '' }], bukti: [], catatan: '' },
      spj: {
        status: 'DISETUJUI', laporan: 'Rapat evaluasi selesai, rekomendasi percepatan serapan ditindaklanjuti.',
        realisasi: { uangHarian: 530000 * 3, penginapan: 1490000 * 2, transport: 1450000, lainnya: 0 },
        totalRealisasi: 530000 * 3 + 1490000 * 2 + 1450000,
        bukti: [{ kategori: 'Tiket/Boarding Pass', nama: 'tiket-pp.pdf', nominal: 1450000, dataUrl: null }],
        diajukanTs: iso(plusDays(today, -22)),
      },
      pembayaran: { metode: 'Transfer Bank (LS/GU)', tgl: iso(plusDays(today, -20)), nominal: 530000 * 3 + 1490000 * 2 + 1450000, buktiNo: 'SP2D-2026-0451' },
      history: [
        { ts: iso(plusDays(today, -30)), actorId: 'peg-faj', role: 'pegawai', action: 'Mengajukan', status: 'MENUNGGU_ATASAN', note: '' },
        { ts: iso(plusDays(today, -29)), actorId: 'peg-ata', role: 'atasan', action: 'Menyetujui', status: 'MENUNGGU_KEUANGAN', note: '' },
        { ts: iso(plusDays(today, -29)), actorId: 'peg-keu', role: 'keuangan', action: 'Memverifikasi anggaran', status: 'MENUNGGU_PPK', note: '' },
        { ts: iso(plusDays(today, -28)), actorId: 'peg-ppk', role: 'ppk', action: 'Menyetujui', status: 'MENUNGGU_KPA', note: '' },
        { ts: iso(plusDays(today, -27)), actorId: 'peg-kpa', role: 'kpa', action: 'Menerbitkan dokumen', status: 'TERBIT', note: '' },
        { ts: iso(plusDays(today, -22)), actorId: 'peg-faj', role: 'pegawai', action: 'Mengajukan SPJ', status: 'SPJ_MENUNGGU_BENDAHARA', note: '' },
        { ts: iso(plusDays(today, -21)), actorId: 'peg-ben', role: 'bendahara', action: 'Verifikasi bukti SPJ', status: 'SPJ_MENUNGGU_PPK', note: 'Bukti lengkap & sesuai.' },
        { ts: iso(plusDays(today, -21)), actorId: 'peg-ppk', role: 'ppk', action: 'Menyetujui SPJ', status: 'SPJ_MENUNGGU_KPA', note: '' },
        { ts: iso(plusDays(today, -20)), actorId: 'peg-kpa', role: 'kpa', action: 'Mengesahkan SPJ', status: 'SPJ_DISETUJUI', note: '' },
        { ts: iso(plusDays(today, -20)), actorId: 'peg-ben', role: 'bendahara', action: 'Pembayaran', status: 'SELESAI', note: 'SP2D-2026-0451 terbit.' },
      ],
    }),
  ];

  store.set('sppd', samples);

  // Audit log gabungan dari history seluruh SPPD contoh.
  const audit = [];
  samples.forEach((s) => (s.history || []).forEach((h) =>
    audit.push({ id: uid('log-'), ts: h.ts, actorId: h.actorId, role: h.role, action: h.action, entity: 'SPPD', entityId: s.id, detail: `${s.perihal}${h.note ? ' — ' + h.note : ''}` })
  ));
  audit.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  store.set('audit', audit);

  store.pref('seeded', true);
}
