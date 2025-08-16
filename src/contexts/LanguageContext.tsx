import React, { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from './LanguageContextDefinition';
import type { LanguageContextType, Language } from './LanguageContextDefinition';
import { useTelegramContext } from '../hooks/useTelegramContext';

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, isReady } = useTelegramContext();
  
  const currentLanguage = i18n.language as Language;
  const isRTL = currentLanguage === 'fa';

  // Update language when Telegram user data is available
  useEffect(() => {
    if (isReady && user?.language_code) {
      const langCode = user.language_code.toLowerCase();
      let targetLang: Language = 'en';
      
      if (langCode.startsWith('fa') || langCode.startsWith('pe')) {
        targetLang = 'fa';
      }
      
      // Only change if different from current language
      if (targetLang !== currentLanguage) {
        i18n.changeLanguage(targetLang);
      }
    }
  }, [isReady, user?.language_code, currentLanguage, i18n]);

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