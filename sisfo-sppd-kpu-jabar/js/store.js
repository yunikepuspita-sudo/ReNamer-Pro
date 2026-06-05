/* ===========================================================================
   store.js — Lapisan data berbasis localStorage.
   Semua data aplikasi disimpan lokal di perangkat (offline-first, gratis,
   tanpa backend). Cocok untuk MVP/demo. Untuk produksi multi-user, lapisan
   ini dapat diganti dengan API tanpa mengubah pemanggilnya.
   ========================================================================= */

const NS = 'sppd_kpujabar';
const KEY = (c) => `${NS}:${c}`;

function read(collection, fallback) {
  try {
    const raw = localStorage.getItem(KEY(collection));
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn('Gagal membaca koleksi', collection, e);
    return fallback;
  }
}

function write(collection, value) {
  try {
    localStorage.setItem(KEY(collection), JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Gagal menyimpan (mungkin kuota localStorage penuh)', e);
    return false;
  }
}

export const store = {
  get: (c, fallback = []) => read(c, fallback),
  set: (c, v) => write(c, v),

  list(c) { return read(c, []); },
  find(c, id) { return read(c, []).find((x) => x.id === id) || null; },

  upsert(c, record) {
    const items = read(c, []);
    const i = items.findIndex((x) => x.id === record.id);
    if (i >= 0) items[i] = record; else items.push(record);
    write(c, items);
    return record;
  },

  remove(c, id) {
    const items = read(c, []).filter((x) => x.id !== id);
    write(c, items);
  },

  // Preferensi sederhana (key/value).
  pref(key, value) {
    const prefs = read('prefs', {});
    if (value === undefined) return prefs[key];
    prefs[key] = value; write('prefs', prefs); return value;
  },

  meta() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(NS)) total += (localStorage.getItem(k) || '').length;
    }
    return { bytes: total * 2 }; // perkiraan (UTF-16)
  },

  reset() {
    const toDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(NS)) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  },
};

/* ID unik ringkas. */
export function uid(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* Nomor surat berurutan per jenis & tahun (mis. ST, SPPD). */
export function nextNumber(kind) {
  const counters = store.get('counters', {});
  const year = new Date().getFullYear();
  const k = `${kind}-${year}`;
  counters[k] = (counters[k] || 0) + 1;
  store.set('counters', counters);
  return { seq: counters[k], year };
}
