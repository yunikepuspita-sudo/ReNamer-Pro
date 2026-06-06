import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Store from './pages/Store'
import Themes from './pages/Themes'
import ThemeDetail from './pages/ThemeDetail'
import BookDetail from './pages/BookDetail'
import Reader from './pages/Reader'
import Library from './pages/Library'
import Premium from './pages/Premium'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'
import IosInstallHint from './components/IosInstallHint'
import WhatsAppFab from './components/WhatsAppFab'

export default function App() {
  return (
    <>
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
                <Route path="/tema" element={<Themes />} />
                <Route path="/tema/:id" element={<ThemeDetail />} />
                <Route path="/buku/:id" element={<BookDetail />} />
                <Route path="/pustaka" element={<Library />} />
                <Route path="/peringkat" element={<Leaderboard />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/masuk" element={<Auth />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFab />
          </div>
        }
      />
    </Routes>
    <IosInstallHint />
    </>
  )
}
