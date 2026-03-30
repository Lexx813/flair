import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/oauth2': {
        target: 'https://api.flair.co',
        changeOrigin: true,
      },
      '/api': {
        target: 'https://api.flair.co',
        changeOrigin: true,
      },
    },
  },
})
