import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig, loadEnv} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({mode}) => {
  // Load .env from the project root (one level up from frontend/)
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');
  return {
    root: __dirname,
    base: '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    build: {
      // Output to the project root dist/ directory
      outDir: path.resolve(__dirname, '../dist'),
      emptyOutDir: true,
      chunkSizeWarningLimit: 1000,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react': path.resolve(__dirname, '../node_modules/react'),
        'react-dom': path.resolve(__dirname, '../node_modules/react-dom'),
      },
      dedupe: ['react', 'react-dom', 'react-router-dom'],
    },
    server: {
      port: 5173,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/health': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/ping': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/hello': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  };
});
