/* SAE SURVEI · app.js — prototipe UI (vanilla JS, tanpa backend). */

const app = document.getElementById('app');
const TABS = [
  { id: 'dashboard', label: '📈 Dashboard' },
  { id: 'survei', label: '🗂️ Daftar Survei' },
  { id: 'isi', label: '📝 Isi Survei' },
  { id: 'analitik', label: '🤖 Analitik AI' },
  { id: 'laporan', label: '📄 Laporan' }
];

const TIPE_ICON = { IKM: '🏛️', Pegawai: '👥', Stakeholder: '🤝', NPS: '⭐', Integritas: '🛡️', Kegiatan: '📅' };

const state = {
  tab: 'dashboard',
  isiSurveyId: 'ikm-2026',
  answers: {},   // kode unsur -> 1..4
  rating: 0,
  submitted: false,
  reportType: null
};

/* ---------- util ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const heatColor = (skor) => skor >= 88 ? '#16a34a' : skor >= 80 ? '#0891b2' : skor >= 70 ? '#d97706' : '#dc2626';

function computeIKM() {
  const answered = Object.values(state.answers);
  // gunakan data contoh + jawaban responden saat ini (jika ada) untuk demonstrasi
  const base = UNSUR_IKM.map((u) => u.nrr);
  const nrr = base.reduce((a, b) => a + b, 0) / base.length;
  return +(nrr * 25).toFixed(2);
}

/* QR-like deterministik (offline, tanpa pustaka). Bukan QR asli — ilustrasi UI. */
function fauxQR(seed, size) {
  const n = 21, cell = size / n;
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const rnd = () => (h = (h * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  let rects = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    const on = finder ? ((x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4)) ||
      (x >= n - 7 && (x === n - 7 || x === n - 1)) || (y >= n - 7 && (y === n - 7 || y === n - 1)))
      : rnd() > 0.55;
    if (on) rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="#0f172a"/>`;
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="QR ilustrasi">${rects}</svg>`;
}

/* ---------- render shell ---------- */
function render() {
  const tabs = TABS.map((t) => `<button class="${t.id === state.tab ? 'on' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
  const body = ({
    dashboard: viewDashboard, survei: viewSurvei, isi: viewIsi, analitik: viewAnalitik, laporan: viewLaporan
  }[state.tab])();
  app.innerHTML = `<nav class="tabs">${tabs}</nav>${body}`;
  bind();
  window.scrollTo({ top: 0 });
}

/* ---------- Dashboard ---------- */
function viewDashboard() {
  const ikm = computeIKM();
  const m = mutuIKM(ikm);
  const trendMax = Math.max(...TREND.map((t) => t.nilai));
  const trendMin = Math.min(...TREND.map((t) => t.nilai)) - 3;
  const totalResp = SURVEYS.reduce((a, s) => a + s.responden, 0);

  const unsurBars = UNSUR_IKM.map((u) => {
    const pct = (u.nrr / 4) * 100;
    const col = u.nrr >= 3.06 ? 'var(--brand)' : u.nrr >= 2.6 ? '#d97706' : '#dc2626';
    return `<div class="bar-row"><span class="bar-lbl">${u.kode} · ${esc(u.nama)}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%;background:${col}"></span></span>
      <span class="bar-val">${u.nrr.toFixed(2)}</span></div>`;
  }).join('');

  const trend = TREND.map((t) => {
    const hpct = ((t.nilai - trendMin) / (trendMax - trendMin)) * 100;
    return `<div class="col"><span class="tv">${t.nilai.toFixed(1)}</span>
      <div class="tb" style="height:${Math.max(8, hpct)}%"></div><span class="tl">${t.bulan}</span></div>`;
  }).join('');

  const heat = UNIT_SCORES.map((u) =>
    `<div class="cell" style="background:${heatColor(u.skor)}"><div class="hu">${esc(u.unit)}</div><div class="hs">${u.skor}</div></div>`
  ).join('');

  const best = [...UNIT_SCORES].sort((a, b) => b.skor - a.skor)[0];
  const worst = [...UNIT_SCORES].sort((a, b) => a.skor - b.skor)[0];

  return `
  <section class="cards4">
    <div class="stat"><div class="stat-l">Nilai IKM</div><div class="stat-n" style="color:${m.warna}">${ikm}</div><div class="stat-d up">Mutu ${m.huruf} · ${m.label}</div></div>
    <div class="stat"><div class="stat-l">Total Responden</div><div class="stat-n">${totalResp.toLocaleString('id-ID')}</div><div class="stat-d up">▲ 12% vs bulan lalu</div></div>
    <div class="stat"><div class="stat-l">Survei Aktif</div><div class="stat-n">${SURVEYS.filter((s) => s.status === 'aktif').length}</div><div class="stat-d muted">dari ${SURVEYS.length} survei</div></div>
    <div class="stat"><div class="stat-l">NPS Layanan</div><div class="stat-n" style="color:var(--brand)">+46</div><div class="stat-d up">Zona Baik</div></div>
  </section>

  <section class="panel">
    <h3>Indeks Kepuasan Masyarakat</h3>
    <div class="sub">Konversi nilai persepsi 9 unsur (skala 25–100) · PermenPANRB 14/2017</div>
    <div class="ikm-hero">
      <div class="scoredial" style="--s:${ikm};--col:${m.warna}"><span>${ikm}<small>dari 100</small></span></div>
      <div>
        <div class="row"><span class="grade" style="background:${m.warna}">${m.huruf}</span>
          <div><div style="font-weight:700;font-size:1.05rem">${m.label}</div><div class="muted small">Mutu Pelayanan</div></div></div>
        <p class="small muted" style="max-width:34ch;margin:.6rem 0 0">Unit terbaik: <b>${esc(best.unit)} (${best.skor})</b> · perlu perhatian: <b>${esc(worst.unit)} (${worst.skor})</b>.</p>
      </div>
    </div>
  </section>

  <section class="panel">
    <h4>Nilai per Unsur (NRR, skala 1–4)</h4>
    ${unsurBars}
  </section>

  <section class="panel">
    <h4>Tren IKM 6 Bulan Terakhir</h4>
    <div class="trend">${trend}</div>
  </section>

  <section class="panel">
    <h4>Heatmap Kepuasan per Unit</h4>
    <div class="heat">${heat}</div>
  </section>`;
}

/* ---------- Daftar Survei ---------- */
function viewSurvei() {
  const cards = SURVEYS.map((s) => `
    <div class="scard">
      <div class="ic">${TIPE_ICON[s.tipe] || '📋'}</div>
      <div class="meta">
        <div class="t">${esc(s.judul)} <span class="pill t">${esc(s.tipe)}</span></div>
        <div class="m">${esc(s.sasaran)} · ${s.pertanyaan} pertanyaan · ${s.responden.toLocaleString('id-ID')} responden</div>
      </div>
      <div class="idx">${esc(s.indeks)}</div>
      <span class="pill ${s.status}">${s.status}</span>
      <button class="btn sm primary" data-open="${s.id}">Isi</button>
    </div>`).join('');

  return `
  <section class="panel">
    <div class="row"><div><h3>Daftar Survei</h3><div class="sub" style="margin:0">Survey Builder · distribusi multi-kanal · pemantauan responden</div></div>
      <div class="spacer"></div><button class="btn primary">＋ Survei Baru</button></div>
    <div class="slist">${cards}</div>
  </section>

  <section class="panel">
    <h4>Distribusi Survei — Multi-kanal</h4>
    <div class="dist">
      <div class="qr">${fauxQR('https://sae-survei.kpu-jabar.go.id/s/ikm-2026', 168)}<div class="c small muted" style="margin-top:.4rem">Scan untuk mengisi</div></div>
      <div style="flex:1;min-width:240px">
        <p class="small muted" style="margin-top:0">Bagikan survei lewat kanal mana pun. Cocok untuk Kiosk Mode pasca-layanan atau integrasi presensi SAE PISAN.</p>
        <div class="chips">
          <span class="chip">📱 QR Code</span><span class="chip">🔗 Link</span><span class="chip">✉️ Email</span>
          <span class="chip">💬 WhatsApp</span><span class="chip">📲 SMS Gateway</span><span class="chip">🖥️ Kiosk Mode</span>
        </div>
        <div class="btnrow"><button class="btn sm">Salin Link</button><button class="btn sm">Kirim WhatsApp</button><button class="btn sm">Unduh QR</button></div>
      </div>
    </div>
  </section>`;
}

/* ---------- Isi Survei (responden) ---------- */
function viewIsi() {
  const survey = SURVEYS.find((s) => s.id === state.isiSurveyId) || SURVEYS[0];
  const picker = SURVEYS.filter((s) => s.status !== 'draf').map((s) =>
    `<option value="${s.id}" ${s.id === survey.id ? 'selected' : ''}>${esc(s.judul)}</option>`).join('');

  if (state.submitted) {
    return `<section class="panel thanks">
      <div class="big">✅</div>
      <h3>Terima kasih!</h3>
      <p class="muted">Jawaban Anda telah terekam. Hasil otomatis masuk ke dashboard & analitik AI secara real-time.</p>
      <button class="btn primary" data-reset="1">Isi survei lagi</button>
    </section>`;
  }

  const questions = IKM_QUESTIONS.map((q, i) => {
    const opts = LIKERT_IKM.map((lbl, idx) => {
      const val = idx + 1, sel = state.answers[q.kode] === val ? 'sel' : '';
      const em = ['😞', '😐', '🙂', '😀'][idx];
      return `<label class="${sel}" data-q="${q.kode}" data-v="${val}"><span class="em">${em}</span>${lbl}</label>`;
    }).join('');
    return `<div class="q"><div class="qt">${i + 1}. ${esc(q.teks)}</div><div class="likert">${opts}</div></div>`;
  }).join('');

  // Branching logic: jika ada unsur dinilai <= 2, tampilkan pertanyaan keluhan.
  const lowValues = Object.values(state.answers).filter((v) => v <= 2).length;
  const branch = lowValues > 0 ? `
    <div class="branch">
      <div class="qt">⚠️ Anda memberi nilai rendah pada ${lowValues} aspek. Mohon ceritakan keluhan Anda:</div>
      <textarea placeholder="Contoh: ruang tunggu panas, antrian lama…"></textarea>
    </div>` : '';

  const stars = [1, 2, 3, 4, 5].map((n) =>
    `<span class="s ${n <= state.rating ? 'on' : ''}" data-star="${n}">★</span>`).join('');

  return `
  <section class="panel">
    <div class="row"><div><h3>Isi Survei</h3><div class="sub" style="margin:0">Tampilan sisi responden (HP / kiosk)</div></div>
      <div class="spacer"></div>
      <select id="surveypick">${picker}</select></div>
  </section>

  <section class="panel">
    <h4>${esc(survey.judul)}</h4>
    <p class="small muted" style="margin-top:0">Sasaran: ${esc(survey.sasaran)}. Jawaban Anda anonim.</p>
    ${questions}
    ${branch}
    <div class="q"><div class="qt">Beri rating pengalaman Anda secara keseluruhan</div><div class="stars" id="stars">${stars}</div></div>
    <div class="q"><div class="qt">Saran / masukan tambahan (opsional)</div><textarea placeholder="Tulis masukan Anda…"></textarea></div>
    <button class="btn primary big" data-submit="1">Kirim Jawaban</button>
  </section>`;
}

/* ---------- Analitik AI ---------- */
function viewAnalitik() {
  const topics = TOPICS.map((t) => {
    const arrow = t.arah === 'naik' ? '<span class="down">▲</span>' : t.arah === 'turun' ? '<span class="up">▼</span>' : '–';
    const pct = (t.jumlah / Math.max(...TOPICS.map((x) => x.jumlah))) * 100;
    return `<div class="bar-row"><span class="bar-lbl">${esc(t.nama)} ${arrow}</span>
      <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
      <span class="bar-val">${t.jumlah}</span></div>`;
  }).join('');

  const comments = COMMENTS.map((c) => {
    const tags = [
      ...c.positif.map((p) => `<span class="tag p">✔ ${esc(p)}</span>`),
      ...c.negatif.map((n) => `<span class="tag n">✕ ${esc(n)}</span>`),
      `<span class="tag tp"># ${esc(c.topik)}</span>`
    ].join('');
    return `<div class="cmt">“${esc(c.teks)}”<div class="tags">${tags}</div></div>`;
  }).join('');

  const recs = RECOMMENDATIONS.map((r) =>
    `<div class="rec"><div class="rt">${esc(r.judul)} <span class="pri ${r.prioritas}">· ${r.prioritas}</span></div>
     <div class="ra">${esc(r.alasan)}</div></div>`).join('');

  return `
  <div class="ainote">🤖 <b>AI Analytics Engine</b> — sentiment analysis, topic clustering, dan recommendation generator dijalankan otomatis atas komentar responden. <span class="muted">(prototipe: hasil contoh)</span></div>

  <section class="panel">
    <h4>Sentiment Analysis</h4>
    <div class="split">
      <div class="seg pos" style="width:${SENTIMENT.positif}%">${SENTIMENT.positif}%</div>
      <div class="seg net" style="width:${SENTIMENT.netral}%">${SENTIMENT.netral}%</div>
      <div class="seg neg" style="width:${SENTIMENT.negatif}%">${SENTIMENT.negatif}%</div>
    </div>
    <div class="row small muted" style="margin-top:.5rem;gap:1.2rem"><span>🟢 Positif</span><span>⚪ Netral</span><span>🔴 Negatif</span></div>
    ${comments}
  </section>

  <section class="panel">
    <h4>Topic Clustering — Isu yang Paling Sering Muncul</h4>
    ${topics}
  </section>

  <section class="panel">
    <h4>Recommendation Generator</h4>
    <div class="sub">Rekomendasi tindak lanjut berdasar tren keluhan & sentimen.</div>
    ${recs}
  </section>`;
}

/* ---------- Laporan ---------- */
function viewLaporan() {
  const ikm = computeIKM(); const m = mutuIKM(ikm);
  const docs = [
    { t: 'PDF', d: '📕', s: 'Executive summary, grafik, analisis, rekomendasi' },
    { t: 'Word', d: '📘', s: 'Siap diedit & ditandatangani' },
    { t: 'PowerPoint', d: '📙', s: 'Untuk rapat pimpinan' }
  ].map((x) => `<div class="doccard" data-report="${x.t}"><div class="di">${x.d}</div><div>${x.t}</div><div class="small muted">${x.s}</div></div>`).join('');

  const preview = state.reportType ? `
    <div class="report-preview">
      <h4>📄 Pratinjau Laporan ${esc(state.reportType)} — dibuat otomatis</h4>
      <p class="small muted">SAE SURVEI · ${esc(document.getElementById('tenant')?.textContent || 'Instansi')} · Periode Juni 2026</p>
      <p><b>Ringkasan Eksekutif.</b> Nilai IKM periode ini <b>${ikm} (Mutu ${m.huruf} – ${m.label})</b> berdasarkan ${SURVEYS.find((s) => s.id === 'ikm-2026').responden.toLocaleString('id-ID')} responden. Sentimen responden 64% positif. Unsur terendah: <i>Sarana &amp; Prasarana</i> dan <i>Penanganan Pengaduan</i>.</p>
      <b>Rekomendasi Prioritas:</b>
      <ul>${RECOMMENDATIONS.filter((r) => r.prioritas !== 'Rendah').map((r) => `<li>${esc(r.judul)} — ${esc(r.alasan)}</li>`).join('')}</ul>
      <p class="small muted">Hasil dapat dialirkan ke <b>SAE NASKAH</b> menjadi nota dinas/laporan pimpinan, dan ke <b>SAE PERENCANAAN</b> sebagai dasar program.</p>
      <div class="btnrow"><button class="btn primary sm">⬇️ Unduh ${esc(state.reportType)}</button><button class="btn sm" data-report-close="1">Tutup pratinjau</button></div>
    </div>` : '';

  return `
  <div class="ainote">📄 <b>AI Report Generator</b> — satu klik menghasilkan laporan lengkap. Pilih format di bawah untuk melihat pratinjaunya.</div>
  <section class="panel">
    <h4>Hasilkan Laporan Otomatis</h4>
    <div class="docgrid">${docs}</div>
    ${preview}
  </section>`;
}

/* ---------- events ---------- */
function bind() {
  app.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { state.tab = b.dataset.tab; render(); });
  app.querySelectorAll('[data-open]').forEach((b) => b.onclick = () => {
    state.isiSurveyId = b.dataset.open; state.tab = 'isi'; state.submitted = false; state.answers = {}; state.rating = 0; render();
  });
  const pick = app.querySelector('#surveypick');
  if (pick) pick.onchange = () => { state.isiSurveyId = pick.value; state.answers = {}; state.rating = 0; render(); };
  app.querySelectorAll('[data-q]').forEach((l) => l.onclick = () => {
    state.answers[l.dataset.q] = +l.dataset.v; render();
  });
  app.querySelectorAll('[data-star]').forEach((s) => s.onclick = () => { state.rating = +s.dataset.star; render(); });
  const submit = app.querySelector('[data-submit]');
  if (submit) submit.onclick = () => {
    if (Object.keys(state.answers).length < IKM_QUESTIONS.length) {
      alert('Mohon jawab semua pertanyaan penilaian terlebih dahulu.');
      return;
    }
    state.submitted = true; render();
  };
  const reset = app.querySelector('[data-reset]');
  if (reset) reset.onclick = () => { state.submitted = false; state.answers = {}; state.rating = 0; render(); };
  app.querySelectorAll('[data-report]').forEach((d) => d.onclick = () => { state.reportType = d.dataset.report; render(); });
  const rc = app.querySelector('[data-report-close]');
  if (rc) rc.onclick = () => { state.reportType = null; render(); };
}

render();
