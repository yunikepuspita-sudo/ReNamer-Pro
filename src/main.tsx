import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import App from './App'
import { AppProvider } from './context/AppContext'
import { CatalogProvider } from './context/CatalogContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { initLiveUpdates } from './lib/liveUpdates'

// Beritahu Capgo bahwa bundle web berhasil dimuat (mencegah rollback otomatis).
// Aman dipanggil di web biasa/PWA — akan otomatis dilewati bila bukan native.
initLiveUpdates()

// Service worker (PWA) HANYA untuk web. Di aplikasi native (Capacitor) tidak
// didaftarkan, karena di dalam webview SW membuat halaman tidak responsif dan
// bentrok dengan update OTA Capgo.
if (!Capacitor.isNativePlatform()) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CatalogProvider>
          <AppProvider>
            <App />
          </AppProvider>
        </CatalogProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
)
