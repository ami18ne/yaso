import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'client'),
  plugins: [react()],
  server: {
    host: true,
    port: 5000,
    // Disable HMR - works fine with manual refresh in Codespaces
    hmr: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
})
