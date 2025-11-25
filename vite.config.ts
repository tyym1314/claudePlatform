import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/java/api': {
        target: 'https://similar-dev.zykjnow.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/java\/api/, '/halla-operation-manager-platform/java/api')
      }
    }
  }
})
