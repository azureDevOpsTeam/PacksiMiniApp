import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './locales/i18n' // Initialize i18n

// Register Service Worker for PWA with improved cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // پاک کردن تمام cache های قدیمی
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.startsWith('packsi-pwa-v')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );

      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, automatically update
                console.log('New version available, updating...');
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              } else {
                // First time installation
                console.log('App is ready for offline use');
              }
            }
          });
        }
      });

      // بررسی به‌روزرسانی فوری
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service Worker updated, reloading...');
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
