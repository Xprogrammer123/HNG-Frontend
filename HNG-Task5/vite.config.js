import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path, { resolve } from 'path'

// Custom plugin to remove crossorigin and other attributes for Chrome Extension compatibility
const removeAttributes = () => {
  return {
    name: 'remove-attributes',
    transformIndexHtml(html) {
      return html
        .replace(/crossorigin/g, '')
        .replace(/type="module"/g, 'type="module"'); // keep type module but clean it up
    }
  }
}

export default defineConfig({
  plugins: [react(), removeAttributes()],
  base: './',
  build: {
    modulePreload: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'background/background.js'),
        content: resolve(__dirname, 'content/content.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return '[name]/[name].js';
          }
          return '[name].js';
        },
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
