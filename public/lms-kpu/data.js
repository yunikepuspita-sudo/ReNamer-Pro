/* ============================================================================
 * LMS Kepemiluan — Tiered Facilitation Model (KPU)
 * data.js — Kurikulum berjenjang Komisioner KPU.
 *
 * Sumber konseptual: Policy Brief "Tiered Facilitation Model: Kerangka Strategis
 * Pengembangan Kompetensi Komisioner KPU" (Pusbang & Strategi Kebijakan, ASN
 * Nasional). Arsitektur LMS terinspirasi Frappe LMS (Course → Chapter → Lesson →
 * Quiz → Batch → Certificate) yang dipetakan ke alur 7 tahap & 3 jenjang.
 *
 * CATATAN: Seluruh konten bersifat prototipe edukatif. Nama fasilitator bersifat
 * peran (bukan individu), dan studi kasus disusun ulang untuk pembelajaran.
 * ==========================================================================*/
window.LMS = (function () {
  'use strict';

  /* ── JENJANG (Tier) ──────────────────────────────────────────────────────
   * Tiga jenjang komisioner. Berjenjang & non-hierarkis: tiap jenjang punya
   * fokus kewenangan dan kompleksitas yang berbeda. */
  const TIERS = {
    pusat: {
      id: 'pusat',
      label: 'Komisioner KPU RI',
      short: 'Pusat',
      fokus: 'Kepemimpinan strategis & visioner',
      warna: '#1d4ed8',
      ringkas:
        'Perumusan kebijakan kepemiluan nasional, pengambilan keputusan kolektif, ' +
        'manajemen risiko kelembagaan, serta pengelolaan dinamika politik dan ' +
        'kepercayaan publik berskala nasional.',
    },
    provinsi: {
      id: 'provinsi',
      label: 'Komisioner KPU/KIP Provinsi',
      short: 'Provinsi',
      fokus: 'Kepemimpinan operasional regional',
      warna: '#047857',
      ringkas:
        'Sinkronisasi kebijakan pusat–daerah, pengelolaan konflik kepemiluan ' +
        'regional, dan koordinasi lintas kabupaten/kota.',
    },
    kabkota: {
      id: 'kabkota',
      label: 'Komisioner KPU/KIP Kabupaten/Kota',
      short: 'Kab/Kota',
      fokus: 'Kepemimpinan operasional lapangan',
      warna: '#b45309',
      ringkas:
        'Persoalan operasional strategis di lapangan: logistik, pemutakhiran ' +
        'data pemilih, dan dinamika sosial-politik lokal.',
    },
  };

  /* ── KERANGKA KOMPETENSI ─────────────────────────────────────────────────
   * Domain kompetensi inti komisioner (akar masalah "Material/Method" pada
   * fishbone). Dipakai untuk self-assessment (Tahap 1) dan evaluasi dampak. */
  const KOMPETENSI = [
    { id: 'hukum', label: 'Hukum & Regulasi Pemilu', icon: '⚖️',
      desc: 'Penafsiran UU Pemilu, sengketa, dan konsekuensi konstitusional keputusan.' },
    { id: 'kebijakan', label: 'Analisis Kebijakan', icon: '🧭',
      desc: 'Perumusan, pengujian rasionalitas, dan inovasi kebijakan kepemiluan.' },
    { id: 'kepemimpinan', label: 'Kepemimpinan & Keputusan Kolektif', icon: '👥',
      desc: 'Kepemimpinan kolektif-kolegial dan pengambilan keputusan strategis.' },
    { id: 'risiko', label: 'Manajemen Risiko & Krisis', icon: '🛡️',
      desc: 'Antisipasi sengketa, manajemen krisis, dan keputusan di bawah tekanan.' },
    { id: 'komunikasi', label: 'Komunikasi Publik', icon: '📢',
      desc: 'Komunikasi publik, manajemen disinformasi, dan kepercayaan publik.' },
    { id: 'digital', label: 'Teknologi & Digitalisasi Pemilu', icon: '💻',
      desc: 'Tata kelola sistem informasi, data pemilih, dan demokrasi digital.' },
    { id: 'etika', label: 'Etika, Integritas & Independensi', icon: '🕊️',
      desc: 'Kesadaran moral, konflik kepentingan, dan akuntabilitas publik.' },
    { id: 'global', label: 'Wawasan Global & Inovasi', icon: '🌐',
      desc: 'Tren demokrasi elektoral global dan pembelajaran lintas negara.' },
  ];

  /* ── FASILITATOR (Critical partner / critical enabler) ───────────────────
   * Mitra intelektual & reflektif — bukan pelatih teknis / evaluator kinerja.
   * tiers = jenjang yang paling relevan dilayani. */
  const FASILITATOR = [
    {
      id: 'mantan-pusat', icon: '🏛️',
      label: 'Mantan Komisioner KPU Pusat',
      peran: 'Senior statesperson / elder of democracy',
      tiers: ['pusat', 'provinsi'],
      desc:
        'Penjaga nilai, arah kelembagaan, dan memori institusional. Memfasilitasi ' +
        'mentoring strategis & peer learning serta transfer pengetahuan lintas periode. ' +
        'Bukan mentor harian apalagi instruktur teknis.',
    },
    {
      id: 'akademisi', icon: '🎓',
      label: 'Akademisi Pemilu & Demokrasi (Non-Partisan)',
      peran: 'Critical friend / fasilitator konseptual',
      tiers: ['pusat', 'provinsi', 'kabkota'],
      desc:
        'Memberi kerangka analitis, menguji rasionalitas kebijakan, dan memfasilitasi ' +
        'refleksi berbasis bukti — bukan ceramah normatif. Pusat: isu konseptual & ' +
        'nasional; Provinsi: tata kelola regional; Kab/Kota: studi kasus lapangan.',
    },
    {
      id: 'etika-konstitusi', icon: '🕊️',
      label: 'Tokoh Lembaga Etika & Konstitusi',
      peran: 'Fasilitator integritas (DKPP / MK)',
      tiers: ['pusat', 'provinsi', 'kabkota'],
      desc:
        'Figur Dewan Kehormatan / Mahkamah Konstitusi. Memfasilitasi refleksi batas ' +
        'kewenangan, dilema etik, konflik kepentingan, dan konsekuensi konstitusional ' +
        'keputusan pemilu.',
    },
    {
      id: 'internasional', icon: '🌍',
      label: 'Praktisi Pemilu Internasional',
      peran: 'Sharing experience lintas negara',
      tiers: ['pusat'],
      desc:
        'Dilibatkan selektif & terbatas dari organisasi pemilu internasional kredibel. ' +
        'Membuka perspektif global, menghindari institutional blind spot, dan memberi ' +
        'perbandingan praktik. Bukan konsultan operasional.',
    },
    {
      id: 'lokal', icon: '📍',
      label: 'Fasilitator Lokal',
      peran: 'Konteks sosial-politik kewilayahan',
      tiers: ['provinsi', 'kabkota'],
      desc:
        'Mantan komisioner daerah, praktisi pemilu, dan akademisi lokal. Menjamin ' +
        'pembelajaran relevan, kontekstual, dan aplikatif tanpa kehilangan kerangka ' +
        'nilai kelembagaan.',
    },
  ];

  /* ── EVALUASI DAMPAK (Impact-based, bukan sekadar penyelesaian aktivitas) ─ */
  const DAMPAK = [
    { id: 'konsistensi', label: 'Konsistensi kebijakan komisioner' },
    { id: 'sengketa', label: 'Penurunan risiko sengketa administratif' },
    { id: 'kolektif', label: 'Kualitas pengambilan keputusan kolektif' },
    { id: 'gaya', label: 'Kualitas gaya komunikasi publik' },
    { id: 'kepercayaan', label: 'Tingkat kepercayaan publik' },
  ];

  /* ── Helper pembuat lesson ───────────────────────────────────────────────
   * tipe: baca · video · refleksi · diskusi · studi-kasus · kuis */
  const L = (id, tipe, judul, menit, body) => ({ id, tipe, judul, menit, body });

  /* ── ALUR 7 TAHAP (Course pathway berjenjang) ────────────────────────────
   * Tiap tahap = "Chapter" besar berisi modul. modulFn(tier) mengembalikan
   * modul yang sesuai jenjang (Tahap 2 berbeda tiap jenjang). */
  const STAGES = [
    {
      no: 1,
      id: 'orientasi',
      judul: 'Orientasi & Evaluasi Mandiri',
      kapan: 'Awal masa jabatan',
      tujuan:
        'Memahami mandat konstitusional KPU, prinsip kolektif-kolegial, batas ' +
        'kewenangan strategis, serta memetakan kebutuhan kompetensi personal. ' +
        'Pengembangan kompetensi sebagai kesadaran profesional, bukan kewajiban administratif.',
      modul: () => [
        {
          id: 'm1-induction',
          judul: 'Induction Program: Mandat & Kolektif-Kolegial',
          kompetensi: ['hukum', 'kepemimpinan'],
          lessons: [
            L('l-mandat', 'baca', 'Mandat konstitusional & sifat KPU (nasional, tetap, mandiri)', 15,
              'KPU adalah penyelenggara pemilu yang nasional, tetap, dan mandiri (UU No. 7/2017). ' +
              'Independensi tidak cukup dijaga lewat desain hukum & kode etik, tetapi melalui kapasitas ' +
              'komisioner memahami, menafsirkan, dan mengambil keputusan strategis secara profesional.'),
            L('l-kolegial', 'video', 'Prinsip kolektif-kolegial dalam keputusan KPU', 12,
              'Komisioner bukan sekadar pengambil keputusan kolektif, tetapi penentu arah kebijakan, ' +
              'pemimpin organisasi, sekaligus penjaga independensi dan kepercayaan publik.'),
            L('l-batas', 'baca', 'Batas kewenangan strategis antar jenjang', 10,
              'Perbedaan tingkat kewenangan & kompleksitas menjadi kunci kebutuhan pengembangan ' +
              'kompetensi pada tiap jenjang komisioner.'),
          ],
          kuis: {
            id: 'q1', judul: 'Kuis Orientasi',
            soal: [
              { t: 'Sifat KPU menurut UU Pemilu adalah…',
                o: ['Sementara & lokal', 'Nasional, tetap, dan mandiri', 'Di bawah kementerian', 'Partisan'],
                j: 1 },
              { t: 'Independensi komisioner paling kuat dijaga melalui…',
                o: ['Pengawasan administratif semata', 'Kapasitas & kompetensi profesional', 'Relasi komando birokratis', 'Orientasi politik tertentu'],
                j: 1 },
            ],
          },
        },
        {
          id: 'm1-self',
          judul: 'Self-Assessment Kompetensi',
          kompetensi: KOMPETENSI.map((k) => k.id),
          lessons: [
            L('l-sa-intro', 'baca', 'Mengapa memetakan kompetensi sendiri?', 8,
              'Self-assessment menjadi fondasi pembelajaran sepanjang masa jabatan. Hasilnya ' +
              'menentukan penekanan pada Tahap 2 (penguatan kompetensi strategis sesuai jenjang).'),
            L('l-sa-do', 'refleksi', 'Isi peta kompetensi awal (8 domain)', 15,
              'Buka tab "Kompetensi" → isi penilaian mandiri "Awal". Skor ini menjadi baseline ' +
              'yang dibandingkan dengan penilaian "Akhir" pada Tahap 7.'),
          ],
        },
      ],
    },

    {
      no: 2,
      id: 'strategis',
      judul: 'Penguatan Kompetensi Strategis sesuai Jenjang',
      kapan: 'Inti pembelajaran',
      tujuan:
        'Memperdalam kompetensi inti yang berbeda menurut jenjang kewenangan & ' +
        'kompleksitas. Inilah modul yang dipersonalisasi per jenjang komisioner.',
      modul: (tier) => {
        const BY_TIER = {
          pusat: [
            {
              id: 'm2-p-kebijakan',
              judul: 'Desain Kebijakan Pemilu Nasional',
              kompetensi: ['kebijakan', 'hukum'],
              metode: 'Studi kasus strategis · workshop reflektif · studi banding',
              lessons: [
                L('l-p-des', 'studi-kasus', 'Merancang kebijakan tahapan pemilu nasional', 25,
                  'Telaah trade-off kebijakan nasional: kepastian hukum vs fleksibilitas operasional ' +
                  'di 38 provinsi. Uji rasionalitas kebijakan secara intelektual bersama akademisi.'),
                L('l-p-data', 'baca', 'Tata kelola data pemilih berskala besar', 20,
                  'Prinsip akurasi, mutakhir, dan perlindungan data pemilih nasional; interoperabilitas ' +
                  'sistem informasi KPU.'),
                L('l-p-hasil', 'video', 'Penetapan hasil pemilu & antisipasi sengketa', 18,
                  'Belajar dari ±309 perkara sengketa Pilkada 2024 di MK: titik rawan prosedural pada ' +
                  'rekapitulasi & penetapan.'),
              ],
              kuis: {
                id: 'q2p', judul: 'Kuis Kebijakan Nasional',
                soal: [
                  { t: 'Fokus kompetensi strategis Komisioner KPU RI mencakup…',
                    o: ['Logistik TPS', 'Desain kebijakan nasional & manajemen krisis', 'Mutakhirkan DPT desa', 'Distribusi surat suara kecamatan'],
                    j: 1 },
                ],
              },
            },
            {
              id: 'm2-p-krisis',
              judul: 'Manajemen Krisis & Komunikasi Publik Nasional',
              kompetensi: ['risiko', 'komunikasi'],
              metode: 'Workshop reflektif · simulasi krisis',
              lessons: [
                L('l-p-krisis', 'studi-kasus', 'Simulasi manajemen krisis pemilu nasional', 25,
                  'Skenario eskalasi disinformasi + sengketa serentak. Latih keputusan kolektif cepat ' +
                  'yang tetap konsisten & dapat dipertanggungjawabkan.'),
                L('l-p-komnas', 'baca', 'Strategi komunikasi publik nasional saat krisis', 15,
                  'Menjaga kepercayaan publik: pesan satu suara KPU, transparansi proses, dan respons ' +
                  'terhadap hoaks elektoral.'),
              ],
            },
          ],
          provinsi: [
            {
              id: 'm2-pr-sinkron',
              judul: 'Sinkronisasi Kebijakan Pusat–Daerah',
              kompetensi: ['kebijakan', 'kepemimpinan'],
              metode: 'Workshop lintas wilayah · peer learning antarprovinsi',
              lessons: [
                L('l-pr-sinkron', 'studi-kasus', 'Menerjemahkan kebijakan nasional ke konteks provinsi', 22,
                  'Latihan menerjemahkan regulasi nasional menjadi pengaturan teknis provinsi tanpa ' +
                  'menyimpang dari kerangka pusat.'),
                L('l-pr-koord', 'video', 'Koordinasi lintas kabupaten/kota', 16,
                  'Mekanisme supervisi & harmonisasi antar-KPU kab/kota dalam satu provinsi.'),
              ],
              kuis: {
                id: 'q2pr', judul: 'Kuis Sinkronisasi Regional',
                soal: [
                  { t: 'Metode utama pembelajaran Komisioner Provinsi adalah…',
                    o: ['Studi banding internasional', 'Workshop lintas wilayah & peer learning antarprovinsi', 'Bimtek TPS', 'Kuliah daring mandiri'],
                    j: 1 },
                ],
              },
            },
            {
              id: 'm2-pr-konflik',
              judul: 'Pengelolaan Konflik Kepemiluan Regional',
              kompetensi: ['risiko', 'komunikasi'],
              metode: 'Peer learning · refleksi kasus regional',
              lessons: [
                L('l-pr-konflik', 'studi-kasus', 'Mengelola konflik kepemiluan tingkat provinsi', 20,
                  'Identifikasi pemicu konflik regional (mutasi DPT, netralitas, logistik) dan strategi ' +
                  'de-eskalasi berbasis koordinasi.'),
              ],
            },
          ],
          kabkota: [
            {
              id: 'm2-kk-operasional',
              judul: 'Operasional Strategis di Lapangan',
              kompetensi: ['risiko', 'digital'],
              metode: 'Kontekstual · berbasis pengalaman lapangan',
              lessons: [
                L('l-kk-logistik', 'studi-kasus', 'Manajemen logistik & distribusi', 20,
                  'Perencanaan logistik tepat jumlah, mutu, dan waktu hingga TPS; mitigasi keterlambatan ' +
                  'dan kerusakan surat suara.'),
                L('l-kk-dpt', 'baca', 'Pemutakhiran data pemilih (Coklit/DPT)', 18,
                  'Akurasi DPT di tingkat kab/kota: koordinasi PPK/PPS, penanganan pemilih ganda & TMS.'),
                L('l-kk-sosial', 'video', 'Membaca dinamika sosial-politik lokal', 14,
                  'Memetakan aktor & isu lokal yang berpotensi memengaruhi tahapan pemilu.'),
              ],
              kuis: {
                id: 'q2kk', judul: 'Kuis Operasional Lapangan',
                soal: [
                  { t: 'Fokus strategis Komisioner Kab/Kota adalah…',
                    o: ['Desain kebijakan nasional', 'Logistik, pemutakhiran data pemilih & dinamika lokal', 'Studi banding internasional', 'Sinkronisasi antarprovinsi'],
                    j: 1 },
                ],
              },
            },
          ],
        };
        return BY_TIER[tier] || BY_TIER.kabkota;
      },
    },

    {
      no: 3,
      id: 'peer',
      judul: 'Peer Learning & Mentoring Kolektif',
      kapan: 'Berkelanjutan',
      tujuan:
        'Setiap komisioner diposisikan sebagai pembelajar sekaligus sumber ' +
        'pengetahuan (non-hierarkis). Arena refleksi atas dilema kebijakan, tekanan ' +
        'politik, dan pengambilan keputusan strategis — memperkuat karakter kolegial.',
      modul: () => [
        {
          id: 'm3-peer',
          judul: 'Forum Peer Learning Non-Hierarkis',
          kompetensi: ['kepemimpinan', 'kebijakan'],
          metode: 'Mentoring kolektif · difasilitasi mantan komisioner & akademisi',
          lessons: [
            L('l-peer-1', 'diskusi', 'Berbagi dilema kebijakan & keputusan strategis', 20,
              'Setiap peserta membawa satu dilema nyata; kelompok merefleksikan opsi & konsekuensinya. ' +
              'Posisikan diri sebagai pembelajar sekaligus narasumber.'),
            L('l-peer-2', 'refleksi', 'Catatan reflektif: keputusan tersulit saya', 15,
              'Tuliskan satu keputusan kolektif tersulit dan pelajaran yang dapat diwariskan. ' +
              'Catatan ini dapat dikontribusikan ke Bank Kasus (Tahap 6).'),
          ],
        },
      ],
    },

    {
      no: 4,
      id: 'etika',
      judul: 'Penguatan Etika, Integritas & Independensi',
      kapan: 'Poros utama (lintas tahap)',
      tujuan:
        'Integritas dibangun melalui kesadaran moral & refleksi pengalaman, bukan ' +
        'sekadar pengawasan administratif. Refleksi kasus nyata konflik kepentingan, ' +
        'independensi, dan akuntabilitas publik.',
      modul: () => [
        {
          id: 'm4-etika',
          judul: 'Klinik Etika & Independensi',
          kompetensi: ['etika', 'hukum'],
          metode: 'Difasilitasi tokoh DKPP/MK · refleksi kasus',
          lessons: [
            L('l-et-1', 'studi-kasus', 'Konflik kepentingan & batas independensi', 20,
              'Telaah kasus DKPP: kapan relasi/aktivitas komisioner melanggar independensi? ' +
              'Bedakan pelanggaran etik dari kesalahan prosedural.'),
            L('l-et-2', 'baca', 'Akuntabilitas publik & kode etik penyelenggara', 15,
              'Prinsip-prinsip kode etik penyelenggara pemilu dan konsekuensi konstitusional pelanggaran.'),
            L('l-et-3', 'refleksi', 'Refleksi: garis merah integritas saya', 10,
              'Rumuskan komitmen personal menjaga netralitas & independensi sepanjang masa jabatan.'),
          ],
          kuis: {
            id: 'q4', judul: 'Kuis Etika & Integritas',
            soal: [
              { t: 'Pendekatan utama penguatan integritas komisioner adalah…',
                o: ['Pengawasan administratif semata', 'Kesadaran moral & refleksi pengalaman', 'Sanksi otomatis', 'Orientasi politik'],
                j: 1 },
              { t: 'Lembaga yang relevan memfasilitasi isu etika penyelenggara pemilu…',
                o: ['DKPP', 'BPK', 'KPK saja', 'DPR'],
                j: 0 },
            ],
          },
        },
      ],
    },

    {
      no: 5,
      id: 'adaptif',
      judul: 'Pembelajaran Adaptif: E-Learning & Inovasi',
      kapan: 'Berkelanjutan / on-demand',
      tujuan:
        'Menjawab dinamika pemilu modern melalui e-learning, webinar kebijakan, dan ' +
        'forum inovasi: teknologi pemilu, disinformasi digital, dan tren demokrasi ' +
        'elektoral global.',
      modul: () => [
        {
          id: 'm5-adaptif',
          judul: 'Modul Adaptif & Forum Inovasi',
          kompetensi: ['digital', 'global', 'komunikasi'],
          metode: 'E-learning mandiri · webinar · forum inovasi',
          lessons: [
            L('l-ad-1', 'video', 'Teknologi pemilu & digitalisasi tahapan', 18,
              'Peluang & risiko digitalisasi tahapan; tata kelola sistem informasi KPU.'),
            L('l-ad-2', 'baca', 'Melawan disinformasi & hoaks elektoral', 16,
              'Pola disinformasi pemilu dan strategi literasi digital bagi publik.'),
            L('l-ad-3', 'studi-kasus', 'Tren demokrasi elektoral global', 20,
              'Perbandingan praktik penyelenggaraan pemilu lintas negara untuk menghindari blind spot.'),
          ],
        },
      ],
    },

    {
      no: 6,
      id: 'km',
      judul: 'Integrasi Manajemen Pengetahuan Kelembagaan',
      kapan: 'Berkelanjutan',
      tujuan:
        'Mengintegrasikan seluruh pembelajaran ke manajemen pengetahuan KPU: ' +
        'dokumentasi praktik baik, kegagalan kebijakan, bank kasus kepemiluan, dan ' +
        'pembelajaran dari sengketa — agar pengetahuan strategis tidak hilang saat ' +
        'pergantian komisioner.',
      modul: () => [
        {
          id: 'm6-km',
          judul: 'Bank Kasus & Memori Institusional',
          kompetensi: ['kebijakan', 'risiko'],
          metode: 'Dokumentasi · kontribusi kolektif',
          lessons: [
            L('l-km-1', 'baca', 'Mengapa memori institusional penting?', 12,
              'Tanpa dokumentasi, setiap periode komisioner mengulang kurva belajar dari titik nol ' +
              'sementara pengetahuan berharga hilang. Lihat tab "Bank Kasus".'),
            L('l-km-2', 'diskusi', 'Kontribusikan satu kasus / praktik baik', 20,
              'Tambahkan minimal satu entri ke Bank Kasus (praktik baik atau kegagalan kebijakan) ' +
              'sebagai aset pembelajaran lintas periode.'),
          ],
        },
      ],
    },

    {
      no: 7,
      id: 'refleksi',
      judul: 'Refleksi Akhir Masa Jabatan & Peer Review',
      kapan: 'Akhir masa jabatan',
      tujuan:
        'Penutup alur: refleksi & peer review kelembagaan. Fokus bukan penilaian ' +
        'kinerja individual, melainkan pembelajaran kelembagaan dan transfer ' +
        'pengetahuan strategis kepada generasi komisioner berikutnya.',
      modul: () => [
        {
          id: 'm7-refleksi',
          judul: 'Exit Reflection & Transfer Pengetahuan',
          kompetensi: ['kepemimpinan', 'etika'],
          metode: 'Peer review kelembagaan · difasilitasi senior statesperson',
          lessons: [
            L('l-ref-1', 'refleksi', 'Peta kompetensi "Akhir" (bandingkan dengan baseline)', 15,
              'Isi kembali penilaian mandiri pada tab "Kompetensi" kolom "Akhir". Sistem menghitung ' +
              'pertumbuhan kompetensi sepanjang masa jabatan.'),
            L('l-ref-2', 'diskusi', 'Peer review kelembagaan', 25,
              'Sesi peer review: apa yang harus diwariskan? Fokus pembelajaran kelembagaan, bukan ' +
              'penilaian individu.'),
            L('l-ref-3', 'baca', 'Evaluasi dampak: kontribusi pada kinerja kelembagaan', 15,
              'Isi tab "Evaluasi Dampak" untuk menautkan pembelajaran dengan indikator kinerja ' +
              'kelembagaan KPU.'),
          ],
        },
      ],
    },
  ];

  /* ── BANK KASUS bawaan (seed) — dokumentasi praktik & kegagalan ───────────*/
  const BANK_KASUS_SEED = [
    {
      id: 'bk-seed-1', jenis: 'praktik-baik', tier: 'kabkota',
      judul: 'Bimtek serentak pungut-hitung-rekap (2024)',
      ringkas:
        'Bimtek pemungutan, penghitungan, dan rekapitulasi serta penggunaan sistem ' +
        'informasi KPU memastikan pemahaman teknis yang standar & baku di seluruh ' +
        'wilayah — meski pelaksanaannya insidental & terbatas waktu.',
      pelajaran: 'Standarisasi teknis berhasil; perlu dilembagakan agar tidak insidental.',
      kompetensi: ['digital', 'risiko'],
    },
    {
      id: 'bk-seed-2', jenis: 'kegagalan', tier: 'pusat',
      judul: 'Lonjakan sengketa Pilkada 2024 (±309 perkara di MK)',
      ringkas:
        'Tercatat sekitar 309 perkara sengketa Pilkada 2024 di Mahkamah Konstitusi, ' +
        'menandakan titik rawan prosedural & kapasitas pengambilan keputusan.',
      pelajaran:
        'Risiko kegagalan kerap berasal dari keterbatasan kapasitas (analisis kebijakan, ' +
        'manajemen risiko), bukan hanya pelanggaran etik. Perkuat antisipasi sengketa.',
      kompetensi: ['hukum', 'kebijakan'],
    },
    {
      id: 'bk-seed-3', jenis: 'praktik-baik', tier: 'pusat',
      judul: 'Orientasi Tugas komisioner baru (bersama Rindam Jaya)',
      ringkas:
        'Orientasi tugas pasca-pelantikan komisioner provinsi & kab/kota sebagai ' +
        'langkah awal sebelum bertugas.',
      pelajaran:
        'Bermanfaat sebagai induction, namun dilakukan sekali; perlu alur berkelanjutan ' +
        'sepanjang masa jabatan (justru inti Tiered Facilitation Model).',
      kompetensi: ['kepemimpinan', 'etika'],
    },
  ];

  return { TIERS, KOMPETENSI, FASILITATOR, DAMPAK, STAGES, BANK_KASUS_SEED };
})();
