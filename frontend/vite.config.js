import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Keep the frontend on port 3001
    port: 3001, 
    proxy: {
      '/api': {
        // Your backend address
        
        target: 'http://localhost:5000', 
        changeOrigin: true,
      },
    },
  },
});