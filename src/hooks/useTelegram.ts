import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import type { TelegramUser, TelegramInitData, TelegramContextType } from '../types/telegram';

export const useTelegram = (): TelegramContextType => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);

  const initializeTelegram = useCallback(() => {
    try {

      function applySafeArea() {
        const diff = WebApp.viewportHeight - WebApp.viewportStableHeight;
        document.body.style.paddingTop = diff + "px";
      }

      // یک بار در شروع
      applySafeArea();

      // اگر سایز تغییر کرد (مثلا وقتی کیبورد باز/بسته میشه)
      WebApp.onEvent('viewportChanged', applySafeArea);

      // Set up the app
      // Expand to full screen to hide header
      WebApp.expand();
      // Check if requestFullscreen is supported (available from version 6.1+)
      if (WebApp.platform !== 'tdesktop' &&
        typeof WebApp.requestFullscreen === 'function' &&
        WebApp.version &&
        parseFloat(WebApp.version) >= 6.1) {
        try {
          WebApp.requestFullscreen();
        } catch (error) {
          // requestFullscreen not supported in this version
          console.warn('requestFullscreen not supported in this Telegram WebApp version');
        }
      }
      // Hide header by setting it to transparent/secondary background
      WebApp.setHeaderColor('secondary_bg_color');

      // Set bottom bar color
      WebApp.setBottomBarColor('secondary_bg_color');

      // Disable vertical swipes and enable closing confirmation
      WebApp.disableVerticalSwipes();
      WebApp.enableClosingConfirmation();

      // Add viewport meta tag to disable zoom
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }

      // Get user data
      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user as TelegramUser);
      }

      // Get init data
      if (WebApp.initDataUnsafe) {
        setInitData(WebApp.initDataUnsafe as TelegramInitData);
      }

      // Set theme based on Telegram's color scheme
      setTheme(WebApp.colorScheme === 'dark' ? 'dark' : 'light');

      // Listen for theme changes
      WebApp.onEvent('themeChanged', () => {
        setTheme(WebApp.colorScheme === 'dark' ? 'dark' : 'light');
      });

      setIsReady(true);
      setError(null);
    } catch (error) {
      // Handle Telegram WebApp initialization errors
      const errorMessage = error instanceof Error ? error.message : 'خطا در اتصال به Telegram';
      setError(errorMessage);

      // Log error in development mode
      if (import.meta.env.DEV) {
        // Telegram WebApp initialization error handled silently
      }

      // Still set ready to true for fallback functionality
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    initializeTelegram();

    return () => {
      // Cleanup
      WebApp.offEvent('themeChanged', () => { });
    };
  }, [initializeTelegram]);

  return {
    webApp: WebApp,
    user,
    initData,
    isReady,
    theme,
    error,
  };
};
const applySafeArea = () => {
  if (window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    const diff = tg.viewportHeight - tg.viewportStableHeight;
    document.body.style.paddingTop = `${diff}px`;
  }
};

// یک بار در شروع
applySafeArea();

// اگر سایز تغییر کرد (مثلا وقتی کیبورد باز/بسته میشه)
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.onEvent('viewportChanged', applySafeArea);
}