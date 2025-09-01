import React, { useState, useEffect } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true); // Default to showing form until API response
  const [flights, setFlights] = useState<OutboundTrip[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [expandedFlights, setExpandedFlights] = useState<Set<number>>(new Set());
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

  // Toggle accordion for specific flight
  const toggleFlightAccordion = (requestId: number) => {
    setExpandedFlights(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
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
        const response = await apiService.validate();

        if (response.objectResult) {
          const { setPreferredLocation } = response.objectResult;
          setShowForm(!setPreferredLocation); // Show form if setPreferredLocation is false, show list if true
          // Fetch flights when user has preferred location
          if (setPreferredLocation) {
            fetchFlights();
          }
        }
      } catch (error) {
        console.error('Error checking preferred location:', error);
        // On error, show form by default
        setShowForm(true);
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
          position: 'fixed',
          top: '20px',
          left: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 1000
        }}>
          <button
            onClick={() => setTripType('outbound')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
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
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" transform="rotate(-45 12 12)"/>
            </svg>
          </button>
          
          <button
            onClick={() => setTripType('inbound')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
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
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="currentColor" transform="rotate(135 12 12)"/>
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
        <div style={{ width: '100%', margin: '0 auto 20px auto', maxWidth: '400px' }}>
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
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '400px' }}>
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
                    background: 'rgba(26, 35, 50, 0.6)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid rgba(80, 180, 255, 0.08)',
                    direction: isRTL ? 'rtl' : 'ltr',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(80, 180, 255, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Flight status indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: isRTL ? 'auto' : '12px',
                    left: isRTL ? '12px' : 'auto',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#10b981',
                    opacity: 0.8
                  }} />

                  {/* Flight Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#e2e8f0'
                      }}>
                        {flight.originCity}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: '#64748b'
                      }}>
                        →
                      </span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#e2e8f0'
                      }}>
                        {flight.destinationCity}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      #{flight.requestId}
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    marginBottom: '12px'
                  }}>
                    {formatDate(flight.departureDate)}
                  </div>

                  {/* Cargo Specifications */}
                  <div
                    onClick={() => toggleFlightAccordion(flight.requestId)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid rgba(80, 180, 255, 0.1)',
                      cursor: 'pointer',
                      marginBottom: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        color: '#cbd5e1',
                        fontWeight: '500'
                      }}>
                        {isRTL ? 'مشخصات بار' : 'Cargo Details'}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#64748b',
                        transform: expandedFlights.has(flight.requestId) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease'
                      }}>▼</div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '6px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        fontSize: '10px',
                        color: '#94a3b8'
                      }}>
                        {flight.maxWeightKg && <span>{flight.maxWeightKg}kg</span>}
                        {flight.maxWeightKg && (flight.maxLengthCm || flight.maxWidthCm || flight.maxHeightCm) && <span>•</span>}
                        {(flight.maxLengthCm || flight.maxWidthCm || flight.maxHeightCm) && (
                          <span>
                            {flight.maxLengthCm || '?'}×{flight.maxWidthCm || '?'}×{flight.maxHeightCm || '?'}cm
                          </span>
                        )}
                      </div>
                      {((isRTL && flight.itemTypesFa && flight.itemTypesFa.length > 0) || 
                        (!isRTL && flight.itemTypes && flight.itemTypes.length > 0)) && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                          marginTop: '2px'
                        }}>
                          {(isRTL ? flight.itemTypesFa : flight.itemTypes)?.slice(0, 3).map((itemType: string, index: number) => (
                            <span
                              key={index}
                              style={{
                                fontSize: '8px',
                                padding: '2px 4px',
                                borderRadius: '3px',
                                background: 'rgba(80, 180, 255, 0.15)',
                                color: '#94a3b8',
                                fontFamily: 'IRANSansX, sans-serif'
                              }}
                            >
                              {itemType}
                            </span>
                          ))}
                          {(isRTL ? flight.itemTypesFa : flight.itemTypes) && 
                           (isRTL ? flight.itemTypesFa : flight.itemTypes).length > 3 && (
                            <span style={{
                              fontSize: '8px',
                              padding: '2px 4px',
                              borderRadius: '3px',
                              background: 'rgba(55, 65, 81, 0.3)',
                              color: '#64748b',
                              fontFamily: 'IRANSansX, sans-serif'
                            }}>
                              +{(isRTL ? flight.itemTypesFa : flight.itemTypes).length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Cargo Details */}
                  {expandedFlights.has(flight.requestId) && (
                    <div style={{
                      background: 'linear-gradient(135deg, #0a0e13 0%, #1a2329 50%, #0a0e13 100%)',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '2px solid rgba(80, 180, 255, 0.2)',
                      marginBottom: '16px',
                      animation: 'slideDown 0.4s ease',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
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
                          radial-gradient(circle at 10% 10%, rgba(80, 180, 255, 0.05) 0%, transparent 50%),
                          radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
                        `,
                        pointerEvents: 'none'
                      }} />
                      
                      {/* Header */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        paddingBottom: '12px',
                        borderBottom: '1px solid rgba(80, 180, 255, 0.2)'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '16px',
                          background: 'linear-gradient(135deg, #50b4ff, #2563eb)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          boxShadow: '0 6px 20px rgba(80, 180, 255, 0.4)'
                        }}>📦</div>
                        <div>
                          <div style={{
                            fontSize: '14px',
                            color: '#ffffff',
                            fontFamily: 'IRANSansX, sans-serif',
                            fontWeight: '700',
                            marginBottom: '2px'
                          }}>
                            {isRTL ? 'مشخصات کامل بار' : 'Complete Cargo Specifications'}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#a0aec0',
                            fontFamily: 'IRANSansX, sans-serif'
                          }}>
                            {isRTL ? 'حداکثر ابعاد و وزن مجاز' : 'Maximum allowed dimensions and weight'}
                          </div>
                        </div>
                      </div>
                      
                      {/* Specifications Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '16px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: '12px',
                          fontSize: '14px',
                          color: '#6b7280',
                          fontFamily: 'IRANSansX, sans-serif'
                        }}>
                          <span>{isRTL ? 'وزن:' : 'Weight:'} {flight.maxWeightKg || 'N/A'} {isRTL ? 'کیلوگرم' : 'kg'}</span>
                          <span>{isRTL ? 'ابعاد:' : 'Dimensions:'} {flight.maxLengthCm || 'N/A'}×{flight.maxWidthCm || 'N/A'}×{flight.maxHeightCm || 'N/A'} {isRTL ? 'سانتی‌متر' : 'cm'}</span>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Compact Description */}
                  {flight.description && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.4)',
                      padding: '8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(80, 180, 255, 0.1)',
                      marginBottom: '8px'
                    }}>
                      <div style={{
                        fontSize: '10px',
                        color: '#94a3b8',
                        marginBottom: '4px',
                        fontFamily: 'IRANSansX, sans-serif'
                      }}>
                        {isRTL ? 'توضیحات:' : 'Description:'}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#cbd5e1',
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