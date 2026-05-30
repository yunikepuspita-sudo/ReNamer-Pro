export type ContentType = 'buku' | 'majalah' | 'koran'

export interface Chapter {
  title: string
  /** Paragraphs of body text for the reader. */
  paragraphs: string[]
}

export interface Book {
  id: string
  title: string
  author: string
  publisher: string
  type: ContentType
  category: string
  year: number
  price: number // dalam Rupiah; 0 = gratis
  rating: number // 0-5
  premium: boolean
  /** Dua warna untuk gradien sampul. */
  cover: [string, string]
  synopsis: string
  pages: number
  chapters: Chapter[]
}

export type ReaderTheme = 'terang' | 'gelap' | 'sepia' | 'hijau'
