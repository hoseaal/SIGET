import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/soporte/',
  server: {
    proxy: {
      '/api/sp': 'http://localhost:5003/',
      '/uploads': 'http://localhost:5003/',
    },
  },
});