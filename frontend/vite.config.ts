import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
    // Resolve .tsx/.ts before .js so TypeScript files take priority over compiled JS duplicates
    extensions: ['.mjs', '.mts', '.tsx', '.ts', '.jsx', '.js', '.json', '.vue'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
