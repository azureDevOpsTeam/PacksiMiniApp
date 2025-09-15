import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';

// CSS animations
const accordionStyles = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  .tab-content {
    animation: slideDown 0.3s ease-out;
  }
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = accordionStyles;
  document.head.appendChild(styleElement);
}

type TabType = 'suggestion' | 'inProgress';

interface InProgressRequestProps { }

const InProgressRequest: React.FC<InProgressRequestProps> = () => {
  const { isRTL } = useLanguage();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('suggestion');

  const tabs = [
    {
      id: 'suggestion' as TabType,
      labelFa: 'پیشنهادات',
      labelEn: 'Suggestions'
    },
    {
      id: 'inProgress' as TabType,
      labelFa: 'در حال انجام',
      labelEn: 'In Progress'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'suggestion':
        return (
          <div className="tab-content" style={{
            padding: '20px',
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontFamily: 'IRANSansX, sans-serif'
          }}>
            <div style={{
              fontSize: '16px',
              marginBottom: '10px',
              color: theme.colors.text.primary
            }}>
              {isRTL ? 'پیشنهادات' : 'Suggestions'}
            </div>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {isRTL ? 'در این بخش پیشنهادات مربوط به درخواست‌های شما نمایش داده می‌شود.' : 'This section displays suggestions related to your requests.'}
            </div>
          </div>
        );
      case 'inProgress':
        return (
          <div className="tab-content" style={{
            padding: '20px',
            textAlign: 'center',
            color: theme.colors.text.secondary,
            fontFamily: 'IRANSansX, sans-serif'
          }}>
            <div style={{
              fontSize: '16px',
              marginBottom: '10px',
              color: theme.colors.text.primary
            }}>
              {isRTL ? 'در حال انجام' : 'In Progress'}
            </div>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              {isRTL ? 'در این بخش درخواست‌های در حال انجام شما نمایش داده می‌شود.' : 'This section displays your requests that are currently in progress.'}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
      direction: isRTL ? 'rtl' : 'ltr',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header with Logo and Title */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: theme.colors.background,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <Logo />
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: theme.colors.text.primary,
            fontFamily: 'IRANSansX, sans-serif',
            marginTop: '10px'
          }}>
            {isRTL ? 'درخواست‌های من' : 'My Requests'}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          backgroundColor: theme.colors.surface,
          borderRadius: '12px',
          padding: '4px',
          border: `1px solid ${theme.colors.border}`
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: activeTab === tab.id ? theme.colors.primary : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : theme.colors.text.secondary,
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontFamily: 'IRANSansX, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                  e.currentTarget.style.color = theme.colors.text.primary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }
              }}
            >
              {isRTL ? tab.labelFa : tab.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '100px' // Space for TabBar
      }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default InProgressRequest;