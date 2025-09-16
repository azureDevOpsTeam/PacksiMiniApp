import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SettingsProps {
  activeButton: 'user' | 'admin';
  setActiveButton: (button: 'user' | 'admin') => void;
  forceExpanded?: boolean;
  onMyRequestClick?: () => void;
  onMenuItemClick?: () => void;
}

const Settings: React.FC<SettingsProps> = ({ activeButton, setActiveButton, forceExpanded, onMyRequestClick, onMenuItemClick }) => {
  const { language, changeLanguage } = useLanguage();
  const [settingsExpanded, setSettingsExpanded] = React.useState(false);

  const [selectedLanguage, setSelectedLanguage] = React.useState<'fa' | 'en'>(language as 'fa' | 'en');

  // Handle forceExpanded prop
  React.useEffect(() => {
    if (forceExpanded !== undefined) {
      setSettingsExpanded(forceExpanded);
    }
  }, [forceExpanded]);

  // Update selectedLanguage when language context changes
  React.useEffect(() => {
    setSelectedLanguage(language as 'fa' | 'en');
  }, [language]);

  // Handle language change from buttons
  const handleLanguageChange = (lang: 'fa' | 'en') => {
    setSelectedLanguage(lang);
    changeLanguage(lang);
  };

  return (<>
    {/* Main Settings Panel */}
    <div style={{
      position: 'fixed',
      top: '70px',
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
        }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{
          color: '#fff',
          transition: 'transform 0.3s ease-in-out',
        }}>
          <path d="M4 12H20M4 8H20M4 16H12" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff" />
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
            onClick={() => {
              setActiveButton('user');
              setSettingsExpanded(false);
              onMenuItemClick?.();
            }}
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
            onClick={() => {
              setActiveButton('admin');
              setSettingsExpanded(false);
              onMenuItemClick?.();
            }}
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
            onClick={() => {
              handleLanguageChange('fa');
              setSettingsExpanded(false);
              onMenuItemClick?.();
            }}
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
            onClick={() => {
              handleLanguageChange('en');
              setSettingsExpanded(false);
              onMenuItemClick?.();
            }}
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

      {/* MyRequest Button */}
      {onMyRequestClick && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <div
            onClick={() => {
              onMyRequestClick?.();
              setSettingsExpanded(false);
              onMenuItemClick?.();
            }}
            style={{
              cursor: 'pointer',
              minWidth: '80px',
              height: '35px',
              backgroundColor: '#2ea5f7',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8em',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '600',
              color: '#ffffff',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(46, 165, 247, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1e90d4';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2ea5f7';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            📋 My Requests
          </div>
        </div>
      )}

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
  </>
  );
};

export default Settings;