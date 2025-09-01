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

// Add CSS animation for accordion
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
  const { isRTL, t } = useLanguage();
  const { theme } = useTheme();
  const { webApp } = useTelegramContext();
  
  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true); // Default to showing form until API response
  const [flights, setFlights] = useState<OutboundTrip[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(false);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set());

  // Toggle accordion for specific flight
  const toggleFlightAccordion = (requestId: string) => {
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

  // Fetch outbound flights
  const fetchFlights = async () => {
    setFlightsLoading(true);
    setFlightsError(null);
    try {
      const response = await apiService.getOutboundTrips();
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
          لیست بسته‌ها
        </h2>

        {/* Flights List */}
        <div style={{ width: '100%', margin: '0 auto', padding: '0', maxWidth: '400px'  }}>
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
              هیچ پروازی یافت نشد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {flights.map((flight) => (
                 <div
                   key={flight.requestId}
                  style={{
                    backgroundColor: '#212a33',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid #3a4a5c',
                    direction: isRTL ? 'rtl' : 'ltr',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Gradient overlay */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #50b4ff, #10b981, #8b5cf6)',
                    borderRadius: '12px 12px 0 0'
                  }} />

                  {/* Compact Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #50b4ff, #2563eb)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px'
                      }}>✈️</div>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '700',
                          color: '#ffffff',
                          fontFamily: 'IRANSansX, sans-serif',
                          lineHeight: '1.2'
                        }}>
                          {flight.originCity} → {flight.destinationCity}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: '#848d96',
                          fontFamily: 'IRANSansX, sans-serif',
                          marginTop: '2px'
                        }}>
                          📅 {formatDate(flight.departureDate)}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '9px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#ffffff',
                      fontFamily: 'IRANSansX, sans-serif',
                      fontWeight: '600',
                      boxShadow: '0 1px 4px rgba(16, 185, 129, 0.3)'
                    }}>
                      #{flight.requestId}
                    </div>
                  </div>

                  {/* Compact Specifications */}
                   <div style={{
                     display: 'flex',
                     gap: '8px',
                     marginBottom: '12px'
                   }}>
                     <div 
                       onClick={() => toggleFlightAccordion(flight.requestId)}
                       style={{
                         flex: 1,
                         backgroundColor: '#1a2329',
                         padding: '10px',
                         borderRadius: '8px',
                         border: '1px solid #2d3748',
                         cursor: 'pointer',
                         transition: 'all 0.2s ease',
                         background: expandedFlights.has(flight.requestId) ? 'linear-gradient(135deg, #1f2937, #374151)' : '#1a2329'
                       }}
                     >
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'space-between'
                       }}>
                         <div style={{
                           display: 'flex',
                           alignItems: 'center',
                           gap: '6px'
                         }}>
                           <span style={{ fontSize: '12px' }}>📦</span>
                           <span style={{
                             fontSize: '11px',
                             color: '#ffffff',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '600'
                           }}>
                             {isRTL ? 'مشخصات' : 'Specs'}
                           </span>
                         </div>
                         <span style={{
                           fontSize: '10px',
                           color: '#50b4ff',
                           transform: expandedFlights.has(flight.requestId) ? 'rotate(180deg)' : 'rotate(0deg)',
                           transition: 'transform 0.2s ease'
                         }}>▼</span>
                       </div>
                       <div style={{
                         fontSize: '9px',
                         color: '#848d96',
                         fontFamily: 'IRANSansX, sans-serif',
                         marginTop: '4px'
                       }}>
                         ⚖️ {flight.maxWeightKg || 'N/A'}kg • 📐 {flight.maxLengthCm || 'N/A'}×{flight.maxWidthCm || 'N/A'}×{flight.maxHeightCm || 'N/A'}cm
                       </div>
                     </div>
                   </div>

                   {/* Expanded Specifications */}
                   {expandedFlights.has(flight.requestId) && (
                     <div style={{
                       backgroundColor: '#0f1419',
                       padding: '12px',
                       borderRadius: '8px',
                       border: '1px solid #1f2937',
                       marginBottom: '12px',
                       animation: 'slideDown 0.3s ease'
                     }}>
                       <div style={{
                         display: 'grid',
                         gridTemplateColumns: '1fr 1fr 1fr 1fr',
                         gap: '8px'
                       }}>
                         <div style={{ textAlign: 'center' }}>
                           <div style={{
                             fontSize: '16px',
                             marginBottom: '4px'
                           }}>⚖️</div>
                           <div style={{
                             fontSize: '10px',
                             color: '#50b4ff',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '600'
                           }}>
                             {flight.maxWeightKg || 'N/A'}kg
                           </div>
                         </div>
                         <div style={{ textAlign: 'center' }}>
                           <div style={{
                             fontSize: '16px',
                             marginBottom: '4px'
                           }}>📏</div>
                           <div style={{
                             fontSize: '10px',
                             color: '#50b4ff',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '600'
                           }}>
                             {flight.maxLengthCm || 'N/A'}cm
                           </div>
                         </div>
                         <div style={{ textAlign: 'center' }}>
                           <div style={{
                             fontSize: '16px',
                             marginBottom: '4px'
                           }}>📐</div>
                           <div style={{
                             fontSize: '10px',
                             color: '#50b4ff',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '600'
                           }}>
                             {flight.maxWidthCm || 'N/A'}cm
                           </div>
                         </div>
                         <div style={{ textAlign: 'center' }}>
                           <div style={{
                             fontSize: '16px',
                             marginBottom: '4px'
                           }}>📊</div>
                           <div style={{
                             fontSize: '10px',
                             color: '#50b4ff',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '600'
                           }}>
                             {flight.maxHeightCm || 'N/A'}cm
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

                  {/* Compact Item Types */}
                   {flight.itemTypes && flight.itemTypes.length > 0 && (
                     <div style={{
                       marginBottom: '10px'
                     }}>
                       <div style={{
                         display: 'flex',
                         alignItems: 'center',
                         gap: '6px',
                         marginBottom: '6px'
                       }}>
                         <span style={{ fontSize: '12px' }}>🏷️</span>
                         <span style={{
                           fontSize: '10px',
                           color: '#848d96',
                           fontFamily: 'IRANSansX, sans-serif',
                           fontWeight: '500'
                         }}>
                           {isRTL ? 'انواع اقلام' : 'Items'}
                         </span>
                       </div>
                       <div style={{
                         display: 'flex',
                         flexWrap: 'wrap',
                         gap: '4px'
                       }}>
                         {flight.itemTypes.slice(0, 3).map((itemType, index) => (
                           <span
                             key={index}
                             style={{
                               fontSize: '9px',
                               padding: '3px 8px',
                               borderRadius: '12px',
                               background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                               color: '#ffffff',
                               fontFamily: 'IRANSansX, sans-serif',
                               fontWeight: '600'
                             }}
                           >
                             {itemType}
                           </span>
                         ))}
                         {flight.itemTypes.length > 3 && (
                           <span style={{
                             fontSize: '9px',
                             padding: '3px 8px',
                             borderRadius: '12px',
                             backgroundColor: '#374151',
                             color: '#9ca3af',
                             fontFamily: 'IRANSansX, sans-serif',
                             fontWeight: '500'
                           }}>
                             +{flight.itemTypes.length - 3}
                           </span>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Compact Description */}
                   {flight.description && (
                     <div style={{
                       fontSize: '10px',
                       color: '#a0aec0',
                       fontFamily: 'IRANSansX, sans-serif',
                       fontStyle: 'italic',
                       padding: '8px 0',
                       borderTop: '1px solid #2d3748',
                       lineHeight: '1.4'
                     }}>
                       💬 {flight.description.length > 80 ? flight.description.substring(0, 80) + '...' : flight.description}
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