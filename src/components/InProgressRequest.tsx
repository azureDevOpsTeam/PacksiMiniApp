import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';
import { apiService } from '../services/apiService';
import type { OfferRequest, ItemType } from '../types/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  
  // Modal states for image gallery
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadItemTypes = async () => {
    try {
      const response = await apiService.getItemTypes();
      if (response.objectResult) {
        setItemTypes(response.objectResult);
      }
    } catch (err) {
      console.error('Error loading item types:', err);
    }
  };

  const getItemTypeName = (itemTypeId: number, isRTL: boolean): string => {
    const itemType = itemTypes.find(item => item.itemTypeId === itemTypeId);
    if (!itemType) return '';
    return isRTL ? itemType.persianName : itemType.itemType;
  };

  // Function to open image modal
  const openImageModal = (images: string[], startIndex: number = 0) => {
    setModalImages(images);
    setCurrentImageIndex(startIndex);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImages([]);
    setCurrentImageIndex(0);
  };

  // Function to navigate images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % modalImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load both offers and item types
        const [offersResponse] = await Promise.all([
          apiService.getInProgressOffers(),
          loadItemTypes()
        ]);
        
        if (offersResponse.requestStatus.name === 'Successful') {
          setMyReciveOffers(offersResponse.objectResult.myReciveOffers || []);
          setMySentOffers(offersResponse.objectResult.mySentOffers || []);
        } else {
          setError(offersResponse.message || 'خطا در دریافت اطلاعات');
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
                {/* Header with name and price */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {suggestion.displayName}
                  </span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#059669'
                    }}>
                      ${suggestion.suggestionPrice}
                    </span>
                    {/* Attachments icon */}
                    {suggestion.attachments && suggestion.attachments.length > 0 && (
                      <button
                        onClick={() => openImageModal(suggestion.attachments)}
                        title={`مشاهده ${suggestion.attachments.length} فایل ضمیمه`}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: '600',
                          boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                          transition: 'all 0.2s ease',
                          minWidth: '44px',
                          minHeight: '32px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.05)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                        }}
                      >
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          style={{ flexShrink: 0 }}
                        >
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700'
                        }}>
                          {suggestion.attachments.length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Item Type */}
                {suggestion.itemType && (
                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                    fontSize: '10px',
                    fontWeight: '500',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    marginBottom: '4px',
                    marginRight: isRTL ? '0' : '4px',
                    marginLeft: isRTL ? '4px' : '0'
                  }}>
                    {getItemTypeName(suggestion.itemType, isRTL)}
                  </div>
                )}

                {/* Description */}
                {suggestion.description && suggestion.description.trim() !== '' && (
                  <div style={{
                    fontSize: '11px',
                    color: '#4b5563',
                    marginBottom: '8px',
                    lineHeight: '1.4',
                    padding: '4px 8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    maxHeight: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {suggestion.description}
                  </div>
                )}

                {/* Action Buttons for each suggestion */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  marginTop: '8px'
                }}>
                  {/* Accept Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Accept suggestion:', suggestion.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#10b981';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                    </svg>
                    {isRTL ? 'قبول' : 'Accept'}
                  </button>

                  {/* Chat Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Chat with suggestion owner:', suggestion.id);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: 'transparent',
                      color: '#6366f1',
                      border: '1.5px solid #6366f1',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#6366f1';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(99, 102, 241, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                    </svg>
                    {isRTL ? 'چت' : 'Chat'}
                  </button>
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
    if (loading) {
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

      {/* Image Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001
              }}
            >
              ✕
            </button>

            {/* Previous button */}
            {modalImages.length > 1 && (
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '-50px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isRTL ? '›' : '‹'}
              </button>
            )}

            {/* Image */}
            <img
              src={modalImages[currentImageIndex]}
              alt={`Image ${currentImageIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            {/* Next button */}
            {modalImages.length > 1 && (
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '-50px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isRTL ? '‹' : '›'}
              </button>
            )}

            {/* Image counter */}
            {modalImages.length > 1 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  color: 'white',
                  fontSize: '14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '4px 12px',
                  borderRadius: '16px'
                }}
              >
                {currentImageIndex + 1} / {modalImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressRequest;