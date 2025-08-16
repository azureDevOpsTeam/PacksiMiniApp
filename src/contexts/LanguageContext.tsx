import React, { useCallback } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './LanguageContextDefinition';
import type { LanguageContextType, Language } from './LanguageContextDefinition';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  
  const currentLanguage = i18n.language as Language;
  const isRTL = currentLanguage === 'fa';

  const changeLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
  }, [i18n]);

  const contextValue: LanguageContextType = {
    language: currentLanguage,
    changeLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;