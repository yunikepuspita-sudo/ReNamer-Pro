/* ============================================================================
 * AI Planning Document Factory — KPU · templates.js
 * Blueprint dokumen contoh KPU Jawa Barat (hasil pembelajaran dari dokumen
 * nyata yang diunggah): Nota Dinas, KAK Pengadaan (Penyedia), KAK Swakelola,
 * dan Kontrak Swakelola. Dipakai sebagai:
 *   1) Acuan struktur generator template (tanpa AI).
 *   2) Grounding (few-shot) untuk mode AI agar gaya & format sesuai KPU.
 * ==========================================================================*/
window.TPL = (function () {
  'use strict';

  // Format nomor Nota Dinas KPU (mengacu contoh: PP.05-ND/32/.../...).
  const NOMOR = {
    notaDinas: (seq, romawiBln, thn) => `${seq}/PP.05-ND/32/${romawiBln}/${thn}`,
    kak: (seq, thn) => `${seq}/PL.02-KAK/32/${thn}`,
    sk: (seq, thn) => `${seq}/PP.04-Kpt/32/${thn}`,
    spt: (seq, thn) => `${seq}/PP.05-ST/32/${thn}`,
    kontrak: (seq, thn) => `${seq}/SPK-SWKL/32/${thn}`,
  };
  const ROMAWI = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  // ── Blueprint terstruktur (urutan bagian per jenis dokumen) ────────────────
  const BLUEPRINT = {
    nota_dinas: {
      judul: 'NOTA DINAS',
      sumber: 'Nota Dinas Penataan Staf ASN Sekretariat KPU se-Jawa Barat',
      bagian: ['Kepala (Yth/Dari/Tanggal/Sifat/Lampiran/Hal)', 'Dasar', 'Maksud dan Tujuan', 'Ruang Lingkup', 'Metodologi/Uraian', 'Penutup'],
      contohDasar: [
        'Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara',
        'Peraturan KPU Nomor 14 Tahun 2020 jo. PKPU Nomor 21 Tahun 2023 tentang Tugas, Fungsi, Susunan Organisasi, dan Tata Kerja Sekretariat',
        'Keputusan Sekretaris Jenderal KPU Nomor 464 Tahun 2024 tentang Peta Jabatan',
      ],
    },
    kak_pengadaan: {
      judul: 'KERANGKA ACUAN KERJA (KAK) — PENGADAAN MELALUI PENYEDIA',
      sumber: 'KAK/RAB Pengadaan Jasa Penyempurnaan & Operasionalisasi Aplikasi SAE PISAN',
      bagian: [
        'Latar Belakang', 'Maksud dan Tujuan', 'Sasaran', 'Dasar Hukum',
        'Ruang Lingkup Pekerjaan (Fungsional/Teknis/Non-Fungsional)', 'Keluaran (Deliverables)',
        'Jangka Waktu Pelaksanaan', 'Tenaga Ahli yang Dibutuhkan', 'Indikator Keberhasilan',
        'Lokasi Pekerjaan', 'Sumber Pendanaan', 'Strategi Pengadaan', 'Penutup', 'Lembar Pengesahan (PPK & KPA)',
      ],
      contohDasar: [
        'Undang-Undang Nomor 7 Tahun 2017 tentang Pemilihan Umum',
        'Peraturan Presiden Nomor 16 Tahun 2018 jo. Perpres Nomor 12 Tahun 2021 tentang Pengadaan Barang/Jasa Pemerintah',
        'Peraturan LKPP Nomor 12 Tahun 2021 tentang Pedoman Pelaksanaan PBJ melalui Penyedia',
        'Peraturan Menteri Keuangan Nomor 32 Tahun 2025 tentang Standar Biaya Masukan TA 2026',
      ],
      strategi: 'Nilai ≤ Rp 200 juta (barang/jasa lainnya) atau ≤ Rp 100 juta (jasa konsultansi): Pengadaan Langsung. Di atas itu: Tender/Seleksi (Perpres 16/2018 jo. 12/2021).',
    },
    kak_swakelola: {
      judul: 'KERANGKA ACUAN KERJA (KAK) — SWAKELOLA',
      sumber: 'KAK Swakelola Tipe I (contoh Bimbingan Teknis)',
      bagian: [
        'Uraian Pendahuluan (Latar Belakang)', 'Maksud dan Tujuan', 'Sasaran', 'Lokasi Pekerjaan',
        'Nilai dan Sumber Pendanaan', 'Nama & Organisasi PPK', 'Data Penunjang (Data Dasar/Standar Teknis/Referensi Hukum)',
        'Ruang Lingkup (Lingkup Pekerjaan)', 'Keluaran/Output', 'Peralatan & Personel (PPK & Pelaksana Swakelola)',
        'Jangka Waktu Penyelesaian', 'Organisasi & Personel Tim Pelaksana', 'Jadwal Tahapan',
        'Hal-Hal Lain (Produk Dalam Negeri/UMKK, Alih Pengetahuan)', 'Pengesahan oleh PPK',
      ],
      tipeSwakelola: {
        I: 'Tipe I — direncanakan, dilaksanakan, & diawasi oleh K/L/PD penanggung jawab anggaran sendiri.',
        II: 'Tipe II — dilaksanakan oleh K/L/PD lain pelaksana swakelola.',
        III: 'Tipe III — dilaksanakan oleh Ormas.',
        IV: 'Tipe IV — dilaksanakan oleh Kelompok Masyarakat.',
      },
    },
    kontrak_swakelola: {
      judul: 'KONTRAK SWAKELOLA — POKOK PERJANJIAN',
      sumber: 'Kontrak Swakelola Tipe IV (contoh)',
      bagian: [
        'Identitas Para Pihak (Pejabat Penandatangan Kontrak & Pelaksana Swakelola)', 'Mengingat Bahwa',
        'Nilai Kontrak', 'Hirarki Dokumen Kontrak', 'Hak & Kewajiban Para Pihak', 'Pembayaran (SSKK)', 'Masa Berlaku',
        'Tanda Tangan Para Pihak',
      ],
      hirarki: ['Adendum Kontrak (bila ada)', 'Pokok Perjanjian', 'SSUK', 'SSKK', 'KAK', 'RAB', 'Proposal', 'Dokumen lain terkait'],
    },
  };

  return { NOMOR, ROMAWI, BLUEPRINT };
})();
