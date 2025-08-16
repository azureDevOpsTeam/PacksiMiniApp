import React from 'react';
import TelegramProvider from './contexts/TelegramContext';
import ThemeProvider from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTelegramContext } from './hooks/useTelegramContext';
import { useLanguage } from './hooks/useLanguage';
import logo from './assets/images/logo.png';

// Main App Content Component
const AppContent: React.FC = () => {
  const { isReady } = useTelegramContext();
  const { t, language } = useLanguage();

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
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        marginTop: '20px',
        marginBottom: '30px' 
      }}>
        <img 
          src={logo} 
          alt="Packsi Logo" 
          style={{ 
            width: '150px', 
            borderRadius: '12px'
          }} 
        />

      </div>
      <p style={{ marginBottom: '30px' }}>{t('app.welcome')}</p>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#212a33',
          borderRadius: '12px',
          padding: '8px 12px',
          border: '1px solid #3a4a5c',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            style={{ 
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0',
              color: '#848d96' 
            }}
          >
            <path 
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#848d96',
              fontSize: '16px',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: language === 'fa' ? 'right' : 'left',
              direction: language === 'fa' ? 'rtl' : 'ltr'
            }}
          />
        </div>
      </div>
      
      {/* Bot Links Section */}
      <div style={{ 
        marginTop: '30px', 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <h3 style={{
          color: '#ffffff',
          fontSize: '18px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 20px 0',
          fontWeight: '600',
          textAlign: language === 'fa' ? 'right' : 'left',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          {t('bots.title')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <a href="https://t.me/Packsibot" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              P
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500',
                marginBottom: '2px'
              }}>
                Packsi
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                @Packsibot
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          
          <a href="https://t.me/NexterraLiveBot" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              N
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500',
                marginBottom: '2px'
              }}>
                Nexterra
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                @NexterraLiveBot
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          
          <a href="https://t.me/Mobittehbot" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0',
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'white'
            }}>
              MS
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500',
                marginBottom: '2px'
              }}>
                Mobitteh Shop
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                @Mobittehbot
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
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
