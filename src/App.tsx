import React from 'react';
import TelegramProvider from './contexts/TelegramContext';
import ThemeProvider from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTelegramContext } from './hooks/useTelegramContext';
import { useLanguage } from './hooks/useLanguage';
import CreateRequest from './components/CreateRequest';
import logo from './assets/images/logo.png';

// Main App Content Component
const AppContent: React.FC = () => {
  const { isReady } = useTelegramContext();
  const { t, language } = useLanguage();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('admin');
  const [currentPage, setCurrentPage] = React.useState<'home' | 'createRequest'>('home');

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

  // Render CreateRequest page
  if (currentPage === 'createRequest') {
    return <CreateRequest onBack={() => setCurrentPage('home')} />;
  }

  // Render Home page
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
      {/* User/Admin Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        marginBottom: '20px'
      }}>
        <div style={{
           position: 'relative',
           display: 'flex',
           minWidth: '100px',
           height: '35px',
           backgroundColor: '#000',
           borderRadius: '7px',
           padding: '2px'
         }}>
          <div 
             onClick={() => setActiveButton('user')}
             style={{
               cursor: 'pointer',
               flex: 1,
               background: activeButton === 'user' 
                 ? 'linear-gradient(to top, #151515 0%, #1d1d1d 100%)'
                 : 'linear-gradient(to top, #242424 0%, #303030 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               margin: '1px',
               transition: '0.2s',
               fontSize: '0.8em',
               boxShadow: activeButton === 'user'
                 ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                 : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
               color: '#181818',
               position: 'relative',
               borderRadius: '4px 0 0 4px'
             }}>
            <svg style={{
               height: '1.2em',
               width: '1.2em',
               position: 'relative',
               display: 'block',
               fill: activeButton === 'user' ? 'url(#active)' : '#181818'
             }} viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div 
             onClick={() => setActiveButton('admin')}
             style={{
               cursor: 'pointer',
               flex: 1,
               background: activeButton === 'admin'
                 ? 'linear-gradient(to top, #151515 0%, #1d1d1d 100%)'
                 : 'linear-gradient(to top, #242424 0%, #303030 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               margin: '1px',
               transition: '0.2s',
               fontSize: '0.8em',
               boxShadow: activeButton === 'admin'
                 ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                 : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
               color: '#181818',
               position: 'relative',
               borderRadius: '0 4px 4px 0'
             }}>
            <svg style={{
               height: '1.2em',
               width: '1.2em',
               position: 'relative',
               display: 'block',
               fill: activeButton === 'admin' ? 'url(#active)' : '#181818'
             }} viewBox="0 0 24 24">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.66 7 15 8.34 15 10C15 11.66 13.66 13 12 13C10.34 13 9 11.66 9 10C9 8.34 10.34 7 12 7M6 17.25C6 15.18 8.41 14.5 12 14.5C15.59 14.5 18 15.18 18 17.25V18H6V17.25M19.43 12.57C19.79 12.21 20.39 12.21 20.75 12.57L21.54 13.36C21.9 13.72 21.9 14.32 21.54 14.68L20.75 15.47C20.39 15.83 19.79 15.83 19.43 15.47C19.07 15.11 19.07 14.51 19.43 14.15L19.43 12.57M22 13.5V14.5H20.5V13.5H22M19.43 16.85C19.79 16.49 20.39 16.49 20.75 16.85C21.11 17.21 21.11 17.81 20.75 18.17L19.96 18.96C19.6 19.32 19 19.32 18.64 18.96C18.28 18.6 18.28 18 18.64 17.64L19.43 16.85Z"/>
            </svg>
          </div>
        </div>
        
        {/* SVG Filters for gradient */}
        <svg style={{ height: 0, width: 0 }}>
          <defs>
            <radialGradient id="active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: '#ebf7ff', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#b3e1ff', stopOpacity: 1 }} />
            </radialGradient>
          </defs>
        </svg>
      </div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
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
      
      {/* Unlimited Access Section */}
      <div style={{ 
        marginTop: '30px', 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <h3 style={{
          color: '#50b4ff',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 20px 0',
          fontWeight: '600',
          textAlign: language === 'fa' ? 'right' : 'left',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          {t('unlimited.title')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '30px' }}>
          <a href="#" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#212a33',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500'
              }}>
                {language === 'fa' ? 'تکمیل پروفایل' : 'Complete Profile'}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          
          <a href="#" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            backgroundColor: '#212a33',
            borderRadius: '0 0 8px 8px',
            cursor: 'pointer',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M6.62 10.79C6.57 10.36 6.54 9.93 6.54 9.5C6.54 5.91 9.45 3 13.04 3C16.63 3 19.54 5.91 19.54 9.5C19.54 9.93 19.51 10.36 19.46 10.79L22 12V17H20V19H18V17H16V15H13.83C13.3 15.64 12.68 16.18 11.95 16.58C10.96 17.15 9.8 17.5 8.54 17.5C5.46 17.5 3 15.04 3 12C3 8.96 5.46 6.5 8.54 6.5C9.8 6.5 10.96 6.85 11.95 7.42C12.68 7.82 13.3 8.36 13.83 9H16V11H18V13H20V14L19.46 13.21C19.51 12.64 19.54 12.07 19.54 11.5V10.5C19.54 10.36 19.51 10.22 19.46 10.08L22 8.5V6L19.46 7.21C18.97 4.69 16.22 3 13.04 3C8.59 3 5.04 6.55 5.04 11C5.04 11.43 5.07 11.86 5.12 12.29L6.62 10.79Z" fill="white"/>
                <circle cx="8.5" cy="12" r="1.5" fill="white"/>
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500'
              }}>
                {language === 'fa' ? 'تایید شماره موبایل' : 'Verify Phone Number'}
              </div>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
      
      {/* Bot Links Section */}
      <div style={{ 
        marginTop: '0px', 
        width: '100%', 
        maxWidth: '400px'
      }}>
        <h3 style={{
          color: '#50b4ff',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 20px 0',
          fontWeight: '600',
          textAlign: language === 'fa' ? 'right' : 'left',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          {t('bots.title')}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          
          {/* Create New Request Link */}
          <button onClick={() => setCurrentPage('createRequest')} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: language === 'fa' ? 'rtl' : 'ltr',
            marginBottom: '1px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid #50b4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span style={{
              color: '#50b4ff',
              fontSize: '12px',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '500'
            }}>
              {t('bots.createNew')}
            </span>
          </button>

<a href="https://t.me/Packsibot" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '0',
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
            borderRadius: '0',
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
            borderRadius: ' 0 0 8px 8px',
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
