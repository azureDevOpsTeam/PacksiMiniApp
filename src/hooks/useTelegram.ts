import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import type { TelegramUser, TelegramInitData, TelegramContextType } from '../types/telegram';

export const useTelegram = (): TelegramContextType => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [initData, setInitData] = useState<TelegramInitData | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const initializeTelegram = useCallback(() => {
    try {
      // Initialize Telegram WebApp
      WebApp.ready();

      // Set up the app
      if (!WebApp.isExpanded && (WebApp.platform === 'ios' || WebApp.platform === 'android')) {
        WebApp.expand();
      }
      WebApp.disableVerticalSwipes();
      WebApp.enableClosingConfirmation();

      // Disable zoom functionality
      WebApp.setHeaderColor('#1a1a1a');

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
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      // Fallback for development
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
  };
};