import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/pharmacy': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customers': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/orders': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/medicines': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})
