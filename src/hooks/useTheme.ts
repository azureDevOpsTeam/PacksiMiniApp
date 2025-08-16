import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContextDefinition';
import type { ThemeContextType } from '../contexts/ThemeContextDefinition';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};