/* ===========================================================================
   views/approval.js — Kotak masuk persetujuan/verifikasi sesuai peran.
   ========================================================================= */

import { currentUser, roleLabel } from '../auth.js';
import { inboxFor } from '../domain.js';
import { esc, rentangTanggal } from '../ui.js';
import { renderSppdList, emptyState } from './shared.js';

export function renderApproval(root) {
  const u = currentUser();
  const inbox = inboxFor(u);

  root.innerHTML = `
  <div class="page-head">
    <div><h1>Kotak Persetujuan</h1><p class="desc">Item yang menunggu tindakan Anda sebagai <b>${esc(roleLabel(u.role))}</b>.</p></div>
  </div>
  <div class="card card-pad" style="margin-bottom:14px;border-left:4px solid var(--gold)">
    <b>${inbox.length}</b> perjalanan dinas menunggu ${u.role === 'bendahara' ? 'verifikasi/pembayaran' : 'persetujuan'} Anda.
  </div>
  <div id="list"></div>`;

  const listEl = root.querySelector('#list');
  if (!inbox.length) {
    listEl.innerHTML = emptyState('🎉', 'Antrean kosong', 'Tidak ada item yang menunggu tindakan Anda. Kerja bagus!');
    return;
  }
  renderSppdList(listEl, inbox, { showPemohon: true });
}
