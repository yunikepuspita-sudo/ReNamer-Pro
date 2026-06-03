/* ============================================================================
 * Smart Attendance Event — Google Apps Script backend (Code.gs)
 *
 * Router Web App: menerima request dari PWA dan meneruskan ke SheetService.
 *   - GET  ?action=...   → operasi baca  (listEvents, getEvent, listParticipants, ...)
 *   - POST { action, payload } (Content-Type: text/plain) → operasi tulis
 *
 * SETUP SINGKAT
 * 1. Buka https://sheets.google.com → buat Spreadsheet baru.
 * 2. Extensions → Apps Script. Hapus isi default, buat 2 file:
 *      Code.gs          (file ini)
 *      SheetService.gs  (file pendamping)
 * 3. Deploy → New deployment → Type: "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Salin URL "…/exec".
 * 4. Tempel URL tersebut di PWA: Admin → Pengaturan → URL Apps Script Web App.
 *
 * Semua respons berformat JSON: { ok: true, data } atau { ok: false, error }.
 * ==========================================================================*/

function doGet(e) {
  return handle((e && e.parameter && e.parameter.action) || '', e && e.parameter || {}, null);
}

function doPost(e) {
  var body = {};
  try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); } catch (err) {}
  return handle(body.action || '', body.payload || {}, body.payload || {});
}

function handle(action, params, payload) {
  try {
    var data;
    switch (action) {
      // -------- baca --------
      case 'ping':             data = { time: new Date().toISOString() }; break;
      case 'listEvents':       data = SheetService.listEvents(); break;
      case 'getEvent':         data = SheetService.getEvent(params.id); break;
      case 'listParticipants': data = SheetService.listParticipants(params.eventId); break;
      case 'getParticipant':   data = SheetService.getParticipant(params.id); break;
      // -------- tulis --------
      case 'createEvent':      data = SheetService.createEvent(payload); break;
      case 'updateEvent':      data = SheetService.updateEvent(payload.id, payload.patch); break;
      case 'deleteEvent':      data = SheetService.deleteEvent(payload.id); break;
      case 'rsvp':             data = SheetService.rsvp(payload); break;
      case 'scan':             data = SheetService.scan(payload); break;
      default: throw new Error('Aksi tidak dikenal: ' + action);
    }
    return json({ ok: true, data: data });
  } catch (err) {
    return json({ ok: false, error: String(err && err.message || err) });
  }
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
