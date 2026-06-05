/* ===========================================================================
   views/login.js — Halaman masuk. Demo: pilih peran/akun untuk masuk.
   ========================================================================= */

import { store } from '../store.js';
import { login, ROLES } from '../auth.js';
import { ORG } from '../seed.js';
import { esc, initials, toast } from '../ui.js';

export function renderLogin(app, onDone) {
  app.removeAttribute('aria-busy');
  const pegawai = store.list('pegawai');
  const roleKeys = Object.keys(ROLES);
  const defaultByRole = (r) => pegawai.find((p) => p.role === r);

  app.innerHTML = `
  <div class="auth">
    <div class="auth-hero">
      <div class="badge-line"><span>★</span> SISTEM INFORMASI PERJALANAN DINAS</div>
      <h1>SISFO SPPD<br>${esc(ORG.satker)}</h1>
      <p style="color:#cdd9ee;max-width:46ch">Pengajuan & pertanggungjawaban perjalanan dinas yang
        <b style="color:#fff">paperless, mobile-first, dan akuntabel</b> — selaras prinsip akuntabilitas keuangan negara.</p>
      <ul>
        <li><span class="c">✓</span> Alur persetujuan berjenjang (atasan → keuangan → PPK → KPA)</li>
        <li><span class="c">✓</span> Surat Tugas & SPPD elektronik + QR Code validasi</li>
        <li><span class="c">✓</span> SPJ digital, deteksi duplikasi klaim, & arsip permanen</li>
        <li><span class="c">✓</span> Dashboard realtime serapan anggaran (DIPA)</li>
        <li><span class="c">✓</span> Bekerja offline (PWA) — dapat di-install di ponsel</li>
      </ul>
    </div>
    <div class="auth-card">
      <div class="auth-inner">
        <div class="brand" style="padding:0 0 6px"><div class="mark"></div>
          <div><div class="name" style="color:var(--navy)">SISFO SPPD</div><div class="sub" style="color:var(--muted)">KPU Jawa Barat</div></div></div>
        <h2>Masuk</h2>
        <p class="muted small">Mode demo — pilih peran untuk mencoba seluruh alur. Tidak perlu kata sandi.</p>

        <div class="role-grid" id="roleGrid">
          ${roleKeys.map((r) => {
            const acc = defaultByRole(r);
            return `<button class="role-pick" data-role="${r}">
              <div class="r-name">${esc(ROLES[r].short)}</div>
              <div class="r-sub">${esc(ROLES[r].desc)}</div>
            </button>`;
          }).join('')}
        </div>

        <div class="field mt-16">
          <label class="lbl">Atau pilih akun spesifik</label>
          <select class="select" id="accSelect">
            ${pegawai.map((p) => `<option value="${p.id}">${esc(p.nama)} — ${esc(ROLES[p.role].label)}</option>`).join('')}
          </select>
        </div>

        <button class="btn btn-primary btn-block mt-16" id="loginBtn">Masuk →</button>
        <p class="muted small text-center mt-12">© ${new Date().getFullYear()} ${esc(ORG.satker)} · v1.0.0</p>
      </div>
    </div>
  </div>`;

  let selected = pegawai[0].id;
  const accSelect = app.querySelector('#accSelect');
  accSelect.value = selected;

  app.querySelectorAll('.role-pick').forEach((btn) => {
    btn.onclick = () => {
      app.querySelectorAll('.role-pick').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const acc = defaultByRole(btn.dataset.role);
      if (acc) { selected = acc.id; accSelect.value = acc.id; }
    };
  });
  accSelect.onchange = () => {
    selected = accSelect.value;
    app.querySelectorAll('.role-pick').forEach((b) => b.classList.remove('active'));
  };

  app.querySelector('#loginBtn').onclick = () => {
    const u = login(selected);
    if (!u) { toast('Akun tidak ditemukan.', 'err'); return; }
    toast(`Selamat datang, ${u.nama.split(',')[0]}.`, 'ok');
    onDone();
  };
}
