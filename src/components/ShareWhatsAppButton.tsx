import { waShareLink, shareBookText } from '../lib/whatsapp'

/**
 * Tombol "Bagikan via WhatsApp" untuk sebuah judul.
 * Membuka WhatsApp dengan teks promosi + tautan buku, siap dikirim ke
 * chat, grup, atau status.
 */
export default function ShareWhatsAppButton({
  book,
  className = 'btn btn--ghost',
}: {
  book: { id: string; title: string; author: string }
  className?: string
}) {
  const text = shareBookText({ id: book.id, title: book.title, author: book.author })
  return (
    <a
      className={className}
      href={waShareLink(text)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Bagikan ${book.title} via WhatsApp`}
    >
      <span aria-hidden="true">📲</span> Bagikan via WhatsApp
    </a>
  )
}
