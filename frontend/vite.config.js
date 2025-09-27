import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001, // Keep the frontend on port 3001
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your backend address
        changeOrigin: true,
      },
    },
  },
});