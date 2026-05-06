import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'background/background.js'),
        content: path.resolve(__dirname, 'content/content.js'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background' || chunk.name === 'content') {
            return '[name]/[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
})
