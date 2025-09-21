import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
// import { useTelegramContext } from '../hooks/useTelegramContext'; // Not needed
import { apiService } from '../services/apiService';
import type { MyRequestTrip } from '../types/api';
import Logo from './Logo';
import SkeletonLoader from './SkeletonLoader';

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

  @keyframes flightPath {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(0%);
      opacity: 1;
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

  .flight-card {
    position: relative;
    overflow: hidden;
  }

  .flight-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    transition: left 0.5s;
  }

  .flight-card:hover::before {
    left: 100%;
  }

  .airplane-icon {
    animation: pulse 2s infinite;
  }

  .flight-route {
    animation: flightPath 1s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = accordionStyles;
  document.head.appendChild(styleElement);
}

type TabType = 'passenger' | 'sender';

interface MyRequestProps {}

const MyRequest: React.FC<MyRequestProps> = () => {
  const { isRTL } = useLanguage();

  // const { user } = useTelegramContext(); // Not needed as API uses token
  
  const [activeTab, setActiveTab] = useState<TabType>('passenger');
  const [requests, setRequests] = useState<MyRequestTrip[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setRequestsLoading(true);
        setRequestsError(null);
        const response = await apiService.getMyRequestTrips();
        console.log('MyRequest component received response:', response);
        console.log('Response data:', response.data);
        console.log('Response success:', response.success);
        
        if (response.success && response.data && response.data.length > 0) {
          console.log('Setting requests with data:', response.data);
          setRequests(response.data);
        } else {
          console.log('No requests data or success is false');
          setRequests([]);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequestsError(isRTL ? 'خطا در دریافت درخواست‌ها' : 'Error fetching requests');
      } finally {
        setRequestsLoading(false);
      }
    };

    fetchRequests();
  }, [isRTL]);

  // Filter requests based on active tab and search query
  const filteredRequests = requests.filter(request => {
    // Log for debugging
    console.log('Filtering request:', request);
    console.log('Active tab:', activeTab);
    console.log('Request recordType:', request.tripType);
    
    // Filter by tab (recordType)
    const tabFilter = activeTab === 'passenger' 
      ? request.tripType === 'Passenger'
      : request.tripType === 'Sender';
    
    console.log('Tab filter result:', tabFilter);
    
    if (!tabFilter) return false;

    // Filter by search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      request.originCity?.toLowerCase().includes(query) ||
      request.destinationCity?.toLowerCase().includes(query) ||
      request.tripType?.toLowerCase().includes(query) ||
      request.status?.toLowerCase().includes(query)
    );
  });
  
  // Log filtered requests
  console.log('Filtered requests:', filteredRequests);

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, { fa: string; en: string; color: string }> = {
      'Pending': { fa: 'در انتظار', en: 'Pending', color: '#f59e0b' },
      'Confirmed': { fa: 'تایید شده', en: 'Confirmed', color: '#10b981' },
      'Cancelled': { fa: 'لغو شده', en: 'Cancelled', color: '#ef4444' },
      'Completed': { fa: 'تکمیل شده', en: 'Completed', color: '#6366f1' }
    };
    
    const statusInfo = statusMap[status] || { fa: status, en: status, color: '#848d96' };
    return {
      text: isRTL ? statusInfo.fa : statusInfo.en,
      color: statusInfo.color
    };
  };

  return (
    <>
      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        //top: '80px',
        left: '0',
        right: '0',
        backgroundColor: '#17212b',
        zIndex: 100,
        paddingBottom: '20px',
      }}>
        {/* Header with Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '15px',
          paddingTop: '20px'
        }}>
          <Logo />
        </div>

        <h2 style={{
          fontSize: '18px',
          margin: '0 auto 20px auto',
          color: '#50b4ff',
          fontFamily: 'IRANSansX, sans-serif',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          {(() => {
            switch (activeTab) {
              case 'passenger':
                return isRTL ? 'درخواست‌های مسافر' : 'Passenger Requests';
              case 'sender':
                return isRTL ? 'درخواست‌های ارسال کننده' : 'Sender Requests';
              default:
                return isRTL ? 'درخواست‌های من' : 'My Requests';
            }
          })()
          }
        </h2>

        {/* Tab Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '0 20px'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: '#212a33',
            borderRadius: '12px',
            padding: '4px',
            gap: '2px',
            border: '1px solid #3a4a5c'
          }}>
            {[
              { key: 'passenger' as TabType, labelFa: 'مسافر', labelEn: 'Passenger' },
              { key: 'sender' as TabType, labelFa: 'ارسال کننده', labelEn: 'Sender' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: activeTab === tab.key ? '#50b4ff' : 'transparent',
                  color: activeTab === tab.key ? '#ffffff' : '#848d96',
                  fontSize: '12px',
                  fontFamily: 'IRANSansX, sans-serif',
                  fontWeight: activeTab === tab.key ? '600' : '400',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'rgba(80, 180, 255, 0.1)';
                    e.currentTarget.style.color = '#50b4ff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#848d96';
                  }
                }}
              >
                {isRTL ? tab.labelFa : tab.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        marginTop: '160px',
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '20px'
      }}>

        {/* Search Box */}
        <div style={{ width: '100%', margin: '5px auto 20px auto', maxWidth: '400px', padding: '20px' }}>
          <div style={{
            position: 'relative'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'جستجو بر اساس مبدأ، مقصد یا وضعیت...' : 'Search by origin, destination or status...'}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '5px',
                border: '1px solid #3a4a5c',
                backgroundColor: '#212a33',
                color: '#848d96',
                fontSize: '13px',
                fontFamily: 'IRANSansX, sans-serif',
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: isRTL ? 'auto' : '8px',
                  left: isRTL ? '8px' : 'auto',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#848d96',
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '2px',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Requests List */}
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '400px', padding: '20px 0' }}>
          {requestsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} type="search" height="80px" />
              ))}
            </div>
          ) : requestsError ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#ef4444',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {requestsError}
            </div>
          ) : requests.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {isRTL ? 'هیچ درخواستی یافت نشد' : 'No requests found'}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {isRTL ? 'هیچ نتیجه‌ای برای جستجوی شما یافت نشد' : 'No results found for your search'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {filteredRequests.map((request) => {
                const statusDisplay = getStatusDisplay(request.status || 'Pending');
                
                return (
                  <div
                    key={request.id}
                    className="flight-card"
                    style={{
                      backgroundColor: '#212a33',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #3a4a5c',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      margin: '0 20px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Request Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#50b4ff',
                        fontFamily: 'IRANSansX, sans-serif'
                      }}>
                        {isRTL ? 'درخواست' : 'Request'} #{request.id}
                      </div>
                      <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: statusDisplay.color + '20',
                        color: statusDisplay.color,
                        fontSize: '11px',
                        fontWeight: '500',
                        fontFamily: 'IRANSansX, sans-serif'
                      }}>
                        {statusDisplay.text}
                      </div>
                    </div>

                    {/* Route Information */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isRTL ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#ffffff',
                          fontFamily: 'IRANSansX, sans-serif'
                        }}>
                          {request.originCity || 'N/A'}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#848d96',
                          fontFamily: 'IRANSansX, sans-serif'
                        }}>
                          {isRTL ? 'مبدأ' : 'Origin'}
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: 1,
                        justifyContent: 'center',
                        margin: '0 16px'
                      }}>
                        <div style={{
                          width: '100%',
                          height: '1px',
                          backgroundColor: '#3a4a5c',
                          position: 'relative'
                        }}>
                          <div className="airplane-icon" style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '12px',
                            color: '#50b4ff'
                          }}>
                            ✈️
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isRTL ? 'flex-start' : 'flex-end'
                      }}>
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#ffffff',
                          fontFamily: 'IRANSansX, sans-serif'
                        }}>
                          {request.destinationCity || 'N/A'}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#848d96',
                          fontFamily: 'IRANSansX, sans-serif'
                        }}>
                          {isRTL ? 'مقصد' : 'Destination'}
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                      color: '#848d96',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      <div>
                        {isRTL ? 'نوع:' : 'Type:'} {request.tripType === 'Passenger' ? (isRTL ? 'مسافر' : 'Passenger') : (isRTL ? 'ارسال کننده' : 'Sender')}
                      </div>
                      {request.createdAt && (
                        <div>
                          {new Date(request.createdAt).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyRequest;