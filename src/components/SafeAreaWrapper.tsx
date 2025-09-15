import React, { useEffect } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style }) => {
  useEffect(() => {
    const applySafeAreaInsets = () => {
      // بررسی اینکه WebApp SDK تلگرام موجود است
      if (window.Telegram?.WebApp?.getSafeAreaInsets) {
        const insets = window.Telegram.WebApp.getSafeAreaInsets();
        
        // Override CSS variables با مقادیر واقعی از Telegram WebApp API
        const root = document.documentElement;
        root.style.setProperty('--tg-safe-area-inset-top', `${insets.top || 0}px`);
        root.style.setProperty('--tg-safe-area-inset-right', `${insets.right || 0}px`);
        root.style.setProperty('--tg-safe-area-inset-bottom', `${insets.bottom || 0}px`);
        root.style.setProperty('--tg-safe-area-inset-left', `${insets.left || 0}px`);
      }
    };

    // اعمال Safe Area در ابتدا
    applySafeAreaInsets();

    // گوش دادن به تغییرات viewport (برای حالت‌هایی که کاربر صفحه را drag می‌کند)
    if (window.Telegram?.WebApp?.onEvent) {
      window.Telegram.WebApp.onEvent('viewportChanged', applySafeAreaInsets);
    }

    // Cleanup
    return () => {
      if (window.Telegram?.WebApp?.offEvent) {
        window.Telegram.WebApp.offEvent('viewportChanged', applySafeAreaInsets);
      }
    };
  }, []);

  return (
    <div className="app-root" style={style}>
      {children}
    </div>
  );
};

export default SafeAreaWrapper;