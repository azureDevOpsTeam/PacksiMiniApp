import React, { useEffect } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style }) => {
  useEffect(() => {
    const applySafeAreaInsets = () => {
      const root = document.documentElement;
      
      // بررسی اینکه WebApp SDK تلگرام موجود است
      if (window.Telegram?.WebApp?.getSafeAreaInsets) {
        try {
          const insets = window.Telegram.WebApp.getSafeAreaInsets();
          
          // Override CSS variables با مقادیر واقعی از Telegram WebApp API
          root.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
          root.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);
          root.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
          root.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
        } catch (error) {
          console.warn('Failed to get safe area insets from Telegram WebApp:', error);
          // Set default values in case of error
          root.style.setProperty('--tg-safe-area-inset-top', '0px');
          root.style.setProperty('--tg-safe-area-inset-right', '0px');
          root.style.setProperty('--tg-safe-area-inset-bottom', '0px');
          root.style.setProperty('--tg-safe-area-inset-left', '0px');
        }
      } else {
        // اگر Telegram WebApp در دسترس نیست، از env() استفاده کن یا مقادیر پیش‌فرض
        console.log('Telegram WebApp not available, using CSS env() values');
      }

      // Set Telegram WebApp viewport height
      if (window.Telegram?.WebApp?.viewportHeight) {
        root.style.setProperty('--tg-viewport-height', `${window.Telegram.WebApp.viewportHeight}px`);
      } else {
        // Fallback to window.innerHeight for better mobile support
        root.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
      }
    };

    // اعمال Safe Area در ابتدا
    applySafeAreaInsets();

    // گوش دادن به تغییرات viewport (برای حالت‌هایی که کاربر صفحه را drag می‌کند)
    if (window.Telegram?.WebApp?.onEvent) {
      window.Telegram.WebApp.onEvent('viewportChanged', applySafeAreaInsets);
    }

    // Listen to window resize for viewport height changes
    const handleResize = () => {
      const root = document.documentElement;
      if (window.Telegram?.WebApp?.viewportHeight) {
        root.style.setProperty('--tg-viewport-height', `${window.Telegram.WebApp.viewportHeight}px`);
      } else {
        root.style.setProperty('--tg-viewport-height', `${window.innerHeight}px`);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        window.Telegram.WebApp.offEvent('viewportChanged', applySafeAreaInsets);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="app-root" style={style}>
      {children}
    </div>
  );
};

export default SafeAreaWrapper;