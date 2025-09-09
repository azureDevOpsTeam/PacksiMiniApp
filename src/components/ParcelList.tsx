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
import MyRequest from './MyRequest';

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
  
  @keyframes fadeInScale {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
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
  const [showMyRequest, setShowMyRequest] = useState(false);
  const [showSelectTripModal, setShowSelectTripModal] = useState(false);
  const [selectedFlightForTrip, setSelectedFlightForTrip] = useState<OutboundTrip | null>(null);
  const [selectedTripOption, setSelectedTripOption] = useState<string>('');
  const [suggestionPrice, setSuggestionPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('-1'); // -1 for select, 1 for USD, 2 for IRR
  const [description, setDescription] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Tab system
  type TabType = 'incoming' | 'outgoing' | 'ipicked' | 'pickedme';
  const [activeTab, setActiveTab] = useState<TabType>('outgoing');
  
  // Responsive state for small screens
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);
  
  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 380);
    };
    
    // Set initial value
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter flights based on search query and active tab using TripType
  const filteredFlights = flights.filter(flight => {
    // Tab filter based on TripType
    let matchesTab = true;
    switch (activeTab) {
      case 'incoming':
        matchesTab = flight.tripType === 'inbound' && !flight.selectStatus;
        break;
      case 'outgoing':
        matchesTab = flight.tripType === 'outbound' && !flight.selectStatus;
        break;
      case 'ipicked':
        matchesTab = flight.selectStatus === 'ipicked';
        break;
      case 'pickedme':
        matchesTab = flight.selectStatus === 'pickedme';
        break;
      default:
        matchesTab = true;
    }
    
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

      return matchesTab && matchesSearch;
    }

    return matchesTab;
  });

  // Get count for each tab
  const getTabCount = (tabType: TabType) => {
    return flights.filter(flight => {
      switch (tabType) {
        case 'incoming':
          return flight.tripType === 'inbound';
        case 'outgoing':
          return flight.tripType === 'outbound';
        case 'ipicked':
          return flight.selectStatus === 'ipicked';
        case 'pickedme':
          return flight.selectStatus === 'pickedme';
        default:
          return false;
      }
    }).length;
  };

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
        // Open modal instead of direct API call
        setSelectedFlightForTrip(flight);
        setShowSelectTripModal(true);
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

  // Handle select trip modal submission
  const handleSelectTripSubmit = async () => {
    if (!selectedFlightForTrip || !selectedTripOption) {
      setApiResult({
        success: false,
        message: isRTL ? 'لطفا گزینه سفر را انتخاب کنید' : 'Please select a trip option'
      });
      
      setTimeout(() => {
        setApiResult(null);
      }, 3000);
      return;
    }

    // Validate price suggestion fields if price suggestion is selected
    if (selectedTripOption === 'suggest_price') {
      if (!suggestionPrice || suggestionPrice.trim() === '' || parseFloat(suggestionPrice) <= 0) {
        setApiResult({
          success: false,
          message: isRTL ? 'لطفا قیمت پیشنهادی معتبر وارد کنید' : 'Please enter a valid suggested price'
        });
        
        setTimeout(() => {
          setApiResult(null);
        }, 3000);
        return;
      }
      
      if (!currency || currency === '-1') {
        setApiResult({
          success: false,
          message: isRTL ? 'لطفا نوع ارز را انتخاب کنید' : 'Please select currency type'
        });
        
        setTimeout(() => {
          setApiResult(null);
        }, 3000);
        return;
      }
    }

    try {
      setIsLoading(true);
      
      let requestData;
      
      if (selectedTripOption === 'suggest_price') {
        // For price suggestion, use the new API structure
        requestData = {
          model: {
            requestId: selectedFlightForTrip.requestId,
            suggestionPrice: parseFloat(suggestionPrice) || 0,
            currency: parseInt(currency) || 0,
            description: description
          }
        };
      } else {
        // For regular trip selection, use the old structure
        requestData = {
          model: {
            requestId: selectedFlightForTrip.requestId,
            tripOption: selectedTripOption
          }
        };
      }
      
      const response = await apiService.selectRequest(requestData);

      if (response.requestStatus.value === 0) {
        setApiResult({
          success: true,
          message: response.message || t('submitSuggestion.success')
        });
        
        // Update local state
        setFlights(prevFlights => 
          prevFlights.map(flight => 
            flight.requestId === selectedFlightForTrip.requestId 
              ? {
                  ...flight,
                  currentUserStatus: 1,
                  currentUserStatusEn: 'pickedme',
                  currentUserStatusFa: 'انتخاب شده'
                }
              : flight
          )
        );
        
        // Close modal immediately after success
        setShowSelectTripModal(false);
        setSelectedFlightForTrip(null);
        setSelectedTripOption('');
        setSuggestionPrice('');
        setCurrency('-1');
        setDescription('');
        
        // Show success message and redirect after 1.5 seconds
        setTimeout(() => {
          setApiResult(null);
          // Navigate back to previous page or home
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '/';
          }
        }, 1500);
        
        await fetchFlights();
      } else {
        setApiResult({
          success: false,
          message: response.message || (isRTL ? 'خطا در ثبت درخواست' : 'Error submitting request')
        });
        
        setTimeout(() => {
          setApiResult(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setApiResult({
        success: false,
        message: isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error'
      });
      
      setTimeout(() => {
        setApiResult(null);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle select trip modal cancel
  const handleSelectTripCancel = () => {
    setShowSelectTripModal(false);
    setSelectedFlightForTrip(null);
    setSelectedTripOption('');
    setSuggestionPrice('');
    setCurrency('-1');
    setDescription('');
  };



  // Fetch flights using new GetRequestTrips endpoint
  const fetchFlights = async () => {
    setFlightsLoading(true);
    setFlightsError(null);
    try {
      const response = await apiService.getRequestTrips();
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

  // No need to fetch flights when activeTab changes since we get all data at once
  // Filtering is now done client-side based on tripType

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

  if (showMyRequest) {
    return (
      <div>
        <MyRequest />
        <button
          onClick={() => setShowMyRequest(false)}
          style={{
            position: 'fixed',
            top: '20px',
            left: '20px',
            padding: '10px 15px',
            backgroundColor: '#2ea5f7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            fontFamily: 'IRANSansX, sans-serif',
            zIndex: 1000
          }}
        >
          ← Back
        </button>
      </div>
    );
  }

  // Show success message if apiResult is success
  if (apiResult && apiResult.success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#22c55e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        color: '#ffffff',
        fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#ffffff',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
          fontSize: '40px'
        }}>
          ✅
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '12px',
          textAlign: 'center',
          margin: '0 0 12px 0'
        }}>
          {t('submitSuggestion.successTitle')}
        </h2>
        <p style={{
          fontSize: '16px',
          textAlign: 'center',
          lineHeight: '1.5',
          margin: '0',
          padding: '0 20px'
        }}>
          {apiResult.message}
        </p>
      </div>
    );
  }

  // Show parcel list if setPreferredLocation is true
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>
      {/* Settings Component */}
      <Settings 
        activeButton={activeButton} 
        setActiveButton={setActiveButton}
      />

      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        top: '80px',
        left: '0',
        right: '0',
        backgroundColor: theme.colors.background,
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
              case 'incoming':
                return isRTL ? 'لیست پروازهای ورودی' : 'Incoming Flights List';
              case 'outgoing':
                return isRTL ? 'لیست پروازهای خروجی' : 'Outgoing Flights List';
              case 'ipicked':
                return isRTL ? 'من انتخاب کرده ام' : 'I Picked List';
              case 'pickedme':
                return isRTL ? 'انتخاب شده ام' : 'Picked Me List';
              default:
                return isRTL ? 'لیست پروازها' : 'Flights List';
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
          maxWidth: '400px',
          width: '100%',
            display: 'flex',
            backgroundColor: '#212a33',
            borderRadius: '12px',
            padding: '4px',
            gap: '2px',
            border: '1px solid #3a4a5c',
            justifyContent: 'space-between'
          }}>
            {[
              { key: 'incoming' as TabType, labelFa: 'ورودی', labelEn: 'Incoming', icon: '⬇️' },
              { key: 'outgoing' as TabType, labelFa: 'خروجی', labelEn: 'Outgoing', icon: '⬆️' },
              { key: 'ipicked' as TabType, labelFa: 'منتخب من', labelEn: 'ipicked', icon: '🎯' },
              { key: 'pickedme' as TabType, labelFa: 'انتخاب شدم', labelEn: 'pickedme', icon: '⭐' }
            ].map((tab) => {
              const tabCount = getTabCount(tab.key);
              return (
              <div key={tab.key} style={{ position: 'relative' }}>
                {(tab.key === 'ipicked' || tab.key === 'pickedme') && tabCount > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    minWidth: '18px',
                    height: '18px',
                    backgroundColor: '#ef4444',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    zIndex: 10,
                    padding: '0 4px'
                  }}>
                    {tabCount}
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: isSmallScreen ? '8px 12px' : '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTab === tab.key ? '#50b4ff' : 'transparent',
                    color: activeTab === tab.key ? '#ffffff' : '#848d96',
                    fontSize: isSmallScreen ? '16px' : '12px',
                    fontFamily: 'IRANSansX, sans-serif',
                    fontWeight: activeTab === tab.key ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap',
                    minWidth: isSmallScreen ? '40px' : 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    maxWidth: isSmallScreen ? '400px' : 'auto',
                    width: isSmallScreen ? '100%' : 'auto',
                    flex: isSmallScreen ? '1' : 'auto'
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
                  {isSmallScreen ? tab.icon : (isRTL ? tab.labelFa : tab.labelEn)}
                </button>
              </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{
        marginTop: '240px',
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

        {/* Flights List */}
        <div style={{ width: '100%', margin: '0 auto', maxWidth: '400px', padding: '20px 0' }}>
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
                        {/* Submit Suggestion Button or Selected Status */}
                        {flight.currentUserStatus === 1 ? (
                          <div
                            style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              backgroundColor: '#6b7280',
                              color: 'white',
                              border: 'none',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(107, 114, 128, 0.3)',
                              opacity: 0.7
                            }}
                          >
                            {isRTL ? 'انتخاب شده' : 'pickedme'}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFlightForTrip(flight);
                              setSelectedTripOption('');
                              setShowSelectTripModal(true);
                            }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '16px',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              textAlign: 'center',
                              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#059669';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#10b981';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.3)';
                            }}
                          >
                            {isRTL ? 'پیشنهاد قیمت' : 'Suggest Price'}
                          </button>
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
                                border: '1px solid rgba(73, 88, 82, 0.1)',
                                animation: 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                              }}>
                                {/* Menu Header */}
                                <div style={{
                                  padding: '10px 10px 8px 10px',
                                  borderBottom: '1px solid rgba(0, 245, 212, 0.1)',
                                  textAlign: 'center'
                                }}>
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

    {/* Select Trip Modal */}
    {showSelectTripModal && selectedFlightForTrip && createPortal(
      <>
        {/* Background Overlay */}
        <div 
          onClick={handleSelectTripCancel}
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
          minWidth: '320px',
          maxWidth: '400px',
          zIndex: 100000,
          overflow: 'hidden',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          animation: 'fadeInScale 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {/* Modal Header */}
          <div style={{
            padding: '20px 20px 16px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={handleSelectTripCancel}
              style={{
                position: 'absolute',
                top: '16px',
                right: isRTL ? 'auto' : '16px',
                left: isRTL ? '16px' : 'auto',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ffffff',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ×
            </button>
            
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {isRTL ? 'پیشنهاد قیمت' : 'Price Suggestion'}
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              color: '#a0a8b0',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {isRTL ? `درخواست #${selectedFlightForTrip.requestId}` : `Request #${selectedFlightForTrip.requestId}`}
            </p>
          </div>
          
          {/* Modal Body */}
          <div style={{ padding: '20px' }}>
            {/* Flight Info Card */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{
                  fontSize: '14px',
                  color: '#10b981',
                  fontWeight: '600',
                  fontFamily: 'IRANSansX, sans-serif'
                }}>
                  {selectedFlightForTrip.originCity} → {selectedFlightForTrip.destinationCity}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: '#a0a8b0',
                  fontFamily: 'IRANSansX, sans-serif'
                }}>
                  {selectedFlightForTrip.fullName}
                </span>
              </div>
              <div style={{
                fontSize: '12px',
                color: '#ffffff',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'لطفاً قیمت پیشنهادی خود را وارد کنید' : 'Please enter your suggested price'}
              </div>
            </div>
            
            {/* Trip Options Dropdown */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#ffffff',
                marginBottom: '8px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500'
              }}>
                {isRTL ? 'نوع درخواست:' : 'Request Type:'} <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedTripOption}
                onChange={(e) => setSelectedTripOption(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'IRANSansX, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(80, 180, 255, 0.5)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <option value="" style={{ background: '#1a202c', color: '#ffffff' }}>
                  {isRTL ? 'نوع درخواست را انتخاب کنید' : 'Select request type'}
                </option>
                <option value="accept_price" style={{ background: '#1a202c', color: '#ffffff' }}>
                  {isRTL ? 'قبول قیمت‌های موجود' : 'Accept existing prices'}
                </option>
                <option value="suggest_price" style={{ background: '#1a202c', color: '#ffffff' }}>
                  {isRTL ? 'پیشنهاد قیمت جدید' : 'Suggest new price'}
                </option>
              </select>
            </div>
            
            {/* Price Suggestion Fields */}
            {selectedTripOption === 'suggest_price' && (
              <>
                {/* Suggested Price Input */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#ffffff',
                    marginBottom: '8px',
                    fontFamily: 'IRANSansX, sans-serif',
                    fontWeight: '500'
                  }}>
                    {isRTL ? 'قیمت پیشنهادی:' : 'Suggested Price:'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={suggestionPrice}
                    onChange={(e) => setSuggestionPrice(e.target.value)}
                    placeholder={isRTL ? 'قیمت پیشنهادی را وارد کنید' : 'Enter suggested price'}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'IRANSansX, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(80, 180, 255, 0.5)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                </div>
                
                {/* Currency Selection */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#ffffff',
                    marginBottom: '8px',
                    fontFamily: 'IRANSansX, sans-serif',
                    fontWeight: '500'
                  }}>
                    {isRTL ? 'نوع ارز:' : 'Currency Type:'} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'IRANSansX, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(80, 180, 255, 0.5)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  >
                    <option value="-1" style={{ background: '#1a202c', color: '#ffffff' }}>
                      {isRTL ? 'نوع ارز را انتخاب کنید' : 'Select Currency'}
                    </option>
                    <option value="1" style={{ background: '#1a202c', color: '#ffffff' }}>
                      {isRTL ? 'دلار' : 'Dollar'}
                    </option>
                    <option value="2" style={{ background: '#1a202c', color: '#ffffff' }}>
                      {isRTL ? 'ریال' : 'Rial'}
                    </option>
                  </select>
                </div>
                
                {/* Description Textarea */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    color: '#ffffff',
                    marginBottom: '8px',
                    fontFamily: 'IRANSansX, sans-serif',
                    fontWeight: '500'
                  }}>
                    {isRTL ? 'توضیحات:' : 'Description:'}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={isRTL ? 'توضیحات خود را وارد کنید' : 'Enter your description'}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontFamily: 'IRANSansX, sans-serif',
                      outline: 'none',
                      transition: 'all 0.3s ease',
                      resize: 'vertical',
                      minHeight: '80px'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(80, 180, 255, 0.5)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}
                  />
                </div>
              </>
            )}
            
            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleSelectTripCancel}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'transparent',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'IRANSansX, sans-serif',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.5 : 1,
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </button>
              
              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSelectTripSubmit}
                disabled={isLoading || !selectedTripOption || (selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))}
                style={{
                  padding: '14px 28px',
                  borderRadius: '16px',
                  border: 'none',
                  background: (isLoading || !selectedTripOption || (selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) 
                    ? 'linear-gradient(135deg, rgba(107, 114, 128, 0.6), rgba(75, 85, 99, 0.6))' 
                    : selectedTripOption === 'suggest_price'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)'
                      : 'linear-gradient(135deg, #10b981, #059669, #047857)',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontFamily: 'IRANSansX, sans-serif',
                  cursor: (isLoading || !selectedTripOption || (selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: (isLoading || !selectedTripOption || (selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: (isLoading || !selectedTripOption || (selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) 
                    ? 'none' 
                    : selectedTripOption === 'suggest_price'
                      ? '0 8px 25px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      : '0 8px 25px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading && selectedTripOption && !(selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) {
                    if (selectedTripOption === 'suggest_price') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d97706, #b45309, #92400e)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 158, 11, 0.5), 0 6px 20px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #047857, #065f46)';
                      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.5), 0 6px 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && selectedTripOption && !(selectedTripOption === 'suggest_price' && (!suggestionPrice || currency === '-1'))) {
                    if (selectedTripOption === 'suggest_price') {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f59e0b, #d97706, #b45309)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4), 0 4px 12px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    } else {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #10b981, #059669, #047857)';
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.4), 0 4px 12px rgba(16, 185, 129, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }
                  }
                }}
              >
                {isLoading ? (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <span style={{
                    fontSize: '18px',
                    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))',
                    animation: selectedTripOption === 'suggest_price' ? 'pulse 2s infinite' : 'none'
                  }}>
                    {selectedTripOption === 'suggest_price' ? '💡' : '✈️'}
                  </span>
                )}
                <span style={{
                  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  fontWeight: '700'
                }}>
                  {selectedTripOption === 'suggest_price' 
                    ? (isRTL ? 'ثبت پیشنهاد' : 'Submit Suggestion')
                    : (isRTL ? 'ثبت درخواست' : 'Submit Request')
                  }
                </span>
              </button>
            </div>
          </div>
        </div>
      </>,
      document.body
    )}
    </div>
  );
};

export default ParcelList;