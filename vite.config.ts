import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 8888,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('pdfjs-dist') || id.includes('jspdf')) {
                return 'pdf-vendor';
              }
              if (id.includes('three') || id.includes('cobe')) {
                return 'three-vendor';
              }
              if (id.includes('openai') || id.includes('@google/genai') || id.includes('@openrouter/sdk')) {
                return 'ai-vendor';
              }
              if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('motion')) {
                return 'ui-vendor';
              }
              if (id.includes('firebase')) {
                return 'firebase-vendor';
              }
              if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
                return 'react-vendor';
              }
            }
          }
        }
      }
    }
  };
});
