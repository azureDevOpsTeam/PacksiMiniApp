import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsProps {
  activeButton: 'user' | 'admin';
  setActiveButton: (button: 'user' | 'admin') => void;
}

const Settings: React.FC<SettingsProps> = ({ activeButton, setActiveButton }) => {
  const { language, changeLanguage } = useLanguage();
  const [settingsExpanded, setSettingsExpanded] = React.useState(false);
  const [selectedLanguage, setSelectedLanguage] = React.useState<'fa' | 'en'>(language as 'fa' | 'en');

  // Update selectedLanguage when language context changes
  React.useEffect(() => {
    setSelectedLanguage(language as 'fa' | 'en');
  }, [language]);

  // Handle language change from buttons
  const handleLanguageChange = (lang: 'fa' | 'en') => {
    setSelectedLanguage(lang);
    changeLanguage(lang);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: settingsExpanded ? '0px' : '-100px',
      width: '100px',
      backgroundColor: '#212a33',
      borderRadius: '12px 0 0 12px',
      border: '1px solid #3a4a5c',
      borderRight: 'none',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      transition: 'right 0.3s ease-in-out',
      padding: '20px 20px 0px 20px',
      opacity: '0.9'
    }}>
      {/* Settings Icon Button with Rotation Animation */}
      <div
        onClick={() => setSettingsExpanded(!settingsExpanded)}
        style={{
          position: 'absolute',
          left: '-40px',
          top: '10px',
          width: '40px',
          height: '40px',
          backgroundColor: '#212a33',
          borderRadius: '10px 0 0 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #3a4a5c',
          borderRight: 'none',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          style={{
            color: '#848d96',
            transform: settingsExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease-in-out',
            animation: 'settingsRotate 4s linear infinite'
          }}
        >
          <path
            d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.12.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97L2.46 14.6c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.39 1.06.73 1.69.98l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.25 1.17-.59 1.69-.98l2.49 1c.22.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64L19.43 12.57z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* User/Admin Toggle inside Settings */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '80px',
          height: '70px',
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
              fontFamily: 'IRANSansX, sans-serif',
              boxShadow: activeButton === 'user'
                ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
              color: '#181818',
              position: 'relative',
              borderRadius: '4px 4px 0 0'
            }}>
            <svg style={{
              height: '1.2em',
              width: '1.2em',
              position: 'relative',
              display: 'block',
              fill: activeButton === 'user' ? 'url(#active)' : '#181818'
            }} viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
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
              fontFamily: 'IRANSansX, sans-serif',
              boxShadow: activeButton === 'admin'
                ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
              color: '#181818',
              position: 'relative',
              borderRadius: '0 0 4px 4px'
            }}>
            <svg style={{
              height: '1.2em',
              width: '1.2em',
              position: 'relative',
              display: 'block',
              fill: activeButton === 'admin' ? 'url(#active)' : '#181818'
            }} viewBox="0 0 24 24">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.66 7 15 8.34 15 10C15 11.66 13.66 13 12 13C10.34 13 9 11.66 9 10C9 8.34 10.34 7 12 7M6 17.25C6 15.18 8.41 14.5 12 14.5C15.59 14.5 18 15.18 18 17.25V18H6V17.25Z" />
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

      {/* Language Toggle inside Settings */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          minWidth: '80px',
          height: '70px',
          backgroundColor: '#000',
          borderRadius: '7px',
          padding: '2px'
        }}>
          <div
            onClick={() => handleLanguageChange('fa')}
            style={{
              cursor: 'pointer',
              flex: 1,
              background: selectedLanguage === 'fa'
                ? 'linear-gradient(to top, #151515 0%, #1d1d1d 100%)'
                : 'linear-gradient(to top, #242424 0%, #303030 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '1px',
              transition: '0.2s',
              fontSize: '0.8em',
              boxShadow: selectedLanguage === 'fa'
                ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
              color: selectedLanguage === 'fa' ? '#ebf7ff' : '#848d96',
              position: 'relative',
              borderRadius: '4px 4px 0 0',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '600'
            }}>
            FA
          </div>
          <div
            onClick={() => handleLanguageChange('en')}
            style={{
              cursor: 'pointer',
              flex: 1,
              background: selectedLanguage === 'en'
                ? 'linear-gradient(to top, #151515 0%, #1d1d1d 100%)'
                : 'linear-gradient(to top, #242424 0%, #303030 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '1px',
              transition: '0.2s',
              fontSize: '0.8em',
              boxShadow: selectedLanguage === 'en'
                ? 'inset 0 16px 14px -21px transparent, 0 0px 13px 0 rgba(0,0,0,0.3), inset 0 0 7px 2px rgba(0,0,0,0.4)'
                : 'inset 0 8px 2px -8px rgba(255,255,255,0.4), 0 8px 5px 0 rgba(0,0,0,0.3)',
              color: selectedLanguage === 'en' ? '#ebf7ff' : '#848d96',
              position: 'relative',
              borderRadius: '0 0 4px 4px',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '600'
            }}>
            EN
          </div>
        </div>
      </div>

      {/* CSS Animation for Settings Icon */}
      <style>
        {`
          @keyframes settingsRotate {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Settings;