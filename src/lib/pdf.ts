import { pdfjs } from 'react-pdf'

// Worker pdf.js di-bundle oleh Vite dan menghormati base path (cocok untuk GitHub Pages).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export { pdfjs }
