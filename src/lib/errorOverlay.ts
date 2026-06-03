/**
 * Penampil error di layar — khusus untuk debugging di HP (di mana kita tidak
 * bisa melihat console). Menangkap error JS & promise yang gagal, lalu
 * menampilkannya sebagai banner merah di bawah layar. Tidak melakukan apa-apa
 * jika tidak ada error.
 */
export function installErrorOverlay(): void {
  const show = (label: string, detail: string) => {
    let el = document.getElementById('__err_overlay__')
    if (!el) {
      el = document.createElement('div')
      el.id = '__err_overlay__'
      el.style.cssText =
        'position:fixed;left:0;right:0;bottom:0;max-height:60%;overflow:auto;' +
        'z-index:2147483647;background:#b91c1c;color:#fff;' +
        'font:12px/1.45 monospace;padding:10px;white-space:pre-wrap;'
      document.body.appendChild(el)
    }
    el.textContent = `[${label}] ${detail}\n\n` + (el.textContent || '')
  }

  window.addEventListener('error', (e) => {
    const err = (e as ErrorEvent).error
    show('ERROR', (err && (err.stack || err.message)) || (e as ErrorEvent).message || String(e))
  })

  window.addEventListener('unhandledrejection', (e) => {
    const r = (e as PromiseRejectionEvent).reason
    show('PROMISE', (r && (r.stack || r.message)) || String(r))
  })
}
