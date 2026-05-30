import type { Book } from '../types'
import BookCard from './BookCard'

/** Rak buku horizontal dengan judul dan tautan "Lihat semua" opsional. */
export default function Shelf({
  title,
  books,
  emptyText,
}: {
  title: string
  books: Book[]
  emptyText?: string
}) {
  return (
    <section className="shelf">
      <h2 className="shelf__title">{title}</h2>
      {books.length === 0 ? (
        <p className="shelf__empty">{emptyText ?? 'Belum ada item.'}</p>
      ) : (
        <div className="shelf__row">
          {books.map((b) => (
            <BookCard key={b.id} book={b} />
          ))}
        </div>
      )}
    </section>
  )
}
