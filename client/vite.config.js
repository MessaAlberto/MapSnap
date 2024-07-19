import react from '@vitejs/plugin-react-swc';
import path from "node:path";
import { defineConfig } from 'vite';
import { EXPRESS_SERVER_API } from './constants';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      components: path.resolve(__dirname, './src/components'),
      pages: path.resolve(__dirname, './src/pages'),
      contexts: path.resolve(__dirname, './src/contexts'),
      style: path.resolve(__dirname, './src/style'),
      socketManager: path.resolve(__dirname, './socketManager.js'),
      constants: path.resolve(__dirname, './constants.js'),
    },
  },
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: EXPRESS_SERVER_API,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      }
    }
  }
})
