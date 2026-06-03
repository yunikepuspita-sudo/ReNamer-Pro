import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Jangan suntik registrasi SW otomatis ke index.html — kita daftarkan
      // manual HANYA di web (lihat src/main.tsx). Di aplikasi native (Capacitor),
      // service worker dimatikan karena membuat webview tidak responsif/konflik
      // dengan update OTA Capgo.
      injectRegister: false,
      includeAssets: ['vite.svg', 'icons/*.png', 'ebooks/*.pdf'],
      manifest: {
        name: 'E-Pustaka Pemilu',
        short_name: 'E-Pustaka',
        description:
          'Perpustakaan digital & toko buku bertema demokrasi dan pemilihan umum.',
        lang: 'id',
        theme_color: '#1e40af',
        background_color: '#1e40af',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // PDF/worker bisa besar; naikkan batas agar ikut di-precache.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,pdf}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
})
