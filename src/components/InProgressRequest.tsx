import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';
import { apiService } from '../services/apiService';
import type { OfferRequest } from '../types/api';

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
  const [myReciveOffers, setMyReciveOffers] = useState<OfferRequest[]>([]);
  const [mySentOffers, setMySentOffers] = useState<OfferRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInProgressOffers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.getInProgressOffers();
        
        if (response.requestStatus.name === 'Successful') {
          setMyReciveOffers(response.objectResult.myReciveOffers || []);
          setMySentOffers(response.objectResult.mySentOffers || []);
        } else {
          setError(response.message || 'خطا در دریافت اطلاعات');
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور');
        console.error('Error fetching in-progress offers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInProgressOffers();
  }, []);

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

  const renderOfferCard = (offer: OfferRequest) => {
    return (
      <div
        key={offer.id}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
          borderRadius: '16px',
          padding: '16px',
          border: '2px solid #e2e8f0',
          direction: isRTL ? 'rtl' : 'ltr',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          cursor: 'pointer',
          overflow: 'hidden',
          fontFamily: 'IRANSansX, sans-serif',
          marginBottom: '12px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1e293b'
          }}>
            {isRTL ? `${offer.originCityPersianName} → ${offer.destinationCityPersianName}` : `${offer.originCityName} → ${offer.destinationCityName}`}
          </div>
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '4px 8px',
            borderRadius: '8px'
          }}>
            #{offer.id}
          </div>
        </div>

        {/* Suggestions */}
        {offer.suggestions && offer.suggestions.length > 0 && (
          <div style={{
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              {isRTL ? 'پیشنهادات:' : 'Suggestions:'}
            </div>
            {offer.suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {suggestion.displayName}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#059669'
                  }}>
                    ${suggestion.suggestionPrice}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('View details for offer:', offer.id);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: '#ffffff',
              color: '#4b5563',
              border: 'none',
              borderRight: isRTL ? 'none' : '1px solid #e5e7eb',
              borderLeft: isRTL ? '1px solid #e5e7eb' : 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#4b5563';
            }}
          >
            {isRTL ? 'جزئیات' : 'Details'} <span style={{ fontSize: '14px' }}>📋</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Message for offer:', offer.id);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '0',
              fontSize: '12px',
              fontWeight: '600',
              backgroundColor: '#f8f9fa',
              color: '#374151',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#e5e7eb';
              e.currentTarget.style.color = '#1f2937';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
              e.currentTarget.style.color = '#374151';
            }}
          >
            {isRTL ? 'پیام' : 'Message'} <span style={{ fontSize: '14px' }}>💬</span>
          </button>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isLoading) {
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
            {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="tab-content" style={{
          padding: '20px',
          textAlign: 'center',
          color: '#ef4444',
          fontFamily: 'IRANSansX, sans-serif'
        }}>
          <div style={{
            fontSize: '16px',
            marginBottom: '10px'
          }}>
            {isRTL ? 'خطا' : 'Error'}
          </div>
          <div style={{
            fontSize: '14px',
            lineHeight: '1.5'
          }}>
            {error}
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'suggestion':
        return (
          <div className="tab-content" style={{
            padding: '20px'
          }}>
            {myReciveOffers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: theme.colors.text.secondary,
                fontFamily: 'IRANSansX, sans-serif',
                padding: '40px 20px'
              }}>
                <div style={{
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: theme.colors.text.primary
                }}>
                  {isRTL ? 'پیشنهادی وجود ندارد' : 'No Suggestions'}
                </div>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {isRTL ? 'هنوز پیشنهادی برای شما ثبت نشده است.' : 'No suggestions have been submitted for you yet.'}
                </div>
              </div>
            ) : (
              myReciveOffers.map(renderOfferCard)
            )}
          </div>
        );
      case 'inProgress':
        return (
          <div className="tab-content" style={{
            padding: '20px'
          }}>
            {mySentOffers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: theme.colors.text.secondary,
                fontFamily: 'IRANSansX, sans-serif',
                padding: '40px 20px'
              }}>
                <div style={{
                  fontSize: '16px',
                  marginBottom: '10px',
                  color: theme.colors.text.primary
                }}>
                  {isRTL ? 'درخواستی وجود ندارد' : 'No Requests'}
                </div>
                <div style={{
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {isRTL ? 'شما هنوز درخواستی ثبت نکرده‌اید.' : 'You have not submitted any requests yet.'}
                </div>
              </div>
            ) : (
              mySentOffers.map(renderOfferCard)
            )}
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