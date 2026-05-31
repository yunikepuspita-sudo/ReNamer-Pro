import { Link } from 'react-router-dom'
import type { Book } from '../types'
import { formatRupiah } from '../data/books'
import PdfCover from './PdfCover'

export default function BookCard({ book }: { book: Book }) {
  return (
    <Link to={`/buku/${book.id}`} className="book-card">
      <PdfCover book={book} />
      <div className="book-card__body">
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">{book.author}</p>
        <div className="book-card__meta">
          <span className="rating">★ {book.rating.toFixed(1)}</span>
          <span className={book.price === 0 ? 'price price--free' : 'price'}>
            {formatRupiah(book.price)}
          </span>
        </div>
      </div>
    </Link>
  )
}
