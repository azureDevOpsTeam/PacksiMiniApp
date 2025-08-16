import React, { ReactNode } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../styles/theme';
import { useTelegramContext } from '../hooks/useTelegramContext';
import { ThemeContext, ThemeContextType } from './ThemeContextDefinition';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme: telegramTheme } = useTelegramContext();
  
  const isDark = telegramTheme === 'dark';
  const currentTheme = isDark ? darkTheme : lightTheme;

  const contextValue: ThemeContextType = {
    theme: currentTheme,
    isDark,
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