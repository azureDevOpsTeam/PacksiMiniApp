import React from 'react';
import TelegramProvider from './contexts/TelegramContext';
import ThemeProvider from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTelegramContext } from './hooks/useTelegramContext';
import { useLanguage } from './hooks/useLanguage';

// Main App Content Component
const AppContent: React.FC = () => {
  const { user, isReady } = useTelegramContext();
  const { t } = useLanguage();

  if (!isReady) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>{t('app.title')}</h1>
      <p>{t('app.welcome')}</p>
      {user && (
        <div style={{ marginTop: '20px' }}>
          <p>{t('user.firstName')}: {user.first_name}</p>
          {user.last_name && <p>{t('user.lastName')}: {user.last_name}</p>}
          {user.username && <p>{t('user.username')}: @{user.username}</p>}
        </div>
      )}
    </div>
  );
};

// Main App Component with Providers
function App() {
  return (
    <TelegramProvider>
      <ThemeProvider>
        <LanguageProvider>
          <GlobalStyles />
          <AppContent />
        </LanguageProvider>
      </ThemeProvider>
    </TelegramProvider>
  );
}

export default App
