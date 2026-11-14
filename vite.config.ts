import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Allow GitHub Codespaces forwarded hostnames (<name>-3000.app.github.dev).
    // localhost keeps working as before.
    allowedHosts: ['.app.github.dev'],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
