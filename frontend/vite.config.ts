import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    allowedHosts: [
      'frontend-production-3f90.up.railway.app',
      '.up.railway.app',
      'localhost',
    ],
  },
})
