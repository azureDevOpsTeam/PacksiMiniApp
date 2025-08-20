import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './locales/i18n' // Initialize i18n

// Register Service Worker for PWA with improved cache management
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // پاک کردن cache های قدیمی فقط در صورت وجود service worker جدید
      const cleanOldCaches = async () => {
        const cacheNames = await caches.keys();
        const currentCacheName = 'packsi-pwa-v1.0.0';
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.startsWith('packsi-pwa-v') && cacheName !== currentCacheName) {
              // Cache deleted silently
              return caches.delete(cacheName);
            }
          })
        );
      };

      const registration = await navigator.serviceWorker.register('/sw.js');
      // Service Worker registered
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content is available, clean old caches and update
                // New version available, updating
                cleanOldCaches();
                newWorker.postMessage({ type: 'SKIP_WAITING' });
              } else {
                // First time installation
                // App ready for offline use
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
      // Service Worker registration failed
    }
  });

  // Handle service worker updates
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Service Worker updated, reloading
    window.location.reload();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
