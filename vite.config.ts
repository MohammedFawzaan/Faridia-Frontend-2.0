import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  server: {
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': { target: process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:3000', changeOrigin: true },
    },
  },
})
