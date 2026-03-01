import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // No CSP in dev - allows fonts, localhost, and blob for voice recording
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  },
  // Production build includes CSP in the HTML
  build: {
    minify: 'terser'
  }
})
