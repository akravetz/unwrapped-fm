import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    https: {
      key: '../backend/certs/localhost.key',
      cert: '../backend/certs/localhost.crt',
    },
    port: 5174,
    host: true
  },
})
