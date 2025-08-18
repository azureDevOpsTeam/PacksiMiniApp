import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import WebApp from '@twa-dev/sdk';

// Import translation files
import enTranslations from './en.json';
import faTranslations from './fa.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fa: {
    translation: faTranslations,
  },
};

// Function to get Telegram user language
const getTelegramLanguage = (): string => {
  try {
    const user = WebApp.initDataUnsafe?.user;
    if (user?.language_code) {
      // Map common language codes to our supported languages
      const langCode = user.language_code.toLowerCase();
      if (langCode.startsWith('fa') || langCode.startsWith('pe')) {
        return 'fa';
      }
      // Default to English for other languages
      return 'en';
    }
  } catch {
    // Could not get Telegram language - fallback to default
  }
  return 'en'; // fallback
};

// Get initial language from Telegram (used as fallback)
const getTelegramLanguageAsFallback = (): string => {
  // Check if there's a saved language preference first
  const savedLanguage = localStorage.getItem('i18nextLng');
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fa')) {
    return savedLanguage;
  }
  
  // If no saved preference, use Telegram language
  return getTelegramLanguage();
};

const initialLanguage = getTelegramLanguageAsFallback();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage, // Use saved preference or Telegram language
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // RTL support
    react: {
      useSuspense: false,
    },
  });

// Set document direction based on language
i18n.on('languageChanged', (lng) => {
  const isRTL = lng === 'fa';
  document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
const isRTL = i18n.language === 'fa';
document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;