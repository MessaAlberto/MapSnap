import react from '@vitejs/plugin-react-swc';
import path from "node:path";
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
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
          target: env.VITE_API_BASE_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  };
});
