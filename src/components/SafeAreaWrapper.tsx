import React, { useEffect, useState } from 'react';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style }) => {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    // بررسی اینکه WebApp SDK تلگرام موجود است
    if (window.Telegram?.WebApp?.getSafeAreaInsets) {
      const insets = window.Telegram.WebApp.getSafeAreaInsets();
      setBottomInset(insets.bottom || 0);
    }
  }, []);

  return (
    <div
      style={{
        paddingBottom: bottomInset,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default SafeAreaWrapper;