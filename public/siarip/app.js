/* SIARIP KPU — Aplikasi (vanilla JS, hash router) */
(function () {
  const D = window.SIARIP;
  const AI = window.SIARIP_AI;
  const app = document.getElementById('app');

  // ── util ────────────────────────────────────────────────────────────────
  const fmt = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const heat = (p) => (p >= 90 ? 'hijau' : p >= 70 ? 'kuning' : 'merah');
  const dot = (p) => (p >= 90 ? '🟩' : p >= 70 ? '🟨' : '🟥');
  const statusClass = (s) => ({ Aktif: 's-aktif', Inaktif: 's-inaktif', Permanen: 's-permanen', Musnah: 's-musnah', 'Dinilai Kembali': 's-dinilai' }[s] || 's-aktif');

  // arsip tersimpan (seed + hasil digitalisasi lokal)
  function loadArsip() {
    try {
      const extra = JSON.parse(localStorage.getItem('siarip_arsip') || '[]');
      return [...extra, ...D.arsip];
    } catch { return D.arsip; }
  }
  function saveExtra(item) {
    const extra = JSON.parse(localStorage.getItem('siarip_arsip') || '[]');
    extra.unshift(item);
    localStorage.setItem('siarip_arsip', JSON.stringify(extra.slice(0, 50)));
  }

  function progress(p) {
    return `<div class="bar"><span style="width:${p}%" class="${heat(p)}"></span></div>`;
  }

  // ── ROUTES ────────────────────────────────────────────────────────────────
  const routes = {
    '': viewBeranda,
    'provinsi': viewProvinsi,
    'satker': viewSatker,
    'digitalisasi': viewDigitalisasi,
    'arsip': viewArsip,
    'terjaga': viewTerjaga,
    'ai': viewAi,
    'integrasi': viewIntegrasi,
  };

  const NAV = [
    ['', '📊', 'Beranda'],
    ['provinsi', '🏢', 'Provinsi'],
    ['satker', '🗺️', 'Satker'],
    ['digitalisasi', '🖨️', 'Digitalisasi'],
    ['arsip', '🗂️', 'Repository'],
    ['terjaga', '🔐', 'Arsip Terjaga'],
    ['ai', '🤖', 'AI Kearsipan'],
    ['integrasi', '🔗', 'Integrasi'],
  ];

  function renderNav(active) {
    const nav = document.getElementById('nav');
    nav.innerHTML = NAV.map(([h, ic, lbl]) =>
      `<a href="#/${h}" class="${active === h ? 'on' : ''}"><i>${ic}</i><span>${lbl}</span></a>`).join('');
  }

  // ── Beranda / Dashboard Eksekutif ─────────────────────────────────────────
  function viewBeranda() {
    const n = D.nasional, k = D.kpi;
    const progNas = Math.round((n.sudahDigital / n.totalArsip) * 100);
    const kpiCards = [
      ['Total Arsip Nasional', fmt(n.totalArsip), 'dokumen', ''],
      ['Sudah Digital', fmt(n.sudahDigital), `${progNas}% nasional`, 'ok'],
      ['Belum Digital', fmt(n.totalArsip - n.sudahDigital), 'antrean digitalisasi', 'warn'],
      ['Indeks Kematangan (IKKD)', k.ikkd.toFixed(1), 'dari skala 5,0', 'ok'],
    ];
    return `
      <section class="hero">
        <div class="hero-txt">
          <span class="pill">SIARIP KPU</span>
          <h2>Sistem Informasi Arsip Digital & Retensi</h2>
          <p>Platform terpadu digitalisasi, klasifikasi, pencarian, retensi, dan penyusutan arsip KPU RI, Provinsi, dan Kabupaten/Kota — selaras PKPU 17/2023, PKPU 13/2019, Kep. KPU 57/2022 & 1258/2024.</p>
        </div>
        <div class="hero-gauge">
          ${gauge(progNas)}
          <div class="gauge-lbl">Progress Digitalisasi Nasional</div>
        </div>
      </section>

      <div class="grid kpi">
        ${kpiCards.map(([t, v, s, c]) => `
          <div class="card stat ${c}">
            <div class="stat-lbl">${t}</div>
            <div class="stat-val">${v}</div>
            <div class="stat-sub">${s}</div>
          </div>`).join('')}
      </div>

      <h3 class="sec">Indikator Kinerja Utama (KPI)</h3>
      <div class="grid kpi2">
        ${miniKpi('🔎', 'Kecepatan Temu Kembali', k.temuKembaliDetik.toFixed(1) + ' dtk', 'rata-rata pencarian')}
        ${miniKpi('✅', 'Kepatuhan JRA', k.kepatuhanJRA + '%', 'arsip sesuai jadwal retensi')}
        ${miniKpi('🏷️', 'Arsip Tanpa Metadata', fmt(k.tanpaMetadata), 'perlu pelengkapan')}
        ${miniKpi('⏳', 'Arsip Retensi Habis', fmt(k.retensiHabis), 'usul susut/musnah')}
        ${miniKpi('♾️', 'Arsip Permanen', fmt(k.permanen), 'simpan selamanya')}
        ${miniKpi('🔐', 'Arsip Terjaga', fmt(k.terjaga), 'akses terbatas (RBAC)')}
      </div>

      <h3 class="sec">Peta Sebaran Digitalisasi (ilustrasi)</h3>
      <div class="card">
        <p class="muted">Warna provinsi mengikuti capaian digitalisasi: 🟩 &gt;90% · 🟨 70–90% · 🟥 &lt;70%. Prototipe menyorot KPU Provinsi Jawa Barat (${D.kpi.progresProvinsi}%).</p>
        ${mapJabarBars()}
      </div>
    `;
  }

  function gauge(p) {
    const r = 52, c = 2 * Math.PI * r, off = c * (1 - p / 100);
    return `<svg viewBox="0 0 130 130" class="gauge">
      <circle cx="65" cy="65" r="${r}" class="g-bg"/>
      <circle cx="65" cy="65" r="${r}" class="g-fg ${heat(p)}" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 65 65)"/>
      <text x="65" y="72" class="g-txt">${p}%</text>
    </svg>`;
  }
  function miniKpi(ic, t, v, s) {
    return `<div class="card mini"><div class="mi">${ic}</div><div><div class="stat-val sm">${v}</div><div class="stat-lbl">${t}</div><div class="stat-sub">${s}</div></div></div>`;
  }
  function mapJabarBars() {
    // sederhana: ringkasan band capaian
    const bands = [
      ['🟩 &gt; 90%', D.satker.filter((s) => s.persen >= 90).length],
      ['🟨 70–90%', D.satker.filter((s) => s.persen >= 70 && s.persen < 90).length],
      ['🟥 &lt; 70%', D.satker.filter((s) => s.persen < 70).length],
    ];
    return `<div class="bands">${bands.map(([l, c]) => `<div class="band"><div class="band-n">${c}</div><div class="band-l">${l}</div><div class="muted">satker</div></div>`).join('')}</div>`;
  }

  // ── Dashboard Provinsi ────────────────────────────────────────────────────
  function viewProvinsi() {
    const p = D.nasional.targetProvinsi;
    return `
      <div class="page-head">
        <h2>Dashboard ${p.nama}</h2>
        <p class="muted">Target Arsip: <b>${fmt(p.target)}</b> dokumen · Progress Digitalisasi: <b>${p.progress}%</b></p>
        ${progress(p.progress)}
      </div>

      <h3 class="sec">Progress per Sub Bagian</h3>
      <div class="card">
        <table class="tbl">
          <thead><tr><th>Sub Bagian</th><th>Kategori</th><th>Kode</th><th class="r">Progress</th><th>Capaian</th></tr></thead>
          <tbody>
          ${D.subbagian.map((s) => `
            <tr>
              <td><b>${s.nama}</b></td>
              <td><span class="tag ${s.kategori === 'Substantif' ? 'sub' : 'fas'}">${s.kategori}</span></td>
              <td class="mono">${s.kode}</td>
              <td class="r">${s.persen}%</td>
              <td class="bar-cell">${progress(s.persen)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <h3 class="sec">Heatmap Capaian</h3>
      <div class="card">
        <div class="legend">
          <span><b class="sw hijau"></b> Hijau &gt; 90%</span>
          <span><b class="sw kuning"></b> Kuning 70–89%</span>
          <span><b class="sw merah"></b> Merah &lt; 70%</span>
        </div>
        <div class="heatmap">
          ${D.subbagian.map((s) => `<div class="hm ${heat(s.persen)}"><span class="hm-d">${dot(s.persen)}</span><span class="hm-n">${s.nama}</span><span class="hm-p">${s.persen}%</span></div>`).join('')}
        </div>
      </div>
    `;
  }

  // ── Dashboard Satker ──────────────────────────────────────────────────────
  function viewSatker() {
    const rows = [...D.satker].sort((a, b) => b.persen - a.persen);
    return `
      <div class="page-head">
        <h2>Dashboard per Satker — KPU Kab/Kota se-Jawa Barat</h2>
        <p class="muted">${rows.length} satuan kerja · Ranking berdasarkan persentase digitalisasi arsip.</p>
      </div>
      <div class="card">
        <table class="tbl rank">
          <thead><tr><th>#</th><th>Satker</th><th class="r">Fisik</th><th class="r">Digital</th><th class="r">Terjaga</th><th class="r">Permanen</th><th class="r">Capaian</th></tr></thead>
          <tbody>
          ${rows.map((s, i) => `
            <tr class="clickrow" data-s="${esc(s.nama)}">
              <td class="rank-no ${i < 3 ? 'top' : ''}">${i + 1}</td>
              <td><b>${esc(s.nama)}</b></td>
              <td class="r">${fmt(s.fisik)}</td>
              <td class="r">${fmt(s.digital)}</td>
              <td class="r">${fmt(s.terjaga)}</td>
              <td class="r">${fmt(s.permanen)}</td>
              <td class="r"><span class="chip ${heat(s.persen)}">${s.persen}%</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div id="satker-detail"></div>
    `;
  }

  function satkerDetail(name) {
    const s = D.satker.find((x) => x.nama === name);
    if (!s) return;
    const box = document.getElementById('satker-detail');
    box.innerHTML = `
      <h3 class="sec">${esc(s.nama)}</h3>
      <div class="grid kpi">
        ${[['Arsip Fisik', fmt(s.fisik)], ['Arsip Digital', fmt(s.digital)], ['Belum Digital', fmt(s.belum)], ['Capaian', s.persen + '%']]
        .map(([t, v]) => `<div class="card stat"><div class="stat-lbl">${t}</div><div class="stat-val">${v}</div></div>`).join('')}
      </div>
      <div class="grid kpi2">
        ${miniKpi('🔐', 'Arsip Terjaga', fmt(s.terjaga), '')}
        ${miniKpi('♾️', 'Arsip Permanen', fmt(s.permanen), '')}
        ${miniKpi('🗑️', 'Usul Musnah', fmt(s.musnah), '')}
        ${miniKpi('⏳', 'Retensi Habis', fmt(s.retensiHabis), '')}
        ${miniKpi('🏷️', 'Tanpa Metadata', fmt(s.tanpaMetadata), '')}
      </div>`;
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ── Digitalisasi (scan → OCR → AI metadata) ───────────────────────────────
  function viewDigitalisasi() {
    return `
      <div class="page-head">
        <h2>Digitalisasi Arsip</h2>
        <p class="muted">Alur: Scan → OCR otomatis → Ekstraksi metadata (AI) → Barcode/QR → Validasi operator → PDF/A terindeks.</p>
      </div>
      <div class="grid two">
        <div class="card">
          <h3 class="card-h">1 · Input Dokumen</h3>
          <label class="fl">Judul / Hasil OCR dokumen</label>
          <input id="dg-judul" class="inp" placeholder="cth: Berita Acara Rekapitulasi Hasil Penghitungan Suara 2024" />
          <label class="fl">Tempel cuplikan teks (opsional, simulasi OCR)</label>
          <textarea id="dg-teks" class="inp" rows="4" placeholder="Tempel isi dokumen agar AI lebih akurat mengklasifikasi…"></textarea>
          <label class="fl">Satuan Kerja</label>
          <select id="dg-satker" class="inp">${D.satker.map((s) => `<option>${esc(s.nama)}</option>`).join('')}</select>
          <button class="btn" id="dg-proses">🤖 Proses OCR & AI</button>
          <button class="btn ghost" id="dg-demo">Isi contoh</button>
        </div>
        <div class="card" id="dg-out">
          <h3 class="card-h">2 · Hasil Ekstraksi</h3>
          <div class="empty">Belum ada dokumen diproses. Masukkan judul dokumen lalu klik <b>Proses OCR & AI</b>.</div>
        </div>
      </div>
    `;
  }

  function digitalisasiProses() {
    const judul = document.getElementById('dg-judul').value.trim();
    const teks = document.getElementById('dg-teks').value.trim();
    const satkerName = document.getElementById('dg-satker').value;
    if (!judul) { alert('Masukkan judul / hasil OCR dokumen terlebih dahulu.'); return; }
    const fullText = judul + ' ' + teks;
    const { meta, hits, confidence } = AI.autoMetadata(fullText);
    const id = 'ARS-' + meta.tahun + '-' + String(Math.floor(Math.random() * 90000) + 10000);
    const out = document.getElementById('dg-out');
    out.innerHTML = `
      <h3 class="card-h">2 · Hasil Ekstraksi <span class="chip ${confidence >= 75 ? 'hijau' : 'kuning'}">akurasi ${confidence}%</span></h3>
      <div class="qrline">
        ${qrSvg(id)}
        <div>
          <div class="muted">ID Arsip / QR</div>
          <div class="mono big">${id}</div>
          <div class="muted">Format keluaran: <b>PDF/A</b> · terindeks Full-Text Search</div>
        </div>
      </div>
      <pre class="json">${esc(JSON.stringify({
        jenis: meta.jenis, subbagian: meta.subbagian, tahun: meta.tahun,
        kode_arsip: meta.kode_arsip, klasifikasi: meta.klasifikasi,
        retensi: meta.retensi, nasib_akhir: meta.nasib_akhir,
        arsip_terjaga: meta.terjaga, status: meta.status,
      }, null, 2))}</pre>
      ${hits.length ? `<p class="muted">Kata kunci terdeteksi: ${hits.map((h) => `<span class="kw">${esc(h)}</span>`).join(' ')}</p>` : `<p class="muted">Tidak ada kata kunci kuat — diklasifikasikan ke Ketatausahaan; mohon validasi arsiparis.</p>`}
      ${meta.terjaga ? `<div class="note warn">🔐 Terdeteksi sebagai <b>Arsip Terjaga</b> — akan dienkripsi AES-256 & masuk RBAC + approval berlapis.</div>` : ''}
      <button class="btn" id="dg-simpan">💾 Validasi & Simpan ke Repository</button>
    `;
    out.querySelector('#dg-simpan').onclick = () => {
      saveExtra({ id, judul, jenis: meta.jenis, subbagian: meta.subbagian, kode: meta.kode_arsip, tahun: Number(meta.tahun), status: meta.status, terjaga: meta.terjaga, metadata: true, satker: satkerName });
      out.querySelector('#dg-simpan').outerHTML = `<div class="note ok">✅ Tersimpan. Arsip <b>${id}</b> kini tersedia di Repository & terindeks pencarian.</div>`;
    };
  }

  // mini QR-like deterministic matrix (dekoratif, bukan QR valid)
  function qrSvg(seedStr) {
    let h = 0; for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) >>> 0;
    const N = 11, cell = 8, cells = [];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      const finder = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
      const on = finder ? ((x === 0 || x === N - 1 || y === 0 || y === N - 1) || (x === 1 && y === 1)) : (h % 100 < 48);
      if (on) cells.push(`<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}"/>`);
    }
    return `<svg class="qr" viewBox="0 0 ${N * cell} ${N * cell}">${cells.join('')}</svg>`;
  }

  // ── Repository Arsip ──────────────────────────────────────────────────────
  let arsipFilter = { q: '', sub: '', status: '' };
  function viewArsip() {
    const subs = [...new Set(D.arsip.map((a) => a.subbagian))].sort();
    setTimeout(renderArsipList, 0);
    return `
      <div class="page-head">
        <h2>Repository Arsip Digital</h2>
        <p class="muted">Full-Text Search · Version Control · Digital Signature · Audit Trail · Watermark · Backup.</p>
      </div>
      <div class="card filters">
        <input id="ar-q" class="inp" placeholder="🔎 Cari arsip (judul, kode, ID)…" />
        <select id="ar-sub" class="inp"><option value="">Semua sub bagian</option>${subs.map((s) => `<option>${esc(s)}</option>`).join('')}</select>
        <select id="ar-status" class="inp"><option value="">Semua status</option>${['Aktif', 'Inaktif', 'Permanen', 'Musnah'].map((s) => `<option>${s}</option>`).join('')}</select>
      </div>
      <div id="ar-list"></div>
    `;
  }
  function renderArsipList() {
    const q = document.getElementById('ar-q'), sub = document.getElementById('ar-sub'), st = document.getElementById('ar-status');
    if (q) { q.oninput = renderArsipList; sub.onchange = renderArsipList; st.onchange = renderArsipList; }
    arsipFilter = { q: (q?.value || '').toLowerCase(), sub: sub?.value || '', status: st?.value || '' };
    const list = loadArsip().filter((a) =>
      (!arsipFilter.q || (a.judul + a.kode + a.id).toLowerCase().includes(arsipFilter.q)) &&
      (!arsipFilter.sub || a.subbagian === arsipFilter.sub) &&
      (!arsipFilter.status || a.status === arsipFilter.status));
    const box = document.getElementById('ar-list');
    if (!box) return;
    box.innerHTML = `<div class="muted res">${list.length} arsip ditemukan</div>` + (list.length ? list.map((a) => `
      <div class="card arow">
        <div class="ar-main">
          <div class="ar-title">${a.terjaga ? '🔐 ' : '📄 '}${esc(a.judul)}</div>
          <div class="ar-meta">
            <span class="mono">${esc(a.id)}</span> ·
            <span class="mono">${esc(a.kode)}</span> ·
            ${esc(a.subbagian)} · ${a.tahun}
            ${a.metadata ? '' : '<span class="tag warn">tanpa metadata</span>'}
          </div>
        </div>
        <div class="ar-right"><span class="status ${statusClass(a.status)}">${a.status}</span></div>
      </div>`).join('') : `<div class="card empty">Tidak ada arsip yang cocok dengan filter.</div>`);
  }

  // ── Arsip Terjaga (RBAC) ──────────────────────────────────────────────────
  function viewTerjaga() {
    const authed = sessionStorage.getItem('siarip_terjaga') === '1';
    if (!authed) {
      return `
        <div class="page-head"><h2>🔐 Modul Arsip Terjaga</h2>
        <p class="muted">Khusus: Data Pemilih, Hasil Pemilu, Dokumen Strategis & Dokumen Negara. Enkripsi AES-256 · RBAC · Approval berlapis · Log akses (Kep. KPU 1258/2024).</p></div>
        <div class="card gate">
          <div class="gate-ic">🔒</div>
          <h3>Akses Terbatas</h3>
          <p class="muted">Masuk dengan peran berwenang. Demo: peran <b>Arsiparis Ahli</b> / <b>Sekretaris</b>.</p>
          <select id="tg-role" class="inp"><option>Operator</option><option>Arsiparis Ahli</option><option>Sekretaris</option></select>
          <button class="btn" id="tg-login">🔑 Verifikasi Akses (MFA simulasi)</button>
          <div id="tg-msg"></div>
        </div>`;
    }
    const items = loadArsip().filter((a) => a.terjaga);
    return `
      <div class="page-head"><h2>🔐 Modul Arsip Terjaga</h2>
      <p class="muted">Akses sebagai <b>${esc(sessionStorage.getItem('siarip_role') || 'Arsiparis')}</b> · Sesi terenkripsi · Setiap akses tercatat pada audit trail.</p>
      <button class="btn ghost sm" id="tg-out">Keluar sesi terjaga</button></div>
      <div class="grid kpi">
        ${[['Total Arsip Terjaga', fmt(D.kpi.terjaga)], ['Enkripsi', 'AES-256'], ['Kontrol Akses', 'RBAC + MFA'], ['Approval', 'Berlapis']]
        .map(([t, v]) => `<div class="card stat"><div class="stat-lbl">${t}</div><div class="stat-val sm">${v}</div></div>`).join('')}
      </div>
      <h3 class="sec">Daftar Arsip Terjaga</h3>
      ${items.map((a) => `
        <div class="card arow locked">
          <div class="ar-main">
            <div class="ar-title">🔐 ${esc(a.judul)}</div>
            <div class="ar-meta"><span class="mono">${esc(a.id)}</span> · <span class="mono">${esc(a.kode)}</span> · ${esc(a.subbagian)} · ${a.tahun}</div>
          </div>
          <div class="ar-right"><span class="status ${statusClass(a.status)}">${a.status}</span><span class="lock">terenkripsi</span></div>
        </div>`).join('')}
      <div class="card log">
        <h3 class="card-h">🧾 Log Akses (Audit Trail)</h3>
        <ul class="logs">
          <li><span class="mono">${new Date().toLocaleString('id-ID')}</span> — ${esc(sessionStorage.getItem('siarip_role') || 'Arsiparis')} membuka daftar arsip terjaga <span class="tag ok">granted</span></li>
          <li><span class="mono">${new Date(Date.now() - 86400000).toLocaleString('id-ID')}</span> — Operator mencoba unduh DPT <span class="tag warn">denied · butuh approval</span></li>
        </ul>
      </div>`;
  }

  // ── AI Kearsipan ──────────────────────────────────────────────────────────
  function viewAi() {
    return `
      <div class="page-head"><h2>AI Kearsipan</h2>
      <p class="muted">Auto-Metadata, Klasifikasi otomatis & Retensi Checker berbasis JRA KPU.</p></div>

      <div class="grid two">
        <div class="card">
          <h3 class="card-h">🤖 AI Auto-Metadata & Klasifikasi</h3>
          <label class="fl">Judul / isi dokumen</label>
          <textarea id="ai-text" class="inp" rows="3" placeholder="cth: Daftar Pemilih Tetap Pemilu 2024 Kota Bandung"></textarea>
          <button class="btn" id="ai-run">Hasilkan Metadata</button>
          <div id="ai-meta"></div>
        </div>
        <div class="card">
          <h3 class="card-h">⏳ AI Retensi Checker</h3>
          <label class="fl">Pilih kode klasifikasi</label>
          <select id="rc-kode" class="inp">${[...new Set(D.jra.map((j) => j.kode))].map((k) => `<option value="${k}">${k} — ${klName(k)}</option>`).join('')}</select>
          <label class="fl">Uraian arsip</label>
          <select id="rc-uraian" class="inp"></select>
          <label class="fl">Tahun arsip</label>
          <input id="rc-tahun" class="inp" type="number" value="2014" min="1990" max="2026" />
          <button class="btn" id="rc-run">Cek Retensi</button>
          <div id="rc-out"></div>
        </div>
      </div>
    `;
  }
  function klName(k) {
    return D.klasifikasi.Substantif.concat(D.klasifikasi.Fasilitatif).find((x) => x.kode === k)?.nama || k;
  }
  function aiRun() {
    const t = document.getElementById('ai-text').value.trim();
    if (!t) { alert('Masukkan teks dokumen.'); return; }
    const { meta, hits, confidence } = AI.autoMetadata(t);
    document.getElementById('ai-meta').innerHTML = `
      <div class="chip ${confidence >= 75 ? 'hijau' : 'kuning'} cf">akurasi klasifikasi ${confidence}%</div>
      <pre class="json">${esc(JSON.stringify({
        jenis: meta.jenis, subbagian: meta.subbagian, tahun: meta.tahun,
        kode_arsip: meta.kode_arsip, retensi: meta.retensi,
        nasib_akhir: meta.nasib_akhir, arsip_terjaga: meta.terjaga, status: meta.status,
      }, null, 2))}</pre>
      ${hits.length ? `<p class="muted">Kata kunci: ${hits.map((h) => `<span class="kw">${esc(h)}</span>`).join(' ')}</p>` : ''}`;
  }
  function rcSyncUraian() {
    const k = document.getElementById('rc-kode').value;
    const sel = document.getElementById('rc-uraian');
    sel.innerHTML = D.jra.filter((j) => j.kode === k).map((j, i) => `<option value="${i}">${esc(j.uraian)}</option>`).join('');
  }
  function rcRun() {
    const k = document.getElementById('rc-kode').value;
    const idx = Number(document.getElementById('rc-uraian').value);
    const tahun = Number(document.getElementById('rc-tahun').value);
    const rule = D.jra.filter((j) => j.kode === k)[idx];
    const res = AI.retensiStatus(tahun, rule);
    const recs = { Aktif: '✓ Aktif', Inaktif: '✓ Inaktif', Permanen: '✓ Permanen', Musnah: '✓ Musnah', 'Dinilai Kembali': '✓ Dinilai Kembali' };
    document.getElementById('rc-out').innerHTML = `
      <div class="reten ${statusClass(res.status)}">
        <div class="reten-top"><span class="status ${statusClass(res.status)}">${recs[res.status] || res.status}</span><span class="muted">umur arsip ${res.umur} tahun</span></div>
        <div class="reten-rule">Masa aktif <b>${rule.aktif} th</b> · inaktif <b>${rule.inaktif} th</b> · nasib akhir <b>${rule.nasibAkhir}</b>${rule.terjaga ? ' · <b>Terjaga</b>' : ''}</div>
        <p class="reten-why">${res.alasan}</p>
        <div class="muted sm">Dasar: JRA KPU (PKPU 17/2023 & 13/2019).</div>
      </div>`;
  }

  // ── Integrasi ─────────────────────────────────────────────────────────────
  function viewIntegrasi() {
    const I = D.integrasi;
    return `
      <div class="page-head"><h2>Integrasi Sistem KPU</h2>
      <p class="muted">SIARIP terhubung dengan aplikasi umum kearsipan <b>${esc(I.induk)}</b> dan ekosistem aplikasi internal KPU.</p></div>
      <div class="card flowwrap">
        <div class="flow">
          <div class="flow-node srikandi">SRIKANDI</div>
          <div class="flow-arrow">▼</div>
          <div class="flow-node siarip">SIARIP KPU</div>
        </div>
      </div>
      <div class="grid sysgrid">
        ${I.sistem.map((s) => `<div class="card sys"><div class="sys-name">${esc(s.nama)}</div><div class="muted">${esc(s.ket)}</div><span class="tag ok">${esc(s.status)}</span></div>`).join('')}
      </div>
      <h3 class="sec">Teknologi</h3>
      <div class="grid sysgrid">
        ${[['Frontend', 'Next.js PWA · Flutter Mobile'], ['Backend', 'NestJS · Spring Boot'], ['Database', 'PostgreSQL · Elasticsearch'], ['Storage', 'MinIO S3 · Object Storage Nasional'], ['AI', 'OCR (Tesseract/PaddleOCR) · LLM · RAG'], ['Keamanan', 'SSO KPU · MFA · Enkripsi · Audit immutable']]
        .map(([t, v]) => `<div class="card sys"><div class="sys-name">${t}</div><div class="muted">${esc(v)}</div></div>`).join('')}
      </div>
    `;
  }

  // ── router & event wiring ─────────────────────────────────────────────────
  function render() {
    const hash = location.hash.replace(/^#\/?/, '');
    const key = hash.split('?')[0];
    const view = routes[key] || routes[''];
    renderNav(routes[key] ? key : '');
    app.innerHTML = view();
    app.scrollTo ? app.scrollTo(0, 0) : window.scrollTo(0, 0);
    wire(key);
  }

  function wire(key) {
    if (key === 'satker') {
      document.querySelectorAll('.clickrow').forEach((r) => r.onclick = () => satkerDetail(r.dataset.s));
    }
    if (key === 'digitalisasi') {
      document.getElementById('dg-proses').onclick = digitalisasiProses;
      document.getElementById('dg-demo').onclick = () => {
        document.getElementById('dg-judul').value = 'Berita Acara Rekapitulasi Hasil Penghitungan Suara Pemilu 2024 Tingkat Provinsi';
        document.getElementById('dg-teks').value = 'rekapitulasi penghitungan suara sertifikat hasil model d penetapan';
      };
    }
    if (key === 'arsip') renderArsipList();
    if (key === 'terjaga') {
      const login = document.getElementById('tg-login');
      if (login) login.onclick = () => {
        const role = document.getElementById('tg-role').value;
        const msg = document.getElementById('tg-msg');
        if (role === 'Operator') { msg.innerHTML = `<div class="note warn">⛔ Peran <b>Operator</b> tidak berwenang mengakses arsip terjaga. Diperlukan approval atasan.</div>`; return; }
        sessionStorage.setItem('siarip_terjaga', '1'); sessionStorage.setItem('siarip_role', role); render();
      };
      const out = document.getElementById('tg-out');
      if (out) out.onclick = () => { sessionStorage.removeItem('siarip_terjaga'); render(); };
    }
    if (key === 'ai') {
      document.getElementById('ai-run').onclick = aiRun;
      document.getElementById('rc-kode').onchange = rcSyncUraian;
      document.getElementById('rc-run').onclick = rcRun;
      rcSyncUraian();
    }
  }

  window.addEventListener('hashchange', render);
  render();
})();
