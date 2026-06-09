import type { ContentType } from '../types'

export interface UploadRecord {
  id: string
  title: string
  author: string
  type: ContentType
  /** Nama berkas tersaran (konvensi Tahun_Penulis_Judul); default = nama asli. */
  filename: string
  size: number
  createdAt: number
  blob: Blob
}

const DB_NAME = 'e-pustaka-uploads'
const STORE = 'ebooks'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function addUpload(
  file: File,
  meta: { title: string; author: string; type: ContentType; filename?: string },
): Promise<UploadRecord> {
  const record: UploadRecord = {
    id: 'up-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
    title: meta.title || file.name.replace(/\.pdf$/i, ''),
    author: meta.author || 'Tidak diketahui',
    type: meta.type,
    filename: meta.filename?.trim() || file.name,
    size: file.size,
    createdAt: Date.now(),
    blob: file,
  }
  const db = await openDB()
  await request(db.transaction(STORE, 'readwrite').objectStore(STORE).put(record))
  db.close()
  return record
}

export async function listUploads(): Promise<UploadRecord[]> {
  const db = await openDB()
  const all = await request<UploadRecord[]>(
    db.transaction(STORE, 'readonly').objectStore(STORE).getAll(),
  )
  db.close()
  return all.sort((a, b) => b.createdAt - a.createdAt)
}

export async function getUpload(id: string): Promise<UploadRecord | undefined> {
  const db = await openDB()
  const rec = await request<UploadRecord | undefined>(
    db.transaction(STORE, 'readonly').objectStore(STORE).get(id),
  )
  db.close()
  return rec
}

export async function deleteUpload(id: string): Promise<void> {
  const db = await openDB()
  await request(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id))
  db.close()
}

/** Gradien sampul deterministik dari id, agar ebook unggahan tetap punya sampul. */
export function uploadCover(id: string): [string, string] {
  const palettes: [string, string][] = [
    ['#1e3a8a', '#3b82f6'],
    ['#047857', '#10b981'],
    ['#7c2d12', '#ea580c'],
    ['#581c87', '#a855f7'],
    ['#9d174d', '#ec4899'],
    ['#0e7490', '#06b6d4'],
    ['#c2410c', '#fbbf24'],
    ['#155e75', '#22d3ee'],
  ]
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return palettes[h % palettes.length]
}
