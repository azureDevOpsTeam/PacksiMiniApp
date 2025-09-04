import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramContext } from '../hooks/useTelegramContext';
import { apiService } from '../services/apiService';
import type { OutboundTrip } from '../types/api';
import AddPreferredLocation from './AddPreferredLocation';
import Logo from './Logo';
import Settings from './Settings';
import SkeletonLoader from './SkeletonLoader';

// Add CSS animations for flight cards
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
  
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
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
  const styleSheet = document.createElement('style');
  styleSheet.textContent = accordionStyles;
  document.head.appendChild(styleSheet);
}



// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ParcelListProps {
}

const ParcelList: React.FC<ParcelListProps> = () => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const { webApp } = useTelegramContext();

  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // Default to showing list
  const [flights, setFlights] = useState<OutboundTrip[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [apiResult, setApiResult] = useState<{success: boolean, message: string} | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tripType, setTripType] = useState<'inbound' | 'outbound'>('outbound');

  // Filter flights based on search query
  const filteredFlights = flights.filter(flight => {
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const originCity = flight.originCity?.toLowerCase() || '';
      const destinationCity = flight.destinationCity?.toLowerCase() || '';
      const itemTypes = isRTL ? flight.itemTypesFa : flight.itemTypes;
      const itemTypesText = itemTypes?.join(' ').toLowerCase() || '';

      const matchesSearch = originCity.includes(query) ||
        destinationCity.includes(query) ||
        itemTypesText.includes(query);

      return matchesSearch;
    }

    return true;
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (activeMenu) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu]);

  // Handle menu actions
  const handleMenuAction = async (action: string, flight: OutboundTrip) => {
    console.log('handleMenuAction called with action:', action, 'requestId:', flight.requestId);
    setActiveMenu(null);
    
    switch (action) {
      case 'details':
        // Handle flight details view
        console.log('Show details for flight:', flight.requestId);
        break;
      case 'selectTrip':
        // Handle trip selection
        await handleSelectTrip(flight.requestId);
        break;
      case 'saveToFavorites':
        // Handle save to favorites
        console.log('Save to favorites:', flight.requestId);
        break;
      case 'report':
        // Handle report
        console.log('Report flight:', flight.requestId);
        break;
      default:
        break;
    }
  };

  // Handle select trip API call
  const handleSelectTrip = async (requestId: number) => {
    try {
      console.log('handleSelectTrip called with requestId:', requestId);
      
      // Show loading state
      setIsLoading(true);

      console.log('Calling apiService.selectRequest...');
      const response = await apiService.selectRequest({
        model: {
          requestId: requestId
        }
      });

      console.log('API Response:', response);

      // Check if the API call was successful (value 0 means success based on provided response)
      if (response.requestStatus.value === 0) {
        // Success - show confirmation message in modal
        console.log('API call successful');
        setApiResult({
          success: true,
          message: response.message || (isRTL ? 'سفر با موفقیت انتخاب شد' : 'Trip selected successfully')
        });
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setApiResult(null);
          setActiveMenu(null); // Close the menu
        }, 3000);
        
        // Refresh the flights list to update status
        console.log('Refreshing flights list...');
        await fetchFlights();
      } else {
        // Error from API
        console.log('API call failed with status:', response.requestStatus);
        setApiResult({
          success: false,
          message: response.message || (isRTL ? 'خطا در انتخاب سفر' : 'Error selecting trip')
        });
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          setApiResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error selecting trip:', error);
      // Show error message in modal
      setApiResult({
        success: false,
        message: isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error'
      });
      
      // Auto-dismiss after 3 seconds
      setTimeout(() => {
        setApiResult(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch flights based on trip type
  const fetchFlights = async () => {
    setFlightsLoading(true);
    setFlightsError(null);
    try {
      const response = tripType === 'outbound'
        ? await apiService.getOutboundTrips()
        : await apiService.getInboundTrips();
      if (response.objectResult) {
        setFlights(response.objectResult);
      } else {
        setFlights([]);
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setFlightsError('Failed to load flights');
      setFlights([]);
    } finally {
      setFlightsLoading(false);
    }
  };

  // Check setPreferredLocation on component mount
  useEffect(() => {
    const checkPreferredLocation = async () => {
      try {
        setIsLoading(true);
        // Always show list instead of form
        setShowForm(false);
        fetchFlights();
      } catch (error) {
        console.error('Error checking preferred location:', error);
        // Even on error, show list
        setShowForm(false);
        fetchFlights();
      } finally {
        setIsLoading(false);
      }
    };

    checkPreferredLocation();
  }, []);

  // Fetch flights when tripType changes
  useEffect(() => {
    if (!showForm) {
      fetchFlights();
    }
  }, [tripType]);

  // Handle form completion
  const handleFormComplete = () => {
    setShowForm(false);
    fetchFlights();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Function to get status display based on currentUserStatus
  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 0:
        return {
          text: isRTL ? 'در انتظار' : 'Pending',
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 1:
        return {
          text: isRTL ? 'تأیید شده' : 'Confirmed',
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 2:
        return {
          text: isRTL ? 'لغو شده' : 'Cancelled',
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 3:
        return {
          text: isRTL ? 'تکمیل شده' : 'Completed',
          color: '#8b5cf6',
          bgColor: 'rgba(139, 92, 246, 0.1)'
        };
      default:
        return {
          text: isRTL ? 'نامشخص' : 'Unknown',
          color: '#6b7280',
          bgColor: 'rgba(107, 114, 128, 0.1)'
        };
    }
  };



  // Setup back button
  useEffect(() => {
    if (!webApp) return;

    const handleBackButton = () => {
      // Navigate back to home
      window.history.back();
    };

    webApp.BackButton.show();
    webApp.BackButton.onClick(handleBackButton);

    return () => {
      webApp.BackButton.offClick(handleBackButton);
      webApp.BackButton.hide();
    };
  }, [webApp]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '80px 20px 0 20px',
        backgroundColor: '#17212b'
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '20px', width: '100%', padding: '0' }}>
          <SkeletonLoader type="profile" height="60px" />
        </div>

        {/* Logo Skeleton */}
        <div style={{ marginBottom: '30px' }}>
          <SkeletonLoader type="text" width="120px" height="40px" />
        </div>

        {/* Content Skeleton */}
        <div style={{ width: '100%', padding: '0 20px', gap: '20px', display: 'flex', flexDirection: 'column' }}>
          <SkeletonLoader type="text" width="150px" height="20px" />
          <SkeletonLoader type="search" height="60px" />
          <SkeletonLoader type="search" height="60px" />
          <SkeletonLoader type="search" height="60px" />
        </div>
      </div>
    );
  }

  // Show form if setPreferredLocation is false
  if (showForm) {
    return (
      <div>
        <AddPreferredLocation onComplete={handleFormComplete} />
      </div>
    );
  }

  // Show parcel list if setPreferredLocation is true
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      minHeight: '100vh',
      padding: '80px 0 0 0',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        width: '100%'
      }}>
        {/* Settings Component */}
        <Settings activeButton={activeButton} setActiveButton={setActiveButton} />

        {/* Trip Type Filter Buttons */}
        <div style={{
          position: 'absolute',
          top: '80px',
          left: '-1px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          <button
            onClick={() => setTripType('outbound')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '0 10px 0 0',
              border: '1px solid #3a4a5c',
              backgroundColor: '#212a33',
              backdropFilter: 'blur(10px)',
              color: tripType === 'outbound' ? '#50b4ff' : '#848d96',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              opacity: '0.9'
            }}
            title={isRTL ? 'پروازهای خروجی' : 'Outbound Flights'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" transform="rotate(-45 12 12)" />
            </svg>
          </button>

          <button
            onClick={() => setTripType('inbound')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '0 0 10px 0',
              border: '1px solid #3a4a5c',
              backgroundColor: '#212a33',
              backdropFilter: 'blur(10px)',
              color: tripType === 'inbound' ? '#50b4ff' : '#848d96',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              opacity: '0.9'
            }}
            title={isRTL ? 'پروازهای ورودی' : 'Inbound Flights'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" transform="rotate(135 12 12)" />
            </svg>
          </button>
        </div>

        {/* Header with Logo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <Logo />
        </div>

        <h2 style={{
          fontSize: '18px',
          margin: '0 auto 20px auto',
          color: '#50b4ff',
          fontFamily: 'IRANSansX, sans-serif',
          fontWeight: '700'
        }}>
          {tripType === 'outbound'
            ? (isRTL ? 'لیست پروازهای خروجی' : 'Outbound Flights List')
            : (isRTL ? 'لیست پروازهای ورودی' : 'Inbound Flights List')
          }
        </h2>

        {/* Search Box */}
        <div style={{ width: '100%', margin: '0 auto 20px auto', maxWidth: '400px', padding: '20px' }}>
          <div style={{
            position: 'relative'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'جستجو بر اساس مبدأ، مقصد یا نوع مدرک...' : 'Search by origin, destination or document type...'}
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

        {/* Flights List */}
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '400px', padding: '20px' }}>
          {flightsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} type="search" height="80px" />
              ))}
            </div>
          ) : flightsError ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#ef4444',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {flightsError}
            </div>
          ) : flights.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {t('parcelList.flightsNotFound')}
            </div>
          ) : filteredFlights.length === 0 ? (
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
              {filteredFlights.map((flight) => (
                <div
                  key={flight.requestId}
                  className="flight-card"
                  style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
                    borderRadius: '20px',
                    padding: '0',
                    border: '2px solid #e2e8f0',
                    direction: isRTL ? 'rtl' : 'ltr',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    fontFamily: 'IRANSansX, sans-serif',
                    minHeight: '200px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2), 0 8px 16px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Airline Header */}
                  <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    padding: '20px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {/* Background Pattern */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `
                        radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, transparent 50%)
                      `,
                      pointerEvents: 'none'
                    }} />
                    
                    {/* Airline Info */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '15px',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px'
                        }}>✈️</div>
                        <div>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: 'bold',
                            marginBottom: '2px'
                          }}>{flight.fullName}</div>
                          <div style={{
                            fontSize: '10px',
                            opacity: 0.8
                          }}>{isRTL ? 'بلیط بار' : 'CARGO TICKET'}</div>
                        </div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px'
                      }}>
                        {/* Request ID */}
                        <div style={{
                        textAlign: isRTL ? 'left' : 'right'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          opacity: 0.8,
                          marginBottom: '2px'
                        }}>{isRTL ? 'شماره درخواست' : 'REQUEST ID'}</div>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>#{flight.requestId}</div>
                        {/* Status Badge */}
                        {flight.currentUserStatus !== undefined && (
                          <div style={{
                            marginTop: '8px',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            backgroundColor: getStatusDisplay(flight.currentUserStatus).bgColor,
                            color: getStatusDisplay(flight.currentUserStatus).color,
                            border: `1px solid ${getStatusDisplay(flight.currentUserStatus).color}`,
                            textAlign: 'center'
                          }}>
                            {getStatusDisplay(flight.currentUserStatus).text}
                          </div>
                        )}
                      </div>
                        
                        {/* Three Dots Menu */}
                        <div style={{
                          position: 'relative',
                          zIndex: 1001
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenu(activeMenu === flight.requestId ? null : flight.requestId);
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.2)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '16px',
                              color: 'white',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                            }}
                          >
                            ⋮
                          </button>
                          
                          {/* Popup Menu Overlay */}
                          {activeMenu === flight.requestId && createPortal(
                            <>
                              {/* Background Overlay */}
                              <div 
                                onClick={() => setActiveMenu(null)}
                                style={{
                                  position: 'fixed',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                  zIndex: 99999,
                                  backdropFilter: 'blur(4px)'
                                }}
                              />
                              
                              <div style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                background: 'linear-gradient(135deg, rgba(26, 32, 38, 0.95) 0%, rgba(36, 43, 53, 0.95) 100%)',
                                borderRadius: '20px',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                                minWidth: '280px',
                                maxWidth: '320px',
                                zIndex: 100000,
                                overflow: 'hidden',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                animation: 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}>
                                {/* Menu Header */}
                                <div style={{
                                  padding: '20px 20px 16px 20px',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                  textAlign: 'center'
                                }}>
                                  <h3 style={{
                                    margin: 0,
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#ffffff',
                                    fontFamily: 'IRANSansX, sans-serif'
                                  }}>
                                    {isRTL ? 'عملیات' : 'Actions'}
                                  </h3>
                                  <p style={{
                                    margin: '4px 0 0 0',
                                    fontSize: '12px',
                                    color: '#a0a8b0',
                                    fontFamily: 'IRANSansX, sans-serif'
                                  }}>
                                    {isRTL ? `درخواست #${flight.requestId}` : `Request #${flight.requestId}`}
                                  </p>
                                </div>
                                
                                {/* Menu Items */}
                                <div style={{ padding: '8px' }}>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuAction('details', flight);
                                    }}
                                    style={{
                                      padding: '16px 20px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      color: '#ffffff',
                                      borderRadius: '12px',
                                      transition: 'all 0.3s ease',
                                      textAlign: isRTL ? 'right' : 'left',
                                      fontFamily: 'IRANSansX, sans-serif',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      marginBottom: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(80, 180, 255, 0.2)';
                                      e.currentTarget.style.transform = 'translateX(' + (isRTL ? '-4px' : '4px') + ')';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                  >
                                    <span style={{ fontSize: '16px' }}>📋</span>
                                    {t('flights.menu.details')}
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuAction('selectTrip', flight);
                                    }}
                                    style={{
                                      padding: '16px 20px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      color: '#ffffff',
                                      borderRadius: '12px',
                                      transition: 'all 0.3s ease',
                                      textAlign: isRTL ? 'right' : 'left',
                                      fontFamily: 'IRANSansX, sans-serif',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      marginBottom: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(46, 213, 115, 0.2)';
                                      e.currentTarget.style.transform = 'translateX(' + (isRTL ? '-4px' : '4px') + ')';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                  >
                                    <span style={{ fontSize: '16px' }}>✈️</span>
                                    {t('flights.menu.selectTrip')}
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuAction('saveToFavorites', flight);
                                    }}
                                    style={{
                                      padding: '16px 20px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      color: '#ffffff',
                                      borderRadius: '12px',
                                      transition: 'all 0.3s ease',
                                      textAlign: isRTL ? 'right' : 'left',
                                      fontFamily: 'IRANSansX, sans-serif',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      marginBottom: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(255, 193, 7, 0.2)';
                                      e.currentTarget.style.transform = 'translateX(' + (isRTL ? '-4px' : '4px') + ')';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                  >
                                    <span style={{ fontSize: '16px' }}>⭐</span>
                                    {t('flights.menu.saveToFavorites')}
                                  </div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMenuAction('report', flight);
                                    }}
                                    style={{
                                      padding: '16px 20px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      color: '#ffffff',
                                      borderRadius: '12px',
                                      transition: 'all 0.3s ease',
                                      textAlign: isRTL ? 'right' : 'left',
                                      fontFamily: 'IRANSansX, sans-serif',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                      e.currentTarget.style.transform = 'translateX(' + (isRTL ? '-4px' : '4px') + ')';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'transparent';
                                      e.currentTarget.style.transform = 'translateX(0)';
                                    }}
                                  >
                                    <span style={{ fontSize: '16px' }}>🚨</span>
                                    {t('flights.menu.report')}
                                  </div>
                                </div>
                                
                                {/* Loading Indicator */}
                                {isLoading && (
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '16px',
                                    zIndex: 1000
                                  }}>
                                    <div style={{
                                      width: '24px',
                                      height: '24px',
                                      border: '3px solid rgba(255, 255, 255, 0.3)',
                                      borderTop: '3px solid #ffffff',
                                      borderRadius: '50%',
                                      animation: 'spin 1s linear infinite'
                                    }} />
                                  </div>
                                )}
                                
                                {/* API Result Display */}
                                {apiResult && (
                                  <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: apiResult.success ? 'rgba(34, 197, 94, 0.95)' : 'rgba(239, 68, 68, 0.95)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '16px',
                                    zIndex: 1001,
                                    padding: '20px',
                                    textAlign: 'center'
                                  }}>
                                    <div>
                                      <div style={{
                                        fontSize: '24px',
                                        marginBottom: '8px'
                                      }}>
                                        {apiResult.success ? '✅' : '❌'}
                                      </div>
                                      <div style={{
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        fontFamily: 'IRANSansX, sans-serif',
                                        lineHeight: '1.4'
                                      }}>
                                        {apiResult.message}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>,
                            document.body
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Flight Route */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <div style={{
                        textAlign: 'center',
                        flex: 1
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '4px'
                        }}>{flight.originCity}</div>
                        <div style={{
                          fontSize: '10px',
                          opacity: 0.8
                        }}>{isRTL ? 'مبدأ' : 'FROM'}</div>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '0 20px'
                      }}>
                        <div style={{
                          width: '30px',
                          height: '1px',
                          background: 'rgba(255,255,255,0.5)'
                        }} />
                        <div style={{
                          fontSize: '16px',
                          animation: 'pulse 2s infinite'
                        }}>✈️</div>
                        <div style={{
                          width: '30px',
                          height: '1px',
                          background: 'rgba(255,255,255,0.5)'
                        }} />
                      </div>
                      
                      <div style={{
                        textAlign: 'center',
                        flex: 1
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: 'bold',
                          marginBottom: '4px'
                        }}>{flight.destinationCity}</div>
                        <div style={{
                          fontSize: '10px',
                          opacity: 0.8
                        }}>{isRTL ? 'مقصد' : 'TO'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Info Bar */}
                  <div style={{
                    background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '2px dashed #cbd5e1'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '10px',
                        color: '#64748b',
                        marginBottom: '2px'
                      }}>{isRTL ? 'تاریخ پرواز' : 'FLIGHT DATE'}</div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#1e293b'
                      }}>{formatDate(flight.departureDate)}</div>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      background: 'white',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: '#64748b',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      QR CODE<br/>PLACEHOLDER
                    </div>
                  </div>

                  {/* Item Types Section */}
                  {((isRTL && flight.itemTypesFa && flight.itemTypesFa.length > 0) ||
                    (!isRTL && flight.itemTypes && flight.itemTypes.length > 0)) && (
                    <div style={{
                      padding: '20px',
                      background: 'white',
                      borderTop: '2px dashed #cbd5e1'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        marginBottom: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>{isRTL ? 'انواع اقلام مجاز' : 'ALLOWED ITEM TYPES'}</div>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        justifyContent: 'center'
                      }}>
                        {(isRTL ? flight.itemTypesFa : flight.itemTypes)?.map((itemType: string, index: number) => (
                          <span
                            key={index}
                            style={{
                              fontSize: '11px',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                              color: '#1e40af',
                              fontWeight: '600',
                              border: '1px solid #93c5fd',
                              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                            }}
                          >
                            {itemType}
                          </span>
                        ))}
                       </div>
                     </div>
                   )}

                  {/* Compact Description */}
                  {flight.description && (
                    <div style={{
                      background: 'rgba(3, 125, 136, 0.8)',
                      padding: '8px',
                      border: '1px solid rgba(80, 180, 255, 0.1)',
                    }}>
                      <div style={{
                        fontSize: '10px',
                        color: '#000',
                        marginBottom: '4px',
                        fontFamily: 'IRANSansX, sans-serif'
                      }}>
                        {isRTL ? 'توضیحات:' : 'Description:'}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#fff',
                        fontFamily: 'IRANSansX, sans-serif',
                        lineHeight: '1.4'
                      }}>
                        {flight.description}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParcelList;