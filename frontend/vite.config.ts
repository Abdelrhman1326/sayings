import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // true, // enables access via 127.0.0.1, localhost, LAN IP, etc.
    port: 5173, // optional if you want to force a specific port
    proxy: {
      '/apis': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})