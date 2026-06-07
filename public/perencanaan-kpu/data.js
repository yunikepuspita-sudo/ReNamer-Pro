/* ============================================================================
 * AI Planning Document Factory — KPU
 * data.js — Knowledge Base Regulasi, Standar Biaya (SBM/SHBJ), data RKA/DIPA,
 *           dan aturan kebutuhan dokumen per sumber anggaran.
 *
 * CATATAN: Angka SBM bersifat indikatif (mengacu pola PMK Standar Biaya
 * Masukan). Selalu verifikasi dengan PMK SBM tahun berjalan sebelum dipakai
 * untuk dokumen resmi.
 * ==========================================================================*/
window.KB = (function () {
  'use strict';

  // ── Sumber anggaran ───────────────────────────────────────────────────────
  // RM = Rupiah Murni (APBN) · HLD = Hibah Langsung Dalam Negeri (HNP 2026)
  const SUMBER = {
    APBN: {
      kode: 'APBN',
      label: 'APBN (Rupiah Murni / RM)',
      sumberDanaKode: 'RM',
      warna: '#1d4ed8',
      dasar: [
        'UU No. 17 Tahun 2003 tentang Keuangan Negara',
        'PMK tentang Standar Biaya Masukan (SBM) TA berjalan',
        'PMK tentang Standar Harga Satuan Regional / SHBJ',
        'Perpres tentang Pengadaan Barang/Jasa Pemerintah',
        'DIPA KPU Provinsi Jawa Barat TA 2026 (RM)',
      ],
      catatan:
        'Belanja bersumber Rupiah Murni mengikuti batas SBM/SHBJ secara ketat. ' +
        'Revisi dan pergeseran mengikuti mekanisme DIPA/POK pada SAKTI.',
    },
    HNP: {
      kode: 'HNP',
      label: 'HNP 2026 (Hibah Langsung Dalam Negeri / HLD)',
      sumberDanaKode: 'HLD',
      register: '22S6FR8A',
      warna: '#047857',
      dasar: [
        'PMK tentang Pengelolaan Hibah Langsung Dalam Negeri',
        'Naskah Perjanjian Hibah Daerah (NPHD) / Perjanjian Hibah',
        'Register Hibah No. 22S6FR8A (KPPN 022 - Bandung I)',
        'Perpres tentang Pengadaan Barang/Jasa Pemerintah',
        'DIPA KPU Provinsi Jawa Barat TA 2026 (Hibah/HLD)',
      ],
      catatan:
        'Belanja hibah (HLD) wajib sesuai peruntukan dalam NPHD dan tercatat pada ' +
        'register hibah. Pengesahan pendapatan & belanja hibah melalui SP2HL/SPHL. ' +
        'Belanja Modal hibah mengikuti SHBJ dan ketentuan PBJ.',
    },
  };

  // ── Data RKA / DIPA KPU Provinsi Jawa Barat TA 2026 (DIPA Rev 8) ────────────
  // Diekstrak dari dokumen "RKA KPU JABAR 2026 - DIPA 8 (30 April 2026)".
  const RKA = {
    satker: 'KPU Provinsi Jawa Barat',
    kodeSatker: '654399',
    kementerian: 'Komisi Pemilihan Umum (076)',
    tahun: 2026,
    dipa: 'DIPA Revisi 8 (30 April 2026)',
    kppn: 'KPPN 022 - Bandung I',
    totalPagu: 25427437000,
    sumber: {
      APBN: 15427437000, // Rupiah Murni
      HNP: 10000000000, // Hibah HNP 2026 (Reg. 22S6FR8A)
    },
    program: [
      { kode: '076.01.WA', nama: 'Program Dukungan Manajemen', pagu: 24082363000 },
      { kode: '076.01.CQ', nama: 'Program Penyelenggaraan Pemilihan Umum', pagu: 1345074000 },
    ],
    // Rincian utama komponen hibah (HNP 2026 / HLD)
    hnpRincian: [
      { kode: 'TA', nama: 'Belanja Barang/Jasa HNP 2026', pagu: 3939612000, akun: '521211/521219/522151' },
      { kode: 'TB', nama: 'Operasional & Administrasi Perkantoran HNP 2026', pagu: 4735388000, akun: '521111/523111/523121' },
      { kode: 'TC', nama: 'Belanja Modal HNP 2026 (Peralatan & Mesin)', pagu: 1325000000, akun: '532111' },
    ],
  };

  // ── Bagan Akun Standar (BAS) — struktur akun belanja pemerintah ────────────
  // Sesuai PMK Bagan Akun Standar. Hierarki: Akun (5) → Kelompok (2 digit) →
  // Jenis (3 digit) → Detil/Akun 6 digit. Hanya cabang Belanja (5) yang relevan
  // untuk perencanaan kegiatan & disusun mendekati BAS resmi + akun pada RKA.
  const BAS = {
    kode: '5',
    nama: 'BELANJA',
    kelompok: [
      {
        kode: '51', nama: 'Belanja Pegawai',
        jenis: [
          {
            kode: '511', nama: 'Belanja Gaji dan Tunjangan',
            akun: [
              { kode: '511111', nama: 'Belanja Gaji Pokok PNS' },
              { kode: '511119', nama: 'Belanja Pembulatan Gaji PNS' },
              { kode: '511121', nama: 'Belanja Tunj. Suami/Istri PNS' },
              { kode: '511122', nama: 'Belanja Tunj. Anak PNS' },
              { kode: '511123', nama: 'Belanja Tunj. Struktural PNS' },
              { kode: '511124', nama: 'Belanja Tunj. Fungsional PNS' },
              { kode: '511126', nama: 'Belanja Tunj. Beras PNS' },
              { kode: '511129', nama: 'Belanja Uang Makan PNS' },
              { kode: '511151', nama: 'Belanja Tunjangan Umum PNS' },
              { kode: '511332', nama: 'Belanja Uang Kehormatan Pejabat Negara' },
              { kode: '511611', nama: 'Belanja Gaji Pokok PPPK' },
              { kode: '511628', nama: 'Belanja Uang Makan PPPK' },
            ],
          },
          {
            kode: '512', nama: 'Belanja Pegawai (Tunjangan Khusus/Kegiatan)',
            akun: [
              { kode: '512411', nama: 'Belanja Pegawai (Tunjangan Khusus/Kegiatan/Kinerja) PNS' },
              { kode: '512414', nama: 'Belanja Pegawai Tunjangan Kinerja PPPK' },
            ],
          },
        ],
      },
      {
        kode: '52', nama: 'Belanja Barang',
        jenis: [
          {
            kode: '521', nama: 'Belanja Barang Operasional & Non-Operasional',
            akun: [
              { kode: '521111', nama: 'Belanja Keperluan Perkantoran' },
              { kode: '521115', nama: 'Belanja Honor Operasional Satuan Kerja' },
              { kode: '521119', nama: 'Belanja Barang Operasional Lainnya' },
              { kode: '521211', nama: 'Belanja Bahan' },
              { kode: '521213', nama: 'Belanja Honor Output Kegiatan' },
              { kode: '521219', nama: 'Belanja Barang Non Operasional Lainnya' },
            ],
          },
          {
            kode: '522', nama: 'Belanja Jasa',
            akun: [
              { kode: '522111', nama: 'Belanja Langganan Listrik' },
              { kode: '522131', nama: 'Belanja Jasa Konsultan' },
              { kode: '522141', nama: 'Belanja Sewa' },
              { kode: '522151', nama: 'Belanja Jasa Profesi (Narasumber/Moderator)' },
              { kode: '522191', nama: 'Belanja Jasa Lainnya' },
            ],
          },
          {
            kode: '523', nama: 'Belanja Pemeliharaan',
            akun: [
              { kode: '523111', nama: 'Belanja Pemeliharaan Gedung dan Bangunan' },
              { kode: '523121', nama: 'Belanja Pemeliharaan Peralatan dan Mesin' },
            ],
          },
          {
            kode: '524', nama: 'Belanja Perjalanan Dinas',
            akun: [
              { kode: '524111', nama: 'Belanja Perjalanan Dinas Biasa' },
              { kode: '524113', nama: 'Belanja Perjalanan Dinas Dalam Kota' },
              { kode: '524114', nama: 'Belanja Perjalanan Dinas Paket Meeting Dalam Kota' },
              { kode: '524119', nama: 'Belanja Perjalanan Dinas Paket Meeting Luar Kota' },
            ],
          },
        ],
      },
      {
        kode: '53', nama: 'Belanja Modal',
        jenis: [
          { kode: '531', nama: 'Belanja Modal Tanah', akun: [{ kode: '531111', nama: 'Belanja Modal Tanah' }] },
          { kode: '532', nama: 'Belanja Modal Peralatan dan Mesin', akun: [{ kode: '532111', nama: 'Belanja Modal Peralatan dan Mesin' }] },
          { kode: '533', nama: 'Belanja Modal Gedung dan Bangunan', akun: [{ kode: '533111', nama: 'Belanja Modal Gedung dan Bangunan' }] },
          { kode: '536', nama: 'Belanja Modal Lainnya', akun: [{ kode: '536111', nama: 'Belanja Modal Lainnya' }] },
        ],
      },
    ],
  };

  // Peta datar kode akun → nama (diturunkan dari BAS) untuk lookup cepat.
  const AKUN = (function () {
    const m = {};
    BAS.kelompok.forEach((k) => k.jenis.forEach((j) => j.akun.forEach((a) => { m[a.kode] = a.nama; })));
    return m;
  })();

  // ── Standar Biaya Masukan (indikatif, pola PMK SBM) ────────────────────────
  // Nilai dalam Rupiah. satuan: OJ=Orang/Jam, OH=Orang/Hari, OK=Orang/Kegiatan,
  // OP=Orang/Paket, Keg=Kegiatan.
  const SBM = {
    // Honorarium narasumber/pembahas (per orang/jam)
    narasumber_menteri: { label: 'Honor Narasumber — Menteri/setingkat', satuan: 'OJ', max: 1700000, akun: '522151' },
    narasumber_es1: { label: 'Honor Narasumber — Pejabat Eselon I/setara', satuan: 'OJ', max: 1400000, akun: '522151' },
    narasumber_es2: { label: 'Honor Narasumber — Pejabat Eselon II/setara', satuan: 'OJ', max: 1000000, akun: '522151' },
    narasumber_es3: { label: 'Honor Narasumber — Eselon III ke bawah/Praktisi', satuan: 'OJ', max: 900000, akun: '522151' },
    moderator: { label: 'Honor Moderator', satuan: 'OK', max: 700000, akun: '522151' },
    pembawa_acara: { label: 'Honor Pembawa Acara/MC', satuan: 'OK', max: 400000, akun: '521213' },
    // Honorarium panitia (per orang/kegiatan)
    panitia_pengarah: { label: 'Honor Panitia — Pengarah', satuan: 'OK', max: 450000, akun: '521213' },
    panitia_penanggungjawab: { label: 'Honor Panitia — Penanggung Jawab', satuan: 'OK', max: 450000, akun: '521213' },
    panitia_ketua: { label: 'Honor Panitia — Ketua/Wakil Ketua', satuan: 'OK', max: 400000, akun: '521213' },
    panitia_sekretaris: { label: 'Honor Panitia — Sekretaris', satuan: 'OK', max: 300000, akun: '521213' },
    panitia_anggota: { label: 'Honor Panitia — Anggota', satuan: 'OK', max: 300000, akun: '521213' },
    // Uang harian & paket meeting (Provinsi Jawa Barat, indikatif)
    uang_harian_fullboard: { label: 'Uang Harian Paket Fullboard Dalam Kota', satuan: 'OH', max: 130000, akun: '524114' },
    uang_harian_fullday: { label: 'Uang Harian Paket Fullday/Halfday Dalam Kota', satuan: 'OH', max: 110000, akun: '524114' },
    uang_harian_perjadin: { label: 'Uang Harian Perjalanan Dinas (Prov. Jawa Barat)', satuan: 'OH', max: 430000, akun: '524111' },
    uang_saku_rdk: { label: 'Uang Saku Rapat Dalam Kantor (RDK)', satuan: 'OK', max: 400000, akun: '521213' },
    paket_fullboard: { label: 'Paket Meeting Fullboard (Prov. Jawa Barat)', satuan: 'OH', max: 600000, akun: '524114' },
    paket_fullday: { label: 'Paket Meeting Fullday (Prov. Jawa Barat)', satuan: 'OH', max: 380000, akun: '524114' },
    paket_halfday: { label: 'Paket Meeting Halfday (Prov. Jawa Barat)', satuan: 'OH', max: 240000, akun: '524114' },
    // Konsumsi rapat (per orang/kali)
    konsumsi_makan: { label: 'Konsumsi Rapat — Makan', satuan: 'OK', max: 65000, akun: '521211' },
    konsumsi_snack: { label: 'Konsumsi Rapat — Snack/Kudapan', satuan: 'OK', max: 22000, akun: '521211' },
    // Transport
    transport_lokal: { label: 'Transport Lokal/Kegiatan Dalam Kota', satuan: 'OK', max: 150000, akun: '524113' },
    // Bahan/ATK & cetak
    atk_paket: { label: 'ATK & Bahan Pendukung', satuan: 'Keg', max: null, akun: '521211' },
    spanduk: { label: 'Spanduk/Backdrop Kegiatan', satuan: 'Keg', max: null, akun: '521211' },
    penggandaan: { label: 'Penggandaan/Cetak Materi', satuan: 'OP', max: null, akun: '521211' },
  };

  // ── Knowledge Base Regulasi ────────────────────────────────────────────────
  const REGULASI = {
    nasional: [
      'UU No. 7 Tahun 2017 tentang Pemilihan Umum (jo. perubahannya)',
      'UU No. 17 Tahun 2003 tentang Keuangan Negara',
      'UU No. 1 Tahun 2004 tentang Perbendaharaan Negara',
      'UU No. 5 Tahun 2014 tentang Aparatur Sipil Negara',
      'Perpres tentang Pengadaan Barang/Jasa Pemerintah',
      'PMK tentang Standar Biaya Masukan (SBM) TA berjalan',
      'Perpres No. 95 Tahun 2018 tentang Sistem Pemerintahan Berbasis Elektronik (SPBE)',
    ],
    internal: [
      'Peraturan KPU (PKPU) terkait tahapan & tata kelola',
      'Keputusan KPU tentang Pedoman Teknis',
      'SOP Sekretariat KPU Provinsi Jawa Barat',
    ],
  };

  // ── Aturan penentu kebutuhan dokumen (AI Requirement Analyzer) ─────────────
  // Jenis kegiatan menentukan template RAB & dokumen yang diperlukan.
  const JENIS_KEGIATAN = {
    bimtek: { label: 'Bimbingan Teknis / Pelatihan', pola: 'fullday' },
    sosialisasi: { label: 'Sosialisasi / Penyuluhan', pola: 'fullday' },
    rakor: { label: 'Rapat Koordinasi / Konsinyering', pola: 'fullboard' },
    fgd: { label: 'FGD / Diskusi Terbatas', pola: 'halfday' },
    rdk: { label: 'Rapat Dalam Kantor (RDK)', pola: 'rdk' },
    pengadaan: { label: 'Pengadaan Barang/Jasa (Belanja Modal)', pola: 'pengadaan' },
  };

  return { SUMBER, RKA, AKUN, BAS, SBM, REGULASI, JENIS_KEGIATAN };
})();
