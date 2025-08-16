import React from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
// import { useTelegramContext } from '../hooks/useTelegramContext';
import { ThemeContext } from './ThemeContextDefinition';
import type { ThemeContextType } from './ThemeContextDefinition';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // const { theme: telegramTheme } = useTelegramContext();
  
  // Force dark theme (light theme temporarily disabled)
  const isDark = true; // telegramTheme === 'dark';
  const currentTheme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => {
    // Note: In Telegram Mini Apps, theme is controlled by Telegram
    // This function is provided for interface compatibility
    console.warn('Theme switching is controlled by Telegram WebApp');
  };

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    isDark,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={currentTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;