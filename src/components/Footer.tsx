import { Link } from 'react-router-dom'
import { waChannelLink, waChatLink, hasChannel } from '../lib/whatsapp'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <h4>E-Pustaka Pemilu</h4>
          <p>
            Perpustakaan digital & toko buku bertema demokrasi dan pemilihan umum.
            Baca buku, majalah, dan koran kapan saja, di mana saja.
          </p>
        </div>
        <div>
          <h4>Tentang</h4>
          <p>Versi 1.0.0</p>
          <p>Konten edukatif untuk demonstrasi.</p>
        </div>
        <div>
          <h4>Bantuan</h4>
          <p>customercare@e-pustaka-pemilu.id</p>
          <p>
            <a href={waChatLink('Halo E-Pustaka Pemilu, saya ingin bertanya.')} target="_blank" rel="noopener noreferrer">
              💬 Chat WhatsApp
            </a>
            {hasChannel && (
              <>
                {' · '}
                <a href={waChannelLink()} target="_blank" rel="noopener noreferrer">📢 Saluran WhatsApp</a>
              </>
            )}
          </p>
          <p>Kebijakan Privasi · Syarat Penggunaan</p>
          <p><Link to="/admin">Masuk Admin</Link></p>
        </div>
      </div>
      <div className="footer__bar">© 2024 E-Pustaka Pemilu — proyek demonstrasi non-komersial.</div>
    </footer>
  )
}
