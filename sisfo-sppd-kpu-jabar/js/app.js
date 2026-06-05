/* ===========================================================================
   app.js — Titik masuk aplikasi: seed data, registrasi Service Worker,
   kerangka tampilan (shell), navigasi berbasis peran, dan routing.
   ========================================================================= */

import { seedIfEmpty, ORG } from './seed.js';
import { store } from './store.js';
import { currentUser, logout, ROLES, roleLabel } from './auth.js';
import { startRouter, go, currentPath } from './router.js';
import { inboxFor, mySppd } from './domain.js';
import { esc, initials, toast } from './ui.js';

import { renderLogin } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderPengajuan } from './views/pengajuan.js';
import { renderDaftar } from './views/daftar.js';
import { renderDetail } from './views/detail.js';
import { renderApproval } from './views/approval.js';
import { renderSpj } from './views/spj.js';
import { renderPembayaran } from './views/pembayaran.js';
import { renderAnggaran } from './views/anggaran.js';
import { renderArsip } from './views/arsip.js';
import { renderAudit } from './views/audit.js';
import { renderMasterData } from './views/masterdata.js';

/* ----- Konfigurasi rute & navigasi ----- */
const ROUTES = [
  { path: 'dashboard',  title: 'Dashboard',                  icon: '📊', nav: true,  roles: '*', render: renderDashboard, primary: true },
  { path: 'pengajuan',  title: 'Ajukan Perjalanan Dinas',    icon: '➕', nav: true,  roles: ['pegawai'], render: renderPengajuan, primary: true },
  { path: 'daftar',     title: 'Perjalanan Dinas',           icon: '🧳', nav: true,  roles: '*', render: renderDaftar, primary: true },
  { path: 'approval',   title: 'Kotak Persetujuan',          icon: '✅', nav: true,  roles: ['atasan', 'keuangan', 'ppk', 'kpa', 'bendahara'], render: renderApproval, badge: 'inbox', primary: true },
  { path: 'spj',        title: 'Pertanggungjawaban (SPJ)',   icon: '🧾', nav: true,  roles: ['pegawai'], render: renderSpj, badge: 'spj' },
  { path: 'pembayaran', title: 'Pembayaran & Pencairan',     icon: '💳', nav: true,  roles: ['bendahara'], render: renderPembayaran },
  { path: 'anggaran',   title: 'Anggaran (DIPA)',            icon: '📁', nav: true,  roles: ['keuangan', 'ppk', 'kpa', 'bendahara', 'auditor'], render: renderAnggaran },
  { path: 'arsip',      title: 'Arsip Digital',              icon: '🗄️', nav: true,  roles: '*', render: renderArsip, primary: true },
  { path: 'audit',      title: 'Audit Trail',                icon: '🛡️', nav: true,  roles: ['kpa', 'auditor'], render: renderAudit },
  { path: 'master',     title: 'Master Data',                icon: '⚙️', nav: true,  roles: ['keuangan', 'kpa'], render: renderMasterData },
  { path: 'sppd',       title: 'Detail Perjalanan Dinas',    icon: '', nav: false, roles: '*', render: renderDetail },
];

function roleAllowed(route, user) {
  return route.roles === '*' || (user && route.roles.includes(user.role));
}

function badgeCount(route, user) {
  if (route.badge === 'inbox') return inboxFor(user).length;
  if (route.badge === 'spj') return mySppd(user).filter((s) => ['TERBIT', 'PELAKSANAAN', 'SPJ_REVISI'].includes(s.status)).length;
  return 0;
}

/* ----- Render shell ----- */
let contentEl = null;

function buildShell(user) {
  const app = document.getElementById('app');
  app.removeAttribute('aria-busy');

  const navItems = ROUTES.filter((r) => r.nav && roleAllowed(r, user));
  const navHTML = navItems.map((r) => {
    const c = badgeCount(r, user);
    return `<a href="#/${r.path}" data-path="${r.path}">
      <span class="ico">${r.icon}</span><span>${esc(r.title)}</span>
      ${c ? `<span class="pill">${c}</span>` : ''}</a>`;
  }).join('');

  // Navigasi bawah (mobile): ambil item utama + tombol menu.
  const primary = navItems.filter((r) => r.primary).slice(0, 4);
  const bottomHTML = primary.map((r) => {
    const c = badgeCount(r, user);
    return `<a href="#/${r.path}" data-path="${r.path}"><span class="ico">${r.icon}</span>${esc(ROLES[user.role] && r.title.length > 12 ? r.title.split(' ')[0] : r.title)}${c ? '<span class="dot"></span>' : ''}</a>`;
  }).join('') + `<a href="#" data-menu><span class="ico">☰</span>Menu</a>`;

  app.innerHTML = `
    <div class="scrim" id="scrim"></div>
    <div class="layout">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <div class="mark"></div>
          <div><div class="name">SISFO SPPD</div><div class="sub">${esc(ORG.satker)}</div></div>
        </div>
        <nav class="nav">${navHTML}</nav>
        <div class="sidebar-foot">
          v1.0.0 · PWA Paperless<br>© ${new Date().getFullYear()} ${esc(ORG.satker)}
        </div>
      </aside>
      <div class="main">
        <header class="topbar">
          <button class="hamburger" id="hamburger" aria-label="Menu">☰</button>
          <div class="page-title" id="page-title">Dashboard</div>
          <div class="spacer"></div>
          <div id="net-pill"></div>
          <div class="userchip" id="userchip" title="Akun & keluar">
            <div class="avatar">${esc(initials(user.nama))}</div>
            <div class="u-meta"><div class="u-name">${esc(user.nama.split(',')[0])}</div><div class="u-role">${esc(roleLabel(user.role))}</div></div>
          </div>
        </header>
        <main class="content" id="content"></main>
      </div>
    </div>
    <nav class="bottomnav">${bottomHTML}</nav>`;

  contentEl = document.getElementById('content');

  // Interaksi shell
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const closeSidebar = () => { sidebar.classList.remove('open'); scrim.classList.remove('show'); };
  document.getElementById('hamburger').onclick = () => { sidebar.classList.add('open'); scrim.classList.add('show'); };
  scrim.onclick = closeSidebar;
  app.querySelectorAll('.nav a, .bottomnav a[data-path]').forEach((a) => a.addEventListener('click', closeSidebar));
  app.querySelector('[data-menu]').onclick = (e) => { e.preventDefault(); sidebar.classList.add('open'); scrim.classList.add('show'); };
  document.getElementById('userchip').onclick = openAccountMenu;

  updateNet();
}

function openAccountMenu() {
  import('./ui.js').then(({ modal }) => {
    const u = currentUser();
    modal({
      title: 'Akun',
      body: `<div class="flex center gap-12" style="margin-bottom:12px">
          <div class="avatar" style="width:46px;height:46px;font-size:17px">${esc(initials(u.nama))}</div>
          <div><div class="bold">${esc(u.nama)}</div><div class="small muted">${esc(roleLabel(u.role))} · ${esc(u.unit)}</div>
          <div class="small muted">NIP ${esc(u.nip)}</div></div></div>
        <p class="small muted">Mode demo: data tersimpan lokal di perangkat ini (offline-first). Anda dapat berganti peran untuk mencoba seluruh alur persetujuan.</p>`,
      footer: `<button class="btn" data-switch>Ganti Peran / Akun</button><button class="btn btn-danger" data-out>Keluar</button>`,
      onMount: (root, close) => {
        root.querySelector('[data-out]').onclick = () => { close(); doLogout(); };
        root.querySelector('[data-switch]').onclick = () => { close(); doLogout(); };
      },
    });
  });
}

function doLogout() { logout(); renderApp(); toast('Anda telah keluar.'); }

/* ----- Routing ----- */
function handleRoute(path, parts) {
  const user = currentUser();
  if (!user) { renderApp(); return; }
  if (!contentEl) buildShell(user);

  const route = ROUTES.find((r) => r.path === parts[0]) || ROUTES[0];
  if (!roleAllowed(route, user)) {
    contentEl.innerHTML = `<div class="empty"><div class="big">🔒</div><h3>Akses dibatasi</h3>
      <p class="muted">Menu ini tidak tersedia untuk peran <b>${esc(roleLabel(user.role))}</b>.</p>
      <a class="btn btn-primary" href="#/dashboard">Ke Dashboard</a></div>`;
    setActive('dashboard'); document.getElementById('page-title').textContent = 'Akses dibatasi';
    return;
  }

  document.getElementById('page-title').textContent = route.title;
  setActive(route.path);
  window.scrollTo(0, 0);
  try {
    route.render(contentEl, parts);
  } catch (e) {
    console.error(e);
    contentEl.innerHTML = `<div class="empty"><div class="big">⚠️</div><h3>Terjadi kesalahan</h3><p class="muted">${esc(e.message)}</p></div>`;
  }
  refreshBadges(user);
}

function setActive(path) {
  document.querySelectorAll('[data-path]').forEach((a) =>
    a.classList.toggle('active', a.getAttribute('data-path') === path));
}

export function refreshBadges(user = currentUser()) {
  if (!user) return;
  ROUTES.filter((r) => r.nav && r.badge).forEach((r) => {
    const c = badgeCount(r, user);
    document.querySelectorAll(`.nav a[data-path="${r.path}"]`).forEach((a) => {
      let pill = a.querySelector('.pill');
      if (c) { if (!pill) { pill = document.createElement('span'); pill.className = 'pill'; a.appendChild(pill); } pill.textContent = c; }
      else if (pill) pill.remove();
    });
  });
}

/* Navigasi terprogram dari view. */
export function navigate(path) { go(path); }

/* ----- Status jaringan ----- */
function updateNet() {
  const pill = document.getElementById('net-pill');
  if (!pill) return;
  pill.innerHTML = navigator.onLine ? '' : '<span class="badge badge-amber" title="Mode luring">● Offline</span>';
}
window.addEventListener('online', () => { updateNet(); toast('Kembali daring.', 'ok'); });
window.addEventListener('offline', () => { updateNet(); toast('Mode offline aktif — data tetap tersimpan lokal.', 'warn'); });

/* ----- Tampilkan login atau shell ----- */
function renderApp() {
  const user = currentUser();
  contentEl = null;
  if (!user) {
    renderLogin(document.getElementById('app'), () => { renderApp(); go('/dashboard'); });
    return;
  }
  buildShell(user);
  handleRoute(currentPath(), currentPath().split('/').filter(Boolean));
}

/* ----- Service Worker ----- */
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw && nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(reg);
        });
      });
    }).catch((e) => console.warn('SW gagal:', e));
  });
}

function showUpdateBanner(reg) {
  const b = document.createElement('div');
  b.className = 'update-banner';
  b.innerHTML = `<span>Versi baru tersedia.</span><button class="btn btn-gold btn-sm">Muat ulang</button>`;
  b.querySelector('button').onclick = () => { reg.waiting?.postMessage('SKIP_WAITING'); location.reload(); };
  document.body.appendChild(b);
  navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
}

/* Penyegaran badge navigasi setelah ada perubahan data dari view. */
window.addEventListener('sppd:changed', () => refreshBadges());

/* ----- Bootstrap ----- */
seedIfEmpty();
registerSW();
startRouter(handleRoute);
renderApp();
