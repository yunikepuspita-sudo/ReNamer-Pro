/* ============================================================================
 * AI Planning Document Factory — KPU
 * generators.js — Mesin: Requirement Analyzer, RAB Generator, Budget Validator,
 *                 Document Generators (Nota Dinas, KAK, TOR, RAB, Jadwal, SK,
 *                 SPT, Matriks Risiko), dan AI Review Assistant.
 * ==========================================================================*/
window.GEN = (function () {
  'use strict';

  const KB = window.KB;

  // ── Util ────────────────────────────────────────────────────────────────
  const rupiah = (n) => 'Rp ' + Math.round(n || 0).toLocaleString('id-ID');
  const terbilangBulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  function tglID(iso) {
    if (!iso) return '...........................';
    const d = new Date(iso + 'T00:00:00');
    return `${d.getDate()} ${terbilangBulan[d.getMonth()]} ${d.getFullYear()}`;
  }
  function hariID(iso) {
    if (!iso) return '';
    const nm = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', "Jum'at", 'Sabtu'];
    return nm[new Date(iso + 'T00:00:00').getDay()];
  }
  function addDays(iso, n) {
    const d = new Date(iso + 'T00:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  // ── Terbilang (angka → kata) untuk nilai RAB ──────────────────────────────
  function terbilang(n) {
    n = Math.round(n);
    const a = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
    function f(x) {
      if (x < 12) return a[x];
      if (x < 20) return f(x - 10) + ' belas';
      if (x < 100) return f(Math.floor(x / 10)) + ' puluh ' + f(x % 10);
      if (x < 200) return 'seratus ' + f(x - 100);
      if (x < 1000) return f(Math.floor(x / 100)) + ' ratus ' + f(x % 100);
      if (x < 2000) return 'seribu ' + f(x - 1000);
      if (x < 1000000) return f(Math.floor(x / 1000)) + ' ribu ' + f(x % 1000);
      if (x < 1000000000) return f(Math.floor(x / 1000000)) + ' juta ' + f(x % 1000000);
      return f(Math.floor(x / 1000000000)) + ' miliar ' + f(x % 1000000000);
    }
    return f(n).replace(/\s+/g, ' ').trim() + ' rupiah';
  }

  // ════════════════════════════════════════════════════════════════════════
  // 1. AI REQUIREMENT ANALYZER
  // ════════════════════════════════════════════════════════════════════════
  function analyzeRequirements(f) {
    const isPengadaan = f.jenis === 'pengadaan' || f.sumber === 'HNP' && f.jenis === 'pengadaan';
    const adaNarasumber = ['bimtek', 'sosialisasi', 'rakor', 'fgd'].includes(f.jenis);
    const banyakPeserta = Number(f.peserta) >= 30;

    const docs = [
      { id: 'nota_dinas', nama: 'Nota Dinas', status: 'Wajib' },
      { id: 'kak', nama: 'KAK (Kerangka Acuan Kerja)', status: 'Wajib' },
      { id: 'tor', nama: 'TOR (Term of Reference)', status: 'Wajib' },
      { id: 'rab', nama: 'RAB (Rincian Anggaran Biaya)', status: 'Wajib' },
      { id: 'jadwal', nama: 'Jadwal Kegiatan', status: 'Wajib' },
      { id: 'sk_panitia', nama: 'SK Panitia/Tim', status: banyakPeserta || adaNarasumber ? 'Perlu' : 'Opsional' },
      { id: 'spt', nama: 'SPT (Surat Perintah Tugas)', status: adaNarasumber ? 'Perlu' : 'Opsional' },
      { id: 'matriks_risiko', nama: 'Matriks Risiko', status: 'Perlu' },
    ];

    if (adaNarasumber) {
      docs.push({ id: 'kontrak_ns', nama: 'Kontrak/SPK Narasumber', status: 'Opsional' });
    }
    if (isPengadaan || f.sumber === 'HNP') {
      docs.push({ id: 'kak_pengadaan', nama: 'Spesifikasi Teknis / KAK Pengadaan', status: isPengadaan ? 'Wajib' : 'Opsional' });
      docs.push({ id: 'hps', nama: 'HPS (Harga Perkiraan Sendiri)', status: isPengadaan ? 'Wajib' : 'Opsional' });
      docs.push({ id: 'rancangan_kontrak', nama: 'Rancangan Kontrak', status: isPengadaan ? 'Perlu' : 'Opsional' });
    }
    if (f.sumber === 'HNP') {
      docs.push({ id: 'sp2hl', nama: 'SP2HL/SPHL (Pengesahan Hibah)', status: 'Perlu' });
    }
    return docs;
  }

  // ════════════════════════════════════════════════════════════════════════
  // 2. RAB GENERATOR (AI Document Generator — bagian D + Budget Validator)
  // ════════════════════════════════════════════════════════════════════════
  function generateRAB(f) {
    const SBM = KB.SBM;
    const peserta = Math.max(1, Number(f.peserta) || 0);
    const hari = Math.max(1, Number(f.hari) || 1);
    const jenis = f.jenis;
    const items = [];

    const push = (key, vol, satuan, hargaOverride) => {
      const s = SBM[key];
      if (!s) return;
      const harga = hargaOverride != null ? hargaOverride : (s.max != null ? s.max : 0);
      items.push({
        uraian: s.label,
        akun: s.akun,
        akunNama: KB.AKUN[s.akun] || '',
        vol,
        satuan: s.satuan,
        harga,
        jumlah: vol * harga,
        sbmMax: s.max,
        sbmKey: key,
      });
    };

    if (jenis === 'pengadaan') {
      // Belanja Modal (mis. HNP 2026 — Peralatan & Mesin)
      items.push({
        uraian: 'Pengadaan Peralatan dan Mesin (sesuai spesifikasi teknis)',
        akun: '532111', akunNama: KB.AKUN['532111'],
        vol: 1, satuan: 'Paket', harga: 0, jumlah: 0, sbmMax: null, sbmKey: null,
        editableHarga: true,
      });
      items.push({
        uraian: 'Biaya pendukung/administrasi pengadaan (ATK, penggandaan)',
        akun: '521211', akunNama: KB.AKUN['521211'],
        vol: 1, satuan: 'Paket', harga: 2500000, jumlah: 2500000, sbmMax: null, sbmKey: null,
      });
      return finalizeRAB(items);
    }

    // Kegiatan pertemuan (bimtek/sosialisasi/rakor/fgd/rdk)
    const jenisInfo = KB.JENIS_KEGIATAN[jenis] || KB.JENIS_KEGIATAN.fullday;
    const pola = jenisInfo.pola;

    // Narasumber & moderator
    if (['bimtek', 'sosialisasi', 'rakor', 'fgd'].includes(jenis)) {
      const jamPerHari = jenis === 'fgd' ? 2 : 4;
      const ns = jenis === 'bimtek' ? 2 : 1; // jumlah narasumber
      push('narasumber_es3', ns * jamPerHari * hari, null); // default praktisi/es3
      push('moderator', 1 * hari, null);
    }

    // Paket meeting / uang harian sesuai pola
    if (pola === 'fullboard') {
      push('paket_fullboard', peserta * hari, null);
      push('uang_harian_fullboard', peserta * hari, null);
    } else if (pola === 'fullday') {
      push('paket_fullday', peserta * hari, null);
      push('uang_harian_fullday', peserta * hari, null);
    } else if (pola === 'halfday') {
      push('paket_halfday', peserta * hari, null);
    } else if (pola === 'rdk') {
      push('konsumsi_makan', peserta * hari, null);
      push('konsumsi_snack', peserta * hari, null);
      push('uang_saku_rdk', peserta * hari, null);
    }

    // Transport lokal peserta (kecuali fullboard yang menginap)
    if (pola !== 'fullboard') {
      push('transport_lokal', peserta * hari, null);
    }

    // Bahan/ATK, penggandaan, spanduk
    push('atk_paket', 1, null, 2000000);
    push('penggandaan', peserta, null, 25000);
    push('spanduk', 1, null, 350000);

    return finalizeRAB(items);
  }

  function finalizeRAB(items) {
    const total = items.reduce((s, it) => s + (it.jumlah || 0), 0);
    return { items, total };
  }

  function recomputeRAB(items) {
    items.forEach((it) => { it.jumlah = (it.vol || 0) * (it.harga || 0); });
    return items.reduce((s, it) => s + (it.jumlah || 0), 0);
  }

  // ════════════════════════════════════════════════════════════════════════
  // 3. AI BUDGET VALIDATOR
  // ════════════════════════════════════════════════════════════════════════
  function validateBudget(rab) {
    const temuan = [];

    // a. Kepatuhan SBM
    rab.items.forEach((it) => {
      if (it.sbmMax != null && it.harga > it.sbmMax) {
        temuan.push({
          tipe: 'sbm', level: 'error',
          pesan: `${it.uraian}: harga satuan ${rupiah(it.harga)} melebihi batas SBM ${rupiah(it.sbmMax)}.`,
          saran: `Turunkan ke maksimal ${rupiah(it.sbmMax)}.`,
        });
      }
    });

    // b. Deteksi duplikasi anggaran (uraian sama / kategori konsumsi ganda)
    const seen = {};
    rab.items.forEach((it) => {
      const k = it.uraian.toLowerCase().trim();
      if (seen[k]) {
        temuan.push({ tipe: 'duplikasi', level: 'warn', pesan: `Kemungkinan duplikasi: "${it.uraian}" muncul lebih dari sekali.`, saran: 'Gabungkan atau hapus baris ganda.' });
      }
      seen[k] = true;
    });
    const adaPaket = rab.items.some((it) => /paket meeting|fullboard|fullday|halfday/i.test(it.uraian));
    const adaKonsumsi = rab.items.some((it) => /konsumsi/i.test(it.uraian));
    if (adaPaket && adaKonsumsi) {
      temuan.push({ tipe: 'duplikasi', level: 'warn', pesan: 'Paket meeting sudah mencakup konsumsi — terdapat konsumsi terpisah (potensi ganda).', saran: 'Hapus konsumsi terpisah bila memakai paket meeting.' });
    }

    // c. Simulasi efisiensi (kurangi peserta 10%)
    const pesertaItems = rab.items.filter((it) => /OH|OK|OP/.test(it.satuan || '') && it.vol > 1);
    const hemat = pesertaItems.reduce((s, it) => s + it.jumlah * 0.1, 0);

    return {
      temuan,
      patuh: temuan.filter((t) => t.level === 'error').length === 0,
      efisiensi: hemat > 0 ? { persen: 10, nilai: Math.round(hemat), pesan: `Jika peserta/volume dikurangi 10%, estimasi penghematan ${rupiah(hemat)}.` } : null,
    };
  }

  // ════════════════════════════════════════════════════════════════════════
  // 4. AI REVIEW ASSISTANT (Compliance / Quality / Risk)
  // ════════════════════════════════════════════════════════════════════════
  function reviewAssistant(f, rab, validasi) {
    const compliance = [];
    const quality = [];
    const risk = [];

    compliance.push(check(!!f.nama, 'Nama kegiatan terisi'));
    compliance.push(check(!!f.tujuan, 'Tujuan kegiatan jelas'));
    compliance.push(check(!!f.output, 'Output kegiatan terdefinisi'));
    compliance.push(check(!!f.tanggal, 'Waktu pelaksanaan ditetapkan'));
    compliance.push(check(!!f.sumber, 'Sumber anggaran dipilih (' + (KB.SUMBER[f.sumber] ? KB.SUMBER[f.sumber].label : '-') + ')'));
    compliance.push(check(rab.total > 0, 'RAB memiliki nilai anggaran'));

    quality.push(check((f.tujuan || '').length > 20, 'Tujuan ditulis memadai (bukan satu kata)'));
    quality.push(check(!!f.sasaran, 'Sasaran/peserta kegiatan dinyatakan'));
    quality.push(check((f.output || '').length > 5, 'Output dirumuskan terukur'));

    risk.push(check(validasi.patuh, validasi.patuh ? 'Seluruh item sesuai SBM (rendah risiko temuan BPK)' : 'Terdapat item melebihi SBM — POTENSI TEMUAN BPK/Inspektorat'));
    risk.push(check(!validasi.temuan.some((t) => t.tipe === 'duplikasi'), validasi.temuan.some((t) => t.tipe === 'duplikasi') ? 'Terindikasi duplikasi anggaran — periksa kembali' : 'Tidak terindikasi duplikasi anggaran'));
    if (f.sumber === 'HNP') {
      risk.push(check(true, 'Sumber Hibah (HLD): pastikan sesuai NPHD & register hibah 22S6FR8A, serta pengesahan SP2HL/SPHL.'));
    }

    const skor = Math.round(
      (compliance.concat(quality, risk).filter((x) => x.ok).length /
        compliance.concat(quality, risk).length) * 100
    );
    return { compliance, quality, risk, skor };
  }
  function check(ok, label) { return { ok: !!ok, label }; }

  // ════════════════════════════════════════════════════════════════════════
  // 5. DOCUMENT GENERATORS  → mengembalikan HTML siap cetak
  // ════════════════════════════════════════════════════════════════════════
  const KOP = (f) => `
    <div class="doc-kop">
      <div class="kop-logo">🏛️</div>
      <div class="kop-text">
        <div class="kop-l1">KOMISI PEMILIHAN UMUM</div>
        <div class="kop-l2">PROVINSI JAWA BARAT</div>
        <div class="kop-l3">Jalan Garut No. 11, Kota Bandung 40271 · Telp. (022) 4232789 · jabar.kpu.go.id</div>
      </div>
    </div><hr class="kop-rule"/>`;

  const blokSumber = (f) => {
    const s = KB.SUMBER[f.sumber] || {};
    return `<p><b>Sumber Dana:</b> ${s.label || '-'}${s.register ? ' · Register Hibah No. ' + s.register : ''} · DIPA KPU Prov. Jawa Barat TA ${KB.RKA.tahun}.</p>`;
  };

  function docNotaDinas(f, m) {
    return KOP(f) + `
      <h2 class="doc-title">NOTA DINAS</h2>
      <p class="doc-nomor">Nomor: ${m.nomor}</p>
      <table class="doc-meta">
        <tr><td>Yth.</td><td>:</td><td>Sekretaris KPU Provinsi Jawa Barat</td></tr>
        <tr><td>Dari</td><td>:</td><td>${f.pemrakarsa || 'Kepala Bagian/Subbagian Pemrakarsa'}</td></tr>
        <tr><td>Hal</td><td>:</td><td>Permohonan Persetujuan Kegiatan ${f.nama}</td></tr>
        <tr><td>Tanggal</td><td>:</td><td>${tglID(m.tglDok)}</td></tr>
      </table>
      <p>Dengan hormat, dalam rangka ${f.tujuan || 'pelaksanaan tugas dan fungsi'}, bersama ini kami mengajukan permohonan persetujuan pelaksanaan kegiatan <b>${f.nama}</b> yang akan dilaksanakan pada ${tglID(f.tanggal)} di ${f.lokasi || '-'} dengan sasaran ${f.sasaran || f.peserta + ' peserta'}.</p>
      <p>Kegiatan ini direncanakan dengan total anggaran sebesar <b>${rupiah(m.total)}</b> (${terbilang(m.total)}) yang bersumber dari ${(KB.SUMBER[f.sumber] || {}).label || '-'}.</p>
      <p>Sebagai bahan pertimbangan, terlampir KAK, TOR, RAB, dan jadwal kegiatan. Atas perkenan dan persetujuan Bapak/Ibu, kami ucapkan terima kasih.</p>
      ${ttdBlok(f, m, f.pemrakarsa || 'Pemrakarsa Kegiatan')}`;
  }

  function docKAK(f, m) {
    const s = KB.SUMBER[f.sumber] || {};
    return KOP(f) + `
      <h2 class="doc-title">KERANGKA ACUAN KERJA (KAK)</h2>
      <p class="doc-nomor">Kegiatan: ${f.nama} · TA ${KB.RKA.tahun}</p>
      <ol class="doc-ol">
        <li><b>Latar Belakang.</b> Dalam rangka penguatan tata kelola dan pelaksanaan tugas KPU Provinsi Jawa Barat, kegiatan ${f.nama} diselenggarakan untuk menjawab kebutuhan ${f.tujuan || '...'}. Kegiatan ini sejalan dengan prinsip tata kelola yang akuntabel, transparan, dan patuh regulasi.</li>
        <li><b>Dasar Hukum.</b><ul>${s.dasar ? s.dasar.map((d) => '<li>' + d + '</li>').join('') : ''}${KB.REGULASI.nasional.slice(0, 3).map((d) => '<li>' + d + '</li>').join('')}</ul></li>
        <li><b>Maksud.</b> Memberikan ${f.tujuan || 'pemahaman dan penguatan kapasitas'} bagi ${f.sasaran || 'peserta'}.</li>
        <li><b>Tujuan.</b> ${f.tujuan || '-'}</li>
        <li><b>Output (Keluaran).</b> ${f.output || '-'}</li>
        <li><b>Outcome (Hasil).</b> Meningkatnya kapasitas dan kinerja ${f.sasaran || 'peserta'} dalam mendukung tugas dan fungsi KPU.</li>
        <li><b>Sasaran.</b> ${f.sasaran || f.peserta + ' orang'}</li>
        <li><b>Lokasi & Waktu.</b> ${f.lokasi || '-'}, ${tglID(f.tanggal)}${Number(f.hari) > 1 ? ' s.d. ' + tglID(addDays(f.tanggal, Number(f.hari) - 1)) : ''} (${f.hari || 1} hari).</li>
        <li><b>Indikator Keberhasilan.</b> Terlaksananya kegiatan sesuai jadwal; minimal 90% peserta hadir; tersusunnya ${f.output || 'output kegiatan'}.</li>
        <li><b>Pembiayaan.</b> Total ${rupiah(m.total)} (${terbilang(m.total)}) bersumber dari ${s.label || '-'}.</li>
      </ol>
      ${ttdBlok(f, m, f.pemrakarsa || 'Pejabat Pembuat Komitmen')}`;
  }

  function docTOR(f, m) {
    return KOP(f) + `
      <h2 class="doc-title">TERM OF REFERENCE (TOR)</h2>
      <p class="doc-nomor">${f.nama} · TA ${KB.RKA.tahun}</p>
      <ol class="doc-ol">
        <li><b>Ruang Lingkup.</b> Kegiatan mencakup persiapan, pelaksanaan, dan pelaporan ${f.nama} di ${f.lokasi || '-'}.</li>
        <li><b>Metodologi.</b> ${metodologi(f)}</li>
        <li><b>Deliverables.</b> ${f.output || '-'}; laporan pelaksanaan; dokumentasi; daftar hadir.</li>
        <li><b>KPI Kegiatan.</b> Kehadiran ≥ 90%; tingkat pemahaman peserta meningkat; output tersusun tepat waktu.</li>
        <li><b>Peserta/Sasaran.</b> ${f.sasaran || f.peserta + ' orang'}.</li>
        <li><b>Jangka Waktu.</b> ${f.hari || 1} hari, ${tglID(f.tanggal)}.</li>
        <li><b>Pembiayaan.</b> ${rupiah(m.total)} dari ${(KB.SUMBER[f.sumber] || {}).label || '-'}.</li>
      </ol>
      ${ttdBlok(f, m, f.pemrakarsa || 'Pejabat Pembuat Komitmen')}`;
  }
  function metodologi(f) {
    const map = {
      bimtek: 'Ceramah, praktik/simulasi, tanya-jawab, dan evaluasi.',
      sosialisasi: 'Paparan narasumber, diskusi, dan tanya-jawab.',
      rakor: 'Rapat koordinasi, pembahasan kelompok, dan perumusan kesimpulan.',
      fgd: 'Focus Group Discussion terstruktur dengan fasilitator.',
      rdk: 'Rapat dalam kantor dengan pembahasan agenda.',
      pengadaan: 'Pengadaan barang/jasa sesuai ketentuan Perpres PBJ.',
    };
    return map[f.jenis] || 'Paparan dan diskusi.';
  }

  function docRAB(f, m) {
    const rows = m.rab.items.map((it, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${it.uraian}${it.sbmMax != null && it.harga > it.sbmMax ? ' <span class="badge-err">&gt; SBM</span>' : ''}</td>
        <td class="c">${it.akun}</td>
        <td class="r">${it.vol}</td>
        <td class="c">${it.satuan || '-'}</td>
        <td class="r">${rupiah(it.harga)}</td>
        <td class="r">${rupiah(it.jumlah)}</td>
      </tr>`).join('');
    return KOP(f) + `
      <h2 class="doc-title">RINCIAN ANGGARAN BIAYA (RAB)</h2>
      <p class="doc-nomor">${f.nama} · Sumber: ${(KB.SUMBER[f.sumber] || {}).label || '-'} · TA ${KB.RKA.tahun}</p>
      <table class="doc-table">
        <thead><tr><th>No</th><th>Uraian</th><th>Akun</th><th>Vol</th><th>Sat</th><th>Harga Satuan</th><th>Jumlah</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="6" class="r"><b>TOTAL</b></td><td class="r"><b>${rupiah(m.total)}</b></td></tr></tfoot>
      </table>
      <p><i>Terbilang: ${terbilang(m.total)}.</i></p>
      ${blokSumber(f)}
      ${ttdBlok(f, m, f.pemrakarsa || 'Pejabat Pembuat Komitmen')}`;
  }

  function docJadwal(f, m) {
    const hari = Math.max(1, Number(f.hari) || 1);
    let rows = '';
    for (let d = 0; d < hari; d++) {
      const tgl = addDays(f.tanggal, d);
      rows += `
        <tr><td class="c">${d + 1}</td><td>${hariID(tgl)}, ${tglID(tgl)}</td><td>08.00–09.00</td><td>Registrasi & Pembukaan</td></tr>
        <tr><td></td><td></td><td>09.00–12.00</td><td>Sesi Materi/Pembahasan ${d + 1}</td></tr>
        <tr><td></td><td></td><td>13.00–15.30</td><td>Praktik/Diskusi & Tanya Jawab</td></tr>
        <tr><td></td><td></td><td>15.30–16.00</td><td>Penutupan/RTL</td></tr>`;
    }
    return KOP(f) + `
      <h2 class="doc-title">JADWAL KEGIATAN</h2>
      <p class="doc-nomor">${f.nama}</p>
      <table class="doc-table">
        <thead><tr><th>Hari ke-</th><th>Tanggal</th><th>Waktu</th><th>Agenda</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${ttdBlok(f, m, f.pemrakarsa || 'Ketua Panitia')}`;
  }

  function docSK(f, m) {
    return KOP(f) + `
      <h2 class="doc-title">KEPUTUSAN SEKRETARIS KPU PROVINSI JAWA BARAT</h2>
      <p class="doc-nomor">Nomor: ${m.nomor}</p>
      <p class="c"><b>TENTANG</b><br/>PEMBENTUKAN PANITIA/TIM PELAKSANA<br/>${f.nama.toUpperCase()}</p>
      <p><b>Menimbang:</b> bahwa untuk kelancaran pelaksanaan ${f.nama}, perlu dibentuk panitia/tim pelaksana yang ditetapkan dengan Keputusan.</p>
      <p><b>Mengingat:</b> ${KB.REGULASI.nasional.slice(0, 3).join('; ')}.</p>
      <p><b>MEMUTUSKAN:</b></p>
      <p><b>KESATU:</b> Membentuk Panitia/Tim Pelaksana ${f.nama} dengan susunan sebagaimana terlampir.</p>
      <p><b>KEDUA:</b> Panitia bertugas mempersiapkan, melaksanakan, dan melaporkan kegiatan.</p>
      <p><b>KETIGA:</b> Segala biaya dibebankan pada DIPA KPU Prov. Jawa Barat TA ${KB.RKA.tahun} sumber ${(KB.SUMBER[f.sumber] || {}).label || '-'}.</p>
      <p><b>KEEMPAT:</b> Keputusan ini berlaku sejak tanggal ditetapkan.</p>
      ${ttdBlok(f, m, 'Sekretaris KPU Provinsi Jawa Barat')}`;
  }

  function docSPT(f, m) {
    return KOP(f) + `
      <h2 class="doc-title">SURAT PERINTAH TUGAS (SPT)</h2>
      <p class="doc-nomor">Nomor: ${m.nomor}</p>
      <p>Dasar: KAK & RAB kegiatan ${f.nama} TA ${KB.RKA.tahun}.</p>
      <p>Menugaskan kepada pegawai/panitia (daftar terlampir) untuk melaksanakan ${f.nama} pada ${tglID(f.tanggal)}${Number(f.hari) > 1 ? ' s.d. ' + tglID(addDays(f.tanggal, Number(f.hari) - 1)) : ''} di ${f.lokasi || '-'}.</p>
      <p>Biaya dibebankan pada DIPA KPU Prov. Jawa Barat TA ${KB.RKA.tahun} sumber ${(KB.SUMBER[f.sumber] || {}).label || '-'}. Setelah selesai agar membuat laporan.</p>
      ${ttdBlok(f, m, 'Sekretaris/KPA')}`;
  }

  function docMatriksRisiko(f, m) {
    const risiko = [
      ['Kehadiran peserta di bawah target', 'Sedang', 'Tinggi', 'Konfirmasi & pengingat H-1, daftar cadangan'],
      ['Realisasi anggaran melebihi pagu', 'Rendah', 'Tinggi', 'Pengendalian RAB sesuai SBM, monitoring SAKTI'],
      ['Ketidaksesuaian SBM (temuan)', f.sumber === 'HNP' ? 'Sedang' : 'Rendah', 'Tinggi', 'Validasi SBM/SHBJ sebelum eksekusi'],
      ['Keterlambatan dokumen/approval', 'Sedang', 'Sedang', 'Workflow berjenjang & batas waktu paraf'],
    ];
    if (f.sumber === 'HNP') risiko.push(['Belanja hibah tidak sesuai NPHD', 'Sedang', 'Tinggi', 'Cek peruntukan NPHD & register, pengesahan SP2HL/SPHL']);
    const rows = risiko.map((r, i) => `<tr><td class="c">${i + 1}</td><td>${r[0]}</td><td class="c">${r[1]}</td><td class="c">${r[2]}</td><td>${r[3]}</td></tr>`).join('');
    return KOP(f) + `
      <h2 class="doc-title">MATRIKS RISIKO</h2>
      <p class="doc-nomor">${f.nama}</p>
      <table class="doc-table">
        <thead><tr><th>No</th><th>Risiko</th><th>Kemungkinan</th><th>Dampak</th><th>Mitigasi</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${ttdBlok(f, m, f.pemrakarsa || 'Pengelola Risiko')}`;
  }

  function ttdBlok(f, m, jabatan) {
    return `
      <div class="doc-ttd">
        <div></div>
        <div class="ttd-box">
          <p>Bandung, ${tglID(m.tglDok)}</p>
          <p>${jabatan}</p>
          ${m.tte ? `<div class="tte-stamp">✔ Ditandatangani secara elektronik (TTE BSrE)<br/><span class="mono">${m.hash ? m.hash.slice(0, 32) + '…' : ''}</span></div>` : '<div class="ttd-space"></div>'}
          <p class="ttd-nama">( ............................................ )</p>
        </div>
      </div>`;
  }

  // Map id dokumen → fungsi generator
  const DOC_FN = {
    nota_dinas: docNotaDinas,
    kak: docKAK,
    tor: docTOR,
    rab: docRAB,
    jadwal: docJadwal,
    sk_panitia: docSK,
    spt: docSPT,
    matriks_risiko: docMatriksRisiko,
  };

  function generateDoc(id, f, m) {
    const fn = DOC_FN[id];
    return fn ? fn(f, m) : `<p>Generator untuk dokumen ini belum tersedia: ${id}</p>`;
  }

  return {
    rupiah, terbilang, tglID, addDays,
    analyzeRequirements, generateRAB, recomputeRAB, validateBudget, reviewAssistant,
    generateDoc, DOC_FN,
  };
})();
