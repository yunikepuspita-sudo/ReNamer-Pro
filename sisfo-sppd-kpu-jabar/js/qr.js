/* ===========================================================================
   qr.js — Render QR Code untuk validasi dokumen.
   Memuat pustaka 'qrcode' dari CDN (di-cache Service Worker untuk dukungan
   offline setelah kunjungan pertama). Jika gagal/ offline pada kunjungan
   pertama, menampilkan token validasi sebagai teks (graceful fallback).
   Untuk deployment air-gapped, vendor berkas qrcode.min.js ke folder /js.
   ========================================================================= */

const CDN = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
let loader = null;

function loadLib() {
  if (window.QRCode) return Promise.resolve(window.QRCode);
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = CDN; s.async = true;
    s.onload = () => resolve(window.QRCode);
    s.onerror = () => reject(new Error('Gagal memuat pustaka QR'));
    document.head.appendChild(s);
  });
  return loader;
}

/* Render QR ke dalam container (mengganti isinya). */
export async function renderQR(container, text, size = 96) {
  if (!container) return;
  try {
    const QR = await loadLib();
    const canvas = document.createElement('canvas');
    container.innerHTML = '';
    container.appendChild(canvas);
    await QR.toCanvas(canvas, text, { width: size, margin: 1, color: { dark: '#0b2447', light: '#ffffff' } });
  } catch (e) {
    container.innerHTML = `<div class="qr-fallback">QR tidak tersedia offline.<br><b>${text}</b></div>`;
  }
}
