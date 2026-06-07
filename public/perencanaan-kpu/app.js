/* ============================================================================
 * AI Planning Document Factory — KPU  ·  app.js
 * Aplikasi satu halaman (vanilla JS) yang mengubah ide kegiatan menjadi
 * seluruh dokumen perencanaan, dengan validasi anggaran, review AI, alur
 * persetujuan berjenjang, TTE elektronik, arsip, dan dashboard monitoring.
 *
 * Pilihan sumber anggaran: APBN (Rupiah Murni) atau HNP 2026 (Hibah/HLD).
 * Data offline-first, tersimpan di localStorage.
 * ==========================================================================*/
(function () {
  'use strict';

  const KB = window.KB;
  const GEN = window.GEN;
  const rupiah = GEN.rupiah;
  const $ = (sel, el = document) => el.querySelector(sel);
  const STORE = 'kpu_planning_berkas_v1';
  const app = document.getElementById('app');

  // ── Alur persetujuan berjenjang (Workflow & Approval Engine) ───────────────
  const APPROVAL_CHAIN = [
    { key: 'staf', label: 'Staf Penyusun', aksi: 'Susun' },
    { key: 'kasubbag', label: 'Kasubbag / Koordinator', aksi: 'Paraf' },
    { key: 'kabag', label: 'Kepala Bagian', aksi: 'Verifikasi' },
    { key: 'sekretaris', label: 'Sekretaris', aksi: 'Persetujuan' },
    { key: 'kpa', label: 'KPA (Kuasa Pengguna Anggaran)', aksi: 'Persetujuan' },
    { key: 'ketua', label: 'Ketua', aksi: 'Final Approval' },
  ];

  // ── State & persistensi ────────────────────────────────────────────────────
  let state = {
    view: 'dashboard', // dashboard | wizard | arsip
    step: 0,
    current: null, // berkas yang sedang diproses
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || []; } catch { return []; }
  }
  function saveAll(list) { localStorage.setItem(STORE, JSON.stringify(list)); }
  function upsert(berkas) {
    const list = load();
    const i = list.findIndex((b) => b.id === berkas.id);
    if (i >= 0) list[i] = berkas; else list.push(berkas);
    saveAll(list);
  }

  function newBerkas() {
    return {
      id: 'BK-' + Date.now().toString(36).toUpperCase(),
      dibuat: new Date().toISOString(),
      form: { nama: '', tujuan: '', output: '', lokasi: 'Kota Bandung', tanggal: '', hari: 1, peserta: 30, sumber: 'APBN', sasaran: '', jenis: 'bimtek', mekanisme: 'penyedia', tipeSwakelola: 'I', pemrakarsa: 'Kepala Subbagian Teknis' },
      rab: null,
      requirements: null,
      validasi: null,
      review: null,
      approvals: {}, // key → {status:'setuju'|'tolak', note, ts}
      status: 'Draft', // Draft | Review | Approval | Selesai | Ditolak
      arsip: null, // {nomor, hash, tte, ts}
    };
  }

  // ════════════════════════════════════════════════════════════════════════
  // RENDER ROOT
  // ════════════════════════════════════════════════════════════════════════
  function render() {
    const aiOn = window.KPAI && window.KPAI.isEnabled();
    app.innerHTML = `
      <nav class="tabs">
        <button data-view="dashboard" class="${state.view === 'dashboard' ? 'on' : ''}">📊 Dashboard</button>
        <button data-view="wizard" class="${state.view === 'wizard' ? 'on' : ''}">✨ Buat Dokumen</button>
        <button data-view="arsip" class="${state.view === 'arsip' ? 'on' : ''}">🗄️ Arsip</button>
        <button data-view="bas" class="${state.view === 'bas' ? 'on' : ''}">📒 BAS</button>
        <button data-view="settings" class="${state.view === 'settings' ? 'on' : ''}">⚙️ AI ${aiOn ? '<span class="dot on"></span>' : '<span class="dot"></span>'}</button>
      </nav>
      <div id="screen"></div>`;
    app.querySelectorAll('.tabs button').forEach((b) =>
      b.addEventListener('click', () => {
        state.view = b.dataset.view;
        if (state.view === 'wizard' && !state.current) { state.current = newBerkas(); state.step = 0; }
        render();
      })
    );
    const s = $('#screen');
    if (state.view === 'dashboard') renderDashboard(s);
    else if (state.view === 'arsip') renderArsip(s);
    else if (state.view === 'bas') renderBAS(s);
    else if (state.view === 'settings') renderSettings(s);
    else renderWizard(s);
  }

  // ════════════════════════════════════════════════════════════════════════
  // DASHBOARD MONITORING
  // ════════════════════════════════════════════════════════════════════════
  function renderDashboard(s) {
    const list = load();
    const count = (st) => list.filter((b) => b.status === st).length;
    const totalRencana = list.reduce((sum, b) => sum + (b.rab ? b.rab.total : 0), 0);
    const rkaq = KB.RKA;

    const pipe = [
      { k: 'Draft', n: count('Draft'), c: '#64748b' },
      { k: 'Review', n: count('Review'), c: '#d97706' },
      { k: 'Approval', n: count('Approval'), c: '#2563eb' },
      { k: 'Selesai', n: count('Selesai'), c: '#16a34a' },
    ];

    const barSumber = (label, val, total, color) => {
      const pct = total ? Math.min(100, (val / total) * 100) : 0;
      return `<div class="bar-row"><div class="bar-lbl">${label}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <div class="bar-val">${rupiah(val)}</div></div>`;
    };

    s.innerHTML = `
      <section class="hero">
        <h2>Dashboard Perencanaan KPU Provinsi Jawa Barat</h2>
        <p class="muted">${rkaq.dipa} · Pagu Total <b>${rupiah(rkaq.totalPagu)}</b> · ${rkaq.kppn}</p>
      </section>

      <div class="cards4">
        ${pipe.map((p) => `<div class="stat"><div class="stat-n" style="color:${p.c}">${p.n}</div><div class="stat-l">${p.k}</div></div>`).join('')}
      </div>

      <section class="panel">
        <h3>💰 Pagu Anggaran per Sumber (DIPA TA ${rkaq.tahun})</h3>
        ${barSumber('APBN (Rupiah Murni)', rkaq.sumber.APBN, rkaq.totalPagu, KB.SUMBER.APBN.warna)}
        ${barSumber('HNP 2026 (Hibah / HLD · Reg. ' + KB.SUMBER.HNP.register + ')', rkaq.sumber.HNP, rkaq.totalPagu, KB.SUMBER.HNP.warna)}
        <p class="muted small">Rincian HNP 2026: ${rkaq.hnpRincian.map((h) => `${h.nama} (${rupiah(h.pagu)})`).join(' · ')}</p>
      </section>

      <section class="panel">
        <h3>📁 Program (Pagu DIPA)</h3>
        ${rkaq.program.map((p) => barSumber(p.kode + ' · ' + p.nama, p.pagu, rkaq.totalPagu, '#7c3aed')).join('')}
      </section>

      <section class="panel">
        <h3>🧾 Total Rencana Anggaran Dokumen Tersusun</h3>
        <p class="bignum">${rupiah(totalRencana)}</p>
        <p class="muted small">Dari ${list.length} berkas perencanaan yang dibuat di aplikasi ini.</p>
      </section>

      <button class="btn primary big" id="cta-new">✨ Mulai Buat Dokumen Perencanaan</button>
    `;
    $('#cta-new', s).addEventListener('click', () => { state.current = newBerkas(); state.step = 0; state.view = 'wizard'; render(); });
  }

  // ════════════════════════════════════════════════════════════════════════
  // WIZARD
  // ════════════════════════════════════════════════════════════════════════
  const STEPS = ['Input Kebutuhan', 'Analisis AI', 'RAB & Validasi', 'Dokumen', 'Review AI', 'Approval', 'TTE & Arsip'];

  function renderWizard(s) {
    const b = state.current;
    const stepBar = STEPS.map((t, i) =>
      `<div class="step ${i === state.step ? 'on' : ''} ${i < state.step ? 'done' : ''}" data-step="${i}"><span>${i + 1}</span>${t}</div>`
    ).join('');
    s.innerHTML = `<div class="stepbar">${stepBar}</div><div id="stepbody"></div>`;
    s.querySelectorAll('.step').forEach((el) => el.addEventListener('click', () => {
      const i = Number(el.dataset.step);
      if (i <= state.step) { state.step = i; renderWizard(s); }
    }));
    const body = $('#stepbody', s);
    [stepInput, stepAnalisis, stepRAB, stepDokumen, stepReview, stepApproval, stepArsip][state.step](body);
  }

  function navButtons(onNext, nextLabel) {
    return `<div class="navbtns">
      ${state.step > 0 ? '<button class="btn" id="prev">← Kembali</button>' : '<span></span>'}
      <button class="btn primary" id="next">${nextLabel || 'Lanjut →'}</button>
    </div>`;
  }
  function wireNav(onNext) {
    const p = $('#prev'); if (p) p.addEventListener('click', () => { state.step--; renderWizard($('#screen')); });
    const n = $('#next'); if (n) n.addEventListener('click', onNext);
  }

  // ── STEP 1: Input Kebutuhan ────────────────────────────────────────────────
  function stepInput(body) {
    const f = state.current.form;
    const opt = (o, sel) => Object.entries(o).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${v.label}</option>`).join('');
    const aiOn = window.KPAI && window.KPAI.isEnabled();
    body.innerHTML = `
      ${aiOn ? `<div class="panel ai-copilot">
        <h3>🤖 AI Copilot Perencanaan</h3>
        <p class="muted">Ketik kebutuhan dalam satu kalimat — AI mengisi formulir otomatis.</p>
        <div class="copilot-row">
          <input id="brief" placeholder="Buatkan KAK Bimtek Penyusunan RKAKL untuk 100 peserta selama 3 hari di Bandung, sumber APBN"/>
          <button class="btn primary" id="copilotgo">Isikan ✨</button>
        </div>
        <div id="copilotmsg" class="muted small"></div>
      </div>` : ''}
      <div class="panel">
        <h3>Tahap 1 · Form Singkat Kebutuhan</h3>
        <p class="muted">Isi ringkas — sistem akan menyusun seluruh dokumen perencanaan otomatis.</p>
        <div class="grid2">
          <label>Nama Kegiatan<input id="nama" value="${esc(f.nama)}" placeholder="Bimtek Pengelolaan Arsip Digital"/></label>
          <label>Jenis Kegiatan<select id="jenis">${opt(KB.JENIS_KEGIATAN, f.jenis)}</select></label>
          <div class="full" id="pengadaan-fields" style="${f.jenis === 'pengadaan' ? '' : 'display:none'}">
            <div class="grid2">
              <label>Mekanisme Pengadaan<select id="mekanisme">
                <option value="penyedia" ${f.mekanisme === 'penyedia' ? 'selected' : ''}>Melalui Penyedia</option>
                <option value="swakelola" ${f.mekanisme === 'swakelola' ? 'selected' : ''}>Swakelola</option>
              </select></label>
              <label>Tipe Swakelola<select id="tipeSwakelola">
                ${['I', 'II', 'III', 'IV'].map((t) => `<option value="${t}" ${f.tipeSwakelola === t ? 'selected' : ''}>Tipe ${t}</option>`).join('')}
              </select></label>
            </div>
          </div>
          <label class="full">Tujuan<textarea id="tujuan" placeholder="Meningkatkan kapasitas pegawai dalam...">${esc(f.tujuan)}</textarea></label>
          <label class="full">Output / Keluaran<input id="output" value="${esc(f.output)}" placeholder="60 pegawai tersertifikasi pengelolaan arsip"/></label>
          <label>Lokasi<input id="lokasi" value="${esc(f.lokasi)}"/></label>
          <label>Tanggal Mulai<input id="tanggal" type="date" value="${esc(f.tanggal)}"/></label>
          <label>Jumlah Hari<input id="hari" type="number" min="1" value="${esc(f.hari)}"/></label>
          <label>Jumlah Peserta<input id="peserta" type="number" min="1" value="${esc(f.peserta)}"/></label>
          <label class="full">Sasaran Kegiatan<input id="sasaran" value="${esc(f.sasaran)}" placeholder="Pegawai KPU Kabupaten/Kota se-Jawa Barat"/></label>
          <label>Pemrakarsa (Jabatan)<input id="pemrakarsa" value="${esc(f.pemrakarsa)}"/></label>
          <label class="hl">Sumber Anggaran
            <select id="sumber">
              <option value="APBN" ${f.sumber === 'APBN' ? 'selected' : ''}>${KB.SUMBER.APBN.label}</option>
              <option value="HNP" ${f.sumber === 'HNP' ? 'selected' : ''}>${KB.SUMBER.HNP.label}</option>
            </select>
          </label>
        </div>
        <div class="sumber-note" id="sumber-note"></div>
      </div>
      ${navButtons()}`;

    const refreshNote = () => {
      const src = KB.SUMBER[$('#sumber', body).value];
      $('#sumber-note', body).innerHTML = `<div class="callout" style="border-color:${src.warna}">
        <b style="color:${src.warna}">${src.label}</b> — ${src.catatan}
        ${src.register ? `<br/><span class="mono small">Register Hibah: ${src.register}</span>` : ''}</div>`;
    };
    $('#sumber', body).addEventListener('change', refreshNote);
    refreshNote();

    // Toggle field pengadaan saat jenis berubah
    $('#jenis', body).addEventListener('change', (e) => {
      $('#pengadaan-fields', body).style.display = e.target.value === 'pengadaan' ? '' : 'none';
    });

    // AI Copilot → isi form dari brief
    const cg = $('#copilotgo', body);
    if (cg) cg.addEventListener('click', async () => {
      const brief = $('#brief', body).value.trim();
      const msg = $('#copilotmsg', body);
      if (!brief) { msg.textContent = 'Tulis dulu kebutuhan kegiatannya.'; return; }
      cg.disabled = true; cg.textContent = 'Memproses…'; msg.textContent = '';
      try {
        const data = await window.KPAI.copilot(brief);
        Object.assign(f, {
          nama: data.nama || f.nama, tujuan: data.tujuan || f.tujuan, output: data.output || f.output,
          lokasi: data.lokasi || f.lokasi, hari: Number(data.hari) || f.hari, peserta: Number(data.peserta) || f.peserta,
          sasaran: data.sasaran || f.sasaran, jenis: data.jenis || f.jenis,
          mekanisme: data.mekanisme || f.mekanisme, sumber: (data.sumber === 'HNP' ? 'HNP' : 'APBN'),
        });
        renderWizard($('#screen')); // render ulang dengan nilai terisi
      } catch (err) {
        msg.textContent = 'AI gagal: ' + err.message;
        cg.disabled = false; cg.textContent = 'Isikan ✨';
      }
    });

    wireNav(() => {
      const g = (id) => { const el = $('#' + id, body); return el ? el.value : ''; };
      Object.assign(f, {
        nama: g('nama'), jenis: g('jenis'), tujuan: g('tujuan'), output: g('output'),
        lokasi: g('lokasi'), tanggal: g('tanggal'), hari: Number(g('hari')) || 1,
        peserta: Number(g('peserta')) || 1, sasaran: g('sasaran'), pemrakarsa: g('pemrakarsa'),
        sumber: g('sumber'), mekanisme: g('mekanisme') || 'penyedia', tipeSwakelola: g('tipeSwakelola') || 'I',
      });
      if (!f.nama) { alert('Nama kegiatan wajib diisi.'); return; }
      state.current.requirements = GEN.analyzeRequirements(f);
      state.current.rab = GEN.generateRAB(f);
      upsert(state.current);
      state.step = 1; renderWizard($('#screen'));
    });
  }

  // ── STEP 2: AI Requirement Analyzer + Knowledge Base ───────────────────────
  function stepAnalisis(body) {
    const b = state.current; const f = b.form;
    const src = KB.SUMBER[f.sumber];
    const badge = (st) => `<span class="pill ${st === 'Wajib' ? 'req' : st === 'Perlu' ? 'need' : 'opt'}">${st}</span>`;
    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 2 · AI Requirement Analyzer</h3>
        <p class="muted">Dokumen yang dibutuhkan untuk <b>${esc(f.nama)}</b> (${KB.JENIS_KEGIATAN[f.jenis].label}, sumber ${src.label}):</p>
        <table class="doc-table">
          <thead><tr><th>Dokumen</th><th>Status</th></tr></thead>
          <tbody>${b.requirements.map((d) => `<tr><td>${d.nama}</td><td>${badge(d.status)}</td></tr>`).join('')}</tbody>
        </table>
      </div>
      <div class="panel">
        <h3>📚 Knowledge Base Regulasi — Dasar Hukum (${src.kode})</h3>
        <ul class="bullet">${src.dasar.map((d) => `<li>${d}</li>`).join('')}</ul>
        <details><summary>Regulasi Nasional & Internal lainnya</summary>
          <ul class="bullet">${KB.REGULASI.nasional.concat(KB.REGULASI.internal).map((d) => `<li>${d}</li>`).join('')}</ul>
        </details>
      </div>
      ${navButtons()}`;
    wireNav(() => { state.step = 2; renderWizard($('#screen')); });
  }

  // ── STEP 3: RAB Generator + Budget Validator ───────────────────────────────
  function stepRAB(body) {
    const b = state.current; const f = b.form;
    const renderTable = () => {
      const rows = b.rab.items.map((it, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><input class="cell" data-i="${i}" data-k="uraian" value="${esc(it.uraian)}"/></td>
          <td class="c small">${it.akun}</td>
          <td><input class="cell num" data-i="${i}" data-k="vol" type="number" value="${it.vol}"/></td>
          <td class="c small">${it.satuan || '-'}</td>
          <td><input class="cell num" data-i="${i}" data-k="harga" type="number" value="${it.harga}"/>${it.sbmMax != null ? `<div class="sbm-hint ${it.harga > it.sbmMax ? 'bad' : 'ok'}">SBM ≤ ${rupiah(it.sbmMax)}</div>` : ''}</td>
          <td class="r">${rupiah(it.jumlah)}</td>
          <td><button class="del" data-del="${i}">✕</button></td>
        </tr>`).join('');
      return `<table class="doc-table editable">
        <thead><tr><th>No</th><th>Uraian</th><th>Akun</th><th>Vol</th><th>Sat</th><th>Harga Satuan</th><th>Jumlah</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="6" class="r"><b>TOTAL</b></td><td class="r"><b>${rupiah(b.rab.total)}</b></td><td></td></tr></tfoot>
      </table>`;
    };

    const renderValidasi = () => {
      const v = b.validasi = GEN.validateBudget(b.rab);
      const t = v.temuan.length
        ? v.temuan.map((x) => `<div class="finding ${x.level}"><b>${x.level === 'error' ? '❌' : '⚠️'} ${x.pesan}</b><div class="muted small">↳ ${x.saran}</div></div>`).join('')
        : '<div class="finding ok">✅ Tidak ditemukan pelanggaran SBM maupun duplikasi anggaran.</div>';
      const eff = v.efisiensi ? `<div class="callout"><b>Simulasi Efisiensi:</b> ${v.efisiensi.pesan}</div>` : '';
      return t + eff;
    };

    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 3 · RAB & AI Budget Validator</h3>
        <p class="muted">RAB dibuat otomatis berdasarkan SBM & jenis kegiatan. Edit volume/harga sesuai kebutuhan — validasi berjalan otomatis. Sumber: <b>${KB.SUMBER[f.sumber].label}</b>.</p>
        <div id="rabtable">${renderTable()}</div>
        <div class="rab-actions">
          <button class="btn" id="addrow">+ Tambah Baris</button>
          <button class="btn" id="regen">↻ Generate Ulang dari SBM</button>
        </div>
      </div>
      <div class="panel">
        <h3>🔎 Hasil Validasi Anggaran</h3>
        <div id="validasibox">${renderValidasi()}</div>
      </div>
      ${navButtons()}`;

    const refresh = () => {
      b.rab.total = GEN.recomputeRAB(b.rab.items);
      $('#rabtable', body).innerHTML = renderTable();
      $('#validasibox', body).innerHTML = renderValidasi();
      wireCells();
      upsert(b);
    };
    const wireCells = () => {
      body.querySelectorAll('.cell').forEach((inp) => inp.addEventListener('input', () => {
        const it = b.rab.items[Number(inp.dataset.i)];
        const k = inp.dataset.k;
        it[k] = inp.classList.contains('num') ? Number(inp.value) || 0 : inp.value;
        b.rab.total = GEN.recomputeRAB(b.rab.items);
        $('#validasibox', body).innerHTML = renderValidasi();
        // update total + jumlah baris tanpa kehilangan fokus
        const tf = body.querySelector('tfoot b:last-child'); if (tf) tf.textContent = rupiah(b.rab.total);
        const cellRow = inp.closest('tr'); if (cellRow) cellRow.querySelector('td.r').textContent = rupiah(it.jumlah);
      }));
      body.querySelectorAll('[data-del]').forEach((btn) => btn.addEventListener('click', () => {
        b.rab.items.splice(Number(btn.dataset.del), 1); refresh();
      }));
    };
    wireCells();
    $('#addrow', body).addEventListener('click', () => {
      b.rab.items.push({ uraian: 'Item baru', akun: '521211', akunNama: 'Belanja Bahan', vol: 1, satuan: 'Keg', harga: 0, jumlah: 0, sbmMax: null, sbmKey: null });
      refresh();
    });
    $('#regen', body).addEventListener('click', () => { b.rab = GEN.generateRAB(f); refresh(); });

    wireNav(() => { b.validasi = GEN.validateBudget(b.rab); upsert(b); state.step = 3; renderWizard($('#screen')); });
  }

  // ── STEP 4: Document Generator + preview/print ─────────────────────────────
  function stepDokumen(body) {
    const b = state.current; const f = b.form;
    const docMeta = () => ({
      nomor: b.arsip ? b.arsip.nomor : '......./KPU-Prov.JABAR/' + (new Date().getFullYear()),
      seq: b.arsip ? (b.arsip.nomor.split('/')[0]) : undefined,
      tglDok: f.tanggal || new Date().toISOString().slice(0, 10),
      total: b.rab.total, rab: b.rab, tte: !!b.arsip, hash: b.arsip ? b.arsip.hash : '',
    });
    const generatable = b.requirements.filter((d) => GEN.DOC_FN[d.id]);
    const aiOn = window.KPAI && window.KPAI.isEnabled();
    let curDoc = null;
    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 4 · ${aiOn ? 'AI' : 'Template'} Document Generator</h3>
        <p class="muted">Seluruh dokumen dibentuk otomatis. Klik untuk pratinjau, ${aiOn ? 'buat versi AI yang kaya narasi, ' : ''}lalu cetak / simpan PDF.
          ${aiOn ? '<span class="pill req">Mode AI aktif</span>' : '<span class="pill opt">Mode template (AI nonaktif)</span>'}</p>
        <div class="docgrid">
          ${generatable.map((d) => `<button class="doccard" data-doc="${d.id}"><span class="docicon">📄</span><span>${d.nama}</span><span class="pill ${d.status === 'Wajib' ? 'req' : d.status === 'Perlu' ? 'need' : 'opt'}">${d.status}</span></button>`).join('')}
        </div>
      </div>
      <div class="panel" id="previewpanel" style="display:none">
        <div class="preview-bar"><b id="prevtitle"></b><span class="spacer"></span>
          ${aiOn ? '<button class="btn primary" id="aidoc">✨ Buat dengan AI</button>' : ''}
          <button class="btn" id="printdoc">🖨️ Cetak / PDF</button>
        </div>
        <div id="aistatus" class="muted small"></div>
        <div class="doc-paper" id="docpaper"></div>
      </div>
      ${navButtons(null, 'Lanjut ke Review →')}`;

    const showDoc = (id, label) => {
      curDoc = id;
      $('#prevtitle', body).textContent = label;
      $('#aistatus', body).textContent = '';
      $('#docpaper', body).innerHTML = GEN.generateDoc(id, f, docMeta());
      $('#previewpanel', body).style.display = 'block';
      $('#previewpanel', body).scrollIntoView({ behavior: 'smooth' });
    };
    body.querySelectorAll('.doccard').forEach((c) => c.addEventListener('click', () => showDoc(c.dataset.doc, c.textContent.trim())));
    $('#printdoc', body).addEventListener('click', () => printNode($('#docpaper', body).innerHTML));

    const aibtn = $('#aidoc', body);
    if (aibtn) aibtn.addEventListener('click', async () => {
      if (!curDoc) return;
      const st = $('#aistatus', body);
      aibtn.disabled = true; aibtn.textContent = 'AI menyusun…'; st.textContent = '⏳ Menyusun narasi dengan Claude…';
      try {
        const html = await window.KPAI.generateDocument(curDoc, f, docMeta());
        $('#docpaper', body).innerHTML = html;
        st.innerHTML = '✨ <b>Versi AI</b> — tinjau & sunting bila perlu sebelum cetak.';
      } catch (err) {
        st.innerHTML = '⚠️ AI gagal (' + esc(err.message) + '). Menampilkan versi template.';
      } finally {
        aibtn.disabled = false; aibtn.textContent = '✨ Buat dengan AI';
      }
    });
    wireNav(() => { b.status = b.status === 'Draft' ? 'Review' : b.status; upsert(b); state.step = 4; renderWizard($('#screen')); });
  }

  // ── STEP 5: AI Review Assistant ────────────────────────────────────────────
  function stepReview(body) {
    const b = state.current; const f = b.form;
    b.review = GEN.reviewAssistant(f, b.rab, b.validasi || GEN.validateBudget(b.rab));
    upsert(b);
    const list = (arr) => arr.map((x) => `<li class="${x.ok ? 'pass' : 'fail'}">${x.ok ? '✅' : '⚠️'} ${x.label}</li>`).join('');
    const aiOn = window.KPAI && window.KPAI.isEnabled();
    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 5 · AI Review Assistant</h3>
        <div class="scorewrap"><div class="scoredial" style="--s:${b.review.skor}"><span>${b.review.skor}</span></div>
          <div><b>Skor Kesiapan Dokumen</b><p class="muted">${b.review.skor >= 80 ? 'Siap diajukan untuk persetujuan.' : 'Perbaiki butir bertanda ⚠️ sebelum diajukan.'}</p></div></div>
      </div>
      <div class="grid3">
        <div class="panel"><h4>📋 Compliance Check</h4><ul class="checklist">${list(b.review.compliance)}</ul></div>
        <div class="panel"><h4>✍️ Quality Check</h4><ul class="checklist">${list(b.review.quality)}</ul></div>
        <div class="panel"><h4>🛡️ Risk Check</h4><ul class="checklist">${list(b.review.risk)}</ul></div>
      </div>
      ${aiOn ? `<div class="panel">
        <h4>📝 AI Approval Summary (ringkasan 1 halaman untuk pimpinan)</h4>
        <button class="btn primary" id="genringkas">✨ Buat Ringkasan AI</button>
        <div id="ringkasbox" class="ringkas"></div>
      </div>` : ''}
      ${navButtons(null, 'Ajukan ke Approval →')}`;

    const gr = $('#genringkas', body);
    if (gr) gr.addEventListener('click', async () => {
      const box = $('#ringkasbox', body);
      gr.disabled = true; gr.textContent = 'Menyusun…'; box.innerHTML = '<p class="muted small">⏳ Claude menyusun ringkasan…</p>';
      try {
        box.innerHTML = await window.KPAI.approvalSummary(f, b.rab, b.validasi || GEN.validateBudget(b.rab));
      } catch (err) { box.innerHTML = '<p class="muted small">⚠️ Gagal: ' + esc(err.message) + '</p>'; }
      gr.disabled = false; gr.textContent = '✨ Buat Ringkasan AI';
    });

    wireNav(() => { b.status = 'Approval'; upsert(b); state.step = 5; renderWizard($('#screen')); });
  }

  // ── STEP 6: Workflow Approval Engine ───────────────────────────────────────
  function stepApproval(body) {
    const b = state.current;
    const rows = APPROVAL_CHAIN.map((lvl, i) => {
      const ap = b.approvals[lvl.key];
      const prevDone = i === 0 || (b.approvals[APPROVAL_CHAIN[i - 1].key] && b.approvals[APPROVAL_CHAIN[i - 1].key].status === 'setuju');
      const st = ap ? ap.status : 'pending';
      return `<div class="aprow ${st}">
        <div class="aplvl"><span class="apno">${i + 1}</span><div><b>${lvl.label}</b><div class="muted small">${lvl.aksi}</div></div></div>
        <div class="apstatus">
          ${ap ? `<span class="pill ${ap.status === 'setuju' ? 'req' : 'err'}">${ap.status === 'setuju' ? '✔ ' + lvl.aksi + ' (' + new Date(ap.ts).toLocaleDateString('id-ID') + ')' : '✘ Ditolak'}</span>${ap.note ? `<div class="muted small">"${esc(ap.note)}"</div>` : ''}`
            : prevDone ? `<button class="btn primary sm" data-ok="${lvl.key}">Setujui</button> <button class="btn sm" data-no="${lvl.key}">Tolak</button>` : '<span class="muted small">menunggu jenjang sebelumnya</span>'}
        </div>
      </div>`;
    }).join('');
    const allOk = APPROVAL_CHAIN.every((l) => b.approvals[l.key] && b.approvals[l.key].status === 'setuju');
    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 6 · Workflow & Approval Engine</h3>
        <p class="muted">Paraf → Verifikasi → Persetujuan berjenjang. Persetujuan final oleh Ketua membuka tahap TTE.</p>
        <div class="approvchain">${rows}</div>
      </div>
      ${navButtons(null, allOk ? 'Lanjut ke TTE & Arsip →' : 'Selesaikan persetujuan dulu')}`;

    body.querySelectorAll('[data-ok]').forEach((btn) => btn.addEventListener('click', () => {
      const note = prompt('Catatan persetujuan (opsional):') || '';
      b.approvals[btn.dataset.ok] = { status: 'setuju', note, ts: new Date().toISOString() };
      upsert(b); renderWizard($('#screen'));
    }));
    body.querySelectorAll('[data-no]').forEach((btn) => btn.addEventListener('click', () => {
      const note = prompt('Alasan penolakan:') || '';
      b.approvals[btn.dataset.no] = { status: 'tolak', note, ts: new Date().toISOString() };
      b.status = 'Ditolak'; upsert(b); renderWizard($('#screen'));
    }));
    wireNav(() => { if (!allOk) { alert('Lengkapi seluruh persetujuan berjenjang terlebih dahulu.'); return; } state.step = 6; renderWizard($('#screen')); });
  }

  // ── STEP 7: TTE & Arsip Elektronik ─────────────────────────────────────────
  async function stepArsip(body) {
    const b = state.current; const f = b.form;
    body.innerHTML = `
      <div class="panel">
        <h3>Tahap 7 · TTE & Arsip Elektronik</h3>
        <p class="muted">Penomoran dokumen, hash integritas (SHA-256), tanda tangan elektronik (simulasi BSrE), dan QR verifikasi.</p>
        <div id="arsipbox">${b.arsip ? '' : '<button class="btn primary big" id="dofinal">🔏 Bubuhkan TTE & Arsipkan</button>'}</div>
        <div id="arsipresult"></div>
      </div>
      ${navButtons(null, 'Selesai ✓')}`;

    const renderResult = () => {
      if (!b.arsip) return;
      $('#arsipbox', body).innerHTML = '';
      $('#arsipresult', body).innerHTML = `
        <div class="arsip-final">
          <div class="arsip-info">
            <p>✅ <b>Dokumen diarsipkan & ditandatangani elektronik.</b></p>
            <table class="doc-meta">
              <tr><td>Nomor Dokumen</td><td>:</td><td class="mono">${b.arsip.nomor}</td></tr>
              <tr><td>Tanggal TTE</td><td>:</td><td>${new Date(b.arsip.ts).toLocaleString('id-ID')}</td></tr>
              <tr><td>Penandatangan</td><td>:</td><td>Ketua KPU Provinsi Jawa Barat (BSrE)</td></tr>
              <tr><td>Hash SHA-256</td><td>:</td><td class="mono small">${b.arsip.hash}</td></tr>
              <tr><td>Status</td><td>:</td><td><span class="pill req">SELESAI</span></td></tr>
            </table>
            <p class="muted small">Integrasi siap: BSrE BSSN · SRIKANDI · e-Office. Pindai QR untuk verifikasi keaslian.</p>
          </div>
          <div class="qr-wrap"><div id="qrcode"></div><div class="muted small c">QR Verifikasi</div></div>
        </div>`;
      drawQR($('#qrcode', body), b.arsip.nomor + '|' + b.arsip.hash.slice(0, 16));
    };

    if (b.arsip) renderResult();
    const fbtn = $('#dofinal', body);
    if (fbtn) fbtn.addEventListener('click', async () => {
      fbtn.disabled = true; fbtn.textContent = 'Memproses…';
      const payload = JSON.stringify({ f, rab: b.rab, ap: b.approvals });
      const hash = await sha256(payload);
      const seq = String(load().filter((x) => x.arsip).length + 1).padStart(3, '0');
      b.arsip = {
        nomor: `${seq}/PD/${f.sumber}/KPU-Prov.JABAR/${new Date().getFullYear()}`,
        hash, tte: true, ts: new Date().toISOString(),
      };
      b.status = 'Selesai';
      upsert(b);
      renderResult();
    });

    wireNav(() => { state.current = null; state.view = 'arsip'; render(); });
  }

  // ════════════════════════════════════════════════════════════════════════
  // ARSIP
  // ════════════════════════════════════════════════════════════════════════
  function renderArsip(s) {
    const list = load().slice().reverse();
    if (!list.length) { s.innerHTML = '<div class="panel empty">Belum ada berkas perencanaan. Mulai dari tab “Buat Dokumen”.</div>'; return; }
    s.innerHTML = `<div class="panel"><h3>🗄️ Arsip Berkas Perencanaan (${list.length})</h3>
      <table class="doc-table">
        <thead><tr><th>Nomor/ID</th><th>Kegiatan</th><th>Sumber</th><th>Anggaran</th><th>Status</th><th></th></tr></thead>
        <tbody>${list.map((b) => `<tr>
          <td class="mono small">${b.arsip ? b.arsip.nomor : b.id}</td>
          <td>${esc(b.form.nama || '(tanpa nama)')}</td>
          <td><span class="pill ${b.form.sumber === 'HNP' ? 'need' : 'req'}">${b.form.sumber}</span></td>
          <td class="r">${rupiah(b.rab ? b.rab.total : 0)}</td>
          <td><span class="pill ${statusPill(b.status)}">${b.status}</span></td>
          <td><button class="btn sm" data-open="${b.id}">Buka</button> <button class="del" data-rm="${b.id}">✕</button></td>
        </tr>`).join('')}</tbody>
      </table></div>`;
    s.querySelectorAll('[data-open]').forEach((btn) => btn.addEventListener('click', () => {
      state.current = load().find((x) => x.id === btn.dataset.open);
      state.step = state.current.arsip ? 6 : 0; state.view = 'wizard'; render();
    }));
    s.querySelectorAll('[data-rm]').forEach((btn) => btn.addEventListener('click', () => {
      if (!confirm('Hapus berkas ini?')) return;
      saveAll(load().filter((x) => x.id !== btn.dataset.rm)); renderArsip(s);
    }));
  }
  function statusPill(st) { return st === 'Selesai' ? 'req' : st === 'Ditolak' ? 'err' : st === 'Approval' ? 'need' : 'opt'; }

  // ════════════════════════════════════════════════════════════════════════
  // BAS — Bagan Akun Standar (referensi akun belanja)
  // ════════════════════════════════════════════════════════════════════════
  function renderBAS(s) {
    const bas = KB.BAS;
    const draw = (q) => {
      q = (q || '').toLowerCase();
      return bas.kelompok.map((k) => {
        const jenis = k.jenis.map((j) => {
          const akun = j.akun.filter((a) => !q || a.kode.includes(q) || a.nama.toLowerCase().includes(q));
          if (!akun.length) return '';
          return `<tr class="bas-jenis"><td class="mono">${j.kode}</td><td colspan="2"><b>${j.nama}</b></td></tr>` +
            akun.map((a) => `<tr><td></td><td class="mono">${a.kode}</td><td>${a.nama}</td></tr>`).join('');
        }).join('');
        if (!jenis) return '';
        return `<tr class="bas-kel"><td class="mono">${k.kode}</td><td colspan="2"><b>${k.nama}</b></td></tr>` + jenis;
      }).join('');
    };
    s.innerHTML = `
      <div class="panel">
        <h3>📒 Bagan Akun Standar (BAS) — Belanja</h3>
        <p class="muted small">Struktur akun belanja pemerintah (mengacu PMK Bagan Akun Standar). Dipakai untuk penyusunan & validasi RAB. Akun pada DIPA KPU Jabar 2026 termuat di sini.</p>
        <input id="bassearch" placeholder="Cari akun: ketik kode (mis. 5241) atau nama (mis. perjalanan)…"/>
        <table class="doc-table bas-table"><thead><tr><th>Kelompok/Jenis</th><th>Kode Akun</th><th>Uraian</th></tr></thead>
        <tbody id="basbody">${draw('')}</tbody></table>
      </div>`;
    $('#bassearch', s).addEventListener('input', (e) => { $('#basbody', s).innerHTML = draw(e.target.value); });
  }

  // ════════════════════════════════════════════════════════════════════════
  // SETTINGS — Konfigurasi Mode AI (Claude)
  // ════════════════════════════════════════════════════════════════════════
  function renderSettings(s) {
    const c = window.KPAI.getConfig();
    s.innerHTML = `
      <div class="panel">
        <h3>⚙️ Pengaturan Mode AI (Claude)</h3>
        <p class="muted">Mode AI memperkaya narasi dokumen & mengaktifkan AI Copilot. Tanpa konfigurasi, aplikasi tetap berjalan memakai generator template.</p>
        <label>Penyedia AI
          <select id="provider">
            <option value="off" ${c.provider === 'off' ? 'selected' : ''}>Nonaktif (template saja)</option>
            <option value="edge" ${c.provider === 'edge' ? 'selected' : ''}>Supabase Edge Function (disarankan — kunci di server)</option>
            <option value="direct" ${c.provider === 'direct' ? 'selected' : ''}>Langsung ke Anthropic (kunci di perangkat ini)</option>
          </select>
        </label>
        <div id="edgecfg" class="cfg-group" style="${c.provider === 'edge' ? '' : 'display:none'}">
          <label>URL Edge Function<input id="edgeUrl" value="${esc(c.edgeUrl)}" placeholder="https://xxxx.supabase.co/functions/v1/perencanaan-ai"/></label>
          <label>Supabase Anon Key<input id="edgeAnon" value="${esc(c.edgeAnon)}" placeholder="eyJhbGciOi..."/></label>
        </div>
        <div id="directcfg" class="cfg-group" style="${c.provider === 'direct' ? '' : 'display:none'}">
          <label>Anthropic API Key<input id="apiKey" type="password" value="${esc(c.apiKey)}" placeholder="sk-ant-..."/></label>
          <p class="muted small">⚠️ Kunci tersimpan di localStorage perangkat ini. Untuk produksi, gunakan Edge Function.</p>
        </div>
        <label>Model
          <select id="model">
            <option value="claude-sonnet-4-6" ${c.model === 'claude-sonnet-4-6' ? 'selected' : ''}>Claude Sonnet 4.6 (cepat & hemat — disarankan)</option>
            <option value="claude-opus-4-8" ${c.model === 'claude-opus-4-8' ? 'selected' : ''}>Claude Opus 4.8 (paling cakap)</option>
            <option value="claude-haiku-4-5-20251001" ${c.model === 'claude-haiku-4-5-20251001' ? 'selected' : ''}>Claude Haiku 4.5 (paling ringan)</option>
          </select>
        </label>
        <div class="navbtns" style="justify-content:flex-start;gap:.5rem">
          <button class="btn primary" id="savecfg">Simpan</button>
          <button class="btn" id="testcfg">Uji Koneksi</button>
        </div>
        <div id="cfgmsg" class="muted small"></div>
      </div>
      <div class="panel">
        <h4>📘 Cara mengaktifkan (Edge Function)</h4>
        <ol class="bullet small">
          <li>Deploy: <span class="mono">supabase functions deploy perencanaan-ai --no-verify-jwt</span></li>
          <li>Set secret: <span class="mono">supabase secrets set ANTHROPIC_API_KEY=sk-ant-...</span></li>
          <li>Isi URL Edge Function + Anon Key di atas, pilih provider "Supabase Edge Function", lalu Simpan.</li>
        </ol>
      </div>`;
    $('#provider', s).addEventListener('change', (e) => {
      $('#edgecfg', s).style.display = e.target.value === 'edge' ? '' : 'none';
      $('#directcfg', s).style.display = e.target.value === 'direct' ? '' : 'none';
    });
    const readCfg = () => ({
      provider: $('#provider', s).value,
      edgeUrl: $('#edgeUrl', s).value.trim(),
      edgeAnon: $('#edgeAnon', s).value.trim(),
      apiKey: $('#apiKey', s).value.trim(),
      model: $('#model', s).value,
    });
    $('#savecfg', s).addEventListener('click', () => {
      window.KPAI.setConfig(readCfg());
      $('#cfgmsg', s).textContent = '✅ Tersimpan.';
      render();
    });
    $('#testcfg', s).addEventListener('click', async () => {
      window.KPAI.setConfig(readCfg());
      const msg = $('#cfgmsg', s);
      if (!window.KPAI.isEnabled()) { msg.textContent = '⚠️ Lengkapi konfigurasi dulu.'; return; }
      msg.textContent = '⏳ Menguji…';
      try {
        const t = await window.KPAI.callClaude({ messages: [{ role: 'user', content: 'Balas satu kata: OK' }], max_tokens: 16 });
        msg.textContent = '✅ Berhasil. Respons: ' + t.slice(0, 40);
      } catch (e) { msg.textContent = '❌ Gagal: ' + e.message; }
    });
  }

  // ════════════════════════════════════════════════════════════════════════
  // HELPERS: esc, hash, QR, print
  // ════════════════════════════════════════════════════════════════════════
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return [...new Uint8Array(buf)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  // QR via qrcodejs (lazy, di-cache service worker untuk offline)
  let qrLoading = null;
  function loadQR() {
    if (window.QRCode) return Promise.resolve();
    if (qrLoading) return qrLoading;
    qrLoading = new Promise((res, rej) => {
      const sc = document.createElement('script');
      sc.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
      sc.onload = res; sc.onerror = rej; document.head.appendChild(sc);
    });
    return qrLoading;
  }
  async function drawQR(el, text) {
    el.innerHTML = '';
    try { await loadQR(); new window.QRCode(el, { text, width: 128, height: 128, correctLevel: window.QRCode.CorrectLevel.M }); }
    catch { el.innerHTML = '<div class="muted small">QR butuh koneksi internet.</div>'; }
  }

  function printNode(html) {
    const w = window.open('', '_blank');
    w.document.write(`<!doctype html><html><head><title>Cetak Dokumen</title>
      <link rel="stylesheet" href="./styles.css"/></head>
      <body class="printpage"><div class="doc-paper">${html}</div>
      <script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`);
    w.document.close();
  }

  // ── Boot ───────────────────────────────────────────────────────────────────
  render();
})();
