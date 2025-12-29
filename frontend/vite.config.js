import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['mermaid'],
  },
  resolve: {
    alias: {
      // Asegurar que mermaid use imports estáticos cuando sea posible
      '@mermaid-js/mermaid': 'mermaid',
    },
  },
})
