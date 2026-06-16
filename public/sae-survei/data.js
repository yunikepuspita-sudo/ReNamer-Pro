/* SAE SURVEI · data.js — data contoh untuk prototipe UI (tanpa backend). */

/* 9 unsur IKM (mengacu PermenPANRB 14/2017) + nilai rata-rata (skala 1–4). */
const UNSUR_IKM = [
  { kode: 'U1', nama: 'Persyaratan', nrr: 3.42 },
  { kode: 'U2', nama: 'Sistem, Mekanisme & Prosedur', nrr: 3.28 },
  { kode: 'U3', nama: 'Waktu Penyelesaian', nrr: 3.05 },
  { kode: 'U4', nama: 'Biaya / Tarif', nrr: 3.66 },
  { kode: 'U5', nama: 'Produk Spesifikasi Jenis Layanan', nrr: 3.31 },
  { kode: 'U6', nama: 'Kompetensi Pelaksana', nrr: 3.40 },
  { kode: 'U7', nama: 'Perilaku Pelaksana', nrr: 3.52 },
  { kode: 'U8', nama: 'Penanganan Pengaduan', nrr: 2.94 },
  { kode: 'U9', nama: 'Sarana & Prasarana', nrr: 2.78 }
];

/* Heatmap unit/bidang (skala 0–100). */
const UNIT_SCORES = [
  { unit: 'Sekretariat', skor: 89 },
  { unit: 'Teknis Penyelenggaraan', skor: 84 },
  { unit: 'Hukum & Pengawasan', skor: 91 },
  { unit: 'Data & Informasi', skor: 80 },
  { unit: 'Sosialisasi & Parmas', skor: 86 },
  { unit: 'Keuangan, Umum & Logistik', skor: 74 }
];

/* Tren IKM 6 bulan terakhir. */
const TREND = [
  { bulan: 'Jan', nilai: 81.2 },
  { bulan: 'Feb', nilai: 82.0 },
  { bulan: 'Mar', nilai: 80.6 },
  { bulan: 'Apr', nilai: 83.1 },
  { bulan: 'Mei', nilai: 84.0 },
  { bulan: 'Jun', nilai: 81.9 }
];

/* Daftar survei. */
const SURVEYS = [
  { id: 'ikm-2026', judul: 'Survei Kepuasan Masyarakat (IKM) 2026', tipe: 'IKM', sasaran: 'Masyarakat / Pemohon Layanan', pertanyaan: 11, responden: 1284, status: 'aktif', indeks: 'IKM 81,9 (B)' },
  { id: 'pegawai-2026', judul: 'Survei Kepuasan & Engagement Pegawai', tipe: 'Pegawai', sasaran: 'Pegawai Internal', pertanyaan: 18, responden: 142, status: 'aktif', indeks: 'EEI 78 (Tinggi)' },
  { id: 'stakeholder-2026', judul: 'Survei Kepercayaan Stakeholder', tipe: 'Stakeholder', sasaran: 'Mitra, Vendor, Media, Akademisi', pertanyaan: 12, responden: 96, status: 'aktif', indeks: 'STI 82 (Baik)' },
  { id: 'nps-layanan', judul: 'Net Promoter Score Layanan', tipe: 'NPS', sasaran: 'Pengguna Layanan', pertanyaan: 3, responden: 540, status: 'aktif', indeks: 'NPS +46' },
  { id: 'integritas-2026', judul: 'Survei Integritas Organisasi', tipe: 'Integritas', sasaran: 'Pegawai & Stakeholder', pertanyaan: 15, responden: 0, status: 'draf', indeks: '—' },
  { id: 'rapat-eval', judul: 'Evaluasi Rapat (Integrasi SAE RAPAT)', tipe: 'Kegiatan', sasaran: 'Peserta Rapat', pertanyaan: 6, responden: 38, status: 'terjadwal', indeks: '—' }
];

/* Kuesioner IKM untuk layar "Isi Survei". */
const LIKERT_IKM = ['Tidak Baik', 'Kurang Baik', 'Baik', 'Sangat Baik'];
const IKM_QUESTIONS = UNSUR_IKM.map((u) => ({
  kode: u.kode,
  teks: `Bagaimana penilaian Anda terhadap ${u.nama.toLowerCase()}?`,
  tipe: 'likert'
}));

/* Hasil analitik AI (contoh). */
const COMMENTS = [
  { teks: 'Pelayanan cepat tetapi ruang tunggu kurang nyaman.', positif: ['Pelayanan cepat'], negatif: ['Ruang tunggu'], topik: 'Fasilitas' },
  { teks: 'Petugas ramah dan informatif, sangat membantu.', positif: ['Petugas ramah', 'Informasi jelas'], negatif: [], topik: 'Petugas' },
  { teks: 'Antrian terlalu panjang saat jam sibuk.', positif: [], negatif: ['Antrian panjang'], topik: 'Antrian' },
  { teks: 'Website sering lambat ketika mengunggah dokumen.', positif: [], negatif: ['Website lambat'], topik: 'Website' },
  { teks: 'AC ruang tunggu mati, panas sekali.', positif: [], negatif: ['Fasilitas (AC)'], topik: 'Fasilitas' },
  { teks: 'Prosedur jelas dan mudah diikuti.', positif: ['Prosedur jelas'], negatif: [], topik: 'Informasi' }
];

const TOPICS = [
  { nama: 'Antrian', jumlah: 38, arah: 'naik' },
  { nama: 'Fasilitas', jumlah: 31, arah: 'naik' },
  { nama: 'Petugas', jumlah: 27, arah: 'turun' },
  { nama: 'Website', jumlah: 19, arah: 'naik' },
  { nama: 'Informasi', jumlah: 14, arah: 'stabil' }
];

const SENTIMENT = { positif: 64, netral: 21, negatif: 15 };

const RECOMMENDATIONS = [
  { judul: 'Perbaikan kenyamanan ruang tunggu', alasan: 'Keluhan fasilitas naik 25% (AC & kursi).', prioritas: 'Tinggi' },
  { judul: 'Tambah loket pada jam sibuk (08.00–11.00)', alasan: 'Topik "antrian" meningkat & sentimen negatif terkait waktu tunggu.', prioritas: 'Tinggi' },
  { judul: 'Optimasi unggah dokumen di website', alasan: 'Keluhan "website lambat" muncul berulang pada layanan daring.', prioritas: 'Sedang' },
  { judul: 'Pertahankan & apresiasi keramahan petugas', alasan: 'Sentimen positif "petugas ramah" konsisten tinggi.', prioritas: 'Rendah' }
];

/* Kategori mutu IKM (PermenPANRB). */
function mutuIKM(nilai) {
  if (nilai >= 88.31) return { huruf: 'A', label: 'Sangat Baik', warna: '#16a34a' };
  if (nilai >= 76.61) return { huruf: 'B', label: 'Baik', warna: '#0891b2' };
  if (nilai >= 65.0) return { huruf: 'C', label: 'Kurang Baik', warna: '#d97706' };
  return { huruf: 'D', label: 'Tidak Baik', warna: '#dc2626' };
}
