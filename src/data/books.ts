import type { Book, Chapter } from '../types'

/** Helper untuk membuat bab contoh agar reader punya konten yang bisa dibaca. */
function chapter(title: string, ...paragraphs: string[]): Chapter {
  return { title, paragraphs }
}

const demokrasiIntro = [
  'Demokrasi bukan sekadar prosedur memilih pemimpin setiap lima tahun sekali. Ia adalah cara hidup bersama yang menempatkan kedaulatan di tangan rakyat. Dalam bab ini kita menelusuri akar gagasan demokrasi, dari agora Athena kuno hingga bilik suara modern.',
  'Pemilihan umum adalah jantung dari sistem demokrasi perwakilan. Melalui pemilu, warga negara menyalurkan suara, menentukan arah kebijakan, dan menagih pertanggungjawaban dari mereka yang berkuasa. Namun pemilu yang bermakna menuntut lebih dari sekadar kotak suara: ia menuntut informasi yang jujur, kompetisi yang adil, dan partisipasi yang setara.',
  'Buku ini mengajak pembaca memahami bahwa setiap suara memiliki bobot. Satu lembar kertas yang dicoblos di bilik sederhana di pelosok desa memiliki nilai yang sama dengan suara di kota besar. Di sanalah letak keindahan dan tantangan demokrasi: kesetaraan yang harus terus dijaga.',
]

export const BOOKS: Book[] = [
  {
    id: 'panduan-mencoblos-pdf',
    themes: ['pemilu', 'pemilih-muda'],
    title: 'Panduan Mencoblos yang Benar (PDF)',
    author: 'Tim E-Pustaka Pemilu',
    publisher: 'E-Pustaka Pemilu',
    type: 'buku',
    category: 'Pendidikan',
    year: 2024,
    price: 0,
    rating: 4.9,
    premium: false,
    cover: ['#0e7490', '#22d3ee'],
    synopsis:
      'Buku saku berformat PDF yang merangkum langkah praktis mencoblos yang sah: persiapan sebelum ke TPS, prosedur di bilik suara, dan hak pemilih. Contoh dokumen PDF asli yang dapat dibaca langsung di dalam aplikasi.',
    pages: 3,
    pdfUrl: 'ebooks/panduan-mencoblos.pdf',
    chapters: [
      { title: 'Panduan Mencoblos yang Benar', paragraphs: ['Dokumen ini dibaca sebagai PDF.'] },
      { title: 'Bab 1 — Sebelum ke TPS', paragraphs: ['Dokumen ini dibaca sebagai PDF.'] },
      { title: 'Bab 2 — Di Bilik Suara', paragraphs: ['Dokumen ini dibaca sebagai PDF.'] },
    ],
  },
  {
    id: 'demokrasi-untuk-pemula',
    themes: ['demokrasi', 'pemilu', 'pemilih-muda'],
    title: 'Demokrasi untuk Pemula',
    author: 'R. Wijaya',
    publisher: 'Pustaka Kebangsaan',
    type: 'buku',
    category: 'Politik',
    year: 2023,
    price: 0,
    rating: 4.7,
    premium: false,
    cover: ['#1e3a8a', '#3b82f6'],
    synopsis:
      'Panduan ringkas memahami demokrasi, hak pilih, dan peran warga dalam pemilihan umum. Ditulis dengan bahasa sederhana untuk pembaca yang baru pertama kali ingin memahami sistem politik Indonesia.',
    pages: 184,
    chapters: [
      chapter('Bab 1 — Apa Itu Demokrasi?', ...demokrasiIntro),
      chapter(
        'Bab 2 — Sejarah Singkat Pemilu Indonesia',
        'Pemilihan umum pertama di Indonesia diselenggarakan pada tahun 1955, hanya satu dekade setelah kemerdekaan. Pemilu itu dikenang sebagai salah satu yang paling demokratis sepanjang sejarah bangsa, diikuti puluhan partai politik dan organisasi.',
        'Sejak saat itu, perjalanan pemilu Indonesia mengalami pasang surut. Era Orde Baru menyederhanakan jumlah partai dan membatasi ruang kompetisi. Reformasi 1998 membuka kembali keran demokrasi, melahirkan pemilu multipartai yang lebih bebas dan langsung.',
        'Memahami sejarah ini penting agar kita menghargai hak pilih yang kini kita miliki. Kebebasan memilih bukan pemberian cuma-cuma, melainkan hasil perjuangan panjang banyak generasi.',
      ),
      chapter(
        'Bab 3 — Hak dan Kewajiban Pemilih',
        'Setiap warga negara yang telah berusia 17 tahun atau sudah menikah memiliki hak untuk memilih. Hak ini dijamin oleh konstitusi dan tidak boleh dihalangi oleh siapa pun.',
        'Namun hak datang bersama tanggung jawab. Pemilih yang cerdas akan mengenali rekam jejak calon, membaca program kerja, dan menolak politik uang. Suara tidak untuk diperjualbelikan.',
      ),
    ],
  },
  {
    id: 'panduan-pemilih-cerdas',
    themes: ['literasi-digital', 'pemilu', 'pemilih-muda'],
    title: 'Panduan Pemilih Cerdas',
    author: 'Sari Anggraini',
    publisher: 'Rumah Demokrasi',
    type: 'buku',
    category: 'Pendidikan',
    year: 2024,
    price: 49000,
    rating: 4.5,
    premium: false,
    cover: ['#047857', '#10b981'],
    synopsis:
      'Bagaimana memilih dengan kepala dingin di tengah banjir informasi? Buku ini membekali pembaca dengan keterampilan menyaring berita, mengenali hoaks kampanye, dan menelusuri rekam jejak kandidat.',
    pages: 220,
    chapters: [
      chapter(
        'Bab 1 — Banjir Informasi Menjelang Pemilu',
        'Setiap musim pemilu, lini masa kita dipenuhi janji, gambar, dan tudingan. Sebagian benar, sebagian dilebih-lebihkan, dan sebagian lagi sepenuhnya palsu. Pemilih cerdas adalah pemilih yang mampu memilah.',
        'Langkah pertama adalah memperlambat diri. Jangan langsung membagikan sebuah unggahan hanya karena ia memancing emosi. Emosi yang kuat justru sering menjadi penanda bahwa kita sedang dimanipulasi.',
      ),
      chapter(
        'Bab 2 — Mengenali Hoaks dan Disinformasi',
        'Hoaks kampanye memiliki pola yang dapat dikenali: sumber yang tidak jelas, foto yang dipotong dari konteksnya, dan ajakan untuk segera menyebarkan. Periksa selalu sumber asli sebelum percaya.',
        'Gunakan mesin pencari gambar terbalik, baca berita dari beberapa media arus utama, dan rujuk situs resmi penyelenggara pemilu. Verifikasi sederhana ini menyelamatkan demokrasi dari kebohongan.',
      ),
    ],
  },
  {
    id: 'sejarah-pemilu-indonesia',
    themes: ['sejarah', 'pemilu', 'demokrasi'],
    title: 'Sejarah Pemilu Indonesia 1955–2024',
    author: 'Prof. Hadiyanto',
    publisher: 'Penerbit Arsip Nusantara',
    type: 'buku',
    category: 'Sejarah',
    year: 2024,
    price: 95000,
    rating: 4.8,
    premium: true,
    cover: ['#7c2d12', '#ea580c'],
    synopsis:
      'Kajian mendalam tujuh dekade pemilihan umum di Indonesia, lengkap dengan data, foto arsip, dan analisis pergeseran sistem pemilu dari masa ke masa.',
    pages: 412,
    chapters: [
      chapter(
        'Bagian I — Pemilu Pertama 1955',
        'Pemilu 1955 berlangsung dalam dua tahap: memilih anggota DPR pada September dan anggota Konstituante pada Desember. Antusiasme rakyat luar biasa meski tingkat melek huruf masih rendah.',
        'Empat partai besar — PNI, Masyumi, NU, dan PKI — mendominasi perolehan suara. Pemilu ini menjadi tolok ukur kejujuran yang terus dikenang hingga hari ini.',
      ),
      chapter(
        'Bagian II — Pemilu Era Orde Baru',
        'Mulai 1971, sistem pemilu disederhanakan. Peserta dibatasi menjadi tiga kekuatan politik. Golongan Karya mendominasi secara konsisten selama lebih dari dua dekade.',
        'Periode ini meninggalkan pelajaran berharga tentang pentingnya independensi penyelenggara pemilu dan kebebasan pers sebagai pengawas jalannya demokrasi.',
      ),
    ],
  },
  {
    id: 'konstitusi-dan-kita',
    themes: ['hukum-konstitusi', 'demokrasi'],
    title: 'Konstitusi dan Kita',
    author: 'Dewi Larasati',
    publisher: 'Pustaka Kebangsaan',
    type: 'buku',
    category: 'Hukum',
    year: 2022,
    price: 0,
    rating: 4.3,
    premium: false,
    cover: ['#581c87', '#a855f7'],
    synopsis:
      'Mengupas UUD 1945 secara membumi: bagaimana konstitusi mengatur kekuasaan, melindungi hak warga, dan menjadi pegangan dalam menyelenggarakan pemilu yang sah.',
    pages: 168,
    chapters: [
      chapter(
        'Bab 1 — Konstitusi sebagai Hukum Tertinggi',
        'Undang-Undang Dasar adalah aturan main tertinggi sebuah negara. Semua undang-undang lain, termasuk yang mengatur pemilu, harus tunduk padanya.',
        'Konstitusi menjamin bahwa kekuasaan tidak terpusat pada satu tangan. Pembagian kekuasaan antara legislatif, eksekutif, dan yudikatif menjaga agar tidak ada pihak yang berkuasa tanpa batas.',
      ),
    ],
  },
  {
    id: 'kampanye-bersih',
    themes: ['kampanye', 'pemilu'],
    title: 'Kampanye Bersih, Politik Sehat',
    author: 'Andi Pratama',
    publisher: 'Rumah Demokrasi',
    type: 'buku',
    category: 'Politik',
    year: 2023,
    price: 65000,
    rating: 4.2,
    premium: false,
    cover: ['#0e7490', '#06b6d4'],
    synopsis:
      'Studi kasus kampanye yang mengedepankan gagasan, bukan uang. Inspirasi bagi calon, relawan, dan pemilih yang merindukan kontestasi politik yang bermartabat.',
    pages: 196,
    chapters: [
      chapter(
        'Bab 1 — Politik Gagasan',
        'Kampanye yang sehat berpusat pada adu program, bukan adu serangan pribadi. Pemilih berhak tahu apa yang akan dikerjakan, bukan sekadar siapa yang paling pandai menyerang lawan.',
        'Politik gagasan menuntut calon untuk benar-benar memahami persoalan rakyat: harga pangan, lapangan kerja, layanan kesehatan, dan pendidikan.',
      ),
    ],
  },
  {
    id: 'literasi-digital-pemilu',
    themes: ['literasi-digital', 'kampanye'],
    title: 'Literasi Digital di Tahun Politik',
    author: 'Maya Kusuma',
    publisher: 'Penerbit Cendekia',
    type: 'buku',
    category: 'Teknologi',
    year: 2024,
    price: 72000,
    rating: 4.6,
    premium: true,
    cover: ['#9d174d', '#ec4899'],
    synopsis:
      'Media sosial mengubah wajah kampanye. Buku ini membahas algoritma, ruang gema, microtargeting, dan cara warga melindungi diri dari manipulasi digital.',
    pages: 240,
    chapters: [
      chapter(
        'Bab 1 — Algoritma yang Membentuk Pilihan',
        'Tanpa kita sadari, apa yang kita lihat di media sosial telah disaring oleh algoritma. Sistem ini cenderung menyajikan konten yang menguatkan keyakinan kita, menciptakan ruang gema.',
        'Memahami cara kerja algoritma adalah langkah awal untuk keluar dari gelembung informasi dan melihat gambaran yang lebih utuh.',
      ),
    ],
  },
  {
    id: 'majalah-suara-rakyat',
    themes: ['pemilu', 'demokrasi'],
    title: 'Majalah Suara Rakyat — Edisi Pemilu',
    author: 'Redaksi Suara Rakyat',
    publisher: 'Suara Rakyat Media',
    type: 'majalah',
    category: 'Berita',
    year: 2024,
    price: 25000,
    rating: 4.1,
    premium: false,
    cover: ['#b91c1c', '#f59e0b'],
    synopsis:
      'Edisi khusus menyambut pemilu: profil daerah pemilihan, wawancara penyelenggara, dan infografik data pemilih dari seluruh provinsi.',
    pages: 64,
    chapters: [
      chapter(
        'Laporan Utama — Menyongsong Hari Pencoblosan',
        'Hari pemungutan suara semakin dekat. Di seluruh penjuru negeri, tempat pemungutan suara mulai dipersiapkan, logistik didistribusikan, dan petugas dilatih.',
        'Edisi ini menyajikan potret kesiapan dari Sabang sampai Merauke, lengkap dengan data jumlah pemilih dan tantangan logistik di daerah terpencil.',
      ),
    ],
  },
  {
    id: 'majalah-demokrasi-kini',
    themes: ['demokrasi', 'pemilu'],
    title: 'Demokrasi Kini — Vol. 12',
    author: 'Redaksi Demokrasi Kini',
    publisher: 'Lembaga Kajian Politik',
    type: 'majalah',
    category: 'Analisis',
    year: 2024,
    price: 30000,
    rating: 4.4,
    premium: true,
    cover: ['#1e40af', '#6366f1'],
    synopsis:
      'Jurnal populer berisi analisis tren elektoral, hasil survei, dan kolom para pakar tata negara mengenai kualitas demokrasi Indonesia.',
    pages: 80,
    chapters: [
      chapter(
        'Kolom Utama — Membaca Angka Survei',
        'Survei adalah potret sesaat, bukan ramalan pasti. Pembaca perlu memahami margin of error, metode pengambilan sampel, dan rentang waktu survei sebelum menyimpulkan.',
        'Angka yang sama bisa diinterpretasikan berbeda. Karena itu, transparansi metodologi lembaga survei menjadi kunci kepercayaan publik.',
      ),
    ],
  },
  {
    id: 'koran-harian-bangsa',
    themes: ['pemilu', 'pengawasan'],
    title: 'Harian Bangsa — Hasil Hitung Cepat',
    author: 'Redaksi Harian Bangsa',
    publisher: 'Harian Bangsa',
    type: 'koran',
    category: 'Berita',
    year: 2024,
    price: 5000,
    rating: 4.0,
    premium: false,
    cover: ['#374151', '#9ca3af'],
    synopsis:
      'Edisi pagi pasca-pencoblosan: liputan hitung cepat, suasana di berbagai TPS, dan pernyataan resmi penyelenggara pemilu.',
    pages: 24,
    chapters: [
      chapter(
        'Halaman 1 — Partisipasi Pemilih Tinggi',
        'Tingkat kehadiran pemilih pada pemilu kali ini tercatat tinggi. Antrean panjang terlihat sejak pagi di banyak tempat pemungutan suara di kota maupun desa.',
        'Penyelenggara mengimbau masyarakat menunggu hasil resmi dan tidak terburu-buru mempercayai klaim kemenangan dari pihak mana pun.',
      ),
    ],
  },
  {
    id: 'koran-warta-pemilu',
    themes: ['pemilu', 'kampanye'],
    title: 'Warta Pemilu — Edisi Kampanye',
    author: 'Redaksi Warta Pemilu',
    publisher: 'Warta Nusantara',
    type: 'koran',
    category: 'Berita',
    year: 2024,
    price: 0,
    rating: 3.9,
    premium: false,
    cover: ['#065f46', '#34d399'],
    synopsis:
      'Lembar berita gratis berisi jadwal kampanye, peta dapil, dan panduan teknis mencoblos yang sah agar suara tidak terbuang.',
    pages: 16,
    chapters: [
      chapter(
        'Panduan — Cara Mencoblos yang Sah',
        'Suara dianggap sah apabila pemilih mencoblos pada kolom yang tersedia menggunakan alat yang disediakan. Coblos pada nomor, nama, atau foto calon dalam satu kolom yang sama tetap dihitung sah.',
        'Hindari merusak atau mencoret surat suara di luar kolom. Jika surat suara rusak sebelum dicoblos, pemilih berhak meminta penggantian satu kali kepada petugas.',
      ),
    ],
  },
  {
    id: 'partisipasi-anak-muda',
    themes: ['pemilih-muda', 'demokrasi'],
    title: 'Anak Muda dan Masa Depan Demokrasi',
    author: 'Bagas Nugroho',
    publisher: 'Penerbit Cendekia',
    type: 'buku',
    category: 'Sosial',
    year: 2024,
    price: 58000,
    rating: 4.6,
    premium: false,
    cover: ['#c2410c', '#fbbf24'],
    synopsis:
      'Generasi muda adalah pemilih terbesar. Buku ini membahas peran, tantangan, dan kekuatan anak muda dalam menentukan arah bangsa melalui kotak suara.',
    pages: 208,
    chapters: [
      chapter(
        'Bab 1 — Suara yang Menentukan',
        'Pemilih muda kini menjadi kelompok terbesar dalam daftar pemilih. Pilihan mereka berpotensi mengubah peta politik secara signifikan.',
        'Namun jumlah besar saja tidak cukup. Yang menentukan adalah kualitas partisipasi: seberapa kritis, seberapa terinformasi, dan seberapa berani anak muda menagih janji.',
      ),
    ],
  },
  {
    id: 'etika-penyelenggara',
    themes: ['pengawasan', 'hukum-konstitusi'],
    title: 'Etika Penyelenggara Pemilu',
    author: 'Dr. Ratna Sari',
    publisher: 'Penerbit Arsip Nusantara',
    type: 'buku',
    category: 'Hukum',
    year: 2023,
    price: 88000,
    rating: 4.5,
    premium: true,
    cover: ['#155e75', '#22d3ee'],
    synopsis:
      'Integritas penyelenggara adalah fondasi pemilu yang dipercaya. Buku ini membedah kode etik, independensi, dan mekanisme pengawasan lembaga pemilu.',
    pages: 256,
    chapters: [
      chapter(
        'Bab 1 — Independensi sebagai Syarat Mutlak',
        'Penyelenggara pemilu harus berdiri di atas semua kepentingan. Keberpihakan, sekecil apa pun, dapat meruntuhkan kepercayaan publik terhadap hasil pemilu.',
        'Independensi bukan hanya soal sikap, tetapi juga soal sistem: rekrutmen yang transparan, anggaran yang memadai, dan perlindungan dari tekanan politik.',
      ),
    ],
  },
]

export const CATEGORIES = Array.from(new Set(BOOKS.map((b) => b.category))).sort()

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id)
}

export function formatRupiah(value: number): string {
  if (value === 0) return 'Gratis'
  return 'Rp ' + value.toLocaleString('id-ID')
}
