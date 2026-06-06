import { waChannelLink, hasChannel, WA_CHANNEL_NAME } from '../lib/whatsapp'

/**
 * Banner ajakan mengikuti Saluran WhatsApp (Channel).
 * Tempatkan di Beranda untuk mendorong pengguna berlangganan broadcast
 * koleksi & e-book baru. Otomatis sembunyi jika saluran belum dikonfigurasi.
 */
export default function WhatsAppChannel() {
  if (!hasChannel) return null

  return (
    <section className="wa-channel" aria-label="Saluran WhatsApp">
      <div className="wa-channel__text">
        <span className="wa-channel__badge">📢 SALURAN WHATSAPP</span>
        <h2>Jadi yang pertama tahu koleksi baru</h2>
        <p>
          Ikuti saluran <strong>{WA_CHANNEL_NAME}</strong> di WhatsApp untuk update e-book,
          majalah, dan jadwal sosialisasi pemilu — langsung di tab Pembaruan. Gratis,
          tanpa spam, dan nomormu tetap privat.
        </p>
      </div>
      <a
        className="wa-channel__btn"
        href={waChannelLink()}
        target="_blank"
        rel="noopener noreferrer"
      >
        Ikuti Saluran
      </a>
    </section>
  )
}
