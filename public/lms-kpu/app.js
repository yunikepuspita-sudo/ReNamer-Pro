/* ============================================================================
 * SiPINTER KPU · app.js — Election Knowledge & Competency Platform
 * Aplikasi satu halaman (vanilla JS, offline-first) yang menjalankan platform
 * pembelajaran berjenjang: 10 tier penyelenggara→publik, alur 7 tahap Tiered
 * Facilitation Model, peta kompetensi, Knowledge Hub, AI Assistant, Sertifikasi
 * & Talent (CPD/succession), Analytics, dan blueprint Arsitektur.
 * Persistensi: localStorage. AI: offline (Knowledge Base) + live (Claude) opsional.
 * ==========================================================================*/
(function () {
  'use strict';

  const LMS = window.LMS;
  const AI = window.LMSAI;
  const SYNC = window.LMSSync;
  const { PLATFORM, GROUPS, TIERS, KOMPETENSI, FASILITATOR, DAMPAK, STAGES,
    KN_CATS, KNOWLEDGE, INTEGRASI, ARCH_LAYERS, PWA_MODULES, TECH, MATURITY } = LMS;
  const app = document.getElementById('app');
  const subEl = document.getElementById('subtitle');
  const STORE = 'lms_kpu_v1';

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TIPE_ICON = { baca: '📖', video: '🎬', refleksi: '✍️', diskusi: '💬', 'studi-kasus': '🧩', kuis: '❓' };
  const color = () => LMS.tierColor(S.tier);

  /* ── State ───────────────────────────────────────────────────────────── */
  function fresh() {
    return { tier: null, nama: '', done: {}, kuis: {}, komp: {}, dampak: {}, kasus: [], chat: [], view: 'beranda' };
  }
  let S = load();
  function load() {
    try { const v = JSON.parse(localStorage.getItem(STORE)); return v && typeof v === 'object' ? Object.assign(fresh(), v) : fresh(); }
    catch { return fresh(); }
  }
  function save() { localStorage.setItem(STORE, JSON.stringify(S)); }

  /* ── Kurikulum helpers (terfilter per jenjang) ───────────────────────── */
  function activeStages() { const ids = LMS.tierStages(S.tier); return STAGES.filter((st) => ids.includes(st.id)); }
  function modulesOf(stage) { return stage.modul(S.tier); }
  function allLessons() {
    const out = [];
    activeStages().forEach((st) => modulesOf(st).forEach((m) => m.lessons.forEach((l) => out.push({ stage: st, modul: m, lesson: l }))));
    return out;
  }
  function stageProgress(stage) {
    const ls = []; modulesOf(stage).forEach((m) => m.lessons.forEach((l) => ls.push(l)));
    const done = ls.filter((l) => S.done[l.id]).length;
    return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 };
  }
  function overall() { const ls = allLessons(); const done = ls.filter((x) => S.done[x.lesson.id]).length; return { done, total: ls.length, pct: ls.length ? Math.round((done / ls.length) * 100) : 0 }; }
  function quizzes() { const out = []; activeStages().forEach((st) => modulesOf(st).forEach((m) => { if (m.kuis) out.push(m.kuis); })); return out; }
  function minutesDone() { return allLessons().filter((x) => S.done[x.lesson.id]).reduce((s, x) => s + (x.lesson.menit || 0), 0); }
  function cpdPoints() {
    const ld = allLessons().filter((x) => S.done[x.lesson.id]).length;
    const qp = quizzes().filter((q) => (S.kuis[q.id] || 0) >= 70).length;
    return ld * 2 + qp * 5 + S.kasus.length * 10;
  }
  function avgKompAkhir() {
    const vals = KOMPETENSI.map((k) => (S.komp[k.id] && S.komp[k.id].akhir) || 0).filter((n) => n > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  function talentScore() {
    const ov = overall();
    const comp = (avgKompAkhir() / 5) * 100;
    const cpd = Math.min(cpdPoints() / 120, 1) * 100;
    return Math.round(ov.pct * 0.5 + comp * 0.3 + cpd * 0.2);
  }
  function talentLabel(s) { return s >= 85 ? 'Sangat siap' : s >= 70 ? 'Siap' : s >= 40 ? 'Berkembang' : 'Perlu pengembangan'; }

  /* ── Navigasi ────────────────────────────────────────────────────────── */
  const TABS = [
    ['beranda', '🏠 Beranda'], ['alur', '🪜 Alur 7 Tahap'], ['kompetensi', '🎯 Kompetensi'],
    ['knowledge', '🗂️ Knowledge Hub'], ['ai', '🤖 AI Assistant'], ['talent', '🏅 Sertifikasi & Talent'],
    ['analytics', '📊 Analytics'], ['fasilitator', '🤝 Fasilitator'], ['arsitektur', '🏗️ Arsitektur'],
    ['sync', '📥 Sinkronisasi'],
  ];
  function go(view) { S.view = view; save(); render(); window.scrollTo(0, 0); }

  /* ── RENDER UTAMA ────────────────────────────────────────────────────── */
  function render() {
    if (!S.tier) return renderOnboarding();
    const t = TIERS[S.tier];
    subEl.textContent = `${PLATFORM.alias} · ${t.label}`;
    app.innerHTML =
      `<nav class="tabs">${TABS.map(([k, lbl]) => `<button class="${S.view === k ? 'on' : ''}" data-go="${k}">${lbl}</button>`).join('')}</nav><div id="view"></div>`;
    app.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
    const v = app.querySelector('#view');
    ({ beranda: viewBeranda, alur: viewAlur, kompetensi: viewKompetensi, knowledge: viewKnowledge,
       ai: viewAI, talent: viewTalent, analytics: viewAnalytics, fasilitator: viewFasilitator,
       arsitektur: viewArsitektur, sync: viewSync }[S.view] || viewBeranda)(v);
  }

  /* ── ONBOARDING (10 tier, dikelompokkan) ─────────────────────────────── */
  function renderOnboarding() {
    subEl.textContent = `${PLATFORM.panjang} · ${PLATFORM.tagline}`;
    const byGroup = {};
    Object.values(TIERS).forEach((t) => { (byGroup[t.group] = byGroup[t.group] || []).push(t); });
    app.innerHTML =
      `<section class="panel hero">
        <h2>Selamat datang di ${esc(PLATFORM.nama)}</h2>
        <p class="muted">${esc(PLATFORM.panjang)} — <b>${esc(PLATFORM.tagline)}</b> yang mengintegrasikan
        pembelajaran, sertifikasi, manajemen pengetahuan, dan succession planning secara
        <b>berjenjang</b>. Pilih jenjang Anda untuk mempersonalisasi alur (Tiered Facilitation Model).</p>
        <label class="full" style="margin:.6rem 0">Nama / panggilan (opsional)
          <input id="nm" placeholder="mis. Komisioner / Anggota PPS …" /></label>
        ${Object.keys(GROUPS).map((g) => `
          <h4 class="sec" style="color:${GROUPS[g].warna}">${GROUPS[g].label}</h4>
          <div class="tier-grid">${byGroup[g].map((t) => `
            <button class="tier-card" data-tier="${t.id}" style="--tc:${GROUPS[g].warna}">
              <div class="tier-badge">Tier ${t.no} · ${t.short}</div>
              <h3>${esc(t.label)}</h3>
              <div class="tier-fokus">${esc(t.fokus)}</div>
              <p class="small muted">${esc(t.ringkas)}</p>
            </button>`).join('')}</div>`).join('')}
        <p class="small muted c" style="margin-top:1rem">Berbasis Policy Brief “Tiered Facilitation Model”.
        Kerangka fitur LMS terinspirasi Frappe LMS. Prototipe edukatif.</p>
      </section>`;
    app.querySelectorAll('[data-tier]').forEach((b) => b.onclick = () => {
      S.tier = b.dataset.tier; S.nama = (app.querySelector('#nm').value || '').trim(); save(); go('beranda');
    });
  }

  /* ── BERANDA ─────────────────────────────────────────────────────────── */
  function viewBeranda(v) {
    const t = TIERS[S.tier], c = color(), ov = overall(), qz = quizzes();
    const qzDone = qz.filter((q) => S.kuis[q.id] != null).length;
    const next = allLessons().find((x) => !S.done[x.lesson.id]);
    v.innerHTML =
      `<section class="panel" style="border-left:5px solid ${c}">
        <div class="flexrow">
          <div><h3 style="margin:0">${S.nama ? esc(S.nama) + ' · ' : ''}${esc(t.label)}</h3>
            <div class="muted small">Tier ${t.no} · ${GROUPS[t.group].label} — ${esc(t.fokus)}</div></div>
          <button class="btn sm" data-act="ganti">Ganti jenjang</button></div>
      </section>
      <div class="cards4">
        <div class="stat"><div class="stat-n">${ov.pct}%</div><div class="stat-l">Alur selesai</div></div>
        <div class="stat"><div class="stat-n">${ov.done}/${ov.total}</div><div class="stat-l">Materi</div></div>
        <div class="stat"><div class="stat-n">${qzDone}/${qz.length}</div><div class="stat-l">Kuis</div></div>
        <div class="stat"><div class="stat-n">${cpdPoints()}</div><div class="stat-l">CPD Point</div></div>
      </div>
      <section class="panel">
        <h3>🪜 Progres Alur (${activeStages().length} tahap untuk jenjang ini)</h3>
        ${activeStages().map((st) => { const p = stageProgress(st); return `<div class="bar-row">
          <div class="bar-lbl">Tahap ${st.no}. ${esc(st.judul)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${p.pct}%;background:${c}"></div></div>
          <div class="bar-val">${p.pct}%</div></div>`; }).join('')}
        <button class="btn primary big" data-go2="alur">Buka Alur Pembelajaran →</button>
      </section>
      ${next ? `<section class="panel ai-copilot">
        <h4>▶️ Lanjutkan dari sini</h4>
        <div class="muted small">Tahap ${next.stage.no} · ${esc(next.modul.judul)}</div>
        <div style="margin:.3rem 0 .6rem"><b>${TIPE_ICON[next.lesson.tipe] || ''} ${esc(next.lesson.judul)}</b></div>
        <button class="btn primary" data-open="${next.lesson.id}">Mulai materi</button>
      </section>` : `<section class="panel ok-banner">🎉 Seluruh materi alur jenjang ini selesai. Lihat tab Sertifikasi & Talent.</section>`}
      <section class="panel">
        <h4>Modul Platform</h4>
        <div class="mod-mini">${PWA_MODULES.map((m) => `<span class="chip">${m.icon} ${esc(m.judul)}</span>`).join('')}</div>
        <p class="small muted" style="margin-top:.5rem">Prinsip: berjenjang · berkelanjutan · non-hierarkis ·
        kesukarelaan · terintegrasi manajemen pengetahuan. Lihat tab <b>Arsitektur</b> untuk blueprint penuh.</p>
      </section>`;
    v.querySelector('[data-act="ganti"]').onclick = () => { if (confirm('Ganti jenjang menyesuaikan alur & modul. Lanjutkan?')) { S.tier = null; save(); render(); } };
    v.querySelectorAll('[data-go2]').forEach((b) => b.onclick = () => go(b.dataset.go2));
    v.querySelectorAll('[data-open]').forEach((b) => b.onclick = () => openLesson(b.dataset.open));
  }

  /* ── ALUR 7 TAHAP ────────────────────────────────────────────────────── */
  function viewAlur(v) {
    const c = color(), stages = activeStages();
    v.innerHTML =
      `<div class="stepbar">${stages.map((st) => { const p = stageProgress(st); const cls = p.pct === 100 ? 'done' : p.done > 0 ? 'on' : ''; return `<div class="step ${cls}" data-jump="st-${st.id}"><span>${st.no}</span>${esc(st.judul)}</div>`; }).join('')}</div>` +
      stages.map((st) => { const p = stageProgress(st), mods = modulesOf(st); return `<section class="panel stage" id="st-${st.id}" style="border-left:5px solid ${c}">
        <div class="stage-head"><div class="stage-no" style="background:${c}">${st.no}</div>
          <div style="flex:1"><h3 style="margin:.1rem 0">${esc(st.judul)}</h3>
            <div class="muted small">⏱ ${esc(st.kapan)} · ${p.done}/${p.total} materi · ${p.pct}%</div></div></div>
        <p class="small">${esc(st.tujuan)}</p>
        ${st.id === 'strategis' ? `<div class="callout">🎯 Modul ini dipersonalisasi untuk <b>${esc(TIERS[S.tier].label)}</b>.</div>` : ''}
        ${mods.map((m) => modulCard(m)).join('')}</section>`; }).join('');
    v.querySelectorAll('[data-jump]').forEach((b) => b.onclick = () => { const el = document.getElementById(b.dataset.jump); if (el) el.scrollIntoView({ behavior: 'smooth' }); });
    bindLessonButtons(v); bindQuizButtons(v);
  }
  function modulCard(m) {
    const komp = (m.kompetensi || []).map((id) => { const k = KOMPETENSI.find((x) => x.id === id); return k ? `<span class="pill opt">${k.icon} ${esc(k.label)}</span>` : ''; }).join(' ');
    const lessons = m.lessons.map((l) => { const done = S.done[l.id]; return `<li class="lesson ${done ? 'ldone' : ''}"><button class="lesson-btn" data-open="${l.id}">
      <span class="li">${TIPE_ICON[l.tipe] || '•'}</span><span class="ltext"><b>${esc(l.judul)}</b><span class="muted small"> · ${l.tipe} · ${l.menit} mnt</span></span>
      <span class="lstate">${done ? '✓' : ''}</span></button></li>`; }).join('');
    const kuis = m.kuis ? (() => { const sk = S.kuis[m.kuis.id]; return `<div class="kuis-row">
      <span>❓ <b>${esc(m.kuis.judul)}</b> · ${m.kuis.soal.length} soal</span>
      <span>${sk != null ? `<span class="pill ${sk >= 70 ? 'req' : 'err'}">Skor ${sk}%</span>` : ''}
      <button class="btn sm primary" data-quiz="${m.kuis.id}">${sk != null ? 'Ulangi' : 'Kerjakan'}</button></span></div>`; })() : '';
    return `<div class="modul"><div class="modul-head"><b>${esc(m.judul)}</b></div>
      ${m.metode ? `<div class="muted small">🧪 Metode: ${esc(m.metode)}</div>` : ''}
      <div class="komp-tags">${komp}</div><ul class="lesson-list">${lessons}</ul>${kuis}</div>`;
  }
  function bindLessonButtons(scope) { scope.querySelectorAll('[data-open]').forEach((b) => b.onclick = () => openLesson(b.dataset.open)); }
  function bindQuizButtons(scope) { scope.querySelectorAll('[data-quiz]').forEach((b) => b.onclick = () => openQuiz(b.dataset.quiz)); }

  function findLesson(id) { for (const st of activeStages()) for (const m of modulesOf(st)) { const l = m.lessons.find((x) => x.id === id); if (l) return { st, m, l }; } return null; }
  function openLesson(id) {
    const f = findLesson(id); if (!f) return; const { st, m, l } = f;
    const done = S.done[l.id], isRefleksi = l.tipe === 'refleksi' || l.tipe === 'diskusi', noteKey = 'note_' + l.id;
    modal(
      `<div class="muted small">Tahap ${st.no} · ${esc(m.judul)}</div>
       <h3 style="margin:.2rem 0 .4rem">${TIPE_ICON[l.tipe] || ''} ${esc(l.judul)}</h3>
       <div class="muted small">${l.tipe} · ${l.menit} menit</div>
       <div class="lesson-body">${esc(l.body)}</div>
       ${isRefleksi ? `<label class="full" style="margin-top:.6rem">Catatan reflektif Anda<textarea id="rfl" placeholder="Tuliskan refleksi…">${esc(S[noteKey] || '')}</textarea></label>` : ''}`,
      [
        { label: done ? '✓ Sudah selesai' : 'Tandai selesai', cls: 'primary', act: () => { if (isRefleksi) { const txt = document.querySelector('#rfl'); if (txt) S[noteKey] = txt.value; } S.done[l.id] = true; save(); closeModal(); render(); } },
        ...(done ? [{ label: 'Batalkan selesai', cls: '', act: () => { delete S.done[l.id]; save(); closeModal(); render(); } }] : []),
        { label: 'Tutup', cls: '', act: closeModal },
      ]);
  }
  function findQuiz(id) { for (const st of activeStages()) for (const m of modulesOf(st)) if (m.kuis && m.kuis.id === id) return m.kuis; return null; }
  function openQuiz(id) {
    const q = findQuiz(id); if (!q) return;
    modal(
      `<h3 style="margin:.1rem 0 .6rem">❓ ${esc(q.judul)}</h3>
       <form id="qform">${q.soal.map((s, i) => `<div class="qsoal"><div class="qtext">${i + 1}. ${esc(s.t)}</div>
         ${s.o.map((o, j) => `<label class="qopt"><input type="radio" name="s${i}" value="${j}" /> ${esc(o)}</label>`).join('')}</div>`).join('')}</form>
       <div id="qres" class="ringkas"></div>`,
      [
        { label: 'Periksa jawaban', cls: 'primary', act: () => {
          let benar = 0; q.soal.forEach((s, i) => { const sel = document.querySelector(`input[name="s${i}"]:checked`); if (sel && Number(sel.value) === s.j) benar++; });
          const skor = Math.round((benar / q.soal.length) * 100); S.kuis[q.id] = skor; save();
          document.querySelector('#qres').innerHTML = `<b>Skor: ${skor}%</b> (${benar}/${q.soal.length} benar). ` + (skor >= 70 ? '✅ Lulus ambang 70%.' : '⚠️ Di bawah 70% — tinjau materi & ulangi.');
          render();
        } },
        { label: 'Tutup', cls: '', act: closeModal },
      ]);
  }

  /* ── KOMPETENSI (radar) ──────────────────────────────────────────────── */
  function viewKompetensi(v) {
    const c = color();
    v.innerHTML =
      `<section class="panel"><h3>🎯 Peta Kompetensi (Self-Assessment)</h3>
        <p class="small muted">Nilai diri 1–5 pada <b>Awal</b> (Tahap 1) dan <b>Akhir</b> (Tahap 7) masa tugas.</p>
        <div class="radar-wrap">${radarSVG(c)}</div>
        <div class="legend"><span><i class="sw" style="background:#94a3b8"></i> Awal</span><span><i class="sw" style="background:${c}"></i> Akhir</span></div></section>
      <section class="panel"><h4>Penilaian Mandiri</h4>
        <table class="doc-table komp-table"><thead><tr><th>Domain Kompetensi</th><th class="c">Awal</th><th class="c">Akhir</th><th class="c">Δ</th></tr></thead>
        <tbody>${KOMPETENSI.map((k) => { const cc = S.komp[k.id] || {}, d = (cc.akhir || 0) - (cc.awal || 0); return `<tr>
          <td><b>${k.icon} ${esc(k.label)}</b><div class="muted small">${esc(k.desc)}</div></td>
          <td class="c">${scoreSel(k.id, 'awal', cc.awal)}</td><td class="c">${scoreSel(k.id, 'akhir', cc.akhir)}</td>
          <td class="c"><b style="color:${d > 0 ? '#16a34a' : d < 0 ? '#dc2626' : '#64748b'}">${d > 0 ? '+' + d : d}</b></td></tr>`; }).join('')}</tbody></table></section>`;
    v.querySelectorAll('select[data-komp]').forEach((sel) => sel.onchange = () => { const { komp, fase } = sel.dataset; S.komp[komp] = S.komp[komp] || {}; S.komp[komp][fase] = Number(sel.value) || 0; save(); viewKompetensi(v); });
  }
  function scoreSel(id, fase, val) { return `<select data-komp="${id}" data-fase="${fase}"><option value="">–</option>${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${val === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`; }
  function radarSVG(col) {
    const n = KOMPETENSI.length, cx = 160, cy = 150, R = 110;
    const pt = (i, r) => { const a = (Math.PI * 2 * i) / n - Math.PI / 2; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
    let grid = ''; for (let g = 1; g <= 5; g++) { const pts = KOMPETENSI.map((_, i) => pt(i, (R * g) / 5).map((x) => x.toFixed(1)).join(',')).join(' '); grid += `<polygon points="${pts}" fill="none" stroke="#e2e8f0" />`; }
    const axes = KOMPETENSI.map((k, i) => { const [x, y] = pt(i, R), [lx, ly] = pt(i, R + 16); return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="#e2e8f0"/><text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" class="rax" text-anchor="middle">${k.icon}</text>`; }).join('');
    const poly = (fase, cc, op) => { const pts = KOMPETENSI.map((k, i) => { const val = (S.komp[k.id] && S.komp[k.id][fase]) || 0; return pt(i, (R * val) / 5).map((x) => x.toFixed(1)).join(','); }).join(' '); return `<polygon points="${pts}" fill="${cc}" fill-opacity="${op}" stroke="${cc}" stroke-width="2"/>`; };
    return `<svg viewBox="0 0 320 300" class="radar">${grid}${axes}${poly('awal', '#94a3b8', 0.15)}${poly('akhir', col, 0.3)}</svg>`;
  }

  /* ── KNOWLEDGE HUB ───────────────────────────────────────────────────── */
  let knQuery = '', knCat = 'all';
  function allKnowledge() { return KNOWLEDGE.concat(S.kasus); }
  function viewKnowledge(v) {
    const list = allKnowledge().filter((e) => (knCat === 'all' || e.cat === knCat) && matchQ(e, knQuery));
    v.innerHTML =
      `<section class="panel"><h3>🗂️ Knowledge Management System</h3>
        <p class="small muted">Memori institusional KPU: bank kasus sengketa, putusan DKPP/MK, PKPU/JDIH,
        best practice, lesson learned, digital library, & FAQ — agar pengetahuan strategis tak hilang lintas periode.</p>
        <div class="kn-search"><input id="knq" placeholder="🔎 Cari (AI semantic): mis. sengketa, coklit, kode etik…" value="${esc(knQuery)}"/>
          <button class="btn primary" data-add>+ Kontribusi</button></div>
        <div class="kn-cats"><button class="chip ${knCat === 'all' ? 'on' : ''}" data-cat="all">Semua</button>
          ${KN_CATS.map((cat) => `<button class="chip ${knCat === cat.id ? 'on' : ''}" data-cat="${cat.id}">${cat.icon} ${esc(cat.label)}</button>`).join('')}</div>
      </section>
      ${list.length ? `<div class="kn-grid">${list.map(knCard).join('')}</div>` : '<section class="panel empty">Tidak ada entri untuk filter ini.</section>'}`;
    const inp = v.querySelector('#knq');
    inp.oninput = () => { knQuery = inp.value; const pos = inp.selectionStart; viewKnowledge(v); const ni = v.querySelector('#knq'); ni.focus(); try { ni.setSelectionRange(pos, pos); } catch {} };
    v.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => { knCat = b.dataset.cat; viewKnowledge(v); });
    v.querySelector('[data-add]').onclick = openKasusForm;
    v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { S.kasus = S.kasus.filter((k) => k.id !== b.dataset.del); save(); viewKnowledge(v); });
  }
  function matchQ(e, q) { if (!q.trim()) return true; const hay = (e.judul + ' ' + e.isi + ' ' + (e.tags || []).join(' ') + ' ' + (e.pelajaran || '')).toLowerCase(); return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w)); }
  function knCard(e) {
    const cat = KN_CATS.find((c) => c.id === e.cat) || { icon: '📄', label: e.cat };
    const t = TIERS[e.tier]; const isMine = String(e.id).startsWith('bk-mine');
    return `<div class="panel kn"><div class="flexrow"><span class="pill opt">${cat.icon} ${esc(cat.label)}</span>${t ? `<span class="pill opt">${esc(t.short)}</span>` : ''}</div>
      <h4 style="margin:.4rem 0 .2rem">${esc(e.judul)}</h4><p class="small">${esc(e.isi)}</p>
      ${e.pelajaran ? `<div class="callout small">💡 <b>Pelajaran:</b> ${esc(e.pelajaran)}</div>` : ''}
      <div class="muted small" style="margin-top:.3rem">${(e.tags || []).map((x) => '#' + esc(x)).join(' ')}</div>
      ${isMine ? `<button class="btn sm del" data-del="${e.id}" style="margin-top:.5rem">Hapus</button>` : ''}</div>`;
  }
  function openKasusForm() {
    modal(
      `<h3 style="margin:.1rem 0 .6rem">+ Kontribusi Knowledge Base</h3>
       <label class="full">Judul<input id="k-judul" placeholder="mis. Penanganan sengketa DPT…"/></label>
       <div class="grid2" style="margin:.5rem 0">
         <label>Kategori<select id="k-cat">${KN_CATS.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}</select></label>
         <label>Jenjang relevan<select id="k-tier">${Object.values(TIERS).map((t) => `<option value="${t.id}" ${t.id === S.tier ? 'selected' : ''}>${t.short}</option>`).join('')}</select></label></div>
       <label class="full">Ringkasan / isi<textarea id="k-isi" placeholder="Konteks & yang terjadi…"></textarea></label>
       <label class="full" style="margin-top:.5rem">Pelajaran yang dapat diwariskan<textarea id="k-pel" placeholder="Apa pelajaran lintas periode?"></textarea></label>
       <label class="full" style="margin-top:.5rem">Tag (pisahkan koma)<input id="k-tag" placeholder="mis. sengketa, dpt"/></label>`,
      [
        { label: 'Simpan', cls: 'primary', act: () => {
          const judul = document.querySelector('#k-judul').value.trim(); if (!judul) { alert('Judul wajib diisi.'); return; }
          S.kasus.push({ id: 'bk-mine-' + Date.now().toString(36), cat: document.querySelector('#k-cat').value, tier: document.querySelector('#k-tier').value,
            judul, isi: document.querySelector('#k-isi').value.trim() || '—', pelajaran: document.querySelector('#k-pel').value.trim() || '—',
            tags: document.querySelector('#k-tag').value.split(',').map((s) => s.trim()).filter(Boolean) });
          save(); closeModal(); render();
        } },
        { label: 'Batal', cls: '', act: closeModal },
      ]);
  }

  /* ── AI ASSISTANT ────────────────────────────────────────────────────── */
  function viewAI(v) {
    const live = AI.isLive();
    v.innerHTML =
      `<section class="panel"><div class="flexrow"><h3 style="margin:0">🤖 AI Learning Assistant</h3>
        <span class="pill ${live ? 'req' : 'opt'}">${live ? '● Live (Claude)' : '○ Offline (Knowledge Base)'}</span></div>
        <p class="small muted">Tanya regulasi, tahapan, atau sengketa. Jawaban di-grounding pada Knowledge Base
        (RAG ringan). Tanpa konfigurasi, asisten tetap menjawab dari basis pengetahuan lokal (offline).</p>
        <div class="ai-quick">${['Apa itu Coklit?', 'Bedanya tugas PPK, PPS, KPPS?', 'Mengapa sengketa Pilkada 2024 melonjak?', 'Bagaimana menjaga independensi penyelenggara?'].map((q) => `<button class="chip" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div>
        <div class="ai-row"><input id="aiq" placeholder="Ketik pertanyaan kepemiluan…" /><button class="btn primary" id="aisend">Tanya</button></div>
        <details style="margin-top:.6rem"><summary>⚙️ Pengaturan Mode AI Live (opsional)</summary>${aiSettingsHTML()}</details>
      </section>
      <div id="chatlog">${S.chat.map(chatBubble).join('') || '<section class="panel empty">Belum ada percakapan. Mulai dengan pertanyaan di atas.</section>'}</div>`;
    const inp = v.querySelector('#aiq');
    const sendNow = () => { const q = inp.value.trim(); if (q) ask(q, v); };
    v.querySelector('#aisend').onclick = sendNow;
    inp.onkeydown = (e) => { if (e.key === 'Enter') sendNow(); };
    v.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => ask(b.dataset.q, v));
    bindAiSettings(v);
  }
  function chatBubble(m) {
    return `<section class="panel chat"><div class="chat-q">🙋 ${esc(m.q)}</div>
      <div class="chat-a"><div class="chat-meta">${m.mode === 'live' ? '🤖 Claude (live)' : '📚 Knowledge Base (offline)'}</div>
      <div class="chat-text">${esc(m.a).replace(/\n/g, '<br>')}</div>
      ${(m.sumber && m.sumber.length) ? `<div class="chat-src">Sumber: ${m.sumber.map((s) => esc(s.judul)).join(' · ')}</div>` : ''}</div></section>`;
  }
  async function ask(q, v) {
    S.chat.unshift({ q, a: '⏳ memproses…', mode: AI.isLive() ? 'live' : 'offline', sumber: [] }); save(); viewAI(v);
    try {
      const r = await AI.ask(q, { tierLabel: TIERS[S.tier].label });
      S.chat[0] = { q, a: r.text, mode: r.mode, sumber: r.sumber || [] };
    } catch (e) {
      const fb = AI.offlineAnswer(q);
      S.chat[0] = { q, a: '⚠️ AI Live gagal (' + (e.message || e) + ').\n\nJawaban offline:\n' + fb.text, mode: 'offline', sumber: fb.sumber };
    }
    save(); viewAI(v);
  }
  function aiSettingsHTML() {
    const c = AI.getConfig();
    return `<div class="cfg">
      <label>Mode<select id="ai-prov">
        <option value="off" ${c.provider === 'off' ? 'selected' : ''}>Offline (Knowledge Base)</option>
        <option value="edge" ${c.provider === 'edge' ? 'selected' : ''}>Live — Supabase Edge (aman)</option>
        <option value="direct" ${c.provider === 'direct' ? 'selected' : ''}>Live — Anthropic langsung (uji coba)</option></select></label>
      <label>Edge Function URL (lms-ai)<input id="ai-edge" placeholder="https://xxxx.supabase.co/functions/v1/lms-ai" value="${esc(c.edgeUrl || '')}"/></label>
      <label>Supabase anon key<input id="ai-anon" placeholder="(opsional)" value="${esc(c.edgeAnon || '')}"/></label>
      <label>Anthropic API key (mode direct)<input id="ai-key" type="password" placeholder="sk-ant-…" value="${esc(c.apiKey || '')}"/></label>
      <button class="btn primary sm" id="ai-save">Simpan</button>
      <p class="small muted">Mode direct menaruh kunci di perangkat ini saja — gunakan hanya untuk uji coba. Untuk produksi pakai Edge Function (kunci di server).</p></div>`;
  }
  function bindAiSettings(v) {
    const btn = v.querySelector('#ai-save'); if (!btn) return;
    btn.onclick = () => { AI.setConfig({ provider: v.querySelector('#ai-prov').value, edgeUrl: v.querySelector('#ai-edge').value.trim(), edgeAnon: v.querySelector('#ai-anon').value.trim(), apiKey: v.querySelector('#ai-key').value.trim(), model: AI.DEFAULT_MODEL }); viewAI(v); };
  }

  /* ── SERTIFIKASI & TALENT ────────────────────────────────────────────── */
  function viewTalent(v) {
    const t = TIERS[S.tier], c = color(), ov = overall(), qz = quizzes();
    const qzPass = qz.filter((q) => (S.kuis[q.id] || 0) >= 70).length;
    const kompAkhir = KOMPETENSI.filter((k) => S.komp[k.id] && S.komp[k.id].akhir).length;
    const score = talentScore();
    const syarat = [
      { ok: ov.pct === 100, t: 'Menyelesaikan seluruh materi alur jenjang' },
      { ok: qz.length > 0 && qzPass === qz.length, t: `Lulus seluruh kuis (≥70%) — ${qzPass}/${qz.length}` },
      { ok: kompAkhir === KOMPETENSI.length, t: 'Mengisi peta kompetensi akhir (8 domain)' },
      { ok: S.kasus.length >= 1, t: 'Mengontribusikan ≥1 entri Knowledge Hub' },
    ];
    const lulus = syarat.every((s) => s.ok);
    const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const certId = 'SP-' + (S.tier.toUpperCase()) + '-' + (S.nama || 'ANON').replace(/\s+/g, '').slice(0, 6).toUpperCase();
    // Badges
    const badges = [];
    activeStages().forEach((st) => { if (stageProgress(st).pct === 100) badges.push({ ic: '🎖️', t: 'Tahap ' + st.no }); });
    KOMPETENSI.forEach((k) => { if (S.komp[k.id] && S.komp[k.id].akhir >= 4) badges.push({ ic: k.icon, t: k.label }); });
    if (lulus) badges.push({ ic: '🏅', t: 'Tersertifikasi' });
    // Pipeline (succession)
    const ladder = Object.values(TIERS).filter((x) => x.group === t.group).sort((a, b) => a.no - b.no);
    v.innerHTML =
      `<section class="panel"><h3>🏅 Certification & Talent System</h3>
        <div class="cards4"><div class="stat"><div class="stat-n">${cpdPoints()}</div><div class="stat-l">CPD Point</div></div>
          <div class="stat"><div class="stat-n">${badges.length}</div><div class="stat-l">Badge</div></div>
          <div class="stat"><div class="stat-n">${score}</div><div class="stat-l">Skor Talenta</div></div>
          <div class="stat"><div class="stat-n">${esc(talentLabel(score))}</div><div class="stat-l">Kesiapan</div></div></div></section>

      <section class="panel"><h4>Syarat Sertifikasi</h4>
        <ul class="checklist">${syarat.map((s) => `<li class="${s.ok ? '' : 'fail'}">${s.ok ? '✅' : '⬜'} ${esc(s.t)}</li>`).join('')}</ul>
        ${lulus ? '<div class="callout">🎉 Memenuhi syarat sertifikasi kompetensi.</div>' : '<div class="callout">Lengkapi syarat untuk menerbitkan sertifikat & Open Badge.</div>'}</section>

      <section class="panel"><h4>🎖️ Digital Badges</h4>
        <div class="badges">${badges.length ? badges.map((b) => `<span class="badge">${b.ic}<small>${esc(b.t)}</small></span>`).join('') : '<span class="muted small">Belum ada badge — selesaikan tahap & kuasai kompetensi.</span>'}</div></section>

      <section class="panel"><h4>🚀 Talent Pool & Succession Planning</h4>
        <p class="small muted">Kesiapan menapaki jenjang berikutnya dalam pipeline kepemimpinan (${esc(GROUPS[t.group].label)}).</p>
        <div class="gauge"><div class="gauge-bar"><div class="gauge-fill" style="width:${score}%;background:${c}"></div></div><div class="gauge-val">${score}/100 · ${esc(talentLabel(score))}</div></div>
        <div class="pipeline">${ladder.map((x) => `<div class="pl-node ${x.id === t.id ? 'cur' : ''}" style="${x.id === t.id ? 'border-color:' + c : ''}"><div class="pl-no">T${x.no}</div><div class="pl-lbl">${esc(x.short)}</div>${x.id === t.id ? '<div class="pl-you">Anda di sini</div>' : ''}</div>`).join('<div class="pl-arrow">→</div>')}</div></section>

      <section class="panel printpage"><div class="cert" style="--cc:${c}">
        <div class="cert-top">🏛️ KOMISI PEMILIHAN UMUM</div>
        <div class="cert-sub">${esc(PLATFORM.nama)} — ${esc(PLATFORM.alias)}</div>
        <div class="cert-title">SERTIFIKAT KOMPETENSI</div>
        <div class="cert-body">Diberikan kepada</div>
        <div class="cert-nama">${esc(S.nama || '____________________')}</div>
        <div class="cert-body">atas penyelesaian alur pengembangan kompetensi berjenjang sebagai</div>
        <div class="cert-tier">${esc(t.label)} · Tier ${t.no}</div>
        <div class="cert-stat"><span>Alur: <b>${ov.pct}%</b></span><span>CPD: <b>${cpdPoints()}</b></span><span>Skor: <b>${score}</b></span></div>
        <div class="cert-foot"><div>${esc(tgl)}<div class="small muted">No. ${esc(certId)}</div></div><div class="cert-seal">${lulus ? '✓ TERVERIFIKASI' : 'DRAF'}</div></div>
        <div class="cert-note">Independen · Berjenjang · Berkelanjutan · Non-Hierarkis · QR validation (roadmap)</div></div></section>
      <div class="rab-actions"><button class="btn" data-print ${lulus ? '' : 'disabled'}>🖨️ Cetak / Simpan PDF</button>
        <button class="btn del" data-reset>Reset seluruh progres</button></div>`;
    const pr = v.querySelector('[data-print]'); if (pr) pr.onclick = () => window.print();
    v.querySelector('[data-reset]').onclick = () => { if (confirm('Hapus seluruh progres & data di perangkat ini?')) { localStorage.removeItem(STORE); S = fresh(); render(); } };
  }

  /* ── ANALYTICS CENTER ────────────────────────────────────────────────── */
  function viewAnalytics(v) {
    const c = color(), ov = overall(), qz = quizzes();
    const qzPass = qz.filter((q) => (S.kuis[q.id] || 0) >= 70).length;
    const heat = (val) => { const colors = ['#f1f5f9', '#fee2e2', '#fef3c7', '#dbeafe', '#bbf7d0', '#22c55e']; return colors[val] || colors[0]; };
    const dampakFilled = DAMPAK.filter((d) => S.dampak[d.id] && S.dampak[d.id].sesudah);
    const dampakAvg = dampakFilled.length ? (dampakFilled.reduce((s, d) => s + ((S.dampak[d.id].sesudah || 0) - (S.dampak[d.id].sebelum || 0)), 0) / dampakFilled.length) : 0;
    const score = talentScore();
    v.innerHTML =
      `<section class="panel"><h3>📊 Learning Dashboard</h3>
        <div class="cards4"><div class="stat"><div class="stat-n">${ov.pct}%</div><div class="stat-l">Penyelesaian</div></div>
          <div class="stat"><div class="stat-n">${ov.done}</div><div class="stat-l">Materi selesai</div></div>
          <div class="stat"><div class="stat-n">${minutesDone()}<small> mnt</small></div><div class="stat-l">Waktu belajar</div></div>
          <div class="stat"><div class="stat-n">${qzPass}/${qz.length}</div><div class="stat-l">Kuis lulus</div></div></div></section>

      <section class="panel"><h4>Kinerja per Tahap</h4>
        ${activeStages().map((st) => { const p = stageProgress(st); return `<div class="bar-row"><div class="bar-lbl">T${st.no} ${esc(st.judul)}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${p.pct}%;background:${c}"></div></div><div class="bar-val">${p.pct}%</div></div>`; }).join('')}</section>

      <section class="panel"><h4>🌡️ Heatmap Kompetensi (akhir)</h4>
        <div class="heat">${KOMPETENSI.map((k) => { const val = (S.komp[k.id] && S.komp[k.id].akhir) || 0; return `<div class="heat-cell" style="background:${heat(val)}" title="${esc(k.label)}: ${val}/5"><span>${k.icon}</span><b>${val || '–'}</b></div>`; }).join('')}</div>
        <p class="small muted">Skala 0–5. Sel pucat = perlu penguatan; hijau = kuat.</p></section>

      <section class="panel"><h4>📈 Evaluasi Berbasis Dampak</h4>
        <p class="small muted">Kontribusi pembelajaran pada <b>kinerja kelembagaan</b> (bukan sekadar aktivitas). Nilai 1–5 Sebelum/Sesudah.</p>
        <table class="doc-table"><thead><tr><th>Indikator Dampak</th><th class="c">Sebelum</th><th class="c">Sesudah</th><th class="c">Δ</th></tr></thead>
        <tbody>${DAMPAK.map((d) => { const cc = S.dampak[d.id] || {}, delta = (cc.sesudah || 0) - (cc.sebelum || 0); return `<tr><td>${esc(d.label)}</td>
          <td class="c">${dmpSel(d.id, 'sebelum', cc.sebelum)}</td><td class="c">${dmpSel(d.id, 'sesudah', cc.sesudah)}</td>
          <td class="c"><b style="color:${delta > 0 ? '#16a34a' : delta < 0 ? '#dc2626' : '#64748b'}">${delta > 0 ? '+' + delta : delta}</b></td></tr>`; }).join('')}</tbody></table>
        ${dampakFilled.length ? `<div class="callout">Rata-rata kenaikan dampak: <b style="color:${c}">${dampakAvg.toFixed(1)} poin</b> pada ${dampakFilled.length}/${DAMPAK.length} indikator.</div>` : ''}</section>

      <section class="panel"><h4>🔮 Predictive Talent Analytics</h4>
        <div class="gauge"><div class="gauge-bar"><div class="gauge-fill" style="width:${score}%;background:${c}"></div></div><div class="gauge-val">Skor talenta ${score}/100 · ${esc(talentLabel(score))}</div></div>
        <p class="small muted">Proyeksi indikatif dari penyelesaian alur (50%), rata-rata kompetensi akhir (30%), dan CPD (20%).
        ${score >= 70 ? 'Kandidat potensial untuk talent pool jenjang berikutnya.' : 'Fokuskan penguatan pada domain kompetensi berskor rendah (lihat heatmap).'}</p></section>`;
    v.querySelectorAll('select[data-dmp]').forEach((sel) => sel.onchange = () => { const { dmp, fase } = sel.dataset; S.dampak[dmp] = S.dampak[dmp] || {}; S.dampak[dmp][fase] = Number(sel.value) || 0; save(); viewAnalytics(v); });
  }
  function dmpSel(id, fase, val) { return `<select data-dmp="${id}" data-fase="${fase}"><option value="">–</option>${[1, 2, 3, 4, 5].map((n) => `<option value="${n}" ${val === n ? 'selected' : ''}>${n}</option>`).join('')}</select>`; }

  /* ── FASILITATOR ─────────────────────────────────────────────────────── */
  function viewFasilitator(v) {
    const t = TIERS[S.tier], grp = t.group;
    const relevan = FASILITATOR.filter((f) => f.groups.includes(grp));
    const lain = FASILITATOR.filter((f) => !f.groups.includes(grp));
    const card = (f, dim) => `<div class="panel facil ${dim ? 'dim' : ''}"><div class="facil-head"><span class="facil-ic">${f.icon}</span>
      <div><b>${esc(f.label)}</b><div class="muted small">${esc(f.peran)}</div></div></div><p class="small">${esc(f.desc)}</p>
      <div class="komp-tags">${f.groups.map((g) => `<span class="pill ${g === grp ? 'req' : 'opt'}">${esc(GROUPS[g].label)}</span>`).join(' ')}</div></div>`;
    v.innerHTML =
      `<section class="panel"><h3>🤝 Fasilitator: Mitra Intelektual & Reflektif</h3>
        <p class="small muted">Diposisikan sebagai <b>critical partner / critical enabler</b> — bukan pelatih teknis,
        evaluator kinerja, atau instrumen kontrol kebijakan. Prinsip kesukarelaan & independensi dijaga.</p></section>
      <h4 class="sec">Paling relevan untuk ${esc(t.label)}</h4>
      <div class="facil-grid">${relevan.map((f) => card(f, false)).join('') || '<p class="muted small">—</p>'}</div>
      ${lain.length ? `<h4 class="sec">Fasilitator lain dalam model</h4><div class="facil-grid">${lain.map((f) => card(f, true)).join('')}</div>` : ''}`;
  }

  /* ── ARSITEKTUR (blueprint platform) ─────────────────────────────────── */
  function viewArsitektur(v) {
    v.innerHTML =
      `<section class="panel"><h3>🏗️ Arsitektur Platform — ${esc(PLATFORM.nama)}</h3>
        <p class="small muted">${esc(PLATFORM.tagline)}: integrasi pembelajaran, sertifikasi, manajemen pengetahuan,
        & succession planning di atas <b>Frappe LMS</b> dan <b>Tiered Competency Engine</b>.</p>
        <div class="arch">${ARCH_LAYERS.map((l, i) => `<div class="arch-layer"><div class="arch-h"><span class="arch-ic">${l.icon}</span><b>${esc(l.judul)}</b></div>
          <div class="arch-items">${l.items.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div></div>${i < ARCH_LAYERS.length - 1 ? '<div class="arch-arrow">▼</div>' : ''}`).join('')}</div></section>

      <section class="panel"><h4>🪜 Tiered Competency Engine (10 tier)</h4>
        <div class="tierladder">${Object.values(TIERS).sort((a, b) => a.no - b.no).map((t) => `<div class="tl-row" style="border-left:4px solid ${GROUPS[t.group].warna}">
          <span class="tl-no">T${t.no}</span><span class="tl-lbl"><b>${esc(t.label)}</b><span class="muted small"> — ${esc(t.fokus)}</span></span>
          <span class="pill opt">${esc(GROUPS[t.group].label)}</span></div>`).join('')}</div></section>

      <section class="panel"><h4>📦 Modul Utama PWA</h4>
        <div class="mod-grid">${PWA_MODULES.map((m) => `<div class="mod-card"><div class="mod-ic">${m.icon}</div><b>${esc(m.judul)}</b>
          <ul>${m.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}</div></section>

      <section class="panel"><h4>🔌 Integrasi Sistem KPU</h4>
        <div class="intg">${INTEGRASI.map((i) => `<div class="intg-row"><b>${esc(i.nama)}</b><span class="arr">${i.arah === 'dua-arah' ? '⇄' : '→'}</span><span class="small muted">${esc(i.desc)}</span></div>`).join('')}</div></section>

      <section class="panel"><h4>🛠️ Teknologi</h4>
        <div class="tech">${Object.keys(TECH).map((k) => `<div class="tech-col"><div class="tech-h">${esc(k)}</div>${TECH[k].map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>`).join('')}</div></section>

      <section class="panel"><h4>📈 Roadmap Kematangan</h4>
        <div class="maturity">${MATURITY.map((m) => `<div class="mat-step"><div class="mat-lvl">L${m.lvl}</div><div><b>${esc(m.judul)}</b><div class="small muted">${esc(m.desc)}</div></div></div>`).join('')}</div></section>`;
  }

  /* ── SINKRONISASI & DATA ─────────────────────────────────────────────── */
  function viewSync(v) {
    const fc = SYNC.getFrappe();
    const swOn = ('serviceWorker' in navigator);
    v.innerHTML =
      `<section class="panel"><h3>📥 Sinkronisasi & Data</h3>
        <p class="small muted">Modul <b>Mobile Offline → Sinkronisasi saat online</b>. Progres tersimpan
        di perangkat (<code>localStorage</code>). Pindahkan ke perangkat lain via ekspor/impor, atau
        sambungkan ke <b>Frappe LMS</b> (headless) untuk produksi.</p>
        <div class="sync-stat">
          <span class="pill ${swOn ? 'req' : 'opt'}">${swOn ? '● Offline-ready (service worker)' : '○ Service worker tak tersedia'}</span>
          <span class="pill ${AI.isLive() ? 'req' : 'opt'}">AI ${AI.isLive() ? 'Live' : 'Offline'}</span>
          <span class="pill ${fc.baseUrl ? 'req' : 'opt'}">Frappe ${fc.baseUrl ? 'terkonfigurasi' : 'belum diatur'}</span>
        </div>
      </section>

      <section class="panel"><h4>💾 Ekspor / Impor Progres</h4>
        <p class="small muted">Cadangkan seluruh progres (alur, kuis, kompetensi, kontribusi knowledge) sebagai
        berkas JSON. Rahasia (kunci API) tidak ikut diekspor.</p>
        <div class="rab-actions">
          <button class="btn primary" data-export>⬇️ Ekspor JSON</button>
          <label class="btn" style="cursor:pointer">⬆️ Impor JSON<input id="impf" type="file" accept="application/json,.json" hidden></label>
        </div>
        <div id="syncmsg" class="ringkas"></div>
      </section>

      <section class="panel"><h4>🔗 Konektor Frappe LMS (headless · eksperimental)</h4>
        <p class="small muted">Untuk produksi, PWA ini menjadi front-end atas <b>Frappe LMS</b> via REST
        (token auth). Tanpa backend, aplikasi tetap berjalan offline-first.</p>
        <div class="cfg">
          <label>Base URL<input id="fr-url" placeholder="https://lms.kpu.go.id" value="${esc(fc.baseUrl || '')}"/></label>
          <div class="grid2"><label>API Key<input id="fr-key" value="${esc(fc.apiKey || '')}"/></label>
            <label>API Secret<input id="fr-sec" type="password" value="${esc(fc.apiSecret || '')}"/></label></div>
          <div class="rab-actions"><button class="btn primary sm" id="fr-save">Simpan</button>
            <button class="btn sm" id="fr-test">Uji koneksi</button>
            <button class="btn sm" id="fr-pull">Tarik katalog kursus</button></div>
          <div id="frmsg" class="ringkas"></div>
        </div>
        <h4 class="sec">Pemetaan model → doctype Frappe LMS</h4>
        <table class="doc-table"><thead><tr><th>Model lokal</th><th>Frappe LMS</th><th>Keterangan</th></tr></thead>
          <tbody>${SYNC.FRAPPE_MAP.map((m) => `<tr><td><b>${esc(m.lokal)}</b></td><td>${esc(m.frappe)}</td><td class="small muted">${esc(m.ket)}</td></tr>`).join('')}</tbody></table>
        <p class="small muted">Langkah deploy lengkap: lihat <code>public/lms-kpu/DEPLOY.md</code>.</p>
      </section>`;

    v.querySelector('[data-export]').onclick = () => { SYNC.exportDownload(); flash(v, '#syncmsg', '✅ Berkas ekspor diunduh.'); };
    v.querySelector('#impf').onchange = (e) => {
      const file = e.target.files && e.target.files[0]; if (!file) return;
      const r = new FileReader();
      r.onload = () => { const res = SYNC.importText(String(r.result)); flash(v, '#syncmsg', (res.ok ? '✅ ' : '⚠️ ') + res.msg); if (res.ok) { S = load(); save(); setTimeout(render, 600); } };
      r.onerror = () => flash(v, '#syncmsg', '⚠️ Gagal membaca berkas.');
      r.readAsText(file);
    };
    v.querySelector('#fr-save').onclick = () => { SYNC.setFrappe({ baseUrl: v.querySelector('#fr-url').value.trim(), apiKey: v.querySelector('#fr-key').value.trim(), apiSecret: v.querySelector('#fr-sec').value.trim() }); flash(v, '#frmsg', '✅ Konfigurasi Frappe disimpan.'); };
    v.querySelector('#fr-test').onclick = async () => { flash(v, '#frmsg', '⏳ Menguji…'); const r = await SYNC.testConnection(); flash(v, '#frmsg', (r.ok ? '✅ ' : '⚠️ ') + r.msg); };
    v.querySelector('#fr-pull').onclick = async () => { flash(v, '#frmsg', '⏳ Menarik katalog…'); const r = await SYNC.pullCourses(); flash(v, '#frmsg', (r.ok ? '✅ ' : '⚠️ ') + r.msg + (r.courses && r.courses.length ? ' — ' + r.courses.slice(0, 8).join(', ') : '')); };
  }
  function flash(v, sel, msg) { const el = v.querySelector(sel); if (el) el.innerHTML = esc(msg); }

  /* ── Modal util ──────────────────────────────────────────────────────── */
  function modal(html, actions) {
    closeModal();
    const back = document.createElement('div'); back.className = 'modal-back'; back.id = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-body">${html}</div><div class="modal-actions"></div></div>`;
    const acts = back.querySelector('.modal-actions');
    (actions || []).forEach((a) => { const btn = document.createElement('button'); btn.className = 'btn ' + (a.cls || ''); btn.textContent = a.label; btn.onclick = a.act; acts.appendChild(btn); });
    back.addEventListener('click', (e) => { if (e.target === back) closeModal(); });
    document.body.appendChild(back);
  }
  function closeModal() { const m = document.getElementById('modal-back'); if (m) m.remove(); }

  render();
})();
