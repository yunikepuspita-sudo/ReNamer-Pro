/* SIARIP KPU — Data seed (prototipe, data ilustratif)
 * Mengacu pada:
 *  - Keputusan KPU No. 57/2022 (Kode Klasifikasi Arsip & Pengkodean Naskah Dinas)
 *  - PKPU No. 17/2023 (Jadwal Retensi Arsip KPU)
 *  - PKPU No. 13/2019 (JRA Kepegawaian & Keuangan)
 *  - Keputusan KPU No. 1258/2024 (Pengelolaan Arsip Terjaga)
 * Catatan: angka & kode bersifat ilustratif untuk demonstrasi sistem.
 */
window.SIARIP = (function () {
  // ── Profil & target nasional ────────────────────────────────────────────
  const nasional = {
    totalArsip: 12_500_000,
    sudahDigital: 9_250_000,
    targetProvinsi: { nama: 'KPU Provinsi Jawa Barat', target: 250_000, progress: 78 },
  };

  // ── Sub bagian (Dashboard Provinsi) ─────────────────────────────────────
  const subbagian = [
    { nama: 'Perencanaan', kode: 'PR', persen: 95, kategori: 'Fasilitatif' },
    { nama: 'Keuangan', kode: 'KU', persen: 88, kategori: 'Fasilitatif' },
    { nama: 'SDM', kode: 'KP', persen: 82, kategori: 'Fasilitatif' },
    { nama: 'Hukum', kode: 'HK', persen: 79, kategori: 'Fasilitatif' },
    { nama: 'Teknis Pemilu', kode: 'TP', persen: 76, kategori: 'Substantif' },
    { nama: 'Parmas', kode: 'PS', persen: 72, kategori: 'Substantif' },
    { nama: 'Data & Informasi', kode: 'DP', persen: 70, kategori: 'Substantif' },
    { nama: 'Logistik', kode: 'LO', persen: 68, kategori: 'Substantif' },
    { nama: 'Umum', kode: 'TU', persen: 63, kategori: 'Fasilitatif' },
  ];

  // ── Klasifikasi arsip (Kep. KPU 57/2022) ────────────────────────────────
  const klasifikasi = {
    Fasilitatif: [
      { kode: 'PR', nama: 'Perencanaan' },
      { kode: 'HK', nama: 'Hukum' },
      { kode: 'OT', nama: 'Organisasi' },
      { kode: 'TU', nama: 'Ketatausahaan' },
      { kode: 'KA', nama: 'Kearsipan' },
      { kode: 'RT', nama: 'Kerumahtanggaan' },
      { kode: 'HM', nama: 'Kehumasan' },
      { kode: 'TI', nama: 'Teknologi Informasi & Komunikasi' },
      { kode: 'KP', nama: 'Kepegawaian' },
      { kode: 'KU', nama: 'Keuangan' },
    ],
    Substantif: [
      { kode: 'PM', nama: 'Pemilu' },
      { kode: 'PL', nama: 'Pemilihan' },
      { kode: 'LO', nama: 'Logistik' },
      { kode: 'DP', nama: 'Data Pemilih' },
      { kode: 'TP', nama: 'Teknis Penyelenggaraan' },
      { kode: 'SO', nama: 'Sosialisasi' },
      { kode: 'PS', nama: 'Partisipasi Masyarakat' },
    ],
  };

  // ── Jadwal Retensi Arsip (ilustratif, mengacu PKPU 17/2023 & 13/2019) ────
  // aktif & inaktif dalam tahun; nasibAkhir: 'Musnah' | 'Permanen' | 'Dinilai Kembali'
  const jra = [
    { kode: 'KU', uraian: 'Pertanggungjawaban Keuangan (SPJ, kuitansi)', aktif: 2, inaktif: 8, nasibAkhir: 'Musnah', terjaga: false },
    { kode: 'KU', uraian: 'Laporan Keuangan Tahunan (audited)', aktif: 5, inaktif: 5, nasibAkhir: 'Permanen', terjaga: false },
    { kode: 'KP', uraian: 'Berkas Perorangan Pegawai (file kepegawaian)', aktif: 0, inaktif: 1, nasibAkhir: 'Dinilai Kembali', terjaga: false, catatan: 'inaktif s.d. pegawai pensiun + 1 th' },
    { kode: 'KP', uraian: 'SK Pengangkatan / Kepangkatan', aktif: 2, inaktif: 3, nasibAkhir: 'Permanen', terjaga: false },
    { kode: 'PR', uraian: 'Dokumen Perencanaan (Renstra, Renja, RKA-KL)', aktif: 2, inaktif: 3, nasibAkhir: 'Permanen', terjaga: false },
    { kode: 'HK', uraian: 'Produk Hukum / Keputusan KPU', aktif: 5, inaktif: 5, nasibAkhir: 'Permanen', terjaga: false },
    { kode: 'TU', uraian: 'Surat-menyurat / Naskah Dinas rutin', aktif: 2, inaktif: 3, nasibAkhir: 'Musnah', terjaga: false },
    { kode: 'PM', uraian: 'Hasil Pemilu (rekapitulasi, penetapan)', aktif: 5, inaktif: 0, nasibAkhir: 'Permanen', terjaga: true },
    { kode: 'PM', uraian: 'Berita Acara & Sertifikat Hasil (Formulir C/D)', aktif: 5, inaktif: 0, nasibAkhir: 'Permanen', terjaga: true },
    { kode: 'DP', uraian: 'Daftar Pemilih Tetap (DPT)', aktif: 5, inaktif: 0, nasibAkhir: 'Permanen', terjaga: true },
    { kode: 'LO', uraian: 'Pengadaan & Distribusi Logistik Pemilu', aktif: 2, inaktif: 8, nasibAkhir: 'Dinilai Kembali', terjaga: false },
    { kode: 'TP', uraian: 'Teknis Penyelenggaraan (PKPU teknis, juknis)', aktif: 3, inaktif: 2, nasibAkhir: 'Permanen', terjaga: false },
    { kode: 'SO', uraian: 'Bahan Sosialisasi & Kehumasan', aktif: 2, inaktif: 3, nasibAkhir: 'Musnah', terjaga: false },
    { kode: 'PS', uraian: 'Partisipasi Masyarakat / Relawan Demokrasi', aktif: 2, inaktif: 3, nasibAkhir: 'Musnah', terjaga: false },
  ];

  // ── Satker KPU Kab/Kota se-Jawa Barat (27) ──────────────────────────────
  const satkerNames = [
    'KPU Kota Bandung', 'KPU Kota Bekasi', 'KPU Kab. Bandung', 'KPU Kota Depok',
    'KPU Kota Cimahi', 'KPU Kota Bogor', 'KPU Kab. Sumedang', 'KPU Kab. Bandung Barat',
    'KPU Kota Cirebon', 'KPU Kab. Bekasi', 'KPU Kab. Bogor', 'KPU Kab. Karawang',
    'KPU Kota Sukabumi', 'KPU Kab. Purwakarta', 'KPU Kab. Cirebon', 'KPU Kab. Subang',
    'KPU Kota Tasikmalaya', 'KPU Kab. Indramayu', 'KPU Kab. Majalengka', 'KPU Kab. Kuningan',
    'KPU Kab. Cianjur', 'KPU Kab. Sukabumi', 'KPU Kab. Garut', 'KPU Kab. Ciamis',
    'KPU Kota Banjar', 'KPU Kab. Tasikmalaya', 'KPU Kab. Pangandaran',
  ];
  const satkerPersen = [98, 96, 94, 93, 91, 90, 88, 87, 85, 84, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 69, 67, 65, 63, 61];

  // deterministic pseudo-random untuk angka pendukung agar konsisten antar reload
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

  const satker = satkerNames.map((nama, i) => {
    const persen = satkerPersen[i];
    const fisik = 6000 + Math.round(rnd() * 9000);
    const digital = Math.round((fisik * persen) / 100);
    return {
      nama,
      persen,
      fisik,
      digital,
      belum: fisik - digital,
      terjaga: Math.round(digital * (0.06 + rnd() * 0.04)),
      permanen: Math.round(digital * (0.10 + rnd() * 0.05)),
      musnah: Math.round(digital * (0.04 + rnd() * 0.03)),
      retensiHabis: Math.round(digital * (0.05 + rnd() * 0.04)),
      tanpaMetadata: Math.round((fisik - digital) * (0.2 + rnd() * 0.2)),
    };
  });

  // ── Sampel arsip pada Repository ────────────────────────────────────────
  const arsip = [
    { id: 'ARS-2024-00187', judul: 'Surat Pertanggungjawaban Honor Adhoc PPK Pemilu 2024', jenis: 'Surat Dinas', subbagian: 'Keuangan', kode: 'KU.02.03', tahun: 2024, status: 'Aktif', terjaga: false, metadata: true },
    { id: 'ARS-2024-00451', judul: 'Berita Acara Rekapitulasi Hasil Penghitungan Suara Tingkat Provinsi', jenis: 'Berita Acara', subbagian: 'Teknis Pemilu', kode: 'PM.05.01', tahun: 2024, status: 'Permanen', terjaga: true, metadata: true },
    { id: 'ARS-2024-00622', judul: 'Daftar Pemilih Tetap (DPT) Pemilu 2024 Kota Bandung', jenis: 'Daftar', subbagian: 'Data & Informasi', kode: 'DP.03.02', tahun: 2024, status: 'Permanen', terjaga: true, metadata: true },
    { id: 'ARS-2023-01180', judul: 'Keputusan KPU tentang Tahapan dan Jadwal Pemilu', jenis: 'Keputusan', subbagian: 'Hukum', kode: 'HK.01.01', tahun: 2023, status: 'Permanen', terjaga: false, metadata: true },
    { id: 'ARS-2022-00934', judul: 'Renstra KPU Provinsi Jawa Barat 2020-2024', jenis: 'Dokumen Perencanaan', subbagian: 'Perencanaan', kode: 'PR.01.02', tahun: 2022, status: 'Inaktif', terjaga: false, metadata: true },
    { id: 'ARS-2024-00788', judul: 'Berita Acara Distribusi Logistik Surat Suara ke PPK', jenis: 'Berita Acara', subbagian: 'Logistik', kode: 'LO.02.04', tahun: 2024, status: 'Aktif', terjaga: false, metadata: true },
    { id: 'ARS-2019-00302', judul: 'SPJ Belanja Sosialisasi Pemilu 2019', jenis: 'Surat Dinas', subbagian: 'Keuangan', kode: 'KU.02.03', tahun: 2019, status: 'Inaktif', terjaga: false, metadata: false },
    { id: 'ARS-2014-00045', judul: 'Pertanggungjawaban Honor Pemilu Legislatif 2014', jenis: 'Surat Dinas', subbagian: 'Keuangan', kode: 'KU.02.03', tahun: 2014, status: 'Musnah', terjaga: false, metadata: true },
    { id: 'ARS-2024-00955', judul: 'Bahan Sosialisasi & Pendidikan Pemilih Pilkada 2024', jenis: 'Materi', subbagian: 'Parmas', kode: 'SO.02.01', tahun: 2024, status: 'Aktif', terjaga: false, metadata: true },
    { id: 'ARS-2023-00671', judul: 'SK Pengangkatan Pegawai Non-PNS Sekretariat', jenis: 'Keputusan', subbagian: 'SDM', kode: 'KP.01.03', tahun: 2023, status: 'Aktif', terjaga: false, metadata: true },
    { id: 'ARS-2024-01002', judul: 'Formulir Model C.Hasil Pemilihan Presiden TPS', jenis: 'Formulir', subbagian: 'Teknis Pemilu', kode: 'PM.05.02', tahun: 2024, status: 'Permanen', terjaga: true, metadata: true },
    { id: 'ARS-2021-00510', judul: 'Surat Undangan Rapat Koordinasi Internal', jenis: 'Surat Dinas', subbagian: 'Umum', kode: 'TU.01.01', tahun: 2021, status: 'Inaktif', terjaga: false, metadata: false },
  ];

  // ── Ekosistem integrasi ─────────────────────────────────────────────────
  const integrasi = {
    induk: 'SRIKANDI (Aplikasi Umum Bidang Kearsipan Dinamis)',
    sistem: [
      { nama: 'E-Office', ket: 'Persuratan & naskah dinas elektronik', status: 'Terhubung' },
      { nama: 'E-SPPD', ket: 'Surat perjalanan dinas', status: 'Terhubung' },
      { nama: 'E-Kinerja', ket: 'Penilaian kinerja pegawai', status: 'Terhubung' },
      { nama: 'SIPPBJ', ket: 'Pengadaan barang & jasa', status: 'Terhubung' },
      { nama: 'E-Planning', ket: 'Perencanaan & anggaran', status: 'Terhubung' },
      { nama: 'E-Monev', ket: 'Monitoring & evaluasi program', status: 'Terhubung' },
      { nama: 'JDIH', ket: 'Dokumentasi & informasi hukum', status: 'Terhubung' },
      { nama: 'Website KPU', ket: 'Publikasi & layanan informasi publik', status: 'Terhubung' },
    ],
  };

  // ── KPI utama (Dashboard) ───────────────────────────────────────────────
  const totDigital = satker.reduce((a, s) => a + s.digital, 0);
  const totFisik = satker.reduce((a, s) => a + s.fisik, 0);
  const kpi = {
    ikkd: 3.4, // Indeks Kematangan Kearsipan Digital (skala 1-5)
    kepatuhanJRA: 86, // %
    temuKembaliDetik: 4.2, // rata-rata detik
    tanpaMetadata: satker.reduce((a, s) => a + s.tanpaMetadata, 0),
    retensiHabis: satker.reduce((a, s) => a + s.retensiHabis, 0),
    permanen: satker.reduce((a, s) => a + s.permanen, 0),
    terjaga: satker.reduce((a, s) => a + s.terjaga, 0),
    belum: totFisik - totDigital,
    progresProvinsi: Math.round((totDigital / totFisik) * 100),
  };

  return { nasional, subbagian, klasifikasi, jra, satker, arsip, integrasi, kpi };
})();
