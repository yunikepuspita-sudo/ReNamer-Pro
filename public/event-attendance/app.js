/* ============================================================================
 * Smart Attendance Event — core module (app.js)
 * Shared by index.html (peserta/RSVP), admin.html (panitia), checkin.html (scan)
 *
 * Dua mode:
 *   1. ONLINE  — terhubung ke Google Apps Script Web App (Google Sheets database).
 *                Konfigurasi URL di Admin → Pengaturan (disimpan di localStorage).
 *   2. DEMO    — bila URL backend kosong, seluruh data disimpan di localStorage
 *                perangkat ini. Cocok untuk uji coba tanpa setup backend.
 *
 * Semua fungsi data bersifat async sehingga UI yang sama bekerja di dua mode.
 * ==========================================================================*/
window.SAE = (function () {
  'use strict';

  // Opsi: isi langsung URL Apps Script di sini agar tidak perlu setting manual.
  const DEFAULT_API_URL = (window.SAE_CONFIG && window.SAE_CONFIG.API_URL) || '';

  const LS = {
    API: 'sae:apiUrl',
    EVENTS: 'sae:events',
    PARTS: 'sae:participants',
    ACTIVE: 'sae:activeEvent',
    PANITIA: 'sae:panitiaName'
  };

  /* ----------------------------- konfigurasi ----------------------------- */
  function getApiUrl() {
    return (localStorage.getItem(LS.API) || DEFAULT_API_URL || '').trim();
  }
  function setApiUrl(url) {
    localStorage.setItem(LS.API, (url || '').trim());
  }
  function isOnline() {
    return getApiUrl().length > 0;
  }
  function modeLabel() {
    return isOnline() ? 'Online (Google Sheets)' : 'Demo (perangkat ini)';
  }

  /* ------------------------------ utilitas ------------------------------- */
  function uid(prefix) {
    return (prefix || '') + Date.now().toString(36).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();
  }
  function pad(n, w) { return String(n).padStart(w || 3, '0'); }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch (e) { return []; }
  }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // Jarak dua koordinat (meter) — rumus haversine.
  function distanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const toRad = (d) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function fmtTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }
  function fmtDateTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }
  function durationStr(inTs, outTs) {
    if (!inTs || !outTs) return '';
    let ms = new Date(outTs) - new Date(inTs);
    if (ms < 0) return '';
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return (h ? h + 'j ' : '') + m + 'm';
  }

  /* --------------------------- panggilan backend ------------------------- */
  // Apps Script: GET untuk baca (query ?action=...), POST text/plain untuk tulis
  // (text/plain menghindari CORS preflight pada Apps Script Web App).
  async function apiGet(action, params) {
    const url = new URL(getApiUrl());
    url.searchParams.set('action', action);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString(), { method: 'GET' });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Gagal memuat data');
    return json.data;
  }
  async function apiPost(action, payload) {
    const res = await fetch(getApiUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload: payload || {} })
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || 'Gagal menyimpan data');
    return json.data;
  }

  /* =============================== EVENTS ================================ */
  async function listEvents() {
    if (isOnline()) return await apiGet('listEvents');
    return read(LS.EVENTS).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  async function getEvent(id) {
    if (!id) return null;
    if (isOnline()) return await apiGet('getEvent', { id });
    return read(LS.EVENTS).find((e) => e.id === id) || null;
  }

  async function createEvent(data) {
    const event = {
      id: data.id || uid('EVT'),
      nomorSurat: data.nomorSurat || '',
      nama: data.nama || 'Kegiatan',
      jenis: data.jenis || 'Rapat',
      tanggal: data.tanggal || '',
      waktu: data.waktu || '',
      lokasi: data.lokasi || '',
      lat: data.lat === '' || data.lat == null ? null : Number(data.lat),
      lng: data.lng === '' || data.lng == null ? null : Number(data.lng),
      radius: Number(data.radius) || 100,
      gpsRequired: !!data.gpsRequired,
      pdfUrl: data.pdfUrl || '',
      createdAt: Date.now()
    };
    if (isOnline()) return await apiPost('createEvent', event);
    const all = read(LS.EVENTS);
    all.push(event);
    write(LS.EVENTS, all);
    return event;
  }

  async function updateEvent(id, patch) {
    if (isOnline()) return await apiPost('updateEvent', { id, patch });
    const all = read(LS.EVENTS);
    const i = all.findIndex((e) => e.id === id);
    if (i < 0) throw new Error('Event tidak ditemukan');
    all[i] = Object.assign({}, all[i], patch);
    write(LS.EVENTS, all);
    return all[i];
  }

  async function deleteEvent(id) {
    if (isOnline()) return await apiPost('deleteEvent', { id });
    write(LS.EVENTS, read(LS.EVENTS).filter((e) => e.id !== id));
    write(LS.PARTS, read(LS.PARTS).filter((p) => p.eventId !== id));
    return true;
  }

  /* ============================ PARTICIPANTS ============================= */
  async function listParticipants(eventId) {
    if (isOnline()) return await apiGet('listParticipants', { eventId });
    return read(LS.PARTS)
      .filter((p) => p.eventId === eventId)
      .sort((a, b) => (a.seq || 0) - (b.seq || 0));
  }

  async function getParticipant(id) {
    if (isOnline()) return await apiGet('getParticipant', { id });
    return read(LS.PARTS).find((p) => p.id === id) || null;
  }

  // RSVP / konfirmasi kehadiran (Modul 2 & 3).
  async function rsvp(eventId, data) {
    const payload = {
      eventId,
      nama: (data.nama || '').trim(),
      nipNik: (data.nipNik || '').trim(),
      instansi: (data.instansi || '').trim(),
      jabatan: (data.jabatan || '').trim(),
      wa: (data.wa || '').trim(),
      email: (data.email || '').trim(),
      bersedia: data.bersedia === 'Tidak' ? 'Tidak' : 'Ya'
    };
    if (isOnline()) return await apiPost('rsvp', payload);

    const all = read(LS.PARTS);
    const seq = all.filter((p) => p.eventId === eventId).length + 1;
    const part = Object.assign({
      id: eventId + '-' + pad(seq),
      seq,
      status: payload.bersedia === 'Ya' ? 'Konfirmasi Hadir' : 'Tidak Hadir',
      checkIn: null,
      checkOut: null,
      createdAt: Date.now()
    }, payload);
    all.push(part);
    write(LS.PARTS, all);
    return part;
  }

  // Check-in / check-out otomatis (Modul 4 & 5).
  // Mengembalikan { participant, action: 'checkin'|'checkout'|'done' }.
  async function scan(participantId, geo) {
    if (isOnline()) {
      return await apiPost('scan', {
        id: participantId,
        lat: geo && geo.lat, lng: geo && geo.lng
      });
    }
    const all = read(LS.PARTS);
    const i = all.findIndex((p) => p.id === participantId);
    if (i < 0) throw new Error('QR tidak dikenali / peserta tidak terdaftar');
    const p = all[i];
    let action;
    if (!p.checkIn) { p.checkIn = Date.now(); action = 'checkin'; }
    else if (!p.checkOut) { p.checkOut = Date.now(); action = 'checkout'; }
    else { action = 'done'; }
    if (p.status === 'Tidak Hadir' || p.status === 'Konfirmasi Hadir') p.status = 'Hadir';
    all[i] = p;
    write(LS.PARTS, all);
    return { participant: p, action };
  }

  /* ============================== STATISTIK ============================== */
  async function stats(eventId) {
    const parts = await listParticipants(eventId);
    const konfirmasi = parts.filter((p) => p.bersedia === 'Ya').length;
    const hadir = parts.filter((p) => p.checkIn).length;
    const selesai = parts.filter((p) => p.checkOut).length;
    const tidak = parts.filter((p) => p.bersedia === 'Tidak').length;
    return {
      total: parts.length,
      konfirmasi,
      hadir,
      selesai,
      tidakBersedia: tidak,
      belumHadir: konfirmasi - hadir
    };
  }

  /* =============================== GEOLOKASI ============================= */
  function getPosition(options) {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('Perangkat tidak mendukung GPS'));
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy }),
        (err) => reject(new Error(geoErr(err))),
        Object.assign({ enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }, options || {})
      );
    });
  }
  function geoErr(err) {
    switch (err && err.code) {
      case 1: return 'Izin lokasi ditolak. Aktifkan GPS untuk lokasi ini.';
      case 2: return 'Lokasi tidak tersedia. Coba lagi di area terbuka.';
      case 3: return 'Permintaan lokasi timeout. Coba lagi.';
      default: return 'Gagal membaca lokasi.';
    }
  }

  // Validasi radius lokasi acara. Mengembalikan { ok, distance, reason }.
  function validateGeo(event, geo) {
    if (!event || !event.gpsRequired) return { ok: true, distance: null };
    if (event.lat == null || event.lng == null) return { ok: true, distance: null };
    if (!geo) return { ok: false, reason: 'Lokasi tidak terbaca' };
    const d = distanceMeters(event.lat, event.lng, geo.lat, geo.lng);
    return { ok: d <= (event.radius || 100), distance: Math.round(d) };
  }

  /* ============================== QR PAYLOAD ============================= */
  // Isi QR peserta = JSON ringkas; scanner juga menerima id mentah.
  function qrPayload(part) {
    return JSON.stringify({ id: part.id, nama: part.nama, status: 'valid' });
  }
  function parseScan(raw) {
    if (!raw) return null;
    raw = raw.trim();
    // URL tiket → ambil parameter ticket
    try {
      if (/^https?:\/\//i.test(raw)) {
        const u = new URL(raw);
        const t = u.searchParams.get('ticket');
        if (t) return t;
      }
    } catch (e) { /* ignore */ }
    // JSON { id, ... }
    if (raw[0] === '{') {
      try { const o = JSON.parse(raw); if (o && o.id) return String(o.id); } catch (e) { /* ignore */ }
    }
    return raw; // anggap id mentah
  }

  /* ============================ BERBAGI (WA/Email) ====================== */
  function ticketUrl(part) {
    const base = location.origin + location.pathname.replace(/[^/]+$/, '');
    return base + 'index.html?ticket=' + encodeURIComponent(part.id);
  }
  function waLink(part, event) {
    const msg =
      `*Tiket Kehadiran — ${event ? event.nama : 'Acara'}*\n` +
      `Nama: ${part.nama}\nID: ${part.id}\n` +
      (event ? `Tanggal: ${event.tanggal || '-'}\nLokasi: ${event.lokasi || '-'}\n` : '') +
      `\nSimpan QR Anda di sini:\n${ticketUrl(part)}\n\nTunjukkan QR saat check-in. Terima kasih.`;
    const num = (part.wa || '').replace(/[^0-9]/g, '').replace(/^0/, '62');
    return 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg);
  }
  function mailLink(part, event) {
    const subject = `Tiket Kehadiran — ${event ? event.nama : 'Acara'}`;
    const body =
      `Halo ${part.nama},\n\nBerikut tiket kehadiran Anda.\nID: ${part.id}\n` +
      `Simpan & tunjukkan QR saat check-in:\n${ticketUrl(part)}\n\nTerima kasih.`;
    return 'mailto:' + encodeURIComponent(part.email || '') +
      '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  /* =============================== EKSPOR =============================== */
  function rekapRows(event, parts) {
    return parts.map((p) => ({
      ID: p.id,
      Nama: p.nama,
      Instansi: p.instansi || '',
      Jabatan: p.jabatan || '',
      'NIP/NIK': p.nipNik || '',
      WA: p.wa || '',
      Email: p.email || '',
      RSVP: p.bersedia === 'Tidak' ? 'Tidak Hadir' : 'Bersedia',
      'Check In': fmtTime(p.checkIn),
      'Check Out': fmtTime(p.checkOut),
      Durasi: durationStr(p.checkIn, p.checkOut),
      Status: p.checkIn ? (p.checkOut ? 'Selesai' : 'Hadir') : (p.bersedia === 'Tidak' ? 'Tidak Hadir' : 'Belum Hadir')
    }));
  }

  function toCsv(rows) {
    if (!rows.length) return '';
    const head = Object.keys(rows[0]);
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    return [head.join(','), ...rows.map((r) => head.map((h) => esc(r[h])).join(','))].join('\r\n');
  }

  function download(filename, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: type || 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function exportCsv(event, parts) {
    download(slug(event) + '.csv', '﻿' + toCsv(rekapRows(event, parts)), 'text/csv;charset=utf-8');
  }

  async function exportXlsx(event, parts) {
    await ensureXlsx();
    const rows = rekapRows(event, parts);
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Rekap Kehadiran');
    XLSX.writeFile(wb, slug(event) + '.xlsx');
  }

  function slug(event) {
    const base = (event && event.nama ? event.nama : 'rekap-kehadiran')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'rekap-' + base;
  }

  function ensureXlsx() {
    if (window.XLSX) return Promise.resolve();
    return loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js');
  }
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = () => reject(new Error('Gagal memuat ' + src));
      document.head.appendChild(s);
    });
  }

  /* --------------------------- aktif & panitia --------------------------- */
  function getActiveEventId() { return localStorage.getItem(LS.ACTIVE) || ''; }
  function setActiveEventId(id) { localStorage.setItem(LS.ACTIVE, id || ''); }
  function getPanitia() { return localStorage.getItem(LS.PANITIA) || ''; }
  function setPanitia(n) { localStorage.setItem(LS.PANITIA, n || ''); }

  /* ------------------------------- UI helper ----------------------------- */
  function toast(msg, kind) {
    let host = document.getElementById('sae-toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sae-toast';
      document.body.appendChild(host);
    }
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || 'info');
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.classList.add('show'); }, 10);
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3200);
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {});
      });
    }
  }

  function param(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  return {
    // config
    getApiUrl, setApiUrl, isOnline, modeLabel,
    // events
    listEvents, getEvent, createEvent, updateEvent, deleteEvent,
    // participants
    listParticipants, getParticipant, rsvp, scan,
    // stats
    stats,
    // geo
    getPosition, validateGeo, distanceMeters,
    // qr
    qrPayload, parseScan, ticketUrl, waLink, mailLink,
    // export
    rekapRows, exportCsv, exportXlsx,
    // active / panitia
    getActiveEventId, setActiveEventId, getPanitia, setPanitia,
    // helpers
    fmtTime, fmtDateTime, durationStr, toast, registerSW, param, esc, uid
  };
})();
