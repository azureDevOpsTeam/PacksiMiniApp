import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramContext } from '../hooks/useTelegramContext';
import { apiService } from '../services/apiService';
import type { OutboundTrip } from '../types/api';
import AddPreferredLocation from './AddPreferredLocation';
import Logo from './Logo';

import SkeletonLoader from './SkeletonLoader';
import MyRequest from './MyRequest';

// Toast notification helper function
const toast = {
  error: (message: string) => {
    // Simple implementation to show error messages
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '20px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.backgroundColor = '#ef4444';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '12px 20px';
    errorDiv.style.borderRadius = '8px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    errorDiv.style.fontFamily = 'IRANSansX, sans-serif';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.style.opacity = '0';
      errorDiv.style.transition = 'opacity 0.3s ease';
      setTimeout(() => document.body.removeChild(errorDiv), 300);
    }, 3000);
  }
};

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
  
  @keyframes slideDown {
    0% {
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideUp {
    0% {
      max-height: 1000px;
      opacity: 1;
      transform: translateY(0);
    }
    100% {
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
  }
  
  .accordion-content {
    overflow: hidden;
    transition: max-height 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
  }
  
  .accordion-content.open {
    animation: slideDown 0.5s ease forwards;
  }
  
  .accordion-content.closed {
    animation: slideUp 0.5s ease forwards;
    max-height: 0;
    opacity: 0;
  }

  .suggestions-modal::-webkit-scrollbar {
    display: none;
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


  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // Default to showing list
  const [flights, setFlights] = useState<OutboundTrip[]>([]);
  const [flightsLoading, setFlightsLoading] = useState(true);
  const [flightsError, setFlightsError] = useState<string | null>(null);
  const [itemTypes, setItemTypes] = useState<any[]>([]);
  // We're using a ref instead of state to track loading since we don't need to re-render on this change
  const itemTypesLoadingRef = React.useRef(false);
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [apiResult, setApiResult] = useState<{ success: boolean, message: string } | null>(null);
  const [showMyRequest, setShowMyRequest] = useState(false);
  const [showSelectTripModal, setShowSelectTripModal] = useState(false);
  const [selectedFlightForTrip, setSelectedFlightForTrip] = useState<OutboundTrip | null>(null);
  const [selectedTripOption, setSelectedTripOption] = useState<string>('');
  const [suggestionPrice, setSuggestionPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>('-1'); // -1 for select, 1 for USD, 2 for IRR
  const [description, setDescription] = useState<string>('');
  const [itemTypeId, setItemTypeId] = useState<number>(-1); // -1 for select, other values for item types
  const [files, setFiles] = useState<File[]>([]);

  // Suggestions modal state
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [selectedFlightForSuggestions, setSelectedFlightForSuggestions] = useState<OutboundTrip | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accept' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tab system
  type TabType = 'incoming' | 'outgoing';
  const [activeTab, setActiveTab] = useState<TabType>('outgoing');

  // Responsive state for small screens
  const [isSmallScreen, setIsSmallScreen] = useState<boolean>(false);

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 250);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Load item types on component mount
  useEffect(() => {
    const loadItemTypes = async () => {
      try {
        itemTypesLoadingRef.current = true;
        const response = await apiService.getItemTypes();
        if (response.requestStatus.name === 'Successful') {
          setItemTypes(response.objectResult);
        }
      } catch (error) {
        console.error('Error loading item types:', error);
        toast.error(isRTL ? 'خطا در بارگذاری انواع آیتم‌ها' : 'Error loading item types');
      } finally {
        itemTypesLoadingRef.current = false;
      }
    };

    loadItemTypes();
  }, []);

  // Filter flights based on search query and active tab using TripType
  const filteredFlights = flights.filter(flight => {
    // Tab filter based on TripType
    let matchesTab = true;
    switch (activeTab) {
      case 'incoming':
        matchesTab = flight.tripType === 'inbound';
        break;
      case 'outgoing':
        matchesTab = flight.tripType === 'outbound';
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

  // Toggle accordion expansion
  const toggleAccordion = (flightId: string | number) => {
    setExpandedCards(prev => ({
      ...prev,
      [flightId]: !prev[flightId]
    }));
  };
  
  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;
    
    const fileArray: File[] = [];
    let totalSize = 0;
    const maxSizePerFile = 2 * 1024 * 1024; // 2MB
    const maxTotalSize = 8 * 1024 * 1024; // 8MB
    
    // Check file types and sizes
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileType = file.type.toLowerCase();
      
      // Check if file is an image
      if (!fileType.startsWith('image/')) {
        toast.error(isRTL ? 'فقط فایل‌های تصویری مجاز هستند' : 'Only image files are allowed');
        return;
      }
      
      // Check individual file size
      if (file.size > maxSizePerFile) {
        toast.error(isRTL ? 
          `حجم هر فایل نباید بیشتر از 2 مگابایت باشد: ${file.name}` : 
          `File size should not exceed 2MB: ${file.name}`);
        return;
      }
      
      totalSize += file.size;
      fileArray.push(file);
    }
    
    // Check total size of all files
    if (totalSize > maxTotalSize) {
      toast.error(isRTL ? 
        'حجم کل فایل‌ها نباید بیشتر از 8 مگابایت باشد' : 
        'Total file size should not exceed 8MB');
      return;
    }
    
    setFiles(fileArray);
  };

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
      
      if (itemTypeId === -1) {
        setApiResult({
          success: false,
          message: isRTL ? 'لطفا نوع آیتم را انتخاب کنید' : 'Please select an item type'
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
            description: description,
            itemTypeId: itemTypeId,
            files: files
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
        setItemTypeId(-1);
        setFiles([]);

        // Show success message and redirect after 1.5 seconds
        setTimeout(() => {
          setApiResult(null);
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

  // Suggestions modal handlers
  const handleShowSuggestions = (flight: OutboundTrip) => {
    setSelectedFlightForSuggestions(flight);
    setShowSuggestionsModal(true);
  };

  const handleCloseSuggestionsModal = () => {
    setShowSuggestionsModal(false);
    setSelectedFlightForSuggestions(null);
    setSelectedSuggestion(null);
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  const handleSuggestionAction = (suggestion: any, action: 'accept' | 'reject') => {
    setSelectedSuggestion(suggestion);
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const handleConfirmSuggestionAction = async () => {
    if (!selectedSuggestion || !confirmAction) return;

    setActionLoading(true);
    try {
      const payload = {
        model: {
          requestSuggestionId: selectedSuggestion.suggestionId
        }
      };

      const response = confirmAction === 'accept'
        ? await apiService.confirmSuggestion(payload)
        : await apiService.rejectSuggestion(payload);

      if (response.requestStatus.value === 0) {
        // Update the suggestion status in the local state
        if (selectedFlightForSuggestions && selectedFlightForSuggestions.suggestions) {
          const updatedSuggestions = selectedFlightForSuggestions.suggestions.map(suggestion => {
            if (suggestion.suggestionId === selectedSuggestion.suggestionId) {
              return {
                ...suggestion,
                lastStatusEn: confirmAction === 'accept' ? 'accept' : 'rejected',
                lastStatusFa: confirmAction === 'accept' ? 'تایید شده' : 'رد شده'
              };
            }
            return suggestion;
          });

          setSelectedFlightForSuggestions({
            ...selectedFlightForSuggestions,
            suggestions: updatedSuggestions
          });

          // Also update the main flights list
          setFlights(prevFlights =>
            prevFlights.map((flight: OutboundTrip) => {
              if (flight.requestId === selectedFlightForSuggestions.requestId) {
                return {
                  ...flight,
                  suggestions: updatedSuggestions
                };
              }
              return flight;
            })
          );
        }

        setApiResult({
          success: true,
          message: isRTL
            ? `پیشنهاد با موفقیت ${confirmAction === 'accept' ? 'تایید' : 'رد'} شد`
            : `Suggestion ${confirmAction === 'accept' ? 'accepted' : 'rejected'} successfully`
        });

        // Close confirmation dialog
        setShowConfirmDialog(false);
        setSelectedSuggestion(null);
        setConfirmAction(null);
      } else {
        throw new Error(response.message || 'Failed to process suggestion');
      }

      setTimeout(() => {
        setApiResult(null);
      }, 3000);

    } catch (error) {
      console.error('Error handling suggestion action:', error);
      setApiResult({
        success: false,
        message: isRTL ? 'خطا در انجام عملیات' : 'Error performing action'
      });

      setTimeout(() => {
        setApiResult(null);
      }, 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelConfirmAction = () => {
    setShowConfirmDialog(false);
    setSelectedSuggestion(null);
    setConfirmAction(null);
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
        // Call validate API to check setPreferredLocation
        const validateResult = await apiService.validate();

        if (validateResult.objectResult.setPreferredLocation) {
          // User has set preferred location, show list
          setShowForm(false);
          fetchFlights();
        } else {
          // User hasn't set preferred location, show form
          setShowForm(true);
        }
      } catch (error) {
        console.error('Error checking preferred location:', error);
        // On error, show form to be safe
        setShowForm(true);
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
        minHeight: '90vh',
        padding: '10px 20px 0 20px',
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
      height: '90vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text.primary,
      direction: isRTL ? 'rtl' : 'ltr',
      fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative'
    }}>


      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        //top: '80px',
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
                return isRTL ? 'لیست پروازهای ورودی' : 'Inbound Flights List';
              case 'outgoing':
                return isRTL ? 'لیست پروازهای خروجی' : 'Outbound Flights List';
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
            display: 'flex',
            backgroundColor: '#212a33',
            borderRadius: '12px',
            padding: '4px',
            gap: '2px',
            border: '1px solid #3a4a5c',
            justifyContent: 'space-between'
          }}>
            {[
              { key: 'incoming' as TabType, labelFa: 'ورودی', labelEn: 'Inbound', icon: '⬇️' },
              { key: 'outgoing' as TabType, labelFa: 'خروجی', labelEn: 'Outbound', icon: '⬆️' }
            ].map((tab) => {
              return (
                <div key={tab.key} style={{ position: 'relative' }}>
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
                {filteredFlights.map((flight) => {
                  // Full card for all tabs
                  return (
                    <div
                      key={flight.requestId}
                      className="flight-card"
                      style={{
                        background: '#037d88cc',
                        borderRadius: '20px',
                        padding: '0',
                        border: '2px solid #e2e8f0',
                        direction: isRTL ? 'rtl' : 'ltr',
                        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: 'IRANSansX, sans-serif',
                        minHeight: '120px'
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
                      {/* Airline Header - Always visible section */}
                      <div 
                        onClick={() => (activeTab === 'incoming' || activeTab === 'outgoing') ? toggleAccordion(flight.requestId) : undefined}
                        style={{
                          background: 'linear-gradient(135deg,rgb(42, 66, 68) 0%,rgb(18, 134, 143) 100%)',
                          padding: '10px 20px',
                          color: 'white',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: (activeTab === 'incoming' || activeTab === 'outgoing') ? 'pointer' : 'default'
                        }}
                      >
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
                              {flight.selectStatus === "ipicked" ? (
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
                                  {isRTL ? 'انتخاب شده' : 'picked'}
                                </div>
                              ) : flight.selectStatus === "pickedme" ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleShowSuggestions(flight);
                                  }}
                                  style={{
                                    padding: '6px 12px',
                                    borderRadius: '16px',
                                    fontSize: '10px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#2563eb';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#3b82f6';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
                                  }}
                                >
                                  {isRTL ? t('flights.showSuggestions') : t('flights.showSuggestions')}
                                </button>
                              ) : (
                                <span
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
                                  {isRTL ? 'آخرین وضعیت' : 'Last Status'}
                                </span>
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
                                    background: 'linear-gradient(135deg, rgba(26, 38, 35, 0.95) 0%, rgba(22, 93, 192, 0.95) 100%)',
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
                        
                        {/* Expand/Collapse indicator - only for inbound and outbound tabs */}
                        {(activeTab === 'incoming' || activeTab === 'outgoing') && (
                          <div style={{
                            textAlign: 'center',
                            marginTop: '2px',
                            fontSize: '14px',
                            opacity: 0.7,
                            transition: 'transform 0.3s ease'
                          }}>
                            {expandedCards[flight.requestId] ? '▲' : '▼'}
                          </div>
                        )}
                      </div>

                      {/* Accordion Content - First Section - only for inbound and outbound tabs */}
                      {(activeTab === 'incoming' || activeTab === 'outgoing') ? (
                        <div className={`accordion-content ${expandedCards[flight.requestId] ? 'open' : 'closed'}`}>
                      
                        {/* Ticket Info Bar */}
                        <div style={{
                          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
                          padding: '12px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '2px dashed #cbd5e1'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: '10px',
                              color: '#64748b',
                              marginBottom: '2px'
                            }}>{isRTL ? 'تاریخ پرواز' : 'FLIGHT DATE'}</div>
                            <div style={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: '#1e293b',
                              marginBottom: '8px'
                            }}>{formatDate(flight.departureDate)}</div>

                            {/* Item Types in Ticket Bar */}
                            {((isRTL && flight.itemTypesFa && flight.itemTypesFa.length > 0) ||
                              (!isRTL && flight.itemTypes && flight.itemTypes.length > 0)) && (
                                <div>
                                  <div style={{
                                    fontSize: '8px',
                                    color: '#64748b',
                                    marginBottom: '4px'
                                  }}>{isRTL ? 'اقلام مجاز' : 'ALLOWED ITEMS'}</div>
                                  <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '4px'
                                  }}>
                                    {(isRTL ? flight.itemTypesFa : flight.itemTypes)?.slice(0, 3).map((itemType: string, index: number) => (
                                      <span
                                        key={index}
                                        style={{
                                          fontSize: '8px',
                                          padding: '2px 6px',
                                          borderRadius: '4px',
                                          background: '#dbeafe',
                                          color: '#1e40af',
                                          fontWeight: '500',
                                          border: '1px solid #93c5fd'
                                        }}
                                      >
                                        {itemType}
                                      </span>
                                    ))}
                                    {(isRTL ? flight.itemTypesFa : flight.itemTypes)?.length > 3 && (
                                      <span style={{
                                        fontSize: '8px',
                                        color: '#64748b',
                                        fontWeight: '500'
                                      }}>+{(isRTL ? flight.itemTypesFa : flight.itemTypes).length - 3}</span>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                          <div style={{
                            width: '120px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '8px',
                            fontSize: '10px',
                            color: '#64748b',
                          }}>
                            <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#475569', fontSize: '10px' }}>
                              {isRTL ? 'مشخصات بسته' : 'PACKAGE SPECS'}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{isRTL ? 'وزن' : 'Weight'}:</span>
                                <span style={{ fontWeight: 'bold', color: '#334155' }}>{flight.maxWeightKg || '-'} kg</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{isRTL ? 'طول' : 'Length'}:</span>
                                <span style={{ fontWeight: 'bold', color: '#334155' }}>{flight.maxLengthCm || '-'} cm</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{isRTL ? 'عرض' : 'Width'}:</span>
                                <span style={{ fontWeight: 'bold', color: '#334155' }}>{flight.maxWidthCm || '-'} cm</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{isRTL ? 'ارتفاع' : 'Height'}:</span>
                                <span style={{ fontWeight: 'bold', color: '#334155' }}>{flight.maxHeightCm || '-'} cm</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      ) : (
                        <div style={{ padding: '12px 20px' }}>
                          {/* Ticket Info Bar - Always visible for ipicked and pickedme */}
                          <div style={{
                            background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
                            padding: '12px 20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderRadius: '8px',
                            marginBottom: '10px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontSize: '10px',
                                color: '#64748b',
                                marginBottom: '2px'
                              }}>{isRTL ? 'تاریخ پرواز' : 'FLIGHT DATE'}</div>
                              <div style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#1e293b',
                                marginBottom: '8px'
                              }}>{formatDate(flight.departureDate)}</div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* Accordion Content - Second Section - only for inbound and outbound tabs */}
                      {(activeTab === 'incoming' || activeTab === 'outgoing') && (
                        <div className={`accordion-content ${expandedCards[flight.requestId] ? 'open' : 'closed'}`}>
                          {/* Compact Description */}
                          {flight.description && (
                            <div style={{
                              background: 'rgba(3, 125, 136, 0.8)',
                              padding: '8px',
                              border: '1px solid rgba(80, 180, 255, 0.1)',
                              marginBottom: '10px'
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
                          
                          {/* Action Buttons - Added for inbound and outbound tabs */}
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            gap: '0px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
                            border: '1px solid #e5e7eb',
                            margin: '0 10px 10px 10px'
                          }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Open select trip modal with suggest_price option
                                setSelectedFlightForTrip(flight);
                                setSelectedTripOption('');
                                setShowSelectTripModal(true);
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
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                                e.currentTarget.style.color = '#2563eb';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ffffff';
                                e.currentTarget.style.color = '#4b5563';
                              }}
                            >
                              {isRTL ? 'پیشنهاد قیمت' : 'Suggestion Price'} <span style={{ fontSize: '14px' }}>💰</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
            <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto'  }}>
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
                  
                  {/* Item Type Selection - Radio Button Style */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#ffffff',
                      marginBottom: '12px',
                      fontFamily: 'IRANSansX, sans-serif',
                      fontWeight: '500'
                    }}>
                      {isRTL ? 'نوع آیتم:' : 'Item Type:'} <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: '10px',
                      marginBottom: '8px'
                    }}>
                      {itemTypes.map((item) => (
                        <div 
                          key={item.itemTypeId} 
                          onClick={() => setItemTypeId(Number(item.itemTypeId))}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: itemTypeId === Number(item.itemTypeId) 
                              ? '2px solid #50b4ff' 
                              : '1px solid rgba(255, 255, 255, 0.2)',
                            background: itemTypeId === Number(item.itemTypeId) 
                              ? 'rgba(80, 180, 255, 0.15)' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: itemTypeId === Number(item.itemTypeId) ? '#50b4ff' : '#ffffff',
                            fontSize: '14px',
                            fontFamily: 'IRANSansX, sans-serif',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minWidth: '80px',
                            textAlign: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                        >
                          {itemTypeId === Number(item.itemTypeId) && (
                            <div style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              background: '#50b4ff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '8px',
                              color: 'white'
                            }}>
                              <span style={{ fontSize: '8px', lineHeight: 1 }}>✓</span>
                            </div>
                          )}
                          {isRTL ? item.persianName : item.itemType}
                        </div>
                      ))}
                    </div>
                    {itemTypeId === -1 && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#ef4444', 
                        marginTop: '4px',
                        fontFamily: 'IRANSansX, sans-serif'
                      }}>
                        {isRTL ? 'لطفاً یک نوع آیتم انتخاب کنید' : 'Please select an item type'}
                      </div>
                    )}
                  </div>
                  
                  {/* File Upload - Improved Design */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      color: '#ffffff',
                      marginBottom: '8px',
                      fontFamily: 'IRANSansX, sans-serif',
                      fontWeight: '500'
                    }}>
                      {isRTL ? 'تصاویر:' : 'Images:'}
                    </label>
                    
                    <div style={{
                      border: '1px dashed #3a4a5c',
                      borderRadius: '12px',
                      padding: '15px',
                      textAlign: 'center',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      transition: 'all 0.3s ease'
                    }} 
                      onClick={() => document.getElementById('file-upload-input')?.click()}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = '#50b4ff';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = '#3a4a5c';
                      }}
                    >
                      <input
                        id="file-upload-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                      <div style={{ color: '#50b4ff', marginBottom: '5px' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#50b4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 15V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V15" stroke="#50b4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div style={{ fontSize: '14px', color: '#848d96' }}>
                        {isRTL ? 'آپلود تصاویر' : 'Upload Images'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#848d96', marginTop: '5px' }}>
                        {isRTL ? 'حداکثر حجم هر فایل: 2 مگابایت' : 'Max file size: 2MB'}
                      </div>
                    </div>
                    
                    {/* نمایش فایل‌های آپلود شده */}
                    {files.length > 0 && (
                      <div style={{ marginTop: '10px' }}>
                        {files.map((file, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            marginBottom: '8px'
                          }}>
                            <div style={{
                              width: '50px',
                              height: '50px',
                              borderRadius: '6px',
                              overflow: 'hidden',
                              backgroundColor: 'rgba(255, 255, 255, 0.1)'
                            }}>
                              <img
                                src={URL.createObjectURL(file)}
                                alt="Preview"
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                            <div style={{ flex: 1, marginLeft: '10px', marginRight: '10px' }}>
                              <div style={{
                                fontSize: '14px',
                                color: '#ffffff',
                                fontFamily: 'IRANSansX, sans-serif',
                                marginBottom: '4px',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap'
                              }}>
                                {file.name}
                              </div>
                              <div style={{
                                fontSize: '12px',
                                color: '#848d96',
                                fontFamily: 'IRANSansX, sans-serif'
                              }}>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newFiles = [...files];
                                newFiles.splice(index, 1);
                                setFiles(newFiles);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff4757',
                                cursor: 'pointer',
                                fontSize: '18px',
                                padding: '5px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}

                        {/* نمایش حجم کل فایل‌ها */}
                        <div style={{ fontSize: '12px', color: '#848d96', marginTop: '5px', textAlign: isRTL ? 'right' : 'left' }}>
                          {isRTL ? 'حجم کل:' : 'Total size:'} {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} / 8 MB
                        </div>
                      </div>
                    )}
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

      {/* Suggestions Modal */}
      {/* Price Suggestion Modal - Styled with styled-components approach */}
      {showSuggestionsModal && selectedFlightForSuggestions && createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'fadeIn 0.4s ease-out',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header */}
            <div style={{
              background: '#0f172a',
              color: 'white',
              padding: '20px 24px',
              position: 'relative',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '24px' }}>💡</span>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  fontFamily: 'IRANSansX, sans-serif',
                  margin: 0,
                  color: '#ffffff'
                }}>
                  {t('flights.suggestionsModal.title')}
                </h2>
              </div>
              <button
                onClick={handleCloseSuggestionsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}
              >
                ×
              </button>
            </div>

            {/* Content - Scrollable */}
            <div style={{
              padding: '20px 24px',
              height: '400px',
              overflowY: 'auto',
              position: 'relative',
              background: '#1e293b',
              direction: isRTL ? 'rtl' : 'ltr'
            }}>
              <div style={{
                fontSize: '14px',
                lineHeight: 1.6,
                color: '#e2e8f0',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                <h4 style={{
                  margin: '0 0 16px 0',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  {t('flights.suggestionsModal.suggestionsReceived')}
                </h4>

                {selectedFlightForSuggestions.suggestions && selectedFlightForSuggestions.suggestions.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    paddingBottom: '20px'
                  }}>
                    {selectedFlightForSuggestions.suggestions.map((suggestion) => (
                      <div
                        key={suggestion.suggestionId}
                        style={{
                          background: suggestion.lastStatusEn === 'accept'
                            ? 'rgba(34, 197, 94, 0.1)'
                            : suggestion.lastStatusEn === 'rejected'
                              ? 'rgba(239, 68, 68, 0.1)'
                              : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${suggestion.lastStatusEn === 'accept'
                              ? 'rgba(34, 197, 94, 0.3)'
                              : suggestion.lastStatusEn === 'rejected'
                                ? 'rgba(239, 68, 68, 0.3)'
                                : 'rgba(255, 255, 255, 0.1)'
                            }`,
                          borderRadius: '12px',
                          padding: '16px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '12px'
                        }}>
                          <div>
                            <div style={{
                              color: '#ffffff',
                              fontSize: '14px',
                              fontFamily: 'IRANSansX, sans-serif',
                              fontWeight: '600',
                              marginBottom: '4px'
                            }}>
                              {suggestion.fullName}
                            </div>
                            <div style={{
                              color: '#ffffff',
                              fontSize: '16px',
                              fontFamily: 'IRANSansX, sans-serif',
                              fontWeight: '700'
                            }}>
                              {suggestion.price.toLocaleString()} {suggestion.currency === 1 ? t('flights.suggestionsModal.dollar') : t('flights.suggestionsModal.rial')}
                            </div>
                          </div>
                          <div style={{
                            background: suggestion.lastStatusEn === 'accept'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : suggestion.lastStatusEn === 'rejected'
                                ? 'rgba(239, 68, 68, 0.2)'
                                : 'rgba(156, 163, 175, 0.2)',
                            color: suggestion.lastStatusEn === 'accept'
                              ? '#22c55e'
                              : suggestion.lastStatusEn === 'rejected'
                                ? '#ef4444'
                                : '#9ca3af',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'IRANSansX, sans-serif',
                            fontWeight: '500'
                          }}>
                            {isRTL ? suggestion.lastStatusFa : suggestion.lastStatusEn}
                          </div>
                        </div>

                        {suggestion.description && (
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '12px',
                            fontFamily: 'IRANSansX, sans-serif',
                            marginBottom: '12px',
                            fontStyle: 'italic'
                          }}>
                            {suggestion.description}
                          </div>
                        )}

                        {suggestion.lastStatusEn !== 'accept' && suggestion.lastStatusEn !== 'rejected' && (
                          <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => handleSuggestionAction(suggestion, 'reject')}
                              disabled={actionLoading}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: '#ef4444',
                                fontSize: '12px',
                                fontFamily: 'IRANSansX, sans-serif',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                opacity: actionLoading ? 0.5 : 1,
                                fontWeight: '500'
                              }}
                            >
                              {t('flights.suggestionsModal.reject')}
                            </button>
                            <button
                              onClick={() => handleSuggestionAction(suggestion, 'accept')}
                              disabled={actionLoading}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid rgba(34, 197, 94, 0.3)',
                                background: 'rgba(34, 197, 94, 0.1)',
                                color: '#22c55e',
                                fontSize: '12px',
                                fontFamily: 'IRANSansX, sans-serif',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                opacity: actionLoading ? 0.5 : 1,
                                fontWeight: '500'
                              }}
                            >
                              {t('flights.suggestionsModal.accept')}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px',
                    fontFamily: 'IRANSansX, sans-serif'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                    {t('flights.suggestionsModal.noSuggestions')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        createPortal(
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}>
                  {confirmAction === 'accept' ? '✅' : '❌'}
                </div>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#ffffff',
                  fontSize: '18px',
                  fontFamily: 'IRANSansX, sans-serif',
                  fontWeight: '700'
                }}>
                  {confirmAction === 'accept'
                    ? t('flights.suggestionsModal.confirmAccept')
                    : t('flights.suggestionsModal.confirmReject')
                  }
                </h3>
                <p style={{
                  margin: 0,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontFamily: 'IRANSansX, sans-serif'
                }}>
                  {t('flights.suggestionsModal.confirmMessage')}
                </p>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={handleCancelConfirmAction}
                  disabled={actionLoading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    background: 'transparent',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'IRANSansX, sans-serif',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                    fontWeight: '500'
                  }}
                >
                  {t('flights.suggestionsModal.cancel')}
                </button>

                <button
                  onClick={handleConfirmSuggestionAction}
                  disabled={actionLoading}
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    background: confirmAction === 'accept'
                      ? 'linear-gradient(135deg, #22c55e, #16a34a, #15803d)'
                      : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontFamily: 'IRANSansX, sans-serif',
                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                    opacity: actionLoading ? 0.5 : 1,
                    fontWeight: '600'
                  }}
                >
                  {actionLoading ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid #ffffff',
                        borderRadius: '50%'
                      }} />
                      {t('flights.suggestionsModal.processing')}
                    </div>
                  ) : (
                    confirmAction === 'accept'
                      ? t('flights.suggestionsModal.confirmAcceptButton')
                      : t('flights.suggestionsModal.confirmRejectButton')
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
};

export default ParcelList;