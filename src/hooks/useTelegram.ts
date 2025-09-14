import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import type { TelegramUser, TelegramInitData, TelegramContextType } from '../types/telegram';

export const useTelegram = (): TelegramContextType => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [error, setError] = useState<string | null>(null);

  // --- Safe area handler ---
  const applySafeArea = useCallback(() => {
    const diff = WebApp.viewportHeight - WebApp.viewportStableHeight;
    document.body.style.paddingTop = diff + 'px';
  }, []);

  // --- Theme handler ---
  const handleThemeChange = useCallback(() => {
    setTheme(WebApp.colorScheme === 'dark' ? 'dark' : 'light');
  }, []);

  // --- Initialization ---
  const initializeTelegram = useCallback(() => {
    try {
      // Expand to full screen
      WebApp.expand();

      // Request fullscreen (if supported)
      if (
        WebApp.platform !== 'tdesktop' &&
        typeof WebApp.requestFullscreen === 'function' &&
        WebApp.version &&
        parseFloat(WebApp.version) >= 6.1
      ) {
        try {
          WebApp.requestFullscreen();
        } catch {
          console.warn('requestFullscreen not supported in this Telegram WebApp version');
        }
      }

      // Apply safe area
      applySafeArea();
      WebApp.onEvent('viewportChanged', applySafeArea);

      // UI tweaks
      WebApp.setHeaderColor('secondary_bg_color');
      WebApp.setBottomBarColor('secondary_bg_color');
      WebApp.disableVerticalSwipes();
      WebApp.enableClosingConfirmation();

      // Ensure viewport meta
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      } else {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content =
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }

      // User & initData
      if (WebApp.initDataUnsafe?.user) {
        setUser(WebApp.initDataUnsafe.user as TelegramUser);
      }
      if (WebApp.initDataUnsafe) {
        setInitData(WebApp.initDataUnsafe as TelegramInitData);
      }

      // Theme setup
      handleThemeChange();
      WebApp.onEvent('themeChanged', handleThemeChange);

      setIsReady(true);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'خطا در اتصال به Telegram';
      setError(errorMessage);

      if (import.meta.env.DEV) {
        console.error('Telegram WebApp initialization error:', err);
      }

      setIsReady(true); // fallback
    }
  }, [applySafeArea, handleThemeChange]);

  // --- Lifecycle ---
  useEffect(() => {
    initializeTelegram();

    return () => {
      WebApp.offEvent('viewportChanged', applySafeArea);
      WebApp.offEvent('themeChanged', handleThemeChange);
    };
  }, [initializeTelegram, applySafeArea, handleThemeChange]);

  return {
    webApp: WebApp,
    user,
    initData,
    isReady,
    theme,
    error,
  };
};
