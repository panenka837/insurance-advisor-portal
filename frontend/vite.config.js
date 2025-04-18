import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    allowedHosts: [
      'localhost',
      '127.0.0.1' // alleen lokale hosts toegestaan
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5002', // lokale backend

        changeOrigin: true,
        secure: false
      }
    }
  }
})
