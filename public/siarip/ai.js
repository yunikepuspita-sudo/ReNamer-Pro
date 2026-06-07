/* SIARIP KPU — AI Kearsipan (rule/keyword engine, simulasi on-device)
 * Pada produksi: digantikan OCR (Tesseract/PaddleOCR) + LLM klasifikasi +
 * Semantic Search (RAG). Versi ini mensimulasikan alur tanpa server. */
window.SIARIP_AI = (function () {
  const D = window.SIARIP;

  // Pemetaan kata kunci → kode klasifikasi (Kep. KPU 57/2022)
  const RULES = [
    { kode: 'PM', sub: 'Teknis Pemilu', jenis: 'Berita Acara', kw: ['rekapitulasi', 'penghitungan suara', 'hasil pemilu', 'berita acara', 'sertifikat hasil', 'formulir c', 'formulir d', 'penetapan calon terpilih', 'model c'] },
    { kode: 'DP', sub: 'Data & Informasi', jenis: 'Daftar', kw: ['dpt', 'daftar pemilih', 'dps', 'pemutakhiran data pemilih', 'coklit', 'dptb'] },
    { kode: 'LO', sub: 'Logistik', jenis: 'Berita Acara', kw: ['logistik', 'surat suara', 'kotak suara', 'distribusi', 'bilik', 'tinta', 'segel'] },
    { kode: 'KU', sub: 'Keuangan', jenis: 'Surat Dinas', kw: ['spj', 'pertanggungjawaban', 'honor', 'kuitansi', 'belanja', 'anggaran', 'pembayaran', 'gaji', 'tunjangan', 'laporan keuangan'] },
    { kode: 'KP', sub: 'SDM', jenis: 'Keputusan', kw: ['pegawai', 'kepegawaian', 'pengangkatan', 'kepangkatan', 'mutasi', 'cuti', 'pensiun', 'sk pns', 'jabatan'] },
    { kode: 'PR', sub: 'Perencanaan', jenis: 'Dokumen Perencanaan', kw: ['renstra', 'renja', 'perencanaan', 'rka', 'rkakl', 'program kerja', 'kak', 'tor'] },
    { kode: 'HK', sub: 'Hukum', jenis: 'Keputusan', kw: ['keputusan kpu', 'peraturan', 'pkpu', 'produk hukum', 'gugatan', 'sengketa', 'putusan'] },
    { kode: 'TP', sub: 'Teknis Pemilu', jenis: 'Dokumen Teknis', kw: ['tahapan', 'juknis', 'teknis penyelenggaraan', 'jadwal pemilu', 'kampanye'] },
    { kode: 'SO', sub: 'Parmas', jenis: 'Materi', kw: ['sosialisasi', 'pendidikan pemilih', 'kehumasan', 'publikasi'] },
    { kode: 'PS', sub: 'Parmas', jenis: 'Materi', kw: ['partisipasi masyarakat', 'relawan demokrasi', 'parmas'] },
    { kode: 'TU', sub: 'Umum', jenis: 'Surat Dinas', kw: ['undangan', 'rapat', 'nota dinas', 'surat tugas', 'disposisi', 'surat keterangan'] },
  ];

  const SUB_SERI = {
    KU: '02.03', KP: '01.03', PR: '01.02', HK: '01.01', PM: '05.01',
    DP: '03.02', LO: '02.04', TP: '04.01', SO: '02.01', PS: '03.01', TU: '01.01',
  };

  function detectTahun(text) {
    const m = text.match(/\b(19|20)\d{2}\b/);
    return m ? m[0] : String(new Date().getFullYear());
  }

  // Klasifikasi otomatis: skor berdasarkan jumlah kata kunci yang cocok
  function classify(text) {
    const t = (text || '').toLowerCase();
    let best = null, bestScore = 0, hits = [];
    for (const r of RULES) {
      const matched = r.kw.filter((k) => t.includes(k));
      if (matched.length > bestScore) { best = r; bestScore = matched.length; hits = matched; }
    }
    if (!best) {
      best = RULES.find((r) => r.kode === 'TU');
      hits = [];
    }
    // confidence sederhana
    const confidence = Math.min(98, 55 + bestScore * 14);
    return { rule: best, hits, confidence: bestScore ? confidence : 50 };
  }

  // Cari aturan JRA paling relevan untuk sebuah kode + teks
  function findJRA(kode, text) {
    const cands = D.jra.filter((j) => j.kode === kode);
    if (!cands.length) return null;
    const t = (text || '').toLowerCase();
    // pilih yang uraiannya paling cocok
    let best = cands[0], score = -1;
    for (const c of cands) {
      const words = c.uraian.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3);
      const s = words.filter((w) => t.includes(w)).length;
      if (s > score) { score = s; best = c; }
    }
    return best;
  }

  // Auto-metadata lengkap (output mirip skema di arsitektur SIARIP)
  function autoMetadata(text) {
    const { rule, hits, confidence } = classify(text);
    const tahun = detectTahun(text);
    const jraRule = findJRA(rule.kode, text);
    const retensiTotal = jraRule ? jraRule.aktif + jraRule.inaktif : 5;
    const meta = {
      jenis: rule.jenis,
      subbagian: rule.sub,
      tahun,
      kode_arsip: `${rule.kode}.${SUB_SERI[rule.kode] || '00.00'}`,
      klasifikasi: D.klasifikasi.Substantif.concat(D.klasifikasi.Fasilitatif).find((k) => k.kode === rule.kode)?.nama,
      retensi: jraRule ? `${retensiTotal} Tahun (aktif ${jraRule.aktif} + inaktif ${jraRule.inaktif})` : '5 Tahun',
      nasib_akhir: jraRule ? jraRule.nasibAkhir : 'Dinilai Kembali',
      terjaga: jraRule ? !!jraRule.terjaga : false,
      status: retensiStatus(Number(tahun), jraRule).status,
    };
    return { meta, hits, confidence, jraRule };
  }

  // Retensi Checker → Aktif / Inaktif / Permanen / Musnah
  function retensiStatus(tahunArsip, jraRule) {
    const now = new Date().getFullYear();
    const umur = now - tahunArsip;
    if (!jraRule) {
      return { status: 'Aktif', umur, alasan: 'Aturan JRA tidak ditemukan, default Aktif — perlu penilaian arsiparis.' };
    }
    const { aktif, inaktif, nasibAkhir } = jraRule;
    if (nasibAkhir === 'Permanen' && umur >= aktif + inaktif) {
      return { status: 'Permanen', umur, alasan: `Umur ${umur} th ≥ masa retensi (${aktif + inaktif} th); nasib akhir Permanen → simpan selamanya di Records Center.` };
    }
    if (umur >= aktif + inaktif) {
      const st = nasibAkhir === 'Musnah' ? 'Musnah' : nasibAkhir === 'Permanen' ? 'Permanen' : 'Dinilai Kembali';
      return { status: st, umur, alasan: `Umur ${umur} th ≥ masa retensi (${aktif + inaktif} th); nasib akhir: ${nasibAkhir}.` };
    }
    if (umur >= aktif) {
      return { status: 'Inaktif', umur, alasan: `Umur ${umur} th telah melewati masa aktif (${aktif} th); pindah ke Records Center sebagai arsip inaktif.` };
    }
    return { status: 'Aktif', umur, alasan: `Umur ${umur} th masih dalam masa aktif (${aktif} th); simpan di unit pengolah.` };
  }

  // Simulasi OCR: anggap teks yang dimasukkan adalah hasil ekstraksi OCR
  function fakeOcr(judul) {
    return judul; // pada prototipe, judul == hasil OCR
  }

  return { classify, autoMetadata, retensiStatus, findJRA, fakeOcr, SUB_SERI };
})();
