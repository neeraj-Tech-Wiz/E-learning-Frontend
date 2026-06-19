// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Use the actual Ngrok URL here (without the /api part)
const NGROK_HOST = 'https://unquerulous-chae-uncharitably.ngrok-free.app';

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api': {
        target: NGROK_HOST,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // chunk-splitting setup
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split node_modules libs into separate chunks
          if (id.includes('node_modules')) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },

    // Optional: raise warning limit (no more warnings)
    chunkSizeWarningLimit: 1200,
  },
});
