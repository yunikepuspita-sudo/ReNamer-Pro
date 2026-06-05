/* ===========================================================================
   views/detail.js — Detail satu SPPD: ringkasan, dokumen (Surat Tugas/SPPD +
   QR), pelaksanaan (check-in/geotag/bukti), SPJ, riwayat (audit), serta aksi
   persetujuan/penolakan/revisi/pembayaran sesuai peran & status.
   ========================================================================= */

import { store, uid } from '../store.js';
import { currentUser, roleLabel } from '../auth.js';
import { ORG } from '../seed.js';
import {
  statusInfo, canAct, approve, requestRevision, reject, recordPayment,
  addCheckin, submitSPJ, PENGAJUAN_FLOW, SPJ_FLOW, hitungBiaya, cekAnggaran,
} from '../domain.js';
import {
  esc, rupiah, tanggal, tanggalJam, rentangTanggal, statusBadge, toast,
  notePrompt, confirmDialog, modal, fileToDataUrl, fmtBytes,
} from '../ui.js';
import { go } from '../router.js';
import { renderQR } from '../qr.js';
import { pegawai, pegawaiName } from './shared.js';

export function renderDetail(root, parts) {
  const id = parts[1];
  const u = currentUser();
  let tab = 'ringkasan';

  function get() { return store.find('sppd', id); }

  function render() {
    const s = get();
    if (!s) { root.innerHTML = `<div class="empty"><div class="big">🔍</div><h3>Data tidak ditemukan</h3><a class="btn btn-primary" href="#/daftar">Ke Daftar</a></div>`; return; }
    const p = pegawai(s.pemohonId);
    const isOwner = s.pemohonId === u.id;
    const actable = canAct(s, u);
    const hasDoc = !!s.documents;
    const tabs = [
      ['ringkasan', '📋 Ringkasan'],
      ...(hasDoc ? [['dokumen', '📄 Dokumen & QR']] : []),
      ['pelaksanaan', '📍 Pelaksanaan'],
      ['spj', '🧾 SPJ'],
      ['riwayat', '🕘 Riwayat'],
    ];

    root.innerHTML = `
    <div class="page-head">
      <div>
        <a class="small muted" href="#/daftar">← Daftar Perjalanan Dinas</a>
        <h1 style="margin-top:4px">${esc(s.perihal)}</h1>
        <p class="desc">${statusBadge(s.status)} &nbsp; 👤 ${esc(p?.nama || '')} · ${esc(p?.jabatan || '')}</p>
      </div>
      <div class="actions" id="actionBar"></div>
    </div>

    ${renderStepper(s)}

    <div class="tabs" id="tabs">${tabs.map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'active' : ''}">${l}</button>`).join('')}</div>
    <div id="tabBody"></div>`;

    renderActions(root.querySelector('#actionBar'), s, { isOwner, actable });
    root.querySelectorAll('#tabs button').forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
    renderTab(root.querySelector('#tabBody'), s, tab, { isOwner });
  }

  // ---- Stepper alur ----
  function renderStepper(s) {
    const idxP = PENGAJUAN_FLOW.indexOf(s.status);
    const reachedTerbit = idxP >= 0 || ['PELAKSANAAN', ...SPJ_FLOW].includes(s.status) || s.documents;
    const flow = reachedTerbit && (s.status.startsWith('SPJ') || ['PELAKSANAAN', 'SELESAI'].includes(s.status))
      ? SPJ_FLOW : PENGAJUAN_FLOW;
    const labels = flow === PENGAJUAN_FLOW
      ? ['Atasan', 'Keuangan', 'PPK', 'KPA', 'Terbit']
      : ['Verif Bendahara', 'Persetujuan PPK', 'Pengesahan KPA', 'Disetujui', 'Dibayar'];
    let cur = flow.indexOf(s.status);
    if (s.status === 'SELESAI') cur = flow.length - 1;
    if (['TERBIT'].includes(s.status)) cur = PENGAJUAN_FLOW.length - 1;
    const rejected = s.status === 'DITOLAK';
    return `<div class="card card-pad" style="overflow-x:auto">
      <div style="display:flex;gap:6px;min-width:520px">
        ${flow.map((st, i) => {
          const done = i < cur || s.status === 'SELESAI';
          const isCur = i === cur;
          const color = rejected ? 'var(--red)' : done ? 'var(--green)' : isCur ? 'var(--gold)' : 'var(--line)';
          return `<div style="flex:1;text-align:center">
            <div style="height:6px;border-radius:6px;background:${color}"></div>
            <div class="small" style="margin-top:6px;font-weight:${isCur ? 800 : 600};color:${isCur ? 'var(--navy)' : 'var(--muted)'}">${labels[i]}</div>
          </div>`;
        }).join('')}
      </div></div>`;
  }

  // ---- Action bar ----
  function renderActions(bar, s, { isOwner, actable }) {
    const btns = [];
    if (isOwner && (s.status === 'DRAFT' || s.status === 'REVISI')) {
      btns.push(`<button class="btn btn-primary" data-act="edit">✏️ ${s.status === 'REVISI' ? 'Perbaiki & Kirim Ulang' : 'Lengkapi Draf'}</button>`);
    }
    if (actable) {
      const isSpj = s.status.startsWith('SPJ');
      const approveLabel = s.status === 'MENUNGGU_KPA' ? '✅ Sahkan & Terbitkan Dokumen'
        : s.status === 'SPJ_DISETUJUI' ? '💳 Catat Pembayaran' : '✅ Setujui';
      if (s.status === 'SPJ_DISETUJUI') {
        btns.push(`<button class="btn btn-success" data-act="pay">${approveLabel}</button>`);
      } else {
        btns.push(`<button class="btn btn-success" data-act="approve">${approveLabel}</button>`);
        btns.push(`<button class="btn btn-gold" data-act="revisi">↩️ Minta Revisi</button>`);
        if (!isSpj) btns.push(`<button class="btn btn-danger" data-act="tolak">✕ Tolak</button>`);
      }
    }
    if (isOwner && ['TERBIT', 'PELAKSANAAN'].includes(s.status)) {
      btns.push(`<button class="btn btn-primary" data-act="checkin">📍 Check-in Lokasi</button>`);
      btns.push(`<button class="btn btn-gold" data-act="spjform">🧾 Isi SPJ</button>`);
    }
    if (isOwner && s.status === 'SPJ_REVISI') {
      btns.push(`<button class="btn btn-primary" data-act="spjform">🧾 Perbaiki SPJ</button>`);
    }
    bar.innerHTML = btns.join('');

    bar.querySelector('[data-act=edit]') && (bar.querySelector('[data-act=edit]').onclick = () => go('/pengajuan/' + s.id));
    bar.querySelector('[data-act=approve]') && (bar.querySelector('[data-act=approve]').onclick = () => doApprove(s));
    bar.querySelector('[data-act=revisi]') && (bar.querySelector('[data-act=revisi]').onclick = () => doRevisi(s));
    bar.querySelector('[data-act=tolak]') && (bar.querySelector('[data-act=tolak]').onclick = () => doTolak(s));
    bar.querySelector('[data-act=pay]') && (bar.querySelector('[data-act=pay]').onclick = () => doPay(s));
    bar.querySelector('[data-act=checkin]') && (bar.querySelector('[data-act=checkin]').onclick = () => doCheckin(s));
    bar.querySelector('[data-act=spjform]') && (bar.querySelector('[data-act=spjform]').onclick = () => { tab = 'spj'; render(); });
  }

  // ---- Aksi ----
  async function doApprove(s) {
    if (s.status === 'MENUNGGU_KEUANGAN') {
      const cek = cekAnggaran(s.akun, s.totalBiaya);
      if (!cek.ok && !(await confirmDialog({ title: 'Pagu tidak mencukupi', message: `Sisa pagu akun ${s.akun} hanya ${rupiah(cek.sisa)}, sedangkan kebutuhan ${rupiah(s.totalBiaya)}. Tetap setujui?`, danger: true, confirmText: 'Tetap Setujui' }))) return;
    }
    const note = await notePrompt({ title: 'Persetujuan', label: 'Catatan (opsional)', placeholder: 'mis. Sesuai kebutuhan tugas / pagu mencukupi', confirmText: 'Setujui' });
    if (note === null) return;
    approve(s, note);
    window.dispatchEvent(new Event('sppd:changed'));
    toast(s.status === 'MENUNGGU_KPA' ? 'Dokumen diterbitkan.' : 'Berhasil disetujui.', 'ok');
    render();
  }
  async function doRevisi(s) {
    const note = await notePrompt({ title: 'Minta Revisi', label: 'Catatan revisi', placeholder: 'Jelaskan yang perlu diperbaiki…', required: true, confirmText: 'Kirim Revisi', danger: true });
    if (!note) return;
    requestRevision(s, note); window.dispatchEvent(new Event('sppd:changed')); toast('Permintaan revisi dikirim.', 'warn'); render();
  }
  async function doTolak(s) {
    const note = await notePrompt({ title: 'Tolak Pengajuan', label: 'Alasan penolakan', required: true, confirmText: 'Tolak', danger: true });
    if (!note) return;
    reject(s, note); window.dispatchEvent(new Event('sppd:changed')); toast('Pengajuan ditolak.', 'err'); render();
  }
  function doPay(s) {
    const nominal = s.spj?.totalRealisasi || s.biayaDisetujui || s.totalBiaya;
    modal({
      title: 'Catat Pembayaran / Pencairan',
      body: `<div class="form-grid">
        <div class="field col-2"><label class="lbl">Metode</label>
          <select class="select" id="pm">${['Transfer Bank (LS)', 'Transfer Bank (GU)', 'Uang Persediaan (UP)', 'Tunai'].map((m) => `<option>${m}</option>`).join('')}</select></div>
        <div class="field"><label class="lbl">Nominal (Rp)</label><input class="input" id="pn" type="number" value="${nominal}"></div>
        <div class="field"><label class="lbl">No. Bukti / SP2D</label><input class="input" id="pb" placeholder="SP2D-2026-XXXX"></div>
      </div>`,
      footer: `<button class="btn" data-no>Batal</button><button class="btn btn-success" data-yes>Cairkan</button>`,
      onMount: (r, close) => {
        r.querySelector('[data-no]').onclick = close;
        r.querySelector('[data-yes]').onclick = () => {
          recordPayment(s, { metode: r.querySelector('#pm').value, nominal: +r.querySelector('#pn').value, buktiNo: r.querySelector('#pb').value || ('SP2D-' + uid('').toUpperCase().slice(0, 8)) });
          close(); window.dispatchEvent(new Event('sppd:changed')); toast('Pembayaran tercatat. Perjalanan dinas selesai.', 'ok'); render();
        };
      },
    });
  }
  function doCheckin(s) {
    modal({
      title: 'Check-in Lokasi Kegiatan',
      body: `<div class="field"><label class="lbl">Nama Lokasi</label><input class="input" id="ciLok" placeholder="mis. Hotel / Kantor tujuan"></div>
        <div class="field mt-12"><label class="lbl">Catatan</label><input class="input" id="ciNote" placeholder="opsional"></div>
        <div class="field mt-12"><button class="btn btn-sm" id="ciGeo">📍 Ambil Lokasi GPS (Geotagging)</button><div class="small muted mt-8" id="ciGeoOut">Koordinat belum diambil.</div></div>`,
      footer: `<button class="btn" data-no>Batal</button><button class="btn btn-primary" data-yes>Check-in</button>`,
      onMount: (r, close) => {
        let coords = null;
        r.querySelector('#ciGeo').onclick = () => {
          if (!navigator.geolocation) { r.querySelector('#ciGeoOut').textContent = 'Geolokasi tidak didukung peramban.'; return; }
          r.querySelector('#ciGeoOut').textContent = 'Mengambil lokasi…';
          navigator.geolocation.getCurrentPosition(
            (pos) => { coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }; r.querySelector('#ciGeoOut').innerHTML = `✓ ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`; },
            () => { r.querySelector('#ciGeoOut').textContent = 'Gagal mengambil lokasi (izin ditolak).'; });
        };
        r.querySelector('[data-no]').onclick = close;
        r.querySelector('[data-yes]').onclick = () => {
          addCheckin(s, { lokasi: r.querySelector('#ciLok').value || 'Lokasi kegiatan', note: r.querySelector('#ciNote').value, lat: coords?.lat, lng: coords?.lng });
          close(); window.dispatchEvent(new Event('sppd:changed')); toast('Check-in tercatat.', 'ok'); tab = 'pelaksanaan'; render();
        };
      },
    });
  }

  // ---- Tabs ----
  function renderTab(body, s, which, { isOwner }) {
    if (which === 'ringkasan') body.innerHTML = tabRingkasan(s);
    else if (which === 'dokumen') { body.innerHTML = tabDokumen(s); mountDocs(body, s); }
    else if (which === 'pelaksanaan') tabPelaksanaan(body, s, isOwner);
    else if (which === 'spj') tabSPJ(body, s, isOwner);
    else if (which === 'riwayat') body.innerHTML = tabRiwayat(s);
  }

  function tabRingkasan(s) {
    const r = s.rincianBiaya;
    const pengikut = (s.pengikut || []).map((id) => pegawaiName(id)).filter(Boolean);
    return `<div class="grid grid-2" style="grid-template-columns:1.5fr 1fr;align-items:start">
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:12px"><span class="ico">📋</span> Informasi Perjalanan Dinas</div>
        <dl class="dl">
          <dt>Perihal</dt><dd>${esc(s.perihal)}</dd>
          <dt>Uraian Kegiatan</dt><dd>${esc(s.kegiatan)}</dd>
          <dt>Tujuan</dt><dd>${esc(s.lokasiKota)}, ${esc(s.lokasiProvinsi)}</dd>
          <dt>Tanggal</dt><dd>${rentangTanggal(s.tanggalBerangkat, s.tanggalKembali)} <span class="muted">(${s.lamaHari} hari)</span></dd>
          <dt>Alat Angkut</dt><dd>${esc(s.alatAngkut || '-')}</dd>
          <dt>Akun Belanja</dt><dd><span class="tag-akun">${esc(s.akun)}</span></dd>
          ${pengikut.length ? `<dt>Pengikut</dt><dd>${pengikut.map(esc).join(', ')}</dd>` : ''}
          <dt>Lampiran</dt><dd>${(s.lampiran || []).length ? (s.lampiran).map((l) => `📄 ${esc(l.nama)}`).join('<br>') : '<span class="muted">—</span>'}</dd>
        </dl>
      </div>
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:10px"><span class="ico">🧮</span> Rincian Biaya</div>
        <table class="tbl" style="min-width:auto"><tbody>
          <tr><td>Uang Harian</td><td class="num">${rupiah(r.uangHarian)}</td></tr>
          <tr><td>Penginapan</td><td class="num">${rupiah(r.penginapan)}</td></tr>
          <tr><td>Transport</td><td class="num">${rupiah(r.transport)}</td></tr>
          <tr><td>Lain-lain</td><td class="num">${rupiah(r.lainnya)}</td></tr>
          <tr style="font-weight:800;border-top:2px solid var(--navy)"><td>Total</td><td class="num">${rupiah(s.totalBiaya)}</td></tr>
        </tbody></table>
      </div>
    </div>`;
  }

  function tabDokumen(s) {
    const d = s.documents;
    return `<div class="doc-actions"><button class="btn btn-sm" onclick="window.print()">🖨️ Cetak / Simpan PDF</button></div>
      ${suratTugasHTML(s)}<div style="height:18px"></div>${sppdHTML(s)}`;
  }
  function mountDocs(body, s) {
    body.querySelectorAll('[data-qr]').forEach((el) => renderQR(el, s.documents.qrToken, 96));
  }

  function tabPelaksanaan(body, s, isOwner) {
    const pel = s.pelaksanaan || { checkin: [], bukti: [], catatan: '' };
    body.innerHTML = `
      <div class="grid grid-2" style="grid-template-columns:1fr 1fr;align-items:start">
        <div class="card card-pad">
          <div class="card-title" style="margin-bottom:10px"><span class="ico">📍</span> Riwayat Check-in & Geotagging</div>
          ${pel.checkin.length ? `<ul class="timeline">${pel.checkin.map((c) => `
            <li><span class="tl-dot done"></span>
              <div class="tl-title">${esc(c.lokasi)}</div>
              <div class="tl-meta">${tanggalJam(c.ts)}${c.lat ? ` · 📍 ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)} <a href="https://maps.google.com/?q=${c.lat},${c.lng}" target="_blank" rel="noopener">peta</a>` : ''}</div>
              ${c.note ? `<div class="tl-note">${esc(c.note)}</div>` : ''}
            </li>`).join('')}</ul>` : `<p class="muted small">Belum ada check-in. ${isOwner ? 'Gunakan tombol “Check-in Lokasi”.' : ''}</p>`}
        </div>
        <div class="card card-pad">
          <div class="card-title" style="margin-bottom:10px"><span class="ico">📷</span> Dokumentasi Kegiatan</div>
          <div class="thumbs" id="bukti">${(pel.bukti || []).map((b) => b.dataUrl ? `<img class="thumb" src="${b.dataUrl}" alt="${esc(b.nama)}">` : `<div class="file-chip">📄 ${esc(b.nama)}</div>`).join('') || '<p class="muted small">Belum ada dokumentasi.</p>'}</div>
          ${isOwner && ['TERBIT', 'PELAKSANAAN'].includes(s.status) ? `<div class="dropzone mt-12" id="dropBukti"><div class="big">📷</div>Unggah foto dokumentasi</div><input type="file" id="fileBukti" accept="image/*" multiple hidden>` : ''}
          ${pel.catatan ? `<div class="divider"></div><b class="small">Catatan:</b><p class="small mb-0">${esc(pel.catatan)}</p>` : ''}
        </div>
      </div>`;
    const drop = body.querySelector('#dropBukti');
    if (drop) {
      const fi = body.querySelector('#fileBukti');
      drop.onclick = () => fi.click();
      fi.onchange = async (e) => {
        const cur = get();
        cur.pelaksanaan = cur.pelaksanaan || { checkin: [], bukti: [], catatan: '' };
        for (const f of e.target.files) {
          if (f.size > 2_500_000) { toast(`"${f.name}" terlalu besar.`, 'warn'); continue; }
          cur.pelaksanaan.bukti.push({ nama: f.name, dataUrl: await fileToDataUrl(f) });
        }
        store.upsert('sppd', cur); toast('Dokumentasi tersimpan.', 'ok'); tab = 'pelaksanaan'; render();
      };
    }
  }

  function tabSPJ(body, s, isOwner) {
    const editable = isOwner && ['TERBIT', 'PELAKSANAAN', 'SPJ_REVISI'].includes(s.status);
    if (editable) { renderSPJForm(body, s); return; }
    if (!s.spj) { body.innerHTML = `<div class="empty"><div class="big">🧾</div><h3>SPJ belum diisi</h3><p class="muted">Pertanggungjawaban diisi pemohon setelah perjalanan dinas dilaksanakan.</p></div>`; return; }
    const spj = s.spj;
    body.innerHTML = `<div class="card card-pad">
      <div class="card-title" style="margin-bottom:10px"><span class="ico">🧾</span> Laporan & Pertanggungjawaban (SPJ)</div>
      <dl class="dl"><dt>Status SPJ</dt><dd>${statusBadge(s.status)}</dd>
        <dt>Laporan</dt><dd>${esc(spj.laporan || '-')}</dd></dl>
      <div class="divider"></div>
      <table class="tbl" style="min-width:auto"><thead><tr><th>Komponen</th><th class="num">Estimasi</th><th class="num">Realisasi</th></tr></thead><tbody>
        ${['uangHarian', 'penginapan', 'transport', 'lainnya'].map((k) => `<tr><td>${labelKomp(k)}</td><td class="num muted">${rupiah(s.rincianBiaya[k])}</td><td class="num">${rupiah(spj.realisasi?.[k] || 0)}</td></tr>`).join('')}
        <tr style="font-weight:800;border-top:2px solid var(--navy)"><td>Total</td><td class="num muted">${rupiah(s.totalBiaya)}</td><td class="num">${rupiah(spj.totalRealisasi || 0)}</td></tr>
      </tbody></table>
      <div class="divider"></div>
      <b class="small">Bukti Pendukung</b>
      <div class="mt-8">${(spj.bukti || []).map((b) => `<div class="file-chip">📎 <b>${esc(b.kategori)}</b> — ${esc(b.nama)} <span class="muted" style="margin-left:auto">${b.nominal ? rupiah(b.nominal) : ''}</span></div>`).join('') || '<span class="muted small">—</span>'}</div>
    </div>`;
  }

  function renderSPJForm(body, s) {
    const r = s.rincianBiaya;
    const prev = s.spj || {};
    let bukti = (prev.bukti || []).slice();
    body.innerHTML = `<div class="card card-pad">
      <div class="card-title" style="margin-bottom:6px"><span class="ico">🧾</span> ${prev.laporan ? 'Perbaiki' : 'Isi'} Pertanggungjawaban (SPJ)</div>
      <p class="muted small">Lengkapi laporan, realisasi biaya riil, dan unggah bukti (boarding pass, tiket, invoice hotel, daftar hadir, dll).</p>
      <div class="field mt-12"><label class="lbl">Laporan Hasil Perjalanan Dinas <span class="req">*</span></label>
        <textarea class="textarea" id="lap" placeholder="Ringkasan hasil & capaian kegiatan…">${esc(prev.laporan || '')}</textarea></div>
      <div class="divider"></div>
      <b class="small">Realisasi Biaya (Rp)</b>
      <div class="form-grid mt-8">
        ${['uangHarian', 'penginapan', 'transport', 'lainnya'].map((k) => `<div class="field"><label class="lbl">${labelKomp(k)} <span class="muted">(est. ${rupiah(r[k])})</span></label>
          <input class="input" type="number" data-r="${k}" value="${prev.realisasi?.[k] ?? r[k]}"></div>`).join('')}
      </div>
      <div class="flex between mt-12"><b>Total Realisasi</b><b id="totR">${rupiah(prev.totalRealisasi || s.totalBiaya)}</b></div>
      <div class="divider"></div>
      <b class="small">Bukti Pendukung</b>
      <div class="form-grid mt-8" style="grid-template-columns:1.2fr .8fr auto">
        <div class="field"><select class="select" id="bKat">${['Tiket/Boarding Pass', 'Invoice Hotel', 'Bukti Transportasi', 'Daftar Hadir', 'Laporan/Notulen', 'Dokumentasi Foto', 'Lainnya'].map((k) => `<option>${k}</option>`).join('')}</select></div>
        <div class="field"><input class="input" id="bNom" type="number" placeholder="Nominal (Rp)"></div>
        <div class="field"><button class="btn" id="bAdd">📎 Tambah Berkas</button></div>
      </div>
      <input type="file" id="bFile" accept="application/pdf,image/*" hidden>
      <div id="buktiList" class="mt-8"></div>
      <div class="divider"></div>
      <button class="btn btn-primary btn-block" id="spjSubmit">🚀 Ajukan SPJ untuk Verifikasi</button>
    </div>`;

    const totR = body.querySelector('#totR');
    function recalc() {
      const t = ['uangHarian', 'penginapan', 'transport', 'lainnya'].reduce((sum, k) => sum + (+body.querySelector(`[data-r="${k}"]`).value || 0), 0);
      totR.textContent = rupiah(t); return t;
    }
    function renderBukti() {
      body.querySelector('#buktiList').innerHTML = bukti.map((b, i) => `<div class="file-chip">📎 <b>${esc(b.kategori)}</b> — ${esc(b.nama)} <span class="muted">${b.nominal ? rupiah(b.nominal) : ''}</span><span class="x" data-i="${i}">✕</span></div>`).join('');
      body.querySelectorAll('#buktiList .x').forEach((x) => x.onclick = () => { bukti.splice(+x.dataset.i, 1); renderBukti(); });
    }
    body.querySelectorAll('[data-r]').forEach((inp) => inp.oninput = recalc);
    const bFile = body.querySelector('#bFile');
    body.querySelector('#bAdd').onclick = () => bFile.click();
    bFile.onchange = async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const item = { kategori: body.querySelector('#bKat').value, nominal: +body.querySelector('#bNom').value || 0, nama: f.name, dataUrl: f.size < 2_500_000 ? await fileToDataUrl(f) : null };
      bukti.push(item); body.querySelector('#bNom').value = ''; bFile.value = ''; renderBukti();
    };
    body.querySelector('#spjSubmit').onclick = async () => {
      const lap = body.querySelector('#lap').value.trim();
      if (!lap) { toast('Laporan wajib diisi.', 'err'); return; }
      const realisasi = {}; ['uangHarian', 'penginapan', 'transport', 'lainnya'].forEach((k) => realisasi[k] = +body.querySelector(`[data-r="${k}"]`).value || 0);
      const totalRealisasi = realisasi.uangHarian + realisasi.penginapan + realisasi.transport + realisasi.lainnya;
      if (!await confirmDialog({ title: 'Ajukan SPJ', message: `Total realisasi ${rupiah(totalRealisasi)} akan diajukan untuk verifikasi Bendahara. Lanjutkan?` })) return;
      submitSPJ(s, { laporan: lap, realisasi, totalRealisasi, bukti });
      window.dispatchEvent(new Event('sppd:changed')); toast('SPJ diajukan untuk verifikasi.', 'ok'); tab = 'spj'; render();
    };
    renderBukti(); recalc();
  }

  function tabRiwayat(s) {
    const h = [...(s.history || [])].reverse();
    return `<div class="card card-pad">
      <div class="card-title" style="margin-bottom:14px"><span class="ico">🕘</span> Riwayat & Jejak Audit</div>
      ${h.length ? `<ul class="timeline">${h.map((x, i) => {
        const cls = x.action.includes('Menolak') ? 'reject' : (i === 0 ? 'current' : 'done');
        return `<li><span class="tl-dot ${cls}"></span>
          <div class="tl-title">${esc(x.action)} ${statusBadge(x.status)}</div>
          <div class="tl-meta">${esc((pegawaiName(x.actorId) || '').split(',')[0])} (${esc(roleLabel(x.role))}) · ${tanggalJam(x.ts)}</div>
          ${x.note ? `<div class="tl-note">${esc(x.note)}</div>` : ''}</li>`;
      }).join('')}</ul>` : '<p class="muted small">Belum ada riwayat.</p>'}
    </div>`;
  }

  render();
}

function labelKomp(k) { return { uangHarian: 'Uang Harian', penginapan: 'Penginapan', transport: 'Transport', lainnya: 'Lain-lain' }[k] || k; }

/* ---- Template dokumen resmi ---- */
function kop() {
  return `<div class="kop"><div class="garuda"></div><div class="kop-txt">
    <div class="l1">${esc(ORG.instansi)}</div><div class="l2">${esc(ORG.satker)}</div>
    <div class="l3">${esc(ORG.alamat)} · Telp. ${esc(ORG.telp)} · ${esc(ORG.email)}</div></div></div>`;
}
function suratTugasHTML(s) {
  const p = pegawai(s.pemohonId); const d = s.documents;
  const pengikut = (s.pengikut || []).map((id) => pegawai(id)).filter(Boolean);
  return `<div class="doc">${kop()}
    <h2 class="doc-title">SURAT TUGAS</h2>
    <div class="doc-no">Nomor: ${esc(d.suratTuganNo)}</div>
    <p>Dasar: Pelaksanaan kegiatan ${esc(s.perihal)}.</p>
    <p>Sekretaris selaku Kuasa Pengguna Anggaran ${esc(ORG.satker)} dengan ini menugaskan:</p>
    <table class="doc-tbl">
      <tr><td style="width:130px">Nama</td><td>: ${esc(p?.nama || '')}</td></tr>
      <tr><td>NIP</td><td>: ${esc(p?.nip || '')}</td></tr>
      <tr><td>Jabatan</td><td>: ${esc(p?.jabatan || '')}</td></tr>
      ${pengikut.map((pg) => `<tr><td>Pengikut</td><td>: ${esc(pg.nama)} (${esc(pg.jabatan)})</td></tr>`).join('')}
    </table>
    <p style="margin-top:8px">Untuk melaksanakan: <b>${esc(s.kegiatan)}</b> di <b>${esc(s.lokasiKota)}, ${esc(s.lokasiProvinsi)}</b>
       pada tanggal <b>${rentangTanggal(s.tanggalBerangkat, s.tanggalKembali)}</b> (${s.lamaHari} hari) menggunakan ${esc(s.alatAngkut || 'kendaraan')}.</p>
    <p>Biaya perjalanan dinas dibebankan pada DIPA ${esc(ORG.satker)} TA ${ORG.tahunAnggaran}, akun belanja ${esc(s.akun)}.</p>
    <div class="qr-box"><div data-qr></div><div class="small">Validasi dokumen elektronik.<br>Token: <b>${esc(d.qrToken)}</b><br>Pindai QR untuk verifikasi keaslian.</div></div>
    <div class="ttd-grid"><div class="ttd">
      ${esc(ORG.kotaAsal)}, ${tanggal(d.tglTerbit)}<br>Kuasa Pengguna Anggaran,<br><br>
      <span class="badge badge-green" style="font-family:var(--font)">✓ Ditandatangani elektronik (BSrE)</span><br><br>
      <b>${esc(pegawai('peg-kpa')?.nama || '')}</b><br>NIP ${esc(pegawai('peg-kpa')?.nip || '')}
    </div></div>
  </div>`;
}
function sppdHTML(s) {
  const p = pegawai(s.pemohonId); const d = s.documents;
  return `<div class="doc">${kop()}
    <h2 class="doc-title">SURAT PERJALANAN DINAS (SPPD)</h2>
    <div class="doc-no">Nomor: ${esc(d.sppdNo)}</div>
    <table class="doc-tbl">
      <tr><td style="width:36px">1.</td><td style="width:230px">Pejabat yang memberi perintah</td><td>: Kuasa Pengguna Anggaran</td></tr>
      <tr><td>2.</td><td>Nama pegawai yang diperintah</td><td>: ${esc(p?.nama || '')}</td></tr>
      <tr><td>3.</td><td>NIP / Pangkat / Golongan</td><td>: ${esc(p?.nip || '')} / ${esc(p?.golongan || '')}</td></tr>
      <tr><td>4.</td><td>Jabatan</td><td>: ${esc(p?.jabatan || '')}</td></tr>
      <tr><td>5.</td><td>Maksud perjalanan dinas</td><td>: ${esc(s.perihal)}</td></tr>
      <tr><td>6.</td><td>Alat angkut</td><td>: ${esc(s.alatAngkut || '-')}</td></tr>
      <tr><td>7.</td><td>Tempat tujuan</td><td>: ${esc(s.lokasiKota)}, ${esc(s.lokasiProvinsi)}</td></tr>
      <tr><td>8.</td><td>Lama / tanggal perjalanan</td><td>: ${s.lamaHari} hari, ${rentangTanggal(s.tanggalBerangkat, s.tanggalKembali)}</td></tr>
      <tr><td>9.</td><td>Pembebanan anggaran (akun)</td><td>: DIPA ${esc(ORG.satker)} — ${esc(s.akun)}</td></tr>
      <tr><td>10.</td><td>Estimasi biaya</td><td>: ${rupiah(s.totalBiaya)}</td></tr>
    </table>
    <div class="qr-box"><div data-qr></div><div class="small">Dikeluarkan di ${esc(ORG.kotaAsal)} pada ${tanggal(d.tglTerbit)}.<br>Token validasi: <b>${esc(d.qrToken)}</b></div></div>
    <div class="ttd-grid"><div class="ttd">Pejabat Pembuat Komitmen,<br><br>
      <span class="badge badge-green" style="font-family:var(--font)">✓ TTE BSrE</span><br><br>
      <b>${esc(pegawai('peg-ppk')?.nama || '')}</b><br>NIP ${esc(pegawai('peg-ppk')?.nip || '')}</div></div>
  </div>`;
}
