import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH GitHub Actions se aata hai (repo name ke hisaab se).
// Local dev mein '/' rahega.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH || '/',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
  preview: {
    allowedHosts: ['.e2b.app'],
  },
  server: {
    allowedHosts: ['.e2b.app'],
  },
})
