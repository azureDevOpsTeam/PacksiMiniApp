import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useRequestContext } from '../contexts/RequestContext';
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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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
  const { refreshRequestCount } = useRequestContext();

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

  // Confirmation dialog states
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<number | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  // PickedUp confirmation dialog states
  const [showPickedUpDialog, setShowPickedUpDialog] = useState(false);
  const [selectedPickedUpSuggestionId, setSelectedPickedUpSuggestionId] = useState<number | null>(null);
  const [isPickingUp, setIsPickingUp] = useState(false);

  // PassengerConfirmedDelivery confirmation dialog states
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);

  // Function to detect text direction based on content
  const detectTextDirection = (text: string): 'rtl' | 'ltr' => {
    if (!text) return 'ltr';
    
    // Persian/Arabic Unicode ranges
    const persianArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    // Check if text contains Persian/Arabic characters
    return persianArabicRegex.test(text) ? 'rtl' : 'ltr';
  };
  const [selectedDeliverySuggestionId, setSelectedDeliverySuggestionId] = useState<number | null>(null);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [deliveryCode, setDeliveryCode] = useState('');
  const [deliveryCodeError, setDeliveryCodeError] = useState('');
  const [serverError, setServerError] = useState('');



  // Confirm Delivery dialog states
  const [showConfirmDeliveryDialog, setShowConfirmDeliveryDialog] = useState(false);
  const [selectedConfirmDeliverySuggestionId, setSelectedConfirmDeliverySuggestionId] = useState<number | null>(null);
  const [isConfirmingSenderDelivery, setIsConfirmingSenderDelivery] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  // Not Delivered dialog states
  const [showNotDeliveredDialog, setShowNotDeliveredDialog] = useState(false);
  const [selectedNotDeliveredSuggestionId, setSelectedNotDeliveredSuggestionId] = useState<number | null>(null);
  const [isNotDelivering, setIsNotDelivering] = useState(false);

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

  // Handle accept suggestion click
  const handleAcceptSuggestion = (suggestionId: number) => {
    setSelectedSuggestionId(suggestionId);
    setShowConfirmDialog(true);
  };

  // Confirm accept suggestion
  const confirmAcceptSuggestion = async () => {
    if (!selectedSuggestionId) return;

    try {
      setIsAccepting(true);
      const response = await apiService.confirmedBySender({
        model: {
          requestSuggestionId: selectedSuggestionId
        }
      });

      if (response.requestStatus.name === 'Successful') {
        // Refresh the data after successful acceptance
        const offersResponse = await apiService.getInProgressOffers();
        if (offersResponse.requestStatus.name === 'Successful') {
          setMyReciveOffers(offersResponse.objectResult.myReciveOffers || []);
          setMySentOffers(offersResponse.objectResult.mySentOffers || []);
        }

        // Show success message (you can implement a toast notification here)
        console.log('Suggestion accepted successfully');
      } else {
        console.error('Error accepting suggestion:', response.message);
        // Show error message (you can implement a toast notification here)
      }
    } catch (err) {
      console.error('Error accepting suggestion:', err);
      // Show error message (you can implement a toast notification here)
    } finally {
      setIsAccepting(false);
      setShowConfirmDialog(false);
      setSelectedSuggestionId(null);
    }
  };

  // Cancel accept suggestion
  const cancelAcceptSuggestion = () => {
    setShowConfirmDialog(false);
    setSelectedSuggestionId(null);
  };

  // Handle picked up suggestion
  const handlePickedUpSuggestion = (suggestionId: number) => {
    setSelectedPickedUpSuggestionId(suggestionId);
    setShowPickedUpDialog(true);
  };

  // Confirm picked up suggestion
  const confirmPickedUpSuggestion = async () => {
    if (!selectedPickedUpSuggestionId) return;

    try {
      setIsPickingUp(true);

      const payload = {
        model: {
          requestSuggestionId: selectedPickedUpSuggestionId
        }
      };

      const response = await apiService.pickedUp(payload);

      if (response.requestStatus.name === 'Successful') {
        // Refresh data after successful picked up
        const offersResponse = await apiService.getInProgressOffers();
        if (offersResponse.requestStatus.name === 'Successful') {
          setMyReciveOffers(offersResponse.objectResult.myReciveOffers || []);
          setMySentOffers(offersResponse.objectResult.mySentOffers || []);
        }
      } else {
        console.error('Error marking as picked up:', response.message);
      }
    } catch (err) {
      console.error('Error marking as picked up:', err);
      // Show error message (you can implement a toast notification here)
    } finally {
      setIsPickingUp(false);
      setShowPickedUpDialog(false);
      setSelectedPickedUpSuggestionId(null);
    }
  };

  // Cancel picked up suggestion
  const cancelPickedUpSuggestion = () => {
    setShowPickedUpDialog(false);
    setSelectedPickedUpSuggestionId(null);
  };

  // Handle passenger confirmed delivery
  const handlePassengerConfirmedDelivery = (suggestionId: number) => {
    setSelectedDeliverySuggestionId(suggestionId);
    setShowDeliveryDialog(true);
  };

  // Confirm passenger delivery
  const confirmPassengerDelivery = async () => {
    if (!selectedDeliverySuggestionId) return;

    // Validate delivery code
    if (!deliveryCode.trim()) {
      setDeliveryCodeError(isRTL ? 'کد تحویل الزامی است' : 'Delivery code is required');
      return;
    }

    try {
      setIsConfirmingDelivery(true);
      setDeliveryCodeError('');
      setServerError('');

      const payload = {
        model: {
          requestSuggestionId: selectedDeliverySuggestionId,
          deliveryCode: deliveryCode.trim()
        }
      };

      const response = await apiService.passengerConfirmedDelivery(payload);

      if (response.requestStatus.name === 'Successful') {
        // Refresh data after successful delivery confirmation
        const offersResponse = await apiService.getInProgressOffers();
        if (offersResponse.requestStatus.name === 'Successful') {
          setMyReciveOffers(offersResponse.objectResult.myReciveOffers || []);
          setMySentOffers(offersResponse.objectResult.mySentOffers || []);
        }
        
        // Close modal only on success
        setShowDeliveryDialog(false);
        setSelectedDeliverySuggestionId(null);
        setDeliveryCode('');
        setDeliveryCodeError('');
        setServerError('');
      } else {
        // Show server error message
        setServerError(response.message || (isRTL ? 'کد تحویل نامعتبر است' : 'Invalid delivery code'));
      }
    } catch (err) {
      console.error('Error confirming delivery:', err);
      setServerError(isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  // Cancel passenger delivery confirmation
  const cancelPassengerDelivery = () => {
    setShowDeliveryDialog(false);
    setSelectedDeliverySuggestionId(null);
    setDeliveryCode('');
    setDeliveryCodeError('');
    setServerError('');
  };



  // Confirm Delivery handlers
  const handleConfirmDelivery = (suggestionId: number) => {
    setSelectedConfirmDeliverySuggestionId(suggestionId);
    setSelectedRating(0); // Reset rating when opening modal
    setServerError(''); // Clear any previous error messages
    setShowConfirmDeliveryDialog(true);
  };

  const confirmSenderDelivery = async () => {
    if (!selectedConfirmDeliverySuggestionId) return;

    // Validate rating selection
    if (selectedRating === 0) {
      setServerError(isRTL ? 'لطفا امتیاز خود را انتخاب کنید' : 'Please select your rating');
      return;
    }

    setIsConfirmingSenderDelivery(true);
    setServerError(''); // Clear previous errors
    
    try {
      console.log('Sending SaveRating request:', {
        requestSuggestionId: selectedConfirmDeliverySuggestionId,
        rate: selectedRating
      });

      const response = await apiService.saveRating({
        model: {
          requestSuggestionId: selectedConfirmDeliverySuggestionId,
          rate: selectedRating
        }
      });

      console.log('SaveRating response:', response);

      // Check if the response indicates success
      if (response.requestStatus && response.requestStatus.name === 'Successful') {
        // Success - close modal and refresh data
        setShowConfirmDeliveryDialog(false);
        setSelectedConfirmDeliverySuggestionId(null);
        setSelectedRating(0);
        setServerError('');
        
        // Show success message briefly
        console.log('Rating saved successfully');
        
        // Refresh data
        fetchData();
      } else {
        // Server returned an error
        const errorMessage = response.message || (isRTL ? 'خطا در ثبت امتیاز' : 'Error saving rating');
        setServerError(errorMessage);
        console.error('SaveRating failed:', response);
      }
    } catch (error) {
      console.error('Error confirming delivery:', error);
      
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setServerError(isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error');
        } else if (error.message.includes('timeout')) {
          setServerError(isRTL ? 'زمان انتظار تمام شد' : 'Request timeout');
        } else {
          setServerError(isRTL ? 'خطا در ثبت امتیاز' : 'Error saving rating');
        }
      } else {
        setServerError(isRTL ? 'خطای غیرمنتظره' : 'Unexpected error');
      }
    } finally {
      setIsConfirmingSenderDelivery(false);
    }
  };

  const cancelConfirmDelivery = () => {
    setShowConfirmDeliveryDialog(false);
    setSelectedConfirmDeliverySuggestionId(null);
    setSelectedRating(0); // Reset rating when canceling
    setIsConfirmingSenderDelivery(false);
    setServerError(''); // Clear any error messages
  };

  const confirmNotDelivered = async () => {
    if (!selectedNotDeliveredSuggestionId) return;

    setIsNotDelivering(true);
    try {
      await apiService.notDelivered({
        model: {
          requestSuggestionId: selectedNotDeliveredSuggestionId
        }
      });

      setShowNotDeliveredDialog(false);
      setSelectedNotDeliveredSuggestionId(null);
      // Refresh data
      fetchData();
    } catch (error) {
      console.error('Error marking as not delivered:', error);
    } finally {
      setIsNotDelivering(false);
    }
  };

  const cancelNotDelivered = () => {
    setShowNotDeliveredDialog(false);
    setSelectedNotDeliveredSuggestionId(null);
    setIsNotDelivering(false);
  };

  // Fetch data function
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
        // Refresh request count for badge
        refreshRequestCount();
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

  useEffect(() => {
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
          justifyContent: 'center',
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
          </div>
        </div>

        {/* Suggestions */}
        {offer.suggestions && offer.suggestions.length > 0 && (
          <div>

            {offer.suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                style={{
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)',
                  borderRadius: '16px',
                  padding: '20px',
                  marginBottom: index === offer.suggestions.length - 1 ? '0' : '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                  e.currentTarget.style.borderColor = '#c7d2fe';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                {/* Decorative gradient overlay */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4)',
                  borderRadius: '16px 16px 0 0'
                }} />

                {/* Header with enhanced styling */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                  paddingTop: '4px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flex: 1
                  }}>
                    {/* User avatar placeholder */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                      flexShrink: 0
                    }}>
                      {suggestion.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#1e293b',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {suggestion.displayName}
                      </div>
                      <div style={{
                      color: '#89084e',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                      }}>
                        ${suggestion.suggestionPrice}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced price display */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>

                    
                    {/* Enhanced Item Type Badge */}
                {(isRTL ? suggestion.itemTypeFa : suggestion.itemTypeEn) && (
                  <div 
                  onClick={() => openImageModal(suggestion.attachments)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                    color: '#1e40af',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    marginBottom: '12px',
                    border: '1px solid #93c5fd',
                    boxShadow: '0 2px 4px rgba(30, 64, 175, 0.1)'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                        </svg>
                    {getItemTypeName(suggestion.itemType, isRTL)}
                  </div>
                )}
                  </div>
                </div>

                {/* Enhanced Description */}
                {suggestion.descriptions && suggestion.descriptions.trim() !== '' && (() => {
                  const textDirection = detectTextDirection(suggestion.descriptions);
                  const isContentRTL = textDirection === 'rtl';
                  
                  return (
                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      marginBottom: '16px',
                      lineHeight: '1.6',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      borderLeft: isContentRTL ? '1px solid #e2e8f0' : '4px solid #3b82f6',
                      borderRight: isContentRTL ? '4px solid #3b82f6' : '1px solid #e2e8f0',
                      maxHeight: '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      position: 'relative',
                      direction: textDirection,
                      textAlign: isContentRTL ? 'right' : 'left'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        [isContentRTL ? 'right' : 'left']: '8px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: '#3b82f6'
                      }} />
                      <div style={{ 
                        paddingLeft: isContentRTL ? '0' : '12px', 
                        paddingRight: isContentRTL ? '12px' : '0',
                        direction: textDirection,
                        textAlign: isContentRTL ? 'right' : 'left'
                      }}>
                        {suggestion.descriptions}
                      </div>
                    </div>
                  );
                })()}

                {/* Enhanced Delivery Code */}
                {(suggestion.operationButton === 'lblReadyToDelivery' || suggestion.operationButton === 'btnConfirmDelivery') && suggestion.deliveryCode && (
                  <div style={{
                    fontSize: '13px',
                    color: '#065f46',
                    marginBottom: '16px',
                    lineHeight: '1.4',
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                    borderRadius: '12px',
                    border: '1px solid #6ee7b7',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                      </svg>
                    </div>
                    <span>
                      {isRTL ? `کد تحویل: ${suggestion.deliveryCode}` : `Delivery Code: ${suggestion.deliveryCode}`}
                    </span>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  {/* Accept Button - Show only for btnSuggtion in Suggestions tab */}
                  {(activeTab === 'suggestion' && suggestion.operationButton === 'btnSuggtion') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptSuggestion(suggestion.id);
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
                  )}

                  {/* Picked Up Button - Show only for btnPickedUp in Suggestions tab */}
                  {(activeTab === 'suggestion' && suggestion.operationButton === 'btnPickedUp') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePickedUpSuggestion(suggestion.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,16.5L6.5,12L7.91,10.59L11,13.67L16.59,8.09L18,9.5L11,16.5Z" />
                        </svg>
                        {isRTL ? 'تحویل گرفته‌ام' : 'Picked Up'}
                      </button>
                      
                      {/* Chat Button for btnPickedUp */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                        </svg>
                        {isRTL ? 'چت' : 'Chat'}
                      </button>
                    </>
                  )}

                  {/* Passenger Confirmed Delivery Button - Show only for btnPassengerConfirmedDelivery in Suggestions tab */}
                  {(activeTab === 'suggestion' && suggestion.operationButton === 'btnPassengerConfirmedDelivery') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePassengerConfirmedDelivery(suggestion.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                        </svg>
                        {isRTL ? 'تحویل داده‌ام' : 'Delivered'}
                      </button>
                      
                      {/* Chat Button for btnPassengerConfirmedDelivery */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                        </svg>
                        {isRTL ? 'چت' : 'Chat'}
                      </button>
                    </>
                  )}

                  {/* Wait To Confirm Delivery Button - Show only for lblWaitToConfirmDelivery in Suggestions tab (Display Only) */}
                  {(activeTab === 'suggestion' && suggestion.operationButton === 'lblWaitToConfirmDelivery') && (
                    <>
                      <button
                        disabled={true}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                          color: '#6c757d',
                          border: '2px solid #dee2e6',
                          cursor: 'not-allowed',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="16px" height="16px"><linearGradient id="IMoH7gpu5un5Dx2vID39Ra" x1="9.858" x2="38.142" y1="9.858" y2="38.142" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9dffce"/><stop offset="1" stop-color="#50d18d"/></linearGradient><path fill="url(#IMoH7gpu5un5Dx2vID39Ra)" d="M44,24c0,11.045-8.955,20-20,20S4,35.045,4,24S12.955,4,24,4S44,12.955,44,24z"/><linearGradient id="IMoH7gpu5un5Dx2vID39Rb" x1="13" x2="36" y1="24.793" y2="24.793" gradientUnits="userSpaceOnUse"><stop offset=".824" stop-color="#135d36"/><stop offset=".931" stop-color="#125933"/><stop offset="1" stop-color="#11522f"/></linearGradient><path fill="url(#IMoH7gpu5un5Dx2vID39Rb)" d="M21.293,32.707l-8-8c-0.391-0.391-0.391-1.024,0-1.414l1.414-1.414	c0.391-0.391,1.024-0.391,1.414,0L22,27.758l10.879-10.879c0.391-0.391,1.024-0.391,1.414,0l1.414,1.414	c0.391,0.391,0.391,1.024,0,1.414l-13,13C22.317,33.098,21.683,33.098,21.293,32.707z"/></svg>
                        {isRTL ? 'تحویل شد' : 'ّDelivered'}
                      </button>
                    </>
                  )}

                  {/* Confirm Delivery Button - Show only for btnConfirmDelivery in InProgress tab */}
                  {(activeTab === 'inProgress' && suggestion.operationButton === 'btnConfirmDelivery') && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmDelivery(suggestion.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                        </svg>
                        {isRTL ? 'تایید و ثبت امتیاز' : 'Confirm And Rating'}
                      </button>
                      
                      {/* Chat Button for btnConfirmDelivery */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                        </svg>
                        {isRTL ? 'چت' : 'Chat'}
                      </button>
                    </>
                  )}



                  {/* Ready To Pick Up Button - Show only for lblReadyToPickeUp in InProgress tab (Display Only) */}
                  {(activeTab === 'inProgress' && suggestion.operationButton === 'lblReadyToPickeUp') && (
                    <>
                      <button
                        disabled={true}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                          color: '#6c757d',
                          border: '2px solid #dee2e6',
                          cursor: 'not-allowed',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M15.5,17L10.5,12L15.5,7V17Z" />
                        </svg>
                        {isRTL ? 'آماده تحویل' : 'Ready To Picked Up'}
                      </button>
                      
                      {/* Chat Button for lblReadyToPickeUp */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                        </svg>
                        {isRTL ? 'چت' : 'Chat'}
                      </button>
                    </>
                  )}

                  {/* Ready To Delivery Button - Show only for lblReadyToDelivery in InProgress tab (Display Only) */}
                  {(activeTab === 'inProgress' && suggestion.operationButton === 'lblReadyToDelivery') && (
                    <>
                      <button
                        disabled={true}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                          color: '#065f46',
                          border: '2px solid #6ee7b7',
                          cursor: 'not-allowed',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M15.5,17L10.5,12L15.5,7V17Z" />
                        </svg>
                        {isRTL ? 'آماده ارسال' : 'Ready To Delivery'}
                      </button>
                      
                      {/* Chat Button for lblReadyToDelivery */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)',
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'inherit',
                          minWidth: '80px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                        </svg>
                        {isRTL ? 'چت' : 'Chat'}
                      </button>
                    </>
                  )}

                  {/* Chat Button - Hide for specific states where we now have dedicated chat buttons */}
                  {!(activeTab === 'suggestion' && (suggestion.operationButton === 'btnSuggtion' || suggestion.operationButton === 'btnPickedUp' || suggestion.operationButton === 'btnPassengerConfirmedDelivery' || suggestion.operationButton === 'lblWaitToConfirmDelivery')) && !(activeTab === 'inProgress' && (suggestion.operationButton === 'btnConfirmDelivery' || suggestion.operationButton === 'lblReadyToPickeUp' || suggestion.operationButton === 'lblReadyToDelivery')) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!(activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion')) {
                          console.log('Chat with suggestion owner:', suggestion.id);
                        }
                      }}
                      disabled={activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion'}
                      style={{
                        flex: 1,
                        padding: '10px 16px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '600',
                        background: (activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion') ? 'linear-gradient(135deg, #f8f9fa, #e9ecef)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        color: (activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion') ? '#6c757d' : 'white',
                        border: (activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion') ? '2px solid #dee2e6' : 'none',
                        cursor: (activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion') ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        position: 'relative',
                        overflow: 'hidden',
                        fontFamily: 'inherit',
                        boxShadow: (activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion') ? '0 2px 8px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(99, 102, 241, 0.25)'
                      }}
                      onMouseEnter={(e) => {
                        if (!(activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion')) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion')) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.25)';
                        }
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z" />
                      </svg>
                      {(activeTab === 'inProgress' && suggestion.operationButton === 'lblWaitForAcceptSuggetion')
                        ? (isRTL ? 'در انتظار تایید' : 'Wait For Accept')
                        : (isRTL ? 'چت' : 'Chat')
                      }
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

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
        backgroundColor: '#17212b',
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

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={cancelAcceptSuggestion}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideDown 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2Z" />
                </svg>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                {isRTL ? 'تایید پذیرش پیشنهاد' : 'Confirm Accept Suggestion'}
              </h3>
            </div>

            {/* Content */}
            <p
              style={{
                margin: '0 0 24px',
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: '1.5'
              }}
            >
              {isRTL
                ? 'آیا مطمئن هستید که می‌خواهید این پیشنهاد را بپذیرید؟ این عمل قابل بازگشت نیست.'
                : 'Are you sure you want to accept this suggestion? This action cannot be undone.'
              }
            </p>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={cancelAcceptSuggestion}
                disabled={isAccepting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  cursor: isAccepting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isAccepting ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isAccepting) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAccepting) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </button>

              <button
                onClick={confirmAcceptSuggestion}
                disabled={isAccepting}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: isAccepting ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  cursor: isAccepting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isAccepting) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAccepting) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {isAccepting && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {isAccepting
                  ? (isRTL ? 'در حال پردازش...' : 'Processing...')
                  : (isRTL ? 'تایید' : 'Confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PickedUp Confirmation Dialog */}
      {showPickedUpDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={cancelPickedUpSuggestion}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideDown 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                {isRTL ? 'تایید تحویل گرفتن' : 'Confirm Picked Up'}
              </h3>
            </div>

            {/* Content */}
            <p
              style={{
                margin: '0 0 24px',
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: '1.5'
              }}
            >
              {isRTL
                ? 'آیا مطمئن هستید که بسته را تحویل گرفته‌اید؟ این عمل قابل بازگشت نیست.'
                : 'Are you sure you have picked up the package? This action cannot be undone.'
              }
            </p>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={cancelPickedUpSuggestion}
                disabled={isPickingUp}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  cursor: isPickingUp ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isPickingUp ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isPickingUp) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPickingUp) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </button>

              <button
                onClick={confirmPickedUpSuggestion}
                disabled={isPickingUp}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: isPickingUp ? '#9ca3af' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  cursor: isPickingUp ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isPickingUp) {
                    e.currentTarget.style.backgroundColor = '#15803d';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPickingUp) {
                    e.currentTarget.style.backgroundColor = '#16a34a';
                  }
                }}
              >
                {isPickingUp && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {isPickingUp
                  ? (isRTL ? 'در حال پردازش...' : 'Processing...')
                  : (isRTL ? 'تایید' : 'Confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passenger Confirmed Delivery Dialog */}
      {showDeliveryDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            padding: '20px'
          }}
          onClick={cancelPassengerDelivery}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              animation: 'slideDown 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#ede9fe',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#8b5cf6">
                  <path d="M9,20.42L2.79,14.21L5.62,11.38L9,14.77L18.88,4.88L21.71,7.71L9,20.42Z" />
                </svg>
              </div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}
              >
                {isRTL ? 'تایید تحویل دادن' : 'Confirm Delivery'}
              </h3>
            </div>

            {/* Content */}
            <p
              style={{
                margin: '0 0 16px',
                fontSize: '14px',
                color: '#6b7280',
                textAlign: 'center',
                lineHeight: '1.5'
              }}
            >
              {isRTL
                ? 'لطفاً کد تحویل را وارد کنید:'
                : 'Please enter the delivery code:'
              }
            </p>

            {/* Delivery Code Input */}
            <div style={{ marginBottom: '24px' }}>
              <input
                type="text"
                value={deliveryCode}
                onChange={(e) => {
                   setDeliveryCode(e.target.value);
                   if (deliveryCodeError) {
                     setDeliveryCodeError('');
                   }
                   if (serverError) {
                     setServerError('');
                   }
                 }}
                placeholder={isRTL ? 'کد تحویل را وارد کنید' : 'Enter delivery code'}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: (deliveryCodeError || serverError) ? '2px solid #ef4444' : '1px solid #d1d5db',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  direction: isRTL ? 'rtl' : 'ltr',
                  textAlign: isRTL ? 'right' : 'left'
                }}
                onFocus={(e) => {
                   if (!deliveryCodeError && !serverError) {
                     e.target.style.borderColor = '#8b5cf6';
                   }
                 }}
                 onBlur={(e) => {
                   if (!deliveryCodeError && !serverError) {
                     e.target.style.borderColor = '#d1d5db';
                   }
                 }}
              />
              {(deliveryCodeError || serverError) && (
                 <p
                   style={{
                     margin: '8px 0 0',
                     fontSize: '12px',
                     color: '#ef4444',
                     textAlign: isRTL ? 'right' : 'left'
                   }}
                 >
                   {deliveryCodeError || serverError}
                 </p>
               )}
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={cancelPassengerDelivery}
                disabled={isConfirmingDelivery}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  cursor: isConfirmingDelivery ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isConfirmingDelivery ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isConfirmingDelivery) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConfirmingDelivery) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {isRTL ? 'انصراف' : 'Cancel'}
              </button>

              <button
                onClick={confirmPassengerDelivery}
                disabled={isConfirmingDelivery || !deliveryCode.trim()}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: (isConfirmingDelivery || !deliveryCode.trim()) ? '#9ca3af' : '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  cursor: (isConfirmingDelivery || !deliveryCode.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isConfirmingDelivery && deliveryCode.trim()) {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConfirmingDelivery && deliveryCode.trim()) {
                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                  }
                }}
              >
                {isConfirmingDelivery && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {isConfirmingDelivery
                  ? (isRTL ? 'در حال پردازش...' : 'Processing...')
                  : (isRTL ? 'تایید' : 'Confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Confirm Delivery Dialog */}
      {showConfirmDeliveryDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={cancelConfirmDelivery}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: `1px solid ${theme.colors.border}`,
              direction: isRTL ? 'rtl' : 'ltr'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  fontFamily: 'IRANSansX, sans-serif'
                }}
              >
                {isRTL ? 'تایید تحویل' : 'Confirm Delivery'}
              </h3>
            </div>

            {/* Content */}
            <div
              style={{
                marginBottom: '24px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  margin: '0 0 20px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}
              >
                {isRTL
                  ? 'آیا مطمئن هستید که بسته تحویل داده شده است؟'
                  : 'Are you sure the package has been delivered?'
                }
              </p>

              {/* Star Rating Component */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '28px',
                      color: star <= selectedRating ? '#fbbf24' : '#d1d5db',
                      transition: 'all 0.2s ease',
                      padding: '4px'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>

              {/* Rating Labels */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginBottom: '12px',
                  padding: '0 8px'
                }}
              >
                <span>{isRTL ? 'ضعیف' : 'Poor'}</span>
                <span>{isRTL ? 'عالی' : 'Excellent'}</span>
              </div>

              {/* Selected Rating Display */}
              {selectedRating > 0 && (
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#059669',
                    fontWeight: '500'
                  }}
                >
                  {isRTL 
                    ? `امتیاز انتخاب شده: ${selectedRating} از 5`
                    : `Selected rating: ${selectedRating} out of 5`
                  }
                </p>
              )}

              {/* Error Message */}
              {serverError && (
                <div
                  style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#dc2626',
                    fontSize: '14px',
                    textAlign: 'center',
                    fontFamily: 'IRANSansX, sans-serif'
                  }}
                >
                  {serverError}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', direction: isRTL ? 'rtl' : 'ltr' }}>
              <button
                onClick={cancelConfirmDelivery}
                disabled={isConfirmingSenderDelivery}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  cursor: isConfirmingSenderDelivery ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isConfirmingSenderDelivery) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConfirmingSenderDelivery) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {isRTL ? 'لغو' : 'Cancel'}
              </button>
              <button
                onClick={confirmSenderDelivery}
                disabled={isConfirmingSenderDelivery || selectedRating === 0}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: (isConfirmingSenderDelivery || selectedRating === 0) ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  cursor: (isConfirmingSenderDelivery || selectedRating === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isConfirmingSenderDelivery && selectedRating > 0) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isConfirmingSenderDelivery && selectedRating > 0) {
                    e.currentTarget.style.backgroundColor = '#10b981';
                  }
                }}
              >
                {isConfirmingSenderDelivery && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {isConfirmingSenderDelivery
                  ? (isRTL ? 'در حال پردازش...' : 'Processing...')
                  : (isRTL ? 'تایید' : 'Confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Not Delivered Dialog */}
      {showNotDeliveredDialog && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={cancelNotDelivered}
        >
          <div
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: `1px solid ${theme.colors.border}`,
              direction: isRTL ? 'rtl' : 'ltr'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                marginBottom: '16px',
                textAlign: 'center'
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: theme.colors.text.primary,
                  fontFamily: 'IRANSansX, sans-serif'
                }}
              >
                {isRTL ? 'عدم تحویل' : 'Not Delivered'}
              </h3>
            </div>

            {/* Content */}
            <div
              style={{
                marginBottom: '24px',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}
              >
                {isRTL
                  ? 'آیا مطمئن هستید که بسته تحویل داده نشده است؟'
                  : 'Are you sure the package was not delivered?'
                }
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', direction: isRTL ? 'rtl' : 'ltr' }}>
              <button
                onClick={cancelNotDelivered}
                disabled={isNotDelivering}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  cursor: isNotDelivering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!isNotDelivering) {
                    e.currentTarget.style.backgroundColor = '#e5e7eb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNotDelivering) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
              >
                {isRTL ? 'لغو' : 'Cancel'}
              </button>
              <button
                onClick={confirmNotDelivered}
                disabled={isNotDelivering}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  cursor: isNotDelivering ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isNotDelivering) {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNotDelivering) {
                    e.currentTarget.style.backgroundColor = '#ef4444';
                  }
                }}
              >
                {isNotDelivering && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid transparent',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                )}
                {isNotDelivering
                  ? (isRTL ? 'در حال پردازش...' : 'Processing...')
                  : (isRTL ? 'تایید' : 'Confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InProgressRequest;