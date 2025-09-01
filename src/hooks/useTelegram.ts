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
      // Initialize Telegram WebApp
      WebApp.ready();

      // Set up the app
      // Expand to full screen to hide header
      WebApp.expand();
      if (WebApp.platform !== 'tdesktop')
        WebApp.requestFullscreen();
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