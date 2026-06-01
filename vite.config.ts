import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Enable code splitting for lazy-loaded modules
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('CertificatesPage') || id.includes('CertificateLedgerPage') || 
              id.includes('DrcCertificateViewPage') || id.includes('DrcByIdPage')) {
            return 'certificate-pages'
          }
          if (id.includes('DrcHistoryEventDetailPage') || id.includes('DrcHistoryTreePage')) {
            return 'history-pages'
          }
        },
      },
    },
    // Increase chunk size warning limit (in bytes) - 1.5 MB
    chunkSizeWarningLimit: 1536,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
