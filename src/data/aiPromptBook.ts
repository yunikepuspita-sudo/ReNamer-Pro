import type { Book } from '../types'

/**
 * Ebook GRATIS bawaan: "AI Prompt — Optimasi Claude untuk Parhumas & SDM
 * KPU Provinsi Jawa Barat". Dirender sebagai buku teks (per bab) di reader.
 */
export const AI_PROMPT_BOOK: Book = {
  id: 'ai-prompt-kpu-jabar',
  title: 'AI Prompt — Optimasi Claude untuk Parhumas & SDM KPU Jawa Barat',
  author: 'Sekretariat KPU Provinsi Jawa Barat',
  publisher: 'KPU Provinsi Jawa Barat',
  type: 'modul',
  category: 'Teknologi',
  themes: ['literasi-digital', 'pengawasan'],
  year: 2026,
  price: 0,
  rating: 5,
  premium: false,
  cover: ['#7b1d1d', '#a07b2a'],
  pages: 5,
  synopsis:
    'Panduan kerja praktis untuk Kepala Bagian, Kepala Subbagian, dan staf — memetakan tugas inti Parhumas dan SDM, menentukan titik pengungkit paling efisien dengan bantuan AI, dan menyediakan lima puluh use case beserta prompt siap pakai.',
  chapters: [
    {
      title: 'Bab I — Pemetaan Tugas Bagian Parhumas dan SDM',
      paragraphs: [
        'Bagian Parhumas dan Bagian SDM adalah dua sayap kerja Sekretariat KPU Provinsi yang menopang legitimasi dan integritas kelembagaan dari arah berbeda. Bab ini memetakan tugas inti keduanya sebelum membahas titik pengungkit yang dapat dipercepat oleh Claude.',
        'A. Tugas Inti Parhumas: (1) Pelaksanaan hubungan masyarakat penyelenggaraan Pemilu; (2) Pengelolaan partisipasi masyarakat dalam Pemilu; (3) Pengelolaan komunikasi kelembagaan dan citra publik; (4) Pengelolaan dokumentasi dan diseminasi informasi; (5) Pelaksanaan kerja sama dengan pemangku kepentingan.',
        'Sintesis strategis: pada level Provinsi, Bagian Parhumas berperan sebagai public legitimacy builder dan institutional trust manager — mengelola legitimasi publik KPU, meningkatkan partisipasi pemilih (IPP), menjaga reputasi kelembagaan, dan menjadi antarmuka antara KPU dengan masyarakat.',
        'B. Tugas Inti SDM (Pasal 69–70 PKPU No. 14/2020): perencanaan dan pengadaan pegawai; pengembangan karier dan kompetensi; penempatan, mutasi, rotasi, dan promosi; pengelolaan manajemen kepegawaian; pengelolaan kinerja; pengelolaan kesejahteraan; penegakan disiplin dan kode etik; serta pengelolaan administrasi anggota KPU dan badan adhoc.',
        'C. Sintesis Peran Strategis: Parhumas menjalankan fungsi eksternal (legitimasi publik, partisipasi, reputasi); SDM menjalankan fungsi internal (kapabilitas organisasi, kepemimpinan, integritas aparatur). SDM membentuk kapabilitas kelembagaan; Parhumas mengomunikasikannya ke publik sehingga tumbuh kepercayaan dan partisipasi pemilih.',
      ],
    },
    {
      title: 'Bab II — Tugas Operasional yang Dapat Dioptimalkan dengan Claude',
      paragraphs: [
        'Tidak semua tugas perlu dipercepat AI. Bab ini menandai titik pengungkit: pekerjaan yang berulang, padat kata, dan terstandar — wilayah di mana Claude memangkas waktu paling banyak tanpa menggeser otoritas keputusan.',
        'Lima area operasional Parhumas: (1) perencanaan dan strategi komunikasi publik (efisiensi 70–90%); (2) produksi konten dan publikasi (hingga 80%); (3) pemantauan dan analisis opini publik (hingga 90%); (4) penyusunan laporan dan evaluasi; (5) manajemen komunikasi pemangku kepentingan.',
        'Lima area operasional SDM: (1) administrasi kepegawaian (70–90%); (2) perencanaan dan pengembangan SDM; (3) pengelolaan kinerja pegawai; (4) penegakan disiplin pegawai; (5) penyusunan dokumen strategis SDM.',
        'Perbandingan waktu: laporan 4–8 jam → 10–15 menit; surat keputusan 1–2 jam → 5–10 menit; siaran pers 1–3 jam → ±5 menit. Penghematan agregat 70–95%.',
        'Batasan otomasi: keputusan mutasi/promosi, penjatuhan hukuman disiplin, strategi politik komunikasi, dan keputusan strategis tetap membutuhkan keputusan manusia. Claude hanya membantu pada lapis analisis dan penyusunan rancangan; otoritas tetap pada pejabat berwenang.',
      ],
    },
    {
      title: 'Bab III — Lima Puluh Use Case Claude',
      paragraphs: [
        'Lima puluh skenario kerja siap pakai — 25 untuk Parhumas, 25 untuk SDM — beserta prompt yang dapat langsung disalin ke jendela Claude dan diisi datanya.',
        'Contoh use case Parhumas: Siaran Pers Resmi — "Buatkan siaran pers resmi KPU Provinsi Jawa Barat terkait kegiatan [nama kegiatan]. Gunakan gaya formal kelembagaan pemerintah. Sertakan kutipan pimpinan, latar belakang, tujuan kegiatan, dan dampaknya terhadap peningkatan partisipasi pemilih."',
        'Use case Parhumas lain: berita situs web, takarir media sosial, naskah video edukasi pemilih, kalender konten tahunan, analisis sentimen media, laporan pemantauan media, strategi komunikasi krisis, modul sosialisasi pemilih, surat undangan, KAK sosialisasi, laporan kegiatan, hingga laporan tahunan Parhumas.',
        'Contoh use case SDM: Rancangan SK Mutasi — "Buatkan rancangan SK mutasi pegawai ASN sesuai format pemerintah Indonesia." Termasuk juga SK promosi, pembentukan tim, pemetaan talenta, perencanaan suksesi, laporan evaluasi kinerja, surat pemanggilan, berita acara pemeriksaan, SOP kepegawaian, hingga rencana strategis SDM lima tahun.',
      ],
    },
    {
      title: 'Bab IV — Implementasi Sistem AI di Lingkungan Sekretariat',
      paragraphs: [
        'Sebuah Claude Project yang ditata rapi mengubah AI dari alat percakapan menjadi sistem operasi kerja: setiap dokumen punya rumah, setiap workflow punya pola, setiap staf punya pintu masuk yang sama.',
        'Struktur folder yang disarankan (KPU_JABAR_AI_SYSTEM): 00_MASTER_CONTEXT (profil, struktur organisasi, PKPU 14/2020, Renstra), 01_PARHUMAS (press release, konten medsos, laporan kegiatan, strategi komunikasi, media monitoring, pidato), 02_SDM (SK template, mutasi/promosi, talent mapping, succession planning, laporan SDM, disiplin), 03_TEMPLATES, 04_PROMPT_LIBRARY, dan 05_OUTPUT.',
        'Master Prompt sistem (dimasukkan ke Project Instruction): "Anda adalah AI Strategic Officer untuk Sekretariat KPU Provinsi Jawa Barat... Membantu menyusun dokumen resmi pemerintahan; SK, laporan, siaran pers, dan dokumen SDM; gaya formal birokrasi; mengacu pada PKPU 14/2020 dan regulasi ASN; menghasilkan dokumen siap tanda tangan."',
        'Tiga tingkat penerapan: Tingkat 1 (segera) — rancangan surat, SK, laporan, siaran pers. Tingkat 2 — pemetaan talenta, perencanaan suksesi, analisis partisipasi. Tingkat 3 — perencanaan komunikasi strategis dan analisis kapabilitas kelembagaan.',
      ],
    },
    {
      title: 'Bab V — Kerangka Pembangunan Prompt',
      paragraphs: [
        'Bab penutup memuat prompt meta untuk Claude — kerangka yang membantu staf merancang prompt baru ketika kebutuhan kerja melampaui pustaka yang tersedia. Diadaptasi dari kerangka Prompt Generator.',
        'Praktik meta-prompting: (1) pecah tugas menjadi subtugas; (2) libatkan sudut pandang segar dengan memanggil ahli tambahan untuk telaah independen; (3) tekankan verifikasi berulang; (4) cegah tebakan — nyatakan ketidakpastian bila data kurang; (5) bila perlu perhitungan/kode, panggil persona "Ahli Python"; (6) pertahankan format ringkas.',
        'Kerangka keluaran prompt terdiri atas: <Sistem> (definisi peran, menekankan verifikasi), <Konteks> (tugas/tujuan/latar), <Instruksi> (langkah penyelesaian + verifikasi data), <Kendala> (waktu, gaya, panjang, rujukan), dan <Format Keluaran> (spesifikasi tampilan hasil).',
        'Pesan pembuka standar: "Topik atau peran apa untuk prompt yang ingin Anda buat? Sampaikan detail yang sudah ada, dan saya akan membantu menyempurnakannya menjadi prompt yang jernih, terverifikasi, dan minim risiko halusinasi."',
      ],
    },
  ],
}
