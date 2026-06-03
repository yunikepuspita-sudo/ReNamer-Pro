/* ============================================================================
 * Smart Attendance Event — SheetService.gs
 * Lapisan akses data ke Google Sheets. Dua sheet dibuat otomatis:
 *   "Events"        — daftar kegiatan/undangan
 *   "Participants"  — peserta + RSVP + check-in/out (rekap kehadiran)
 *
 * Dipakai sebagai namespace: SheetService.listEvents(), dst (lihat Code.gs).
 * ==========================================================================*/
var SheetService = (function () {

  var EVENT_COLS = ['id', 'nomorSurat', 'nama', 'jenis', 'tanggal', 'waktu',
    'lokasi', 'lat', 'lng', 'radius', 'gpsRequired', 'pdfUrl', 'createdAt'];

  var PART_COLS = ['id', 'eventId', 'seq', 'nama', 'nipNik', 'instansi', 'jabatan',
    'wa', 'email', 'bersedia', 'status', 'checkIn', 'checkOut', 'createdAt'];

  function ss() { return SpreadsheetApp.getActiveSpreadsheet(); }

  function sheet(name, cols) {
    var s = ss().getSheetByName(name);
    if (!s) {
      s = ss().insertSheet(name);
      s.getRange(1, 1, 1, cols.length).setValues([cols]).setFontWeight('bold');
      s.setFrozenRows(1);
    }
    return s;
  }

  function readAll(name, cols) {
    var s = sheet(name, cols);
    var last = s.getLastRow();
    if (last < 2) return [];
    var values = s.getRange(2, 1, last - 1, cols.length).getValues();
    return values.map(function (row) {
      var o = {};
      cols.forEach(function (c, i) { o[c] = row[i]; });
      return normalize(o);
    });
  }

  function normalize(o) {
    ['lat', 'lng', 'radius', 'seq'].forEach(function (k) {
      if (o[k] === '' || o[k] === null || o[k] === undefined) o[k] = (k === 'seq' || k === 'radius') ? o[k] : null;
      else if (typeof o[k] === 'string' && o[k] !== '') o[k] = Number(o[k]);
    });
    if (typeof o.gpsRequired === 'string') o.gpsRequired = (o.gpsRequired === 'true' || o.gpsRequired === 'TRUE');
    ['checkIn', 'checkOut'].forEach(function (k) { if (o[k] === '') o[k] = null; });
    return o;
  }

  function appendRow(name, cols, obj) {
    var s = sheet(name, cols);
    s.appendRow(cols.map(function (c) {
      var v = obj[c];
      return (v === undefined || v === null) ? '' : v;
    }));
  }

  // Cari nomor baris berdasarkan kolom id (1-based, termasuk header).
  function findRow(name, cols, id) {
    var s = sheet(name, cols);
    var last = s.getLastRow();
    if (last < 2) return -1;
    var ids = s.getRange(2, 1, last - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(id)) return i + 2;
    }
    return -1;
  }

  function updateRow(name, cols, rowNum, obj) {
    var s = sheet(name, cols);
    var row = cols.map(function (c) {
      var v = obj[c];
      return (v === undefined || v === null) ? '' : v;
    });
    s.getRange(rowNum, 1, 1, cols.length).setValues([row]);
  }

  /* ------------------------------- EVENTS ------------------------------- */
  function listEvents() {
    return readAll('Events', EVENT_COLS).sort(function (a, b) {
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
  }
  function getEvent(id) {
    return listEvents().filter(function (e) { return String(e.id) === String(id); })[0] || null;
  }
  function createEvent(ev) {
    if (!ev.id) ev.id = 'EVT' + Date.now().toString(36).toUpperCase();
    if (!ev.createdAt) ev.createdAt = Date.now();
    if (ev.radius == null || ev.radius === '') ev.radius = 100;
    appendRow('Events', EVENT_COLS, ev);
    return getEvent(ev.id);
  }
  function updateEvent(id, patch) {
    var rowNum = findRow('Events', EVENT_COLS, id);
    if (rowNum < 0) throw new Error('Event tidak ditemukan');
    var cur = getEvent(id);
    var merged = Object.assign({}, cur, patch);
    updateRow('Events', EVENT_COLS, rowNum, merged);
    return getEvent(id);
  }
  function deleteEvent(id) {
    var rowNum = findRow('Events', EVENT_COLS, id);
    if (rowNum > 0) sheet('Events', EVENT_COLS).deleteRow(rowNum);
    // hapus peserta terkait
    var s = sheet('Participants', PART_COLS);
    var last = s.getLastRow();
    for (var r = last; r >= 2; r--) {
      if (String(s.getRange(r, 2).getValue()) === String(id)) s.deleteRow(r);
    }
    return true;
  }

  /* ---------------------------- PARTICIPANTS ---------------------------- */
  function listParticipants(eventId) {
    return readAll('Participants', PART_COLS)
      .filter(function (p) { return String(p.eventId) === String(eventId); })
      .sort(function (a, b) { return (a.seq || 0) - (b.seq || 0); });
  }
  function getParticipant(id) {
    return readAll('Participants', PART_COLS)
      .filter(function (p) { return String(p.id) === String(id); })[0] || null;
  }
  function rsvp(payload) {
    var lock = LockService.getScriptLock();
    lock.waitLock(8000);
    try {
      var seq = listParticipants(payload.eventId).length + 1;
      var part = {
        id: payload.eventId + '-' + ('000' + seq).slice(-3),
        eventId: payload.eventId,
        seq: seq,
        nama: payload.nama || '',
        nipNik: payload.nipNik || '',
        instansi: payload.instansi || '',
        jabatan: payload.jabatan || '',
        wa: payload.wa || '',
        email: payload.email || '',
        bersedia: payload.bersedia === 'Tidak' ? 'Tidak' : 'Ya',
        status: payload.bersedia === 'Tidak' ? 'Tidak Hadir' : 'Konfirmasi Hadir',
        checkIn: '',
        checkOut: '',
        createdAt: Date.now()
      };
      appendRow('Participants', PART_COLS, part);
      return normalize(part);
    } finally {
      lock.releaseLock();
    }
  }
  function scan(payload) {
    var lock = LockService.getScriptLock();
    lock.waitLock(8000);
    try {
      var rowNum = findRow('Participants', PART_COLS, payload.id);
      if (rowNum < 0) throw new Error('QR tidak dikenali / peserta tidak terdaftar');
      var p = getParticipant(payload.id);
      var action;
      if (!p.checkIn) { p.checkIn = Date.now(); action = 'checkin'; }
      else if (!p.checkOut) { p.checkOut = Date.now(); action = 'checkout'; }
      else { action = 'done'; }
      if (p.status === 'Tidak Hadir' || p.status === 'Konfirmasi Hadir') p.status = 'Hadir';
      updateRow('Participants', PART_COLS, rowNum, p);
      return { participant: normalize(p), action: action };
    } finally {
      lock.releaseLock();
    }
  }

  return {
    listEvents: listEvents, getEvent: getEvent, createEvent: createEvent,
    updateEvent: updateEvent, deleteEvent: deleteEvent,
    listParticipants: listParticipants, getParticipant: getParticipant,
    rsvp: rsvp, scan: scan
  };
})();
