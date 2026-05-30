import type { Book } from '../types'

/** Sampul buku berbasis gradien — tidak butuh aset gambar eksternal. */
export default function BookCover({ book, size = 'md' }: { book: Book; size?: 'sm' | 'md' | 'lg' }) {
  const heights = { sm: 150, md: 210, lg: 320 }
  const fonts = { sm: 13, md: 15, lg: 22 }
  const h = heights[size]
  const typeLabel = { buku: 'BUKU', majalah: 'MAJALAH', koran: 'KORAN' }[book.type]

  return (
    <div
      className="book-cover"
      style={{
        height: h,
        background: `linear-gradient(145deg, ${book.cover[0]}, ${book.cover[1]})`,
      }}
      aria-hidden="true"
    >
      <span className="book-cover__type">{typeLabel}</span>
      <span className="book-cover__title" style={{ fontSize: fonts[size] }}>
        {book.title}
      </span>
      <span className="book-cover__author">{book.author}</span>
      {book.premium && <span className="book-cover__premium">PREMIUM</span>}
    </div>
  )
}
