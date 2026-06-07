/* ============================================================================
 * SiPINTER KPU — Sistem Pembelajaran Integratif, Terstruktur & Berjenjang
 * (alias ELSA — Election Learning & Succession Academy)
 * data.js — Kurikulum berjenjang + Knowledge Base + metadata arsitektur.
 *
 * Election Knowledge & Competency Platform yang mengintegrasikan pembelajaran,
 * sertifikasi, manajemen pengetahuan, dan succession planning secara berjenjang
 * (10 tier penyelenggara → masyarakat) di atas alur 7 tahap Tiered Facilitation
 * Model (Policy Brief Pusbang & Strategi Kebijakan, Talenta ASN Nasional).
 * Kerangka fitur LMS mengadopsi pola Frappe LMS.
 *
 * CATATAN: prototipe edukatif. Angka/kutipan kasus disusun ulang untuk belajar;
 * verifikasi ke sumber resmi (DKPP, MK, JDIH KPU) sebelum penggunaan kelembagaan.
 * ==========================================================================*/
window.LMS = (function () {
  'use strict';

  const PLATFORM = {
    nama: 'SiPINTER KPU',
    panjang: 'Sistem Pembelajaran Integratif, Terstruktur & Berjenjang KPU',
    alias: 'ELSA — Election Learning & Succession Academy',
    tagline: 'Election Knowledge & Competency Platform',
  };

  /* ── KELOMPOK JENJANG (Tiered Competency Engine) ─────────────────────────
   * Menentukan kedalaman alur (stage) yang relevan untuk tiap kelompok. */
  const STAGE_IDS_ALL = ['orientasi', 'strategis', 'peer', 'etika', 'adaptif', 'km', 'refleksi'];
  const GROUPS = {
    komisioner: { label: 'Komisioner', warna: '#1d4ed8', stages: STAGE_IDS_ALL },
    sekretariat: { label: 'Sekretariat', warna: '#0369a1', stages: ['orientasi', 'strategis', 'etika', 'adaptif', 'km'] },
    adhoc: { label: 'Badan Ad Hoc', warna: '#047857', stages: ['orientasi', 'strategis', 'etika', 'adaptif'] },
    publik: { label: 'Publik & Relawan', warna: '#b45309', stages: ['orientasi', 'strategis', 'adaptif'] },
  };

  /* ── 10 TIER (audience / competency level) ───────────────────────────────*/
  const TIERS = {
    'kom-ri': { id: 'kom-ri', no: 1, group: 'komisioner', label: 'Komisioner KPU RI', short: 'KPU RI',
      fokus: 'Kepemimpinan strategis & visioner nasional',
      ringkas: 'Desain kebijakan pemilu nasional, tata kelola data pemilih skala besar, penetapan hasil, manajemen krisis, dan komunikasi publik nasional.' },
    'kom-prov': { id: 'kom-prov', no: 2, group: 'komisioner', label: 'Komisioner KPU/KIP Provinsi', short: 'KPU Prov',
      fokus: 'Kepemimpinan operasional regional',
      ringkas: 'Sinkronisasi kebijakan pusat–daerah, pengelolaan konflik kepemiluan regional, dan koordinasi lintas kabupaten/kota.' },
    'kom-kab': { id: 'kom-kab', no: 3, group: 'komisioner', label: 'Komisioner KPU/KIP Kabupaten/Kota', short: 'KPU Kab',
      fokus: 'Kepemimpinan operasional lapangan',
      ringkas: 'Operasional strategis: logistik, pemutakhiran data pemilih, dan dinamika sosial-politik lokal.' },
    'set-prov': { id: 'set-prov', no: 4, group: 'sekretariat', label: 'Sekretariat KPU Provinsi', short: 'Set Prov',
      fokus: 'Dukungan teknis & tata kelola anggaran provinsi',
      ringkas: 'Tata kelola anggaran, administrasi, dan dukungan teknis penyelenggaraan tingkat provinsi.' },
    'set-kab': { id: 'set-kab', no: 5, group: 'sekretariat', label: 'Sekretariat KPU Kabupaten/Kota', short: 'Set Kab',
      fokus: 'Dukungan administrasi & logistik kab/kota',
      ringkas: 'Administrasi, logistik, tata naskah, dan kepegawaian penyelenggaraan tingkat kabupaten/kota.' },
    'ppk': { id: 'ppk', no: 6, group: 'adhoc', label: 'PPK (Panitia Pemilihan Kecamatan)', short: 'PPK',
      fokus: 'Koordinasi & rekapitulasi tingkat kecamatan',
      ringkas: 'Supervisi PPS, rekapitulasi tingkat kecamatan, dan koordinasi logistik wilayah kecamatan.' },
    'pps': { id: 'pps', no: 7, group: 'adhoc', label: 'PPS (Panitia Pemungutan Suara)', short: 'PPS',
      fokus: 'Pemutakhiran data & pembentukan KPPS',
      ringkas: 'Pemutakhiran data pemilih (Coklit), pembentukan & bimbingan KPPS, dan pelayanan di tingkat desa/kelurahan.' },
    'kpps': { id: 'kpps', no: 8, group: 'adhoc', label: 'KPPS (Kelompok Penyelenggara Pemungutan Suara)', short: 'KPPS',
      fokus: 'Pemungutan & penghitungan suara di TPS',
      ringkas: 'Tata cara pemungutan, penghitungan suara, dan administrasi formulir hasil di TPS.' },
    'relawan': { id: 'relawan', no: 9, group: 'publik', label: 'Relawan Demokrasi', short: 'Relawan',
      fokus: 'Sosialisasi & pendidikan pemilih',
      ringkas: 'Sosialisasi tahapan, pendidikan pemilih segmen, dan literasi digital anti-hoaks di masyarakat.' },
    'masyarakat': { id: 'masyarakat', no: 10, group: 'publik', label: 'Masyarakat Umum', short: 'Publik',
      fokus: 'Literasi kepemiluan warga',
      ringkas: 'Hak pilih, cara memilih, mengenali hoaks pemilu, dan partisipasi demokratis.' },
  };
  function tierStages(tier) { return GROUPS[TIERS[tier].group].stages; }
  function tierColor(tier) { return GROUPS[TIERS[tier].group].warna; }

  /* ── KERANGKA KOMPETENSI (8 domain inti) ─────────────────────────────────*/
  const KOMPETENSI = [
    { id: 'hukum', label: 'Hukum & Regulasi Pemilu', icon: '⚖️', desc: 'Penafsiran UU/PKPU, sengketa, dan konsekuensi konstitusional keputusan.' },
    { id: 'kebijakan', label: 'Analisis Kebijakan', icon: '🧭', desc: 'Perumusan, pengujian rasionalitas, dan inovasi kebijakan kepemiluan.' },
    { id: 'kepemimpinan', label: 'Kepemimpinan & Keputusan Kolektif', icon: '👥', desc: 'Kepemimpinan kolektif-kolegial & pengambilan keputusan strategis.' },
    { id: 'risiko', label: 'Manajemen Risiko & Krisis', icon: '🛡️', desc: 'Antisipasi sengketa, manajemen krisis, dan keputusan di bawah tekanan.' },
    { id: 'komunikasi', label: 'Komunikasi Publik', icon: '📢', desc: 'Komunikasi publik, manajemen disinformasi, dan kepercayaan publik.' },
    { id: 'digital', label: 'Teknologi & Digitalisasi Pemilu', icon: '💻', desc: 'Tata kelola sistem informasi, data pemilih, dan demokrasi digital.' },
    { id: 'etika', label: 'Etika, Integritas & Independensi', icon: '🕊️', desc: 'Kesadaran moral, konflik kepentingan, dan akuntabilitas publik.' },
    { id: 'global', label: 'Wawasan Global & Inovasi', icon: '🌐', desc: 'Tren demokrasi elektoral global & pembelajaran lintas negara.' },
  ];

  /* ── FASILITATOR (critical partner / critical enabler) ───────────────────*/
  const FASILITATOR = [
    { id: 'mantan-pusat', icon: '🏛️', label: 'Mantan Komisioner KPU Pusat', peran: 'Senior statesperson / elder of democracy',
      groups: ['komisioner'],
      desc: 'Penjaga nilai, arah kelembagaan, dan memori institusional. Mentoring strategis & transfer pengetahuan lintas periode. Bukan instruktur teknis.' },
    { id: 'akademisi', icon: '🎓', label: 'Akademisi Pemilu & Demokrasi (Non-Partisan)', peran: 'Critical friend / fasilitator konseptual',
      groups: ['komisioner', 'sekretariat', 'adhoc'],
      desc: 'Memberi kerangka analitis, menguji rasionalitas kebijakan, dan memfasilitasi refleksi berbasis bukti — bukan ceramah normatif.' },
    { id: 'etika-konstitusi', icon: '🕊️', label: 'Tokoh Lembaga Etika & Konstitusi', peran: 'Fasilitator integritas (DKPP / MK)',
      groups: ['komisioner', 'sekretariat', 'adhoc'],
      desc: 'Memfasilitasi refleksi batas kewenangan, dilema etik, konflik kepentingan, dan konsekuensi konstitusional keputusan pemilu.' },
    { id: 'internasional', icon: '🌍', label: 'Praktisi Pemilu Internasional', peran: 'Sharing experience lintas negara',
      groups: ['komisioner'],
      desc: 'Dilibatkan selektif. Membuka perspektif global, menghindari institutional blind spot, dan perbandingan praktik. Bukan konsultan operasional.' },
    { id: 'lokal', icon: '📍', label: 'Fasilitator Lokal', peran: 'Konteks sosial-politik kewilayahan',
      groups: ['komisioner', 'sekretariat', 'adhoc', 'publik'],
      desc: 'Mantan komisioner daerah, praktisi pemilu, dan akademisi lokal. Menjamin pembelajaran relevan, kontekstual, dan aplikatif.' },
  ];

  /* ── EVALUASI DAMPAK (impact-based) ──────────────────────────────────────*/
  const DAMPAK = [
    { id: 'konsistensi', label: 'Konsistensi kebijakan/keputusan' },
    { id: 'sengketa', label: 'Penurunan risiko sengketa administratif' },
    { id: 'kolektif', label: 'Kualitas pengambilan keputusan kolektif' },
    { id: 'gaya', label: 'Kualitas komunikasi publik' },
    { id: 'kepercayaan', label: 'Tingkat kepercayaan publik' },
  ];

  /* ── Helper lesson ───────────────────────────────────────────────────────*/
  const L = (id, tipe, judul, menit, body) => ({ id, tipe, judul, menit, body });

  /* ── MODUL TAHAP 2 (Strategic Learning) — per tier ───────────────────────*/
  const STRAT = {
    'kom-ri': [
      { id: 'm2-ri-1', judul: 'Desain Kebijakan Pemilu Nasional', kompetensi: ['kebijakan', 'hukum'],
        metode: 'Studi kasus strategis · workshop reflektif · studi banding', lessons: [
        L('l-ri-1', 'studi-kasus', 'Merancang kebijakan tahapan pemilu nasional', 25, 'Telaah trade-off kebijakan nasional: kepastian hukum vs fleksibilitas operasional di seluruh provinsi.'),
        L('l-ri-2', 'baca', 'Tata kelola data pemilih berskala besar', 20, 'Prinsip akurasi, mutakhir, dan perlindungan data pemilih nasional; interoperabilitas SIDALIH.'),
        L('l-ri-3', 'video', 'Penetapan hasil & antisipasi sengketa (±309 perkara Pilkada 2024)', 18, 'Belajar dari lonjakan sengketa: titik rawan rekapitulasi & penetapan.')],
        kuis: { id: 'q2-ri', judul: 'Kuis Kebijakan Nasional', soal: [
          { t: 'Fokus strategis Komisioner KPU RI mencakup…', o: ['Logistik TPS', 'Desain kebijakan nasional & manajemen krisis', 'Coklit desa', 'Distribusi surat suara kecamatan'], j: 1 }] } },
      { id: 'm2-ri-2', judul: 'Manajemen Krisis & Komunikasi Nasional', kompetensi: ['risiko', 'komunikasi'],
        metode: 'Workshop reflektif · simulasi krisis', lessons: [
        L('l-ri-4', 'studi-kasus', 'Simulasi manajemen krisis pemilu nasional', 25, 'Skenario eskalasi disinformasi + sengketa serentak; latih keputusan kolektif cepat & konsisten.'),
        L('l-ri-5', 'baca', 'Strategi komunikasi publik nasional saat krisis', 15, 'Menjaga kepercayaan publik: pesan satu suara KPU, transparansi, respons hoaks elektoral.')] },
    ],
    'kom-prov': [
      { id: 'm2-pr-1', judul: 'Sinkronisasi Kebijakan Pusat–Daerah', kompetensi: ['kebijakan', 'kepemimpinan'],
        metode: 'Workshop lintas wilayah · peer learning antarprovinsi', lessons: [
        L('l-pr-1', 'studi-kasus', 'Menerjemahkan kebijakan nasional ke konteks provinsi', 22, 'Mengubah regulasi nasional menjadi pengaturan teknis provinsi tanpa menyimpang dari kerangka pusat.'),
        L('l-pr-2', 'video', 'Koordinasi & supervisi lintas kabupaten/kota', 16, 'Harmonisasi antar-KPU kab/kota dalam satu provinsi.')],
        kuis: { id: 'q2-pr', judul: 'Kuis Sinkronisasi Regional', soal: [
          { t: 'Metode utama pembelajaran Komisioner Provinsi…', o: ['Studi banding internasional', 'Workshop lintas wilayah & peer learning antarprovinsi', 'Bimtek TPS', 'Kuliah daring mandiri'], j: 1 }] } },
      { id: 'm2-pr-2', judul: 'Pengelolaan Konflik Kepemiluan Regional', kompetensi: ['risiko', 'komunikasi'],
        metode: 'Peer learning · refleksi kasus regional', lessons: [
        L('l-pr-3', 'studi-kasus', 'Mengelola konflik kepemiluan tingkat provinsi', 20, 'Identifikasi pemicu konflik regional (DPT, netralitas, logistik) & strategi de-eskalasi.')] },
    ],
    'kom-kab': [
      { id: 'm2-kk-1', judul: 'Operasional Strategis di Lapangan', kompetensi: ['risiko', 'digital'],
        metode: 'Kontekstual · berbasis pengalaman lapangan', lessons: [
        L('l-kk-1', 'studi-kasus', 'Manajemen logistik & distribusi hingga TPS', 20, 'Logistik tepat jumlah, mutu, waktu; mitigasi keterlambatan & kerusakan surat suara.'),
        L('l-kk-2', 'baca', 'Pemutakhiran data pemilih (Coklit/DPT)', 18, 'Akurasi DPT: koordinasi PPK/PPS, penanganan pemilih ganda & TMS.'),
        L('l-kk-3', 'video', 'Membaca dinamika sosial-politik lokal', 14, 'Memetakan aktor & isu lokal yang memengaruhi tahapan.')],
        kuis: { id: 'q2-kk', judul: 'Kuis Operasional Lapangan', soal: [
          { t: 'Fokus strategis Komisioner Kab/Kota…', o: ['Desain kebijakan nasional', 'Logistik, pemutakhiran data pemilih & dinamika lokal', 'Studi banding internasional', 'Sinkronisasi antarprovinsi'], j: 1 }] } },
    ],
    'set-prov': [
      { id: 'm2-sp-1', judul: 'Tata Kelola Anggaran & Administrasi Pemilu', kompetensi: ['kebijakan', 'digital'],
        metode: 'Workshop teknis · pendampingan', lessons: [
        L('l-sp-1', 'baca', 'Perencanaan & pertanggungjawaban anggaran tahapan', 20, 'Siklus anggaran pemilu, kepatuhan SBM/SHBJ, dan dokumentasi pertanggungjawaban.'),
        L('l-sp-2', 'studi-kasus', 'Dukungan teknis penyelenggaraan provinsi', 18, 'Koordinasi dukungan SDM, sarana, dan sistem informasi antar-satker.')],
        kuis: { id: 'q2-sp', judul: 'Kuis Tata Kelola Provinsi', soal: [
          { t: 'Peran utama Sekretariat dalam penyelenggaraan adalah…', o: ['Mengambil keputusan kolektif komisioner', 'Dukungan teknis & administratif', 'Memutus sengketa', 'Menetapkan hasil'], j: 1 }] } },
    ],
    'set-kab': [
      { id: 'm2-sk-1', judul: 'Administrasi & Logistik Pemilu Kab/Kota', kompetensi: ['digital', 'risiko'],
        metode: 'Workshop teknis · simulasi', lessons: [
        L('l-sk-1', 'baca', 'Manajemen logistik & tata naskah dinas', 18, 'Pengelolaan logistik pemilu, persuratan, dan kearsipan tahapan.'),
        L('l-sk-2', 'video', 'Kepegawaian & dukungan badan ad hoc', 14, 'Administrasi pembentukan & honorarium badan ad hoc (PPK/PPS/KPPS).')] },
    ],
    'ppk': [
      { id: 'm2-ppk-1', judul: 'Rekapitulasi & Supervisi Tingkat Kecamatan', kompetensi: ['hukum', 'digital'],
        metode: 'Bimtek · simulasi rekapitulasi', lessons: [
        L('l-ppk-1', 'studi-kasus', 'Rekapitulasi suara tingkat kecamatan', 20, 'Tata cara rekapitulasi berjenjang, penanganan selisih, dan keberatan saksi.'),
        L('l-ppk-2', 'baca', 'Supervisi PPS & koordinasi logistik', 15, 'Memastikan kesiapan PPS dan distribusi logistik wilayah kecamatan.')],
        kuis: { id: 'q2-ppk', judul: 'Kuis Rekapitulasi Kecamatan', soal: [
          { t: 'PPK bertanggung jawab atas rekapitulasi di tingkat…', o: ['TPS', 'Desa/kelurahan', 'Kecamatan', 'Kabupaten'], j: 2 }] } },
    ],
    'pps': [
      { id: 'm2-pps-1', judul: 'Pemutakhiran Data & Pembentukan KPPS', kompetensi: ['digital', 'komunikasi'],
        metode: 'Bimtek · praktik Coklit', lessons: [
        L('l-pps-1', 'studi-kasus', 'Coklit & penyusunan daftar pemilih', 20, 'Praktik pencocokan & penelitian data pemilih; penanganan TMS dan pemilih baru.'),
        L('l-pps-2', 'baca', 'Pembentukan & bimbingan KPPS', 14, 'Rekrutmen, pembekalan, dan supervisi KPPS di TPS.')],
        kuis: { id: 'q2-pps', judul: 'Kuis Data Pemilih', soal: [
          { t: 'Coklit adalah kegiatan…', o: ['Penghitungan suara', 'Pencocokan & penelitian data pemilih', 'Rekapitulasi kecamatan', 'Sosialisasi'], j: 1 }] } },
    ],
    'kpps': [
      { id: 'm2-kpps-1', judul: 'Pemungutan & Penghitungan Suara di TPS', kompetensi: ['hukum', 'risiko'],
        metode: 'Bimtek · simulasi TPS', lessons: [
        L('l-kpps-1', 'video', 'Tata cara pemungutan suara di TPS', 18, 'Alur layanan pemilih, pengisian form, dan penjagaan kerahasiaan suara.'),
        L('l-kpps-2', 'studi-kasus', 'Penghitungan suara & form C-Hasil', 20, 'Penghitungan transparan, penanganan suara sah/tidak sah, dan pengisian C-Hasil akurat.')],
        kuis: { id: 'q2-kpps', judul: 'Kuis Pemungutan Suara', soal: [
          { t: 'KPPS bertugas di tingkat…', o: ['Kecamatan', 'Desa', 'TPS', 'Kabupaten'], j: 2 }] } },
    ],
    'relawan': [
      { id: 'm2-rel-1', judul: 'Sosialisasi & Pendidikan Pemilih', kompetensi: ['komunikasi', 'global'],
        metode: 'Microlearning · praktik fasilitasi', lessons: [
        L('l-rel-1', 'baca', 'Teknik sosialisasi per segmen pemilih', 15, 'Pendekatan untuk pemilih pemula, perempuan, disabilitas, dan kelompok rentan.'),
        L('l-rel-2', 'video', 'Literasi digital & melawan hoaks pemilu', 14, 'Mengenali pola disinformasi dan mengajak verifikasi sebelum membagikan.')],
        kuis: { id: 'q2-rel', judul: 'Kuis Relawan Demokrasi', soal: [
          { t: 'Tujuan utama Relawan Demokrasi adalah…', o: ['Menghitung suara', 'Meningkatkan partisipasi & pendidikan pemilih', 'Memutus sengketa', 'Mengelola anggaran'], j: 1 }] } },
    ],
    'masyarakat': [
      { id: 'm2-mas-1', judul: 'Hak Pilih & Cara Memilih', kompetensi: ['komunikasi'],
        metode: 'Microlearning publik', lessons: [
        L('l-mas-1', 'baca', 'Hak pilih, syarat, dan cara mencoblos', 10, 'Memahami hak konstitusional memilih, syarat, dan tata cara di TPS.'),
        L('l-mas-2', 'video', 'Mengenali & menghentikan hoaks pemilu', 10, 'Ciri hoaks pemilu dan langkah sederhana memverifikasi informasi.')],
        kuis: { id: 'q2-mas', judul: 'Kuis Literasi Pemilih', soal: [
          { t: 'Langkah bijak saat menerima kabar pemilu yang meragukan…', o: ['Langsung sebarkan', 'Verifikasi ke sumber resmi KPU', 'Abaikan total', 'Tambahkan opini'], j: 1 }] } },
    ],
  };

  /* ── ALUR 7 TAHAP (Tiered Facilitation Model) ────────────────────────────*/
  const STAGES = [
    { no: 1, id: 'orientasi', judul: 'Orientasi & Evaluasi Mandiri', kapan: 'Awal masa tugas',
      tujuan: 'Memahami mandat & peran, prinsip kerja, batas kewenangan, serta memetakan kebutuhan kompetensi personal. Pengembangan kompetensi sebagai kesadaran profesional, bukan kewajiban administratif.',
      modul: () => [
        { id: 'm1-induction', judul: 'Induction Program: Mandat & Peran', kompetensi: ['hukum', 'kepemimpinan'], lessons: [
          L('l-mandat', 'baca', 'Mandat & sifat KPU (nasional, tetap, mandiri)', 15, 'KPU adalah penyelenggara pemilu yang nasional, tetap, dan mandiri (UU No. 7/2017). Independensi dijaga lewat kapasitas profesional, bukan hanya desain hukum.'),
          L('l-kolegial', 'video', 'Prinsip kerja & kolektif-kolegial', 12, 'Setiap peran adalah penentu kualitas tahapan, penjaga independensi & kepercayaan publik.'),
          L('l-batas', 'baca', 'Batas kewenangan antar jenjang', 10, 'Perbedaan kewenangan & kompleksitas menjadi kunci kebutuhan kompetensi tiap jenjang.')],
          kuis: { id: 'q1', judul: 'Kuis Orientasi', soal: [
            { t: 'Sifat KPU menurut UU Pemilu adalah…', o: ['Sementara & lokal', 'Nasional, tetap, dan mandiri', 'Di bawah kementerian', 'Partisan'], j: 1 },
            { t: 'Independensi paling kuat dijaga melalui…', o: ['Pengawasan administratif semata', 'Kapasitas & kompetensi profesional', 'Relasi komando', 'Orientasi politik'], j: 1 }] } },
        { id: 'm1-self', judul: 'Self-Assessment Kompetensi', kompetensi: KOMPETENSI.map((k) => k.id), lessons: [
          L('l-sa-intro', 'baca', 'Mengapa memetakan kompetensi sendiri?', 8, 'Self-assessment jadi fondasi pembelajaran sepanjang masa tugas dan menentukan penekanan Tahap 2.'),
          L('l-sa-do', 'refleksi', 'Isi peta kompetensi awal (baseline)', 15, 'Buka tab "Kompetensi" → isi penilaian mandiri kolom "Awal" sebagai baseline yang dibandingkan pada Tahap 7.')] },
      ] },
    { no: 2, id: 'strategis', judul: 'Penguatan Kompetensi Strategis sesuai Jenjang', kapan: 'Inti pembelajaran',
      tujuan: 'Memperdalam kompetensi inti yang berbeda menurut jenjang kewenangan & kompleksitas. Modul dipersonalisasi per jenjang (Tiered Competency Engine).',
      modul: (tier) => STRAT[tier] || STRAT['masyarakat'] },
    { no: 3, id: 'peer', judul: 'Peer Learning & Mentoring Kolektif', kapan: 'Berkelanjutan',
      tujuan: 'Setiap peserta diposisikan sebagai pembelajar sekaligus sumber pengetahuan (non-hierarkis). Arena refleksi dilema, tekanan, dan keputusan strategis.',
      modul: () => [
        { id: 'm3-peer', judul: 'Forum Peer Learning Non-Hierarkis', kompetensi: ['kepemimpinan', 'kebijakan'],
          metode: 'Mentoring kolektif · difasilitasi senior & akademisi', lessons: [
          L('l-peer-1', 'diskusi', 'Berbagi dilema & keputusan strategis', 20, 'Setiap peserta membawa satu dilema nyata; kelompok merefleksikan opsi & konsekuensinya.'),
          L('l-peer-2', 'refleksi', 'Catatan reflektif: keputusan tersulit saya', 15, 'Tuliskan keputusan tersulit & pelajaran yang dapat diwariskan — dapat dikontribusikan ke Knowledge Hub.')] },
      ] },
    { no: 4, id: 'etika', judul: 'Penguatan Etika, Integritas & Independensi', kapan: 'Poros utama (lintas tahap)',
      tujuan: 'Integritas dibangun melalui kesadaran moral & refleksi pengalaman, bukan sekadar pengawasan administratif. Refleksi kasus konflik kepentingan, independensi, akuntabilitas.',
      modul: () => [
        { id: 'm4-etika', judul: 'Klinik Etika & Independensi', kompetensi: ['etika', 'hukum'],
          metode: 'Difasilitasi tokoh DKPP/MK · refleksi kasus', lessons: [
          L('l-et-1', 'studi-kasus', 'Konflik kepentingan & batas independensi', 20, 'Telaah kasus DKPP: kapan relasi/aktivitas melanggar independensi? Bedakan pelanggaran etik dari kesalahan prosedural.'),
          L('l-et-2', 'baca', 'Akuntabilitas publik & kode etik penyelenggara', 15, 'Prinsip kode etik penyelenggara pemilu & konsekuensi konstitusional pelanggaran.'),
          L('l-et-3', 'refleksi', 'Refleksi: garis merah integritas saya', 10, 'Rumuskan komitmen personal menjaga netralitas & independensi.')],
          kuis: { id: 'q4', judul: 'Kuis Etika & Integritas', soal: [
            { t: 'Pendekatan utama penguatan integritas adalah…', o: ['Pengawasan administratif semata', 'Kesadaran moral & refleksi pengalaman', 'Sanksi otomatis', 'Orientasi politik'], j: 1 },
            { t: 'Lembaga yang memfasilitasi isu etika penyelenggara pemilu…', o: ['DKPP', 'BPK', 'KPK saja', 'DPR'], j: 0 }] } },
      ] },
    { no: 5, id: 'adaptif', judul: 'Pembelajaran Adaptif: E-Learning & Inovasi', kapan: 'On-demand / berkelanjutan',
      tujuan: 'Menjawab dinamika pemilu modern via e-learning, webinar, microlearning, dan forum inovasi: teknologi pemilu, disinformasi, tren demokrasi global.',
      modul: () => [
        { id: 'm5-adaptif', judul: 'Modul Adaptif & Forum Inovasi', kompetensi: ['digital', 'global', 'komunikasi'],
          metode: 'E-learning · webinar · AI recommendation', lessons: [
          L('l-ad-1', 'video', 'Teknologi pemilu & digitalisasi tahapan', 18, 'Peluang & risiko digitalisasi; tata kelola sistem informasi KPU (SIREKAP, SIDALIH, SIPOL).'),
          L('l-ad-2', 'baca', 'Melawan disinformasi & hoaks elektoral', 16, 'Pola disinformasi pemilu & strategi literasi digital.'),
          L('l-ad-3', 'studi-kasus', 'Tren demokrasi elektoral global', 20, 'Perbandingan praktik lintas negara untuk menghindari blind spot.')] },
      ] },
    { no: 6, id: 'km', judul: 'Integrasi Manajemen Pengetahuan Kelembagaan', kapan: 'Berkelanjutan',
      tujuan: 'Mengintegrasikan pembelajaran ke manajemen pengetahuan KPU: praktik baik, kegagalan kebijakan, bank kasus, pembelajaran dari sengketa — agar pengetahuan tak hilang saat pergantian.',
      modul: () => [
        { id: 'm6-km', judul: 'Bank Kasus & Memori Institusional', kompetensi: ['kebijakan', 'risiko'],
          metode: 'Dokumentasi · kontribusi kolektif', lessons: [
          L('l-km-1', 'baca', 'Mengapa memori institusional penting?', 12, 'Tanpa dokumentasi, tiap periode mengulang kurva belajar dari nol. Lihat tab "Knowledge Hub".'),
          L('l-km-2', 'diskusi', 'Kontribusikan satu kasus / praktik baik', 20, 'Tambahkan minimal satu entri ke Knowledge Hub sebagai aset pembelajaran lintas periode.')] },
      ] },
    { no: 7, id: 'refleksi', judul: 'Refleksi Akhir Masa Jabatan & Peer Review', kapan: 'Akhir masa tugas',
      tujuan: 'Penutup alur: refleksi & peer review kelembagaan. Fokus pembelajaran kelembagaan & transfer pengetahuan strategis ke generasi berikutnya.',
      modul: () => [
        { id: 'm7-refleksi', judul: 'Exit Reflection & Transfer Pengetahuan', kompetensi: ['kepemimpinan', 'etika'],
          metode: 'Peer review · difasilitasi senior statesperson', lessons: [
          L('l-ref-1', 'refleksi', 'Peta kompetensi "Akhir" (bandingkan baseline)', 15, 'Isi penilaian mandiri kolom "Akhir" pada tab "Kompetensi". Sistem menghitung pertumbuhan.'),
          L('l-ref-2', 'diskusi', 'Peer review kelembagaan', 25, 'Apa yang harus diwariskan? Fokus pembelajaran kelembagaan, bukan penilaian individu.'),
          L('l-ref-3', 'baca', 'Evaluasi dampak pada kinerja kelembagaan', 15, 'Isi tab "Analytics → Evaluasi Dampak" untuk menautkan pembelajaran dengan indikator kinerja.')] },
      ] },
  ];

  /* ── KNOWLEDGE MANAGEMENT SYSTEM ─────────────────────────────────────────*/
  const KN_CATS = [
    { id: 'sengketa', label: 'Bank Kasus Sengketa', icon: '⚖️' },
    { id: 'dkpp', label: 'Putusan DKPP', icon: '🕊️' },
    { id: 'mk', label: 'Putusan MK', icon: '🏛️' },
    { id: 'pkpu', label: 'PKPU & JDIH', icon: '📜' },
    { id: 'best', label: 'Best Practice', icon: '⭐' },
    { id: 'lesson', label: 'Lesson Learned', icon: '💡' },
    { id: 'library', label: 'Digital Library', icon: '📚' },
    { id: 'faq', label: 'FAQ Kepemiluan', icon: '❓' },
  ];
  const KNOWLEDGE = [
    { id: 'kn-1', cat: 'mk', judul: 'Lonjakan sengketa Pilkada 2024 (±309 perkara di MK)', tier: 'kom-ri',
      isi: 'MK meregistrasi sekitar 309 perkara sengketa hasil Pilkada Serentak 2024. Lonjakan ini menandai titik rawan prosedural pada rekapitulasi & penetapan, serta menuntut kapasitas analisis kebijakan & manajemen risiko penyelenggara.',
      pelajaran: 'Perkuat antisipasi sengketa sejak tahapan; banyak risiko bersumber dari keterbatasan kapasitas, bukan hanya pelanggaran etik.', tags: ['sengketa', 'mk', 'pilkada', 'rekapitulasi'] },
    { id: 'kn-2', cat: 'dkpp', judul: 'Pelanggaran kode etik & independensi penyelenggara', tier: 'kom-kab',
      isi: 'DKPP memeriksa dugaan pelanggaran kode etik penyelenggara pemilu. Banyak kasus berakar pada konflik kepentingan & ketidakcermatan prosedural, bukan semata niat buruk.',
      pelajaran: 'Integritas dibangun lewat kesadaran moral & refleksi, bukan hanya pengawasan administratif.', tags: ['etika', 'dkpp', 'integritas', 'independensi'] },
    { id: 'kn-3', cat: 'pkpu', judul: 'UU No. 7 Tahun 2017 tentang Pemilu', tier: 'kom-ri',
      isi: 'Dasar hukum penyelenggaraan pemilu: asas LUBER JURDIL, kelembagaan KPU yang nasional/tetap/mandiri, serta kewenangan & tahapan penyelenggaraan.',
      pelajaran: 'Rujukan utama penafsiran kewenangan & tahapan; pahami sebelum mengambil keputusan strategis.', tags: ['regulasi', 'uu', 'jdih', 'dasar hukum'] },
    { id: 'kn-4', cat: 'best', judul: 'Bimtek serentak pungut-hitung-rekap (2024)', tier: 'kpps',
      isi: 'Bimtek pemungutan, penghitungan, dan rekapitulasi serta penggunaan sistem informasi KPU memastikan pemahaman teknis standar & baku di seluruh wilayah, meski insidental & terbatas waktu.',
      pelajaran: 'Standarisasi teknis berhasil; perlu dilembagakan agar tidak insidental — inti rekomendasi Tiered Facilitation Model.', tags: ['bimtek', 'kpps', 'teknis', 'praktik baik'] },
    { id: 'kn-5', cat: 'best', judul: 'Orientasi Tugas komisioner baru', tier: 'kom-prov',
      isi: 'Orientasi tugas pasca-pelantikan komisioner provinsi & kab/kota (mis. bersama Rindam Jaya) sebagai langkah awal sebelum bertugas.',
      pelajaran: 'Bermanfaat sebagai induction, namun dilakukan sekali; perlu alur berkelanjutan sepanjang masa jabatan.', tags: ['induction', 'orientasi', 'komisioner'] },
    { id: 'kn-6', cat: 'lesson', judul: 'Pembelajaran kelembagaan hilang saat pergantian', tier: 'kom-ri',
      isi: 'Selama kebutuhan kompetensi tidak dipandang sebagai investasi kelembagaan, pembelajaran tetap insidental, tidak terdokumentasi, dan sulit diwariskan — setiap periode mengulang kurva belajar dari nol.',
      pelajaran: 'Lembagakan manajemen pengetahuan (bank kasus, dokumentasi) untuk menjaga memori institusional.', tags: ['knowledge management', 'memori institusional', 'succession'] },
    { id: 'kn-7', cat: 'library', judul: 'Glosarium tahapan pemilu', tier: 'masyarakat',
      isi: 'Istilah kunci: DPT, Coklit, TMS, rekapitulasi berjenjang, C-Hasil, SIREKAP, SIDALIH, SIPOL, PSU (Pemungutan Suara Ulang).',
      pelajaran: 'Pemahaman istilah memperlancar pembelajaran & komunikasi publik.', tags: ['glosarium', 'istilah', 'tahapan'] },
    { id: 'kn-8', cat: 'faq', judul: 'Apa itu Coklit?', tier: 'pps',
      isi: 'Coklit (Pencocokan dan Penelitian) adalah kegiatan pemutakhiran data pemilih dengan mendatangi pemilih untuk mencocokkan & meneliti data, menangani pemilih TMS dan pemilih baru.',
      pelajaran: 'Akurasi data pemilih mengurangi potensi sengketa administratif.', tags: ['coklit', 'data pemilih', 'pps'] },
    { id: 'kn-9', cat: 'faq', judul: 'Apa yang membedakan tugas PPK, PPS, dan KPPS?', tier: 'ppk',
      isi: 'PPK: koordinasi & rekapitulasi tingkat kecamatan. PPS: pemutakhiran data & pembentukan KPPS di desa/kelurahan. KPPS: pemungutan & penghitungan suara di TPS.',
      pelajaran: 'Pembagian tugas berjenjang menjaga rantai integritas hasil.', tags: ['ppk', 'pps', 'kpps', 'badan ad hoc'] },
    { id: 'kn-10', cat: 'lesson', judul: 'Komunikasi krisis menjaga kepercayaan publik', tier: 'kom-ri',
      isi: 'Saat eskalasi disinformasi, KPU perlu berbicara satu suara, transparan atas proses, dan responsif terhadap hoaks — menjaga legitimasi hasil pemilu.',
      pelajaran: 'Siapkan protokol komunikasi krisis sebelum tahapan kritis.', tags: ['komunikasi', 'krisis', 'disinformasi', 'kepercayaan'] },
  ];

  /* ── INTEGRASI SISTEM KPU ────────────────────────────────────────────────*/
  const INTEGRASI = [
    { nama: 'SSO KPU', desc: 'Single sign-on identitas & peran penyelenggara', arah: 'dua-arah' },
    { nama: 'SIAKBA', desc: 'Data badan ad hoc (PPK/PPS/KPPS) untuk enrolment & sertifikasi', arah: 'sumber' },
    { nama: 'SIMPEG', desc: 'Kepegawaian ASN/non-ASN → profil & CPD', arah: 'sumber' },
    { nama: 'JDIH KPU', desc: 'Regulasi & PKPU untuk Knowledge Hub & AI Summarizer', arah: 'sumber' },
    { nama: 'SIDALIH', desc: 'Data pemilih untuk modul Coklit/DPT', arah: 'sumber' },
    { nama: 'SIREKAP', desc: 'Konteks rekapitulasi untuk studi kasus & simulasi', arah: 'sumber' },
    { nama: 'SIPOL', desc: 'Data peserta pemilu untuk materi pendukung', arah: 'sumber' },
    { nama: 'e-Office', desc: 'Persuratan & penugasan pembelajaran', arah: 'dua-arah' },
    { nama: 'DKPP Knowledge Center', desc: 'Putusan & kasus etik → bank kasus', arah: 'sumber' },
    { nama: 'MK Election Case Repository', desc: 'Putusan sengketa → bank kasus & lesson learned', arah: 'sumber' },
    { nama: 'Knowledge Repository KPU', desc: 'Repositori dokumen & best practice', arah: 'dua-arah' },
  ];

  /* ── ARSITEKTUR PLATFORM (8 layer) ───────────────────────────────────────*/
  const ARCH_LAYERS = [
    { id: 'pwa', judul: 'PWA Frontend', icon: '📱', items: ['Android', 'iOS', 'Tablet', 'Desktop', 'Offline-first'] },
    { id: 'gateway', judul: 'API Gateway', icon: '🚪', items: ['REST API', 'GraphQL', 'SSO KPU', 'OAuth2'] },
    { id: 'core', judul: 'Core LMS Engine — Frappe LMS', icon: '🧱', items: ['Courses', 'Learning Path', 'Quiz', 'Webinar', 'Assignment', 'Exam', 'Certificate'] },
    { id: 'competency', judul: 'Tiered Competency Engine', icon: '🪜', items: ['10 tier penyelenggara → publik', 'Alur 7 tahap', 'Self-assessment & radar'] },
    { id: 'km', judul: 'Knowledge Management System', icon: '🗂️', items: ['Bank Kasus Sengketa', 'Best Practice', 'Lesson Learned', 'Digital Library', 'FAQ', 'AI Semantic Search'] },
    { id: 'talent', judul: 'Certification & Talent System', icon: '🏅', items: ['Sertifikasi Kompetensi', 'Badge Digital', 'CPD Point', 'Talent Pool', 'Succession Planning', 'Leadership Pipeline'] },
    { id: 'ai', judul: 'AI Learning Assistant', icon: '🤖', items: ['Chatbot Kepemiluan', 'AI Tutor', 'AI Translator', 'AI Quiz Generator', 'AI Recommendation', 'AI Summarizer Regulasi'] },
    { id: 'analytics', judul: 'Analytics Center', icon: '📊', items: ['Learning Dashboard', 'Kompetensi Dashboard', 'Heatmap Kompetensi', 'Predictive Talent Analytics', 'Kinerja Pembelajaran'] },
  ];

  /* ── MODUL UTAMA PWA ─────────────────────────────────────────────────────*/
  const PWA_MODULES = [
    { icon: '🎓', judul: 'Learning', items: ['Course', 'Webinar', 'Video Learning', 'Podcast'] },
    { icon: '📝', judul: 'Assessment', items: ['Quiz', 'CAT', 'Simulasi Tahapan'] },
    { icon: '🏅', judul: 'Certification', items: ['Digital Certificate', 'QR Validation', 'Open Badge'] },
    { icon: '💬', judul: 'Community', items: ['Forum', 'Peer Learning', 'Mentoring'] },
    { icon: '🗂️', judul: 'Knowledge Hub', items: ['Putusan DKPP', 'Putusan MK', 'PKPU', 'JDIH'] },
    { icon: '🤖', judul: 'AI Assistant', items: ['Tanya Regulasi', 'Tanya Tahapan', 'Tanya Sengketa'] },
    { icon: '📥', judul: 'Mobile Offline', items: ['Download Modul', 'Download Video', 'Sinkronisasi Saat Online'] },
  ];

  /* ── TECH STACK ──────────────────────────────────────────────────────────*/
  const TECH = {
    Frontend: ['React / Next.js', 'Ionic PWA', 'Service Worker'],
    Backend: ['Frappe Framework', 'ERPNext Integration', 'Python', 'PostgreSQL'],
    'AI Layer': ['Claude / LLM', 'RAG Knowledge Base', 'Vector Database', 'LangChain'],
    Infrastructure: ['Kubernetes', 'Docker', 'NGINX', 'Redis', 'MinIO'],
  };

  /* ── ROADMAP KEMATANGAN (6 level) ────────────────────────────────────────*/
  const MATURITY = [
    { lvl: 1, judul: 'LMS Dasar', desc: 'Course, learning path, quiz, sertifikat dasar.' },
    { lvl: 2, judul: 'LMS + Sertifikasi', desc: 'Sertifikasi kompetensi, badge digital, QR validation.' },
    { lvl: 3, judul: 'LMS + Knowledge Management', desc: 'Bank kasus, putusan DKPP/MK, lesson learned, digital library.' },
    { lvl: 4, judul: 'LMS + AI Assistant', desc: 'Chatbot, tutor, summarizer regulasi, AI recommendation (RAG).' },
    { lvl: 5, judul: 'LMS + Talent Pool & Succession', desc: 'CPD point, talent pool, leadership pipeline, succession planning.' },
    { lvl: 6, judul: 'National Election Learning Ecosystem', desc: 'Ekosistem lintas pemangku: KPU RI–Prov–Kab/Kota, PPK/PPS/KPPS, akademisi, pemantau, partai politik, masyarakat.' },
  ];

  return {
    PLATFORM, GROUPS, TIERS, KOMPETENSI, FASILITATOR, DAMPAK, STAGES,
    KN_CATS, KNOWLEDGE, INTEGRASI, ARCH_LAYERS, PWA_MODULES, TECH, MATURITY,
    tierStages, tierColor,
  };
})();
