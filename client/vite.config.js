import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// In development, /api is proxied to the Express server, so there are no CORS headaches locally.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:5000' },
  },
});
