import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './context/AppContext'
import { CatalogProvider } from './context/CatalogContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import { initLiveUpdates } from './lib/liveUpdates'

// Beritahu Capgo bahwa bundle web berhasil dimuat (mencegah rollback otomatis).
// Aman dipanggil di web biasa/PWA — akan otomatis dilewati bila bukan native.
initLiveUpdates()

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
