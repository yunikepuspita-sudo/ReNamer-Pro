/* ===========================================================================
   views/pengajuan.js — Formulir pengajuan perjalanan dinas.
   Menghitung biaya otomatis dari SBM, mengecek anggaran, mendeteksi duplikasi
   klaim, mengunggah lampiran (undangan/TOR), lalu mengajukan ke alur approval.
   ========================================================================= */

import { store, uid } from '../store.js';
import { currentUser } from '../auth.js';
import { ORG } from '../seed.js';
import { hitungLamaHari, hitungBiaya, detectDuplicate, cekAnggaran, submitPengajuan, resubmit } from '../domain.js';
import { esc, rupiah, fileToDataUrl, fmtBytes, toast } from '../ui.js';
import { go } from '../router.js';
import { pegawai } from './shared.js';

export function renderPengajuan(root, parts) {
  const u = currentUser();
  const editId = parts[1];
  const editing = editId ? store.find('sppd', editId) : null;
  const isRevisi = editing && (editing.status === 'REVISI');
  const sbm = store.list('sbm');
  const anggaran = store.list('anggaran');
  const rekan = store.list('pegawai').filter((p) => p.id !== u.id);

  // Lampiran sementara (data URL).
  let lampiran = editing?.lampiran ? editing.lampiran.filter((l) => l.dataUrl) : [];

  const v = editing || {};
  const today = new Date().toISOString().slice(0, 10);

  root.innerHTML = `
  <div class="page-head">
    <div>
      <h1>${isRevisi ? 'Revisi' : 'Ajukan'} Perjalanan Dinas</h1>
      <p class="desc">Pemohon: <b>${esc(u.nama)}</b> · ${esc(u.jabatan)}</p>
    </div>
    <div class="actions"><a class="btn" href="#/daftar">← Kembali</a></div>
  </div>

  ${isRevisi ? `<div class="card card-pad" style="border-left:4px solid var(--red);margin-bottom:14px">
    <b class="muted">⚠️ Catatan revisi dari verifikator:</b>
    <p style="margin:6px 0 0">${esc(lastRevisiNote(editing))}</p></div>` : ''}

  <div class="grid grid-2" style="grid-template-columns: 1.6fr 1fr; align-items:start">
    <div class="card card-pad">
      <form id="frm" novalidate>
        <div class="form-grid">
          <div class="field col-2">
            <label class="lbl">Maksud / Perihal Perjalanan Dinas <span class="req">*</span></label>
            <input class="input" name="perihal" value="${esc(v.perihal || '')}" placeholder="mis. Rapat Koordinasi Pemutakhiran Data Pemilih" required>
          </div>
          <div class="field col-2">
            <label class="lbl">Uraian Kegiatan <span class="req">*</span></label>
            <textarea class="textarea" name="kegiatan" placeholder="Jelaskan kegiatan yang akan diikuti…" required>${esc(v.kegiatan || '')}</textarea>
          </div>
          <div class="field">
            <label class="lbl">Kota/Kabupaten Tujuan <span class="req">*</span></label>
            <input class="input" name="lokasiKota" value="${esc(v.lokasiKota || '')}" placeholder="mis. Jakarta Pusat" required>
          </div>
          <div class="field">
            <label class="lbl">Provinsi Tujuan <span class="req">*</span></label>
            <select class="select" name="lokasiProvinsi" required>
              <option value="">— pilih provinsi —</option>
              ${sbm.map((s) => `<option value="${esc(s.provinsi)}" ${v.lokasiProvinsi === s.provinsi ? 'selected' : ''}>${esc(s.provinsi)}</option>`).join('')}
            </select>
            <span class="hint">Menentukan tarif uang harian & batas penginapan (SBM).</span>
          </div>
          <div class="field">
            <label class="lbl">Tanggal Berangkat <span class="req">*</span></label>
            <input class="input" type="date" name="tanggalBerangkat" value="${esc(v.tanggalBerangkat || '')}" min="${today}" required>
          </div>
          <div class="field">
            <label class="lbl">Tanggal Kembali <span class="req">*</span></label>
            <input class="input" type="date" name="tanggalKembali" value="${esc(v.tanggalKembali || '')}" min="${today}" required>
          </div>
          <div class="field">
            <label class="lbl">Alat Angkut</label>
            <select class="select" name="alatAngkut">
              ${['Pesawat', 'Kereta Api', 'Kendaraan Dinas', 'Kendaraan Umum / Travel', 'Kapal Laut'].map((a) =>
                `<option ${v.alatAngkut === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="lbl">Akun Belanja (DIPA) <span class="req">*</span></label>
            <select class="select" name="akun" required>
              ${anggaran.map((a) => `<option value="${a.kode}" ${v.akun === a.kode ? 'selected' : ''}>${a.kode} — ${esc(a.nama)}</option>`).join('')}
            </select>
          </div>
          <div class="field">
            <label class="lbl">Estimasi Biaya Transport (Rp)</label>
            <input class="input" type="number" name="transport" min="0" step="1000" value="${v.rincianBiaya?.transport ?? 0}">
            <span class="hint">Tiket PP / BBM / tol (sesuai bukti riil saat SPJ).</span>
          </div>
          <div class="field">
            <label class="lbl">Biaya Lain-lain (Rp)</label>
            <input class="input" type="number" name="lainnya" min="0" step="1000" value="${v.rincianBiaya?.lainnya ?? 0}">
          </div>
          <div class="field col-2">
            <label class="lbl">Pengikut (opsional)</label>
            <select class="select" name="pengikut" multiple size="3">
              ${rekan.map((p) => `<option value="${p.id}" ${(v.pengikut || []).includes(p.id) ? 'selected' : ''}>${esc(p.nama)}</option>`).join('')}
            </select>
            <span class="hint">Tahan Ctrl/Cmd untuk memilih lebih dari satu.</span>
          </div>
          <div class="field col-2">
            <label class="lbl">Lampiran (Undangan / TOR / Surat Permintaan)</label>
            <div class="dropzone" id="drop"><div class="big">📎</div>Klik untuk unggah berkas (PDF/gambar)</div>
            <input type="file" id="file" accept="application/pdf,image/*" multiple hidden>
            <div id="fileList"></div>
          </div>
        </div>
      </form>
    </div>

    <div>
      <div class="card card-pad">
        <div class="card-title" style="margin-bottom:10px"><span class="ico">🧮</span> Estimasi Biaya</div>
        <div id="biaya"></div>
      </div>
      <div id="warnDup"></div>
      <div class="card card-pad mt-12">
        <button class="btn btn-primary btn-block" id="btnSubmit">${isRevisi ? '🔁 Kirim Ulang' : '🚀 Ajukan untuk Persetujuan'}</button>
        ${!isRevisi ? `<button class="btn btn-block mt-12" id="btnDraft">💾 Simpan sebagai Draf</button>` : ''}
      </div>
    </div>
  </div>`;

  const frm = root.querySelector('#frm');
  const biayaEl = root.querySelector('#biaya');
  const warnEl = root.querySelector('#warnDup');
  const fileList = root.querySelector('#fileList');

  function readForm() {
    const fd = new FormData(frm);
    const provinsi = fd.get('lokasiProvinsi');
    const berangkat = fd.get('tanggalBerangkat');
    const kembali = fd.get('tanggalKembali');
    const lama = (berangkat && kembali) ? hitungLamaHari(berangkat, kembali) : 1;
    const { rincian, total } = hitungBiaya(provinsi, lama, fd.get('transport'), fd.get('lainnya'));
    const pengikut = Array.from(frm.querySelector('[name=pengikut]').selectedOptions).map((o) => o.value);
    return {
      perihal: fd.get('perihal')?.trim(), kegiatan: fd.get('kegiatan')?.trim(),
      lokasiKota: fd.get('lokasiKota')?.trim(), lokasiProvinsi: provinsi,
      tanggalBerangkat: berangkat, tanggalKembali: kembali, lamaHari: lama,
      alatAngkut: fd.get('alatAngkut'), akun: fd.get('akun'), pengikut,
      rincianBiaya: rincian, totalBiaya: total,
    };
  }

  function recompute() {
    const d = readForm();
    biayaEl.innerHTML = `
      <table class="tbl" style="min-width:auto"><tbody>
        <tr><td>Uang Harian <span class="muted">(${d.lamaHari} hari)</span></td><td class="num">${rupiah(d.rincianBiaya.uangHarian)}</td></tr>
        <tr><td>Penginapan <span class="muted">(${Math.max(0, d.lamaHari - 1)} mlm)</span></td><td class="num">${rupiah(d.rincianBiaya.penginapan)}</td></tr>
        <tr><td>Transport</td><td class="num">${rupiah(d.rincianBiaya.transport)}</td></tr>
        <tr><td>Lain-lain</td><td class="num">${rupiah(d.rincianBiaya.lainnya)}</td></tr>
        <tr style="font-weight:800;border-top:2px solid var(--navy)"><td>Total Estimasi</td><td class="num">${rupiah(d.totalBiaya)}</td></tr>
      </tbody></table>`;

    // Cek anggaran
    if (d.akun && d.totalBiaya) {
      const cek = cekAnggaran(d.akun, d.totalBiaya);
      biayaEl.insertAdjacentHTML('beforeend',
        `<div class="badge ${cek.ok ? 'badge-green' : 'badge-red'}" style="margin-top:8px">
          ${cek.ok ? '✓ Pagu anggaran mencukupi' : '✕ Pagu tidak mencukupi'} · sisa ${rupiah(cek.sisa)}</div>`);
    }

    // Deteksi duplikasi
    if (d.tanggalBerangkat && d.tanggalKembali) {
      const dups = detectDuplicate({ id: editId || '_new', pemohonId: u.id, tanggalBerangkat: d.tanggalBerangkat, tanggalKembali: d.tanggalKembali });
      warnEl.innerHTML = dups.length ? `<div class="card card-pad mt-12" style="border-left:4px solid var(--orange)">
        <b style="color:var(--orange)">⚠️ Potensi duplikasi klaim</b>
        <p class="small mt-8 mb-0">Tanggal beririsan dengan ${dups.length} perjalanan dinas Anda lainnya:
        ${dups.map((x) => `<br>• ${esc(x.perihal)}`).join('')}</p></div>` : '';
    }
  }

  function renderFiles() {
    fileList.innerHTML = lampiran.map((f, i) => `<div class="file-chip">📄 ${esc(f.nama)} <span class="muted">${fmtBytes(f.size)}</span><span class="x" data-i="${i}">✕</span></div>`).join('');
    fileList.querySelectorAll('.x').forEach((x) => x.onclick = () => { lampiran.splice(+x.dataset.i, 1); renderFiles(); });
  }

  // Events
  frm.addEventListener('input', recompute);
  frm.addEventListener('change', recompute);
  root.querySelector('#drop').onclick = () => root.querySelector('#file').click();
  root.querySelector('#file').onchange = async (e) => {
    for (const file of e.target.files) {
      if (file.size > 2_500_000) { toast(`"${file.name}" terlalu besar (maks ~2.5MB untuk demo).`, 'warn'); continue; }
      const dataUrl = await fileToDataUrl(file);
      lampiran.push({ nama: file.name, tipe: file.type, size: file.size, dataUrl });
    }
    renderFiles();
  };

  function validate() {
    let ok = true;
    frm.querySelectorAll('[required]').forEach((f) => {
      const bad = !f.value.trim();
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    const d = readForm();
    if (d.tanggalBerangkat && d.tanggalKembali && new Date(d.tanggalKembali) < new Date(d.tanggalBerangkat)) {
      frm.querySelector('[name=tanggalKembali]').classList.add('invalid');
      toast('Tanggal kembali tidak boleh sebelum tanggal berangkat.', 'err'); ok = false;
    }
    if (!ok) toast('Mohon lengkapi isian yang wajib.', 'err');
    return ok;
  }

  function buildRecord(status) {
    const d = readForm();
    const base = editing || { id: uid('sppd-'), pemohonId: u.id, createdTs: Date.now(), history: [], pelaksanaan: { checkin: [], bukti: [], catatan: '' }, spj: null, pembayaran: null, documents: null };
    return { ...base, ...d, lampiran, biayaDisetujui: d.totalBiaya, status: status || base.status || 'DRAFT', updatedTs: Date.now() };
  }

  root.querySelector('#btnSubmit').onclick = () => {
    if (!validate()) return;
    const rec = buildRecord('DRAFT');
    store.upsert('sppd', rec);
    if (isRevisi) resubmit(store.find('sppd', rec.id));
    else submitPengajuan(store.find('sppd', rec.id));
    window.dispatchEvent(new Event('sppd:changed'));
    toast('Pengajuan terkirim untuk persetujuan atasan.', 'ok');
    go('/sppd/' + rec.id);
  };

  const btnDraft = root.querySelector('#btnDraft');
  if (btnDraft) btnDraft.onclick = () => {
    const rec = buildRecord('DRAFT');
    store.upsert('sppd', rec);
    toast('Tersimpan sebagai draf.', 'ok');
    go('/sppd/' + rec.id);
  };

  renderFiles();
  recompute();
}

function lastRevisiNote(s) {
  const h = [...(s.history || [])].reverse().find((x) => x.action === 'Meminta revisi');
  return h?.note || 'Mohon perbaiki sesuai catatan verifikator.';
}
