import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface SafeAreaContextType {
  insets: SafeAreaInsets;
  isReady: boolean;
}

const SafeAreaContext = createContext<SafeAreaContextType | undefined>(undefined);

interface SafeAreaProviderProps {
  children: ReactNode;
}

const SafeAreaProvider: React.FC<SafeAreaProviderProps> = ({ children }) => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateInsets = () => {
      // Get safe area insets from CSS environment variables
      const computedStyle = getComputedStyle(document.documentElement);
      
      const top = parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0', 10);
      const bottom = parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0', 10);
      const left = parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0', 10);
      const right = parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0', 10);

      // Fallback to CSS env() values if custom properties are not set
      if (top === 0 && bottom === 0 && left === 0 && right === 0) {
        // Create a temporary element to test env() values
        const testElement = document.createElement('div');
        testElement.style.position = 'fixed';
        testElement.style.top = '0';
        testElement.style.left = '0';
        testElement.style.width = '1px';
        testElement.style.height = '1px';
        testElement.style.visibility = 'hidden';
        testElement.style.paddingTop = 'env(safe-area-inset-top)';
        testElement.style.paddingBottom = 'env(safe-area-inset-bottom)';
        testElement.style.paddingLeft = 'env(safe-area-inset-left)';
        testElement.style.paddingRight = 'env(safe-area-inset-right)';
        
        document.body.appendChild(testElement);
        
        const computedTestStyle = getComputedStyle(testElement);
        const envTop = parseInt(computedTestStyle.paddingTop, 10) || 0;
        const envBottom = parseInt(computedTestStyle.paddingBottom, 10) || 0;
        const envLeft = parseInt(computedTestStyle.paddingLeft, 10) || 0;
        const envRight = parseInt(computedTestStyle.paddingRight, 10) || 0;
        
        document.body.removeChild(testElement);
        
        setInsets({
          top: envTop,
          bottom: envBottom,
          left: envLeft,
          right: envRight,
        });
      } else {
        setInsets({ top, bottom, left, right });
      }
      
      setIsReady(true);
    };

    // Initial update
    updateInsets();

    // Listen for viewport changes
    const handleResize = () => {
      updateInsets();
    };

    const handleOrientationChange = () => {
      // Delay to ensure the viewport has updated
      setTimeout(updateInsets, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // For iOS Safari, also listen to visual viewport changes
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  // Set CSS custom properties for global use
  useEffect(() => {
    if (isReady) {
      document.documentElement.style.setProperty('--safe-area-inset-top', `${insets.top}px`);
      document.documentElement.style.setProperty('--safe-area-inset-bottom', `${insets.bottom}px`);
      document.documentElement.style.setProperty('--safe-area-inset-left', `${insets.left}px`);
      document.documentElement.style.setProperty('--safe-area-inset-right', `${insets.right}px`);
    }
  }, [insets, isReady]);

  const value: SafeAreaContextType = {
    insets,
    isReady,
  };

  return (
    <SafeAreaContext.Provider value={value}>
      {children}
    </SafeAreaContext.Provider>
  );
};

const useSafeArea = (): SafeAreaContextType => {
  const context = useContext(SafeAreaContext);
  if (context === undefined) {
    throw new Error('useSafeArea must be used within a SafeAreaProvider');
  }
  return context;
};

export { SafeAreaProvider, useSafeArea };
export type { SafeAreaInsets, SafeAreaContextType };