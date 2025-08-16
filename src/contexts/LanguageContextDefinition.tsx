import { createContext } from 'react';

export interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);