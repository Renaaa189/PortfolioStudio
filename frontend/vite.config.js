import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_URL = process.env.VITE_API_PROXY || 'http://localhost:4000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Si el puerto está ocupado, falla con un aviso en vez de abrir otro en silencio.
    strictPort: true,
    proxy: {
      '/api': API_URL,
      '/uploads': API_URL,
    },
  },
});
