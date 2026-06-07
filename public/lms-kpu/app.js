/* ============================================================================
 * LMS Kepemiluan — Tiered Facilitation Model (KPU) · app.js
 * Aplikasi satu halaman (vanilla JS, offline-first) yang menjalankan alur
 * pembelajaran berjenjang komisioner KPU: pemilihan jenjang, alur 7 tahap,
 * peta kompetensi (self-assessment), bank kasus (manajemen pengetahuan),
 * fasilitator, evaluasi dampak, dan sertifikat.
 *
 * Persistensi: localStorage (per perangkat). Tanpa backend.
 * ==========================================================================*/
(function () {
  'use strict';

  const LMS = window.LMS;
  const { TIERS, KOMPETENSI, FASILITATOR, DAMPAK, STAGES, BANK_KASUS_SEED } = LMS;
  const app = document.getElementById('app');
  const subEl = document.getElementById('subtitle');
  const STORE = 'lms_kpu_v1';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const TIPE_ICON = { baca: '📖', video: '🎬', refleksi: '✍️', diskusi: '💬', 'studi-kasus': '🧩', kuis: '❓' };

  /* ── State & persistensi ──────────────────────────────────────────────── */
  function fresh() {
    return {
      tier: null,            // 'pusat' | 'provinsi' | 'kabkota'
      nama: '',
      done: {},              // lessonId → true
      kuis: {},              // kuisId → skor%
      komp: {},              // kompId → { awal, akhir }
      dampak: {},            // dampakId → { sebelum, sesudah }
      kasus: [],             // kontribusi bank kasus
      view: 'beranda',
    };
  }
  let S = load();
  function load() {
    try {
      const v = JSON.parse(localStorage.getItem(STORE));
      return v && typeof v === 'object' ? Object.assign(fresh(), v) : fresh();
    } catch { return fresh(); }
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(S)); }

  /* ── Helper kurikulum ─────────────────────────────────────────────────── */
  function modulesOf(stage) { return stage.modul(S.tier); }
  function allLessons() {
    const out = [];
    STAGES.forEach((st) => modulesOf(st).forEach((m) => m.lessons.forEach((l) =>
      out.push({ stage: st, modul: m, lesson: l }))));
    return out;
  }
  function stageProgress(stage) {
    const ls = []; modulesOf(stage).forEach((m) => m.lessons.forEach((l) => ls.push(l)));
    const done = ls.filter((l) => S.done[l.id]).length;
    return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
  }
  function overall() {
    const ls = allLessons();
    const done = ls.filter((x) => S.done[x.lesson.id]).length;
    return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
  }
  function quizzes() {
    const out = []; STAGES.forEach((st) => modulesOf(st).forEach((m) => { if (m.kuis) out.push(m.kuis); }));
    return out;
  }

  /* ── Navigasi ─────────────────────────────────────────────────────────── */
  const TABS = [
    ['beranda', '🏠 Beranda'],
    ['alur', '🪜 Alur 7 Tahap'],
    ['kompetensi', '🎯 Kompetensi'],
    ['kasus', '🗂️ Bank Kasus'],
    ['fasilitator', '🤝 Fasilitator'],
    ['dampak', '📊 Evaluasi Dampak'],
    ['sertifikat', '🏅 Sertifikat'],
  ];
  function go(view) { S.view = view; save(); render(); window.scrollTo(0, 0); }

  /* ── RENDER UTAMA ─────────────────────────────────────────────────────── */
  function render() {
    if (!S.tier) return renderOnboarding();
    const t = TIERS[S.tier];
    subEl.textContent = `${t.label} · ${t.fokus}`;
    app.innerHTML =
      `<nav class="tabs">${TABS.map(([k, lbl]) =>
        `<button class="${S.view === k ? 'on' : ''}" data-go="${k}">${lbl}</button>`).join('')}</nav>` +
      `<div id="view"></div>`;
    app.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
    const v = app.querySelector('#view');
    ({ beranda: viewBeranda, alur: viewAlur, kompetensi: viewKompetensi, kasus: viewKasus,
       fasilitator: viewFasilitator, dampak: viewDampak, sertifikat: viewSertifikat }[S.view] || viewBeranda)(v);
  }

  /* ── ONBOARDING: pilih jenjang ────────────────────────────────────────── */
  function renderOnboarding() {
    subEl.textContent = 'Pengembangan Kompetensi Komisioner — Tiered Facilitation Model';
    app.innerHTML =
      `<section class="panel hero">
        <h2>Selamat datang di LMS Kepemiluan</h2>
        <p class="muted">Sistem pembelajaran <b>berjenjang, berkelanjutan, dan non-hierarkis</b>
        bagi Komisioner KPU. Pilih jenjang Anda untuk mempersonalisasi alur pembelajaran
        (Tahap 2 menyesuaikan kewenangan & kompleksitas jenjang).</p>
        <label class="full" style="margin:.6rem 0">Nama / panggilan (opsional)
          <input id="nm" placeholder="mis. Komisioner …" />
        </label>
        <div class="tier-grid">
          ${Object.values(TIERS).map((t) =>
            `<button class="tier-card" data-tier="${t.id}" style="--tc:${t.warna}">
              <div class="tier-badge">${t.short}</div>
              <h3>${t.label}</h3>
              <div class="tier-fokus">${t.fokus}</div>
              <p class="small muted">${esc(t.ringkas)}</p>
            </button>`).join('')}
        </div>
        <p class="small muted c" style="margin-top:1rem">Berbasis Policy Brief
        “Tiered Facilitation Model: Kerangka Strategis Pengembangan Kompetensi
        Komisioner KPU”. Arsitektur LMS terinspirasi Frappe LMS.</p>
      </section>`;
    app.querySelectorAll('[data-tier]').forEach((b) => b.onclick = () => {
      S.tier = b.dataset.tier;
      S.nama = (app.querySelector('#nm').value || '').trim();
      save(); go('beranda');
    });
  }

  /* ── BERANDA ──────────────────────────────────────────────────────────── */
  function viewBeranda(v) {
    const t = TIERS[S.tier];
    const ov = overall();
    const qz = quizzes();
    const qzDone = qz.filter((q) => S.kuis[q.id] != null).length;
    const kompFilled = KOMPETENSI.filter((k) => S.komp[k.id] && S.komp[k.id].awal).length;
    const next = allLessons().find((x) => !S.done[x.lesson.id]);

    v.innerHTML =
      `<section class="panel" style="border-left:5px solid ${t.warna}">
        <div class="flexrow">
          <div>
            <h3 style="margin:0">${S.nama ? esc(S.nama) + ' · ' : ''}${t.label}</h3>
            <div class="muted small">${t.fokus} — ${esc(t.ringkas)}</div>
          </div>
          <button class="btn sm" data-act="ganti">Ganti jenjang</button>
        </div>
      </section>

      <div class="cards4">
        <div class="stat"><div class="stat-n">${ov.pct}%</div><div class="stat-l">Alur selesai</div></div>
        <div class="stat"><div class="stat-n">${ov.done}/${ov.total}</div><div class="stat-l">Materi</div></div>
        <div class="stat"><div class="stat-n">${qzDone}/${qz.length}</div><div class="stat-l">Kuis</div></div>
        <div class="stat"><div class="stat-n">${kompFilled}/${KOMPETENSI.length}</div><div class="stat-l">Kompetensi terpetakan</div></div>
      </div>

      <section class="panel">
        <h3>🪜 Progres Alur 7 Tahap</h3>
        ${STAGES.map((st) => {
          const p = stageProgress(st);
          return `<div class="bar-row">
            <div class="bar-lbl">Tahap ${st.no}. ${esc(st.judul)}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${p.pct}%;background:${t.warna}"></div></div>
            <div class="bar-val">${p.pct}%</div>
          </div>`;
        }).join('')}
        <button class="btn primary big" data-go2="alur">Buka Alur Pembelajaran →</button>
      </section>

      ${next ? `<section class="panel ai-copilot">
        <h4>▶️ Lanjutkan dari sini</h4>
        <div class="muted small">Tahap ${next.stage.no} · ${esc(next.modul.judul)}</div>
        <div style="margin:.3rem 0 .6rem"><b>${TIPE_ICON[next.lesson.tipe] || ''} ${esc(next.lesson.judul)}</b></div>
        <button class="btn primary" data-open="${next.lesson.id}">Mulai materi</button>
      </section>` : `<section class="panel ok-banner">🎉 Seluruh materi alur telah Anda selesaikan. Lihat tab Sertifikat.</section>`}

      <section class="panel">
        <h4>Prinsip Model</h4>
        <ul class="bullet">
          <li><b>Berjenjang & non-hierarkis</b> — fokus berbeda tiap jenjang, tanpa relasi komando.</li>
          <li><b>Berkelanjutan</b> — pembelajaran sepanjang masa jabatan, bukan insidental.</li>
          <li><b>Kesukarelaan</b> — kesadaran profesional, menjaga independensi & martabat jabatan.</li>
          <li><b>Terintegrasi memori institusional</b> — pengetahuan strategis diwariskan lintas periode.</li>
        </ul>
      </section>`;

    v.querySelector('[data-act="ganti"]').onclick = () => {
      if (confirm('Ganti jenjang akan menyesuaikan modul Tahap 2. Lanjutkan?')) { S.tier = null; save(); render(); }
    };
    v.querySelectorAll('[data-go2]').forEach((b) => b.onclick = () => go(b.dataset.go2));
    v.querySelectorAll('[data-open]').forEach((b) => b.onclick = () => openLesson(b.dataset.open));
  }

  /* ── ALUR 7 TAHAP ─────────────────────────────────────────────────────── */
  function viewAlur(v) {
    const t = TIERS[S.tier];
    v.innerHTML =
      `<div class="stepbar">${STAGES.map((st) => {
        const p = stageProgress(st);
        const cls = p.pct === 100 ? 'done' : p.done > 0 ? 'on' : '';
        return `<div class="step ${cls}" data-jump="st-${st.id}"><span>${st.no}</span>${esc(st.judul)}</div>`;
      }).join('')}</div>` +
      STAGES.map((st) => {
        const p = stageProgress(st);
        const mods = modulesOf(st);
        return `<section class="panel stage" id="st-${st.id}" style="border-left:5px solid ${t.warna}">
          <div class="stage-head">
            <div class="stage-no" style="background:${t.warna}">${st.no}</div>
            <div style="flex:1">
              <h3 style="margin:.1rem 0">${esc(st.judul)}</h3>
              <div class="muted small">⏱ ${esc(st.kapan)} · ${p.done}/${p.total} materi · ${p.pct}%</div>
            </div>
          </div>
          <p class="small">${esc(st.tujuan)}</p>
          ${st.no === 2 ? `<div class="callout">🎯 Modul ini dipersonalisasi untuk <b>${t.label}</b>.</div>` : ''}
          ${mods.map((m) => modulCard(m, t)).join('')}
        </section>`;
      }).join('');

    v.querySelectorAll('[data-jump]').forEach((b) => b.onclick = () => {
      const el = document.getElementById(b.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
    bindLessonButtons(v);
    bindQuizButtons(v);
  }

  function modulCard(m, t) {
    const komp = (m.kompetensi || []).map((id) => {
      const k = KOMPETENSI.find((x) => x.id === id); return k ? `<span class="pill opt">${k.icon} ${esc(k.label)}</span>` : '';
    }).join(' ');
    const lessons = m.lessons.map((l) => {
      const done = S.done[l.id];
      return `<li class="lesson ${done ? 'ldone' : ''}">
        <button class="lesson-btn" data-open="${l.id}">
          <span class="li">${TIPE_ICON[l.tipe] || '•'}</span>
          <span class="ltext"><b>${esc(l.judul)}</b><span class="muted small"> · ${l.tipe} · ${l.menit} mnt</span></span>
          <span class="lstate">${done ? '✓' : ''}</span>
        </button></li>`;
    }).join('');
    const kuis = m.kuis ? (() => {
      const sk = S.kuis[m.kuis.id];
      return `<div class="kuis-row">
        <span>❓ <b>${esc(m.kuis.judul)}</b> · ${m.kuis.soal.length} soal</span>
        <span>${sk != null ? `<span class="pill ${sk >= 70 ? 'req' : 'err'}">Skor ${sk}%</span>` : ''}
        <button class="btn sm primary" data-quiz="${m.kuis.id}">${sk != null ? 'Ulangi' : 'Kerjakan'}</button></span>
      </div>`;
    })() : '';
    return `<div class="modul">
      <div class="modul-head"><b>${esc(m.judul)}</b></div>
      ${m.metode ? `<div class="muted small">🧪 Metode: ${esc(m.metode)}</div>` : ''}
      <div class="komp-tags">${komp}</div>
      <ul class="lesson-list">${lessons}</ul>
      ${kuis}
    </div>`;
  }

  function bindLessonButtons(scope) {
    scope.querySelectorAll('[data-open]').forEach((b) => b.onclick = () => openLesson(b.dataset.open));
  }
  function bindQuizButtons(scope) {
    scope.querySelectorAll('[data-quiz]').forEach((b) => b.onclick = () => openQuiz(b.dataset.quiz));
  }

  /* ── LESSON modal ─────────────────────────────────────────────────────── */
  function findLesson(id) {
    for (const st of STAGES) for (const m of modulesOf(st)) {
      const l = m.lessons.find((x) => x.id === id); if (l) return { st, m, l };
    } return null;
  }
  function openLesson(id) {
    const f = findLesson(id); if (!f) return;
    const { st, m, l } = f;
    const done = S.done[l.id];
    const isRefleksi = l.tipe === 'refleksi' || l.tipe === 'diskusi';
    const noteKey = 'note_' + l.id;
    modal(
      `<div class="muted small">Tahap ${st.no} · ${esc(m.judul)}</div>
       <h3 style="margin:.2rem 0 .4rem">${TIPE_ICON[l.tipe] || ''} ${esc(l.judul)}</h3>
       <div class="muted small">${l.tipe} · ${l.menit} menit</div>
       <div class="lesson-body">${esc(l.body)}</div>
       ${isRefleksi ? `<label class="full" style="margin-top:.6rem">Catatan reflektif Anda
         <textarea id="rfl" placeholder="Tuliskan refleksi…">${esc(S[noteKey] || '')}</textarea></label>` : ''}`,
      [
        { label: done ? '✓ Sudah selesai' : 'Tandai selesai', cls: 'primary', act: () => {
          if (isRefleksi) { const txt = document.querySelector('#rfl'); if (txt) S[noteKey] = txt.value; }
          S.done[l.id] = true; save(); closeModal(); render();
        } },
        ...(done ? [{ label: 'Batalkan selesai', cls: '', act: () => { delete S.done[l.id]; save(); closeModal(); render(); } }] : []),
        { label: 'Tutup', cls: '', act: closeModal },
      ]
    );
  }

  /* ── KUIS modal ───────────────────────────────────────────────────────── */
  function findQuiz(id) {
    for (const st of STAGES) for (const m of modulesOf(st)) if (m.kuis && m.kuis.id === id) return m.kuis;
    return null;
  }
  function openQuiz(id) {
    const q = findQuiz(id); if (!q) return;
    modal(
      `<h3 style="margin:.1rem 0 .6rem">❓ ${esc(q.judul)}</h3>
       <form id="qform">${q.soal.map((s, i) =>
        `<div class="qsoal"><div class="qtext">${i + 1}. ${esc(s.t)}</div>
          ${s.o.map((o, j) =>
            `<label class="qopt"><input type="radio" name="s${i}" value="${j}" /> ${esc(o)}</label>`).join('')}
        </div>`).join('')}</form>
       <div id="qres" class="ringkas"></div>`,
      [
        { label: 'Periksa jawaban', cls: 'primary', act: () => {
          let benar = 0;
          q.soal.forEach((s, i) => {
            const sel = document.querySelector(`input[name="s${i}"]:checked`);
            if (sel && Number(sel.value) === s.j) benar++;
          });
          const skor = Math.round((benar / q.soal.length) * 100);
          S.kuis[q.id] = skor; save();
          const res = document.querySelector('#qres');
          res.innerHTML = `<b>Skor: ${skor}%</b> (${benar}/${q.soal.length} benar). ` +
            (skor >= 70 ? '✅ Lulus ambang 70%.' : '⚠️ Di bawah 70% — tinjau materi & ulangi.');
          render();
        } },
        { label: 'Tutup', cls: '', act: closeModal },
      ]
    );
  }

  /* ── KOMPETENSI (self-assessment radar) ───────────────────────────────── */
  function viewKompetensi(v) {
    const t = TIERS[S.tier];
    v.innerHTML =
      `<section class="panel">
        <h3>🎯 Peta Kompetensi (Self-Assessment)</h3>
        <p class="small muted">Nilai diri 1–5 pada <b>Awal</b> masa jabatan (Tahap 1) dan
        <b>Akhir</b> masa jabatan (Tahap 7). Diagram menunjukkan baseline & pertumbuhan.</p>
        <div class="radar-wrap">${radarSVG(t.warna)}</div>
        <div class="legend"><span><i class="sw" style="background:#94a3b8"></i> Awal</span>
          <span><i class="sw" style="background:${t.warna}"></i> Akhir</span></div>
      </section>
      <section class="panel">
        <h4>Penilaian Mandiri</h4>
        <table class="doc-table komp-table">
          <thead><tr><th>Domain Kompetensi</th><th class="c">Awal</th><th class="c">Akhir</th><th class="c">Δ</th></tr></thead>
          <tbody>${KOMPETENSI.map((k) => {
            const c = S.komp[k.id] || {};
            const d = (c.akhir || 0) - (c.awal || 0);
            return `<tr>
              <td><b>${k.icon} ${esc(k.label)}</b><div class="muted small">${esc(k.desc)}</div></td>
              <td class="c">${scoreSel(k.id, 'awal', c.awal)}</td>
              <td class="c">${scoreSel(k.id, 'akhir', c.akhir)}</td>
              <td class="c"><b style="color:${d > 0 ? '#16a34a' : d < 0 ? '#dc2626' : '#64748b'}">${d > 0 ? '+' + d : d}</b></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      </section>`;
    v.querySelectorAll('select[data-komp]').forEach((sel) => sel.onchange = () => {
      const { komp, fase } = sel.dataset;
      S.komp[komp] = S.komp[komp] || {};
      S.komp[komp][fase] = Number(sel.value) || 0;
      save(); viewKompetensi(v);
    });
  }
  function scoreSel(id, fase, val) {
    return `<select data-komp="${id}" data-fase="${fase}">
      <option value="">–</option>${[1, 2, 3, 4, 5].map((n) =>
        `<option value="${n}" ${val === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  }
  function radarSVG(color) {
    const n = KOMPETENSI.length, cx = 160, cy = 150, R = 110;
    const pt = (i, r) => {
      const a = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    };
    let grid = '';
    for (let g = 1; g <= 5; g++) {
      const pts = KOMPETENSI.map((_, i) => pt(i, (R * g) / 5).map((x) => x.toFixed(1)).join(',')).join(' ');
      grid += `<polygon points="${pts}" fill="none" stroke="#e2e8f0" />`;
    }
    const axes = KOMPETENSI.map((k, i) => {
      const [x, y] = pt(i, R); const [lx, ly] = pt(i, R + 16);
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e2e8f0"/>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="rax" text-anchor="middle">${k.icon}</text>`;
    }).join('');
    const poly = (fase, col, op) => {
      const pts = KOMPETENSI.map((k, i) => {
        const val = (S.komp[k.id] && S.komp[k.id][fase]) || 0;
        return pt(i, (R * val) / 5).map((x) => x.toFixed(1)).join(',');
      }).join(' ');
      return `<polygon points="${pts}" fill="${col}" fill-opacity="${op}" stroke="${col}" stroke-width="2"/>`;
    };
    return `<svg viewBox="0 0 320 300" class="radar">${grid}${axes}
      ${poly('awal', '#94a3b8', 0.15)}${poly('akhir', color, 0.3)}</svg>`;
  }

  /* ── BANK KASUS (manajemen pengetahuan) ───────────────────────────────── */
  function allKasus() { return BANK_KASUS_SEED.concat(S.kasus); }
  function viewKasus(v) {
    const list = allKasus();
    v.innerHTML =
      `<section class="panel">
        <h3>🗂️ Bank Kasus Kepemiluan</h3>
        <p class="small muted">Memori institusional KPU: dokumentasi <b>praktik baik</b> &
        <b>kegagalan kebijakan</b> agar pengetahuan strategis tidak hilang saat pergantian
        komisioner (Tahap 6). Tambahkan kontribusi Anda.</p>
        <button class="btn primary" data-add>+ Tambah kasus / praktik baik</button>
      </section>
      <div class="kasus-grid">${list.map(kasusCard).join('')}</div>`;
    v.querySelector('[data-add]').onclick = openKasusForm;
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => {
      S.kasus = S.kasus.filter((k) => k.id !== b.dataset.del); save(); viewKasus(v);
    });
  }
  function kasusCard(k) {
    const t = TIERS[k.tier];
    const isMine = String(k.id).startsWith('bk-mine');
    const badge = k.jenis === 'praktik-baik'
      ? '<span class="pill req">Praktik baik</span>' : '<span class="pill err">Kegagalan</span>';
    const komp = (k.kompetensi || []).map((id) => {
      const kk = KOMPETENSI.find((x) => x.id === id); return kk ? kk.icon : '';
    }).join(' ');
    return `<div class="panel kasus">
      <div class="flexrow">${badge}<span class="pill opt" style="border:1px solid ${t ? t.warna : '#ccc'}">${t ? t.short : '—'}</span></div>
      <h4 style="margin:.4rem 0 .2rem">${esc(k.judul)}</h4>
      <p class="small">${esc(k.ringkas)}</p>
      <div class="callout small">💡 <b>Pelajaran:</b> ${esc(k.pelajaran)}</div>
      <div class="muted small" style="margin-top:.3rem">${komp}</div>
      ${isMine ? `<button class="btn sm del" data-del="${k.id}" style="margin-top:.5rem">Hapus</button>` : ''}
    </div>`;
  }
  function openKasusForm() {
    modal(
      `<h3 style="margin:.1rem 0 .6rem">+ Kontribusi Bank Kasus</h3>
       <label class="full">Judul kasus<input id="k-judul" placeholder="mis. Penanganan sengketa DPT…"/></label>
       <div class="grid2" style="margin:.5rem 0">
         <label>Jenis<select id="k-jenis"><option value="praktik-baik">Praktik baik</option><option value="kegagalan">Kegagalan kebijakan</option></select></label>
         <label>Jenjang<select id="k-tier">${Object.values(TIERS).map((t) =>
           `<option value="${t.id}" ${t.id === S.tier ? 'selected' : ''}>${t.short}</option>`).join('')}</select></label>
       </div>
       <label class="full">Ringkasan<textarea id="k-ringkas" placeholder="Konteks & yang terjadi…"></textarea></label>
       <label class="full" style="margin-top:.5rem">Pelajaran yang dapat diwariskan<textarea id="k-pel" placeholder="Apa pelajaran lintas periode?"></textarea></label>`,
      [
        { label: 'Simpan ke Bank Kasus', cls: 'primary', act: () => {
          const judul = document.querySelector('#k-judul').value.trim();
          if (!judul) { alert('Judul wajib diisi.'); return; }
          S.kasus.push({
            id: 'bk-mine-' + Date.now().toString(36),
            jenis: document.querySelector('#k-jenis').value,
            tier: document.querySelector('#k-tier').value,
            judul,
            ringkas: document.querySelector('#k-ringkas').value.trim() || '—',
            pelajaran: document.querySelector('#k-pel').value.trim() || '—',
            kompetensi: [],
          });
          save(); closeModal(); render();
        } },
        { label: 'Batal', cls: '', act: closeModal },
      ]
    );
  }

  /* ── FASILITATOR ──────────────────────────────────────────────────────── */
  function viewFasilitator(v) {
    const t = TIERS[S.tier];
    const relevan = FASILITATOR.filter((f) => f.tiers.includes(S.tier));
    const lain = FASILITATOR.filter((f) => !f.tiers.includes(S.tier));
    const card = (f, dim) =>
      `<div class="panel facil ${dim ? 'dim' : ''}">
        <div class="facil-head"><span class="facil-ic">${f.icon}</span>
          <div><b>${esc(f.label)}</b><div class="muted small">${esc(f.peran)}</div></div></div>
        <p class="small">${esc(f.desc)}</p>
        <div class="komp-tags">${f.tiers.map((id) =>
          `<span class="pill ${id === S.tier ? 'req' : 'opt'}">${TIERS[id].short}</span>`).join(' ')}</div>
      </div>`;
    v.innerHTML =
      `<section class="panel">
        <h3>🤝 Fasilitator: Mitra Intelektual & Reflektif</h3>
        <p class="small muted">Fasilitator diposisikan sebagai <b>critical partner / critical enabler</b> —
        bukan pelatih teknis, evaluator kinerja, atau instrumen kontrol kebijakan. Prinsip
        kesukarelaan & independensi dijaga ketat.</p>
      </section>
      <h4 class="sec">Paling relevan untuk ${esc(t.label)}</h4>
      <div class="facil-grid">${relevan.map((f) => card(f, false)).join('')}</div>
      ${lain.length ? `<h4 class="sec">Fasilitator lain dalam model</h4>
      <div class="facil-grid">${lain.map((f) => card(f, true)).join('')}</div>` : ''}`;
  }

  /* ── EVALUASI DAMPAK ──────────────────────────────────────────────────── */
  function viewDampak(v) {
    const t = TIERS[S.tier];
    v.innerHTML =
      `<section class="panel">
        <h3>📊 Evaluasi Berbasis Dampak</h3>
        <p class="small muted">Evaluasi bukan sekadar penyelesaian aktivitas, melainkan
        kontribusi nyata pada <b>kinerja kelembagaan KPU</b>. Nilai 1–5 untuk kondisi
        <b>Sebelum</b> dan <b>Sesudah</b> pengembangan kompetensi.</p>
        <table class="doc-table">
          <thead><tr><th>Indikator Dampak</th><th class="c">Sebelum</th><th class="c">Sesudah</th><th class="c">Δ</th></tr></thead>
          <tbody>${DAMPAK.map((d) => {
            const c = S.dampak[d.id] || {};
            const delta = (c.sesudah || 0) - (c.sebelum || 0);
            return `<tr>
              <td>${esc(d.label)}</td>
              <td class="c">${dmpSel(d.id, 'sebelum', c.sebelum)}</td>
              <td class="c">${dmpSel(d.id, 'sesudah', c.sesudah)}</td>
              <td class="c"><b style="color:${delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#64748b'}">${delta > 0 ? '+' + delta : delta}</b></td>
            </tr>`;
          }).join('')}</tbody>
        </table>
        ${(() => {
          const filled = DAMPAK.filter((d) => S.dampak[d.id] && S.dampak[d.id].sesudah);
          if (!filled.length) return '';
          const avg = filled.reduce((s, d) => s + ((S.dampak[d.id].sesudah || 0) - (S.dampak[d.id].sebelum || 0)), 0) / filled.length;
          return `<div class="callout">📈 Rata-rata kenaikan dampak: <b style="color:${t.warna}">${avg.toFixed(1)} poin</b>
            pada ${filled.length}/${DAMPAK.length} indikator.</div>`;
        })()}
      </section>`;
    v.querySelectorAll('select[data-dmp]').forEach((sel) => sel.onchange = () => {
      const { dmp, fase } = sel.dataset;
      S.dampak[dmp] = S.dampak[dmp] || {};
      S.dampak[dmp][fase] = Number(sel.value) || 0;
      save(); viewDampak(v);
    });
  }
  function dmpSel(id, fase, val) {
    return `<select data-dmp="${id}" data-fase="${fase}">
      <option value="">–</option>${[1, 2, 3, 4, 5].map((n) =>
        `<option value="${n}" ${val === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`;
  }

  /* ── SERTIFIKAT ───────────────────────────────────────────────────────── */
  function viewSertifikat(v) {
    const t = TIERS[S.tier];
    const ov = overall();
    const qz = quizzes();
    const qzPass = qz.filter((q) => (S.kuis[q.id] || 0) >= 70).length;
    const kompAkhir = KOMPETENSI.filter((k) => S.komp[k.id] && S.komp[k.id].akhir).length;
    const kontrib = S.kasus.length;
    const syarat = [
      { ok: ov.pct === 100, t: 'Menyelesaikan seluruh materi alur 7 tahap' },
      { ok: qzPass === qz.length && qz.length > 0, t: `Lulus seluruh kuis (≥70%) — ${qzPass}/${qz.length}` },
      { ok: kompAkhir === KOMPETENSI.length, t: 'Mengisi peta kompetensi akhir (8 domain)' },
      { ok: kontrib >= 1, t: 'Mengontribusikan ≥1 entri ke Bank Kasus' },
    ];
    const lulus = syarat.every((s) => s.ok);
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    v.innerHTML =
      `<section class="panel">
        <h3>🏅 Syarat Penyelesaian</h3>
        <ul class="checklist">${syarat.map((s) =>
          `<li class="${s.ok ? '' : 'fail'}">${s.ok ? '✅' : '⬜'} ${esc(s.t)}</li>`).join('')}</ul>
        ${lulus ? '<div class="callout">🎉 Selamat! Anda memenuhi syarat penyelesaian alur.</div>'
                : '<div class="callout">Lengkapi seluruh syarat untuk menerbitkan sertifikat penyelesaian.</div>'}
      </section>
      <section class="panel printpage">
        <div class="cert" style="--cc:${t.warna}">
          <div class="cert-top">🏛️ KOMISI PEMILIHAN UMUM</div>
          <div class="cert-sub">LMS Kepemiluan — Tiered Facilitation Model</div>
          <div class="cert-title">SERTIFIKAT PENYELESAIAN</div>
          <div class="cert-body">Diberikan kepada</div>
          <div class="cert-nama">${esc(S.nama || '____________________')}</div>
          <div class="cert-body">atas penyelesaian alur pengembangan kompetensi berjenjang sebagai</div>
          <div class="cert-tier">${esc(t.label)}</div>
          <div class="cert-stat">
            <span>Alur: <b>${ov.pct}%</b></span>
            <span>Kuis lulus: <b>${qzPass}/${qz.length}</b></span>
            <span>Kontribusi kasus: <b>${kontrib}</b></span>
          </div>
          <div class="cert-foot">
            <div>${esc(tgl)}</div>
            <div class="cert-seal">${lulus ? '✓ TERVERIFIKASI' : 'DRAF'}</div>
          </div>
          <div class="cert-note">Independen · Berjenjang · Berkelanjutan · Non-Hierarkis</div>
        </div>
      </section>
      <div class="rab-actions">
        <button class="btn" data-print ${lulus ? '' : 'disabled'}>🖨️ Cetak / Simpan PDF</button>
        <button class="btn del" data-reset>Reset seluruh progres</button>
      </div>`;
    const pr = v.querySelector('[data-print]'); if (pr) pr.onclick = () => window.print();
    v.querySelector('[data-reset]').onclick = () => {
      if (confirm('Hapus seluruh progres & data di perangkat ini? Tindakan ini tidak dapat dibatalkan.')) {
        localStorage.removeItem(STORE); S = fresh(); render();
      }
    };
  }

  /* ── Modal util ───────────────────────────────────────────────────────── */
  function modal(html, actions) {
    closeModal();
    const back = document.createElement('div');
    back.className = 'modal-back'; back.id = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <div class="modal-body">${html}</div>
      <div class="modal-actions"></div></div>`;
    const acts = back.querySelector('.modal-actions');
    (actions || []).forEach((a) => {
      const btn = document.createElement('button');
      btn.className = 'btn ' + (a.cls || ''); btn.textContent = a.label; btn.onclick = a.act;
      acts.appendChild(btn);
    });
    back.addEventListener('click', (e) => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
  }
  function closeModal() { const m = document.getElementById('modal-back'); if (m) m.remove(); }

  /* ── Boot ─────────────────────────────────────────────────────────────── */
  render();
})();
