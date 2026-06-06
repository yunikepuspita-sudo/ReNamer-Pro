// ──────────────────────────────────────────────────────────────────────────
// Integrasi WhatsApp untuk E-Pustaka Pemilu
//
// Modul terpusat untuk seluruh fitur WhatsApp di situs:
//   • Saluran WhatsApp (Channel) — broadcast info buku & koleksi baru.
//   • Click-to-chat (wa.me)       — tombol layanan pelanggan / customer care.
//   • Bagikan (share)             — sebar judul buku ke chat, grup, atau status.
//
// Semua nilai bisa di-override lewat variabel lingkungan Vite di file `.env`
// (lihat `.env.example`). Jika tidak diisi, dipakai nilai contoh di bawah.
//
// Tentang WhatsApp Channel / Saluran:
//   Saluran adalah kanal broadcast satu-arah (mirip "follow" di media sosial).
//   Cocok untuk perpustakaan: kirim pengumuman koleksi baru, e-book gratis,
//   atau jadwal sosialisasi pemilu ke ribuan pengikut tanpa menyimpan nomor
//   mereka. Pengikut anonim, jadi ramah privasi.
//   Buat saluran di WhatsApp → tab "Pembaruan" → "+" → "Saluran baru", lalu
//   salin tautan bagikannya (bentuk: https://whatsapp.com/channel/xxxxxxxx).
// ──────────────────────────────────────────────────────────────────────────

const env = import.meta.env

/** Nomor WhatsApp customer care, format internasional tanpa "+", spasi, atau "-".
 *  Contoh untuk Indonesia: 628123456789 (bukan 08123456789). */
export const WA_PHONE: string = (env.VITE_WA_PHONE as string | undefined)?.replace(/[^0-9]/g, '') || '6289617061983'

/** Tautan Saluran WhatsApp (Channel). Kosongkan jika belum punya saluran. */
export const WA_CHANNEL_URL: string =
  (env.VITE_WA_CHANNEL_URL as string | undefined) || 'https://whatsapp.com/channel/ePustakaPemilu'

/** Nama saluran yang ditampilkan ke pengguna. */
export const WA_CHANNEL_NAME: string =
  (env.VITE_WA_CHANNEL_NAME as string | undefined) || 'E-Pustaka Pemilu'

/** Apakah saluran sudah dikonfigurasi (bukan placeholder bawaan). */
export const hasChannel: boolean = /\/channel\/[0-9A-Za-z]{8,}/.test(WA_CHANNEL_URL) && !/0{20,}/.test(WA_CHANNEL_URL)

/** URL dasar situs untuk menyusun tautan berbagi. */
export const SITE_URL: string =
  (env.VITE_SITE_URL as string | undefined) || 'https://pustaka.yunikepuspita.com'

/**
 * Tautan click-to-chat (wa.me) ke nomor customer care.
 * @param message Pesan awal yang sudah terisi di kolom chat pengguna.
 */
export function waChatLink(message?: string): string {
  const base = `https://wa.me/${WA_PHONE}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/**
 * Tautan "bagikan" universal WhatsApp. Membuka daftar kontak/grup agar
 * pengguna memilih tujuan, dengan teks sudah terisi.
 */
export function waShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

/** Tautan untuk mengikuti / membuka Saluran WhatsApp. */
export function waChannelLink(): string {
  return WA_CHANNEL_URL
}

/** Bentuk URL detail buku yang bisa dibagikan (HashRouter → pakai #). */
export function bookUrl(bookId: string): string {
  return `${SITE_URL.replace(/\/$/, '')}/#/buku/${bookId}`
}

/** Teks ajakan berbagi sebuah judul ke WhatsApp. */
export function shareBookText(opts: { title: string; author: string; id: string }): string {
  return (
    `📚 *${opts.title}* — ${opts.author}\n` +
    `Baca di E-Pustaka Pemilu, perpustakaan digital bertema demokrasi & pemilu.\n` +
    `${bookUrl(opts.id)}`
  )
}
