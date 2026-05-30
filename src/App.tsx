import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Store from './pages/Store'
import BookDetail from './pages/BookDetail'
import Reader from './pages/Reader'
import Library from './pages/Library'
import Premium from './pages/Premium'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      {/* Reader tampil layar penuh tanpa navbar/footer. */}
      <Route path="/baca/:id" element={<Reader />} />
      <Route
        path="*"
        element={
          <div className="app-shell">
            <Navbar />
            <main className="content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/toko" element={<Store />} />
                <Route path="/buku/:id" element={<BookDetail />} />
                <Route path="/pustaka" element={<Library />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  )
}
