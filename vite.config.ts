import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  base: './', // Use relative paths for Telegram Mini Apps
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    // اضافه کردن timestamp برای cache busting کامل
    rollupOptions: {
      output: {
        // اضافه کردن hash برای cache-busting
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          telegram: ['@twa-dev/sdk'],
          i18n: ['react-i18next', 'i18next'],
        },
      },
    },
    // تنظیمات اضافی برای cache busting
    cssCodeSplit: true,
    assetsInlineLimit: 0, // همه assets را به صورت جداگانه ذخیره کن
  },
  server: {
    port: 3000,
    host: true,
    https: false, // Set to true if you need HTTPS for development
    hmr: {
      port: 3000,
    },
    // تنظیمات cache control برای development
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
})
