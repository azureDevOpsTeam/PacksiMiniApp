import React from 'react';
import TelegramProvider from './contexts/TelegramContext';
import ThemeProvider from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTelegramContext } from './hooks/useTelegramContext';
import { useLanguage } from './hooks/useLanguage';
import CreateRequest from './components/CreateRequest';
import UpdateProfile from './components/UpdateProfile';
import AddPreferredLocation from './components/AddPreferredLocation';
import ParcelList from './components/ParcelList';
import Logo from './components/Logo';
import Settings from './components/Settings';
import NotFound from './components/NotFound';

import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import apiService from './services/apiService';
import type { RequestContactResponse } from '@twa-dev/types';

// Main App Content Component
const AppContent: React.FC = () => {
  const { isReady, webApp, user } = useTelegramContext();
  const { t, language } = useLanguage();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');
  const [currentPage, setCurrentPage] = React.useState<'home' | 'createRequest' | 'updateProfile' | 'addPreferredLocation' | 'parcelList' | 'notFound'>('home');
  const [showVerifyPhone, setShowVerifyPhone] = React.useState<boolean>(false);
  const [showUpdateProfile, setShowUpdateProfile] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(true);
  const [authenticationFailed, setAuthenticationFailed] = React.useState<boolean>(false);

  // Debug log for initial state
  console.log('Component render - Initial states:');
  console.log('- isReady:', isReady);
  console.log('- isValidating:', isValidating);
  console.log('- showVerifyPhone:', showVerifyPhone);
  console.log('- showUpdateProfile:', showUpdateProfile);
  console.log('- currentPage:', currentPage);
  console.log('- authenticationFailed:', authenticationFailed);

  // Handle Telegram BackButton
  React.useEffect(() => {
    if (!webApp) return;

    const handleBackButton = () => {
      setCurrentPage('home');
    };

    if (currentPage !== 'home') {
      // Show BackButton when not on home page
      webApp.BackButton.show();
      webApp.BackButton.onClick(handleBackButton);
    } else {
      // Hide BackButton on home page
      webApp.BackButton.hide();
    }

    return () => {
      webApp.BackButton.offClick(handleBackButton);
    };
  }, [currentPage, webApp]);

  // Validate user function
  const validateUser = React.useCallback(async () => {
    console.log('validateUser called, isReady:', isReady);
    if (!isReady) {
      console.log('Not ready yet, returning');
      return;
    }
    
    try {
      console.log('Starting validation...');
      setIsValidating(true);
      setAuthenticationFailed(false);
      const response = await apiService.validate();
      
      console.log('Full API Response:', JSON.stringify(response, null, 2));
      
      // Check for authentication failure
      if (response.requestStatus.name === 'AuthenticationFailed') {
        console.log('Authentication failed');
        setAuthenticationFailed(true);
        setCurrentPage('notFound');
        return;
      }
      
      // Handle successful response
      if (response && response.requestStatus && response.requestStatus.name === 'Successful' && response.objectResult) {
        const { confirmPhoneNumber, hasCompletedProfile } = response.objectResult;
        console.log('API Response:', response);
        console.log('confirmPhoneNumber:', confirmPhoneNumber);
        console.log('hasCompletedProfile:', hasCompletedProfile);
        
        // Show Verify Phone button if phone is NOT confirmed
        const shouldShowVerifyPhone = !confirmPhoneNumber;
        // Show Complete Profile button if profile is NOT completed AND phone IS confirmed
        const shouldShowUpdateProfile = !hasCompletedProfile && confirmPhoneNumber;
        
        console.log('shouldShowVerifyPhone:', shouldShowVerifyPhone);
        console.log('shouldShowUpdateProfile:', shouldShowUpdateProfile);
        
        setShowVerifyPhone(shouldShowVerifyPhone);
        setShowUpdateProfile(shouldShowUpdateProfile);
        
        console.log('showVerifyPhone set to:', shouldShowVerifyPhone);
        console.log('showUpdateProfile set to:', shouldShowUpdateProfile);
      } else {
        console.log('API response not successful or no objectResult:', response);
        console.log('Response structure check:');
        console.log('- response exists:', !!response);
        console.log('- requestStatus exists:', !!(response && response.requestStatus));
        console.log('- requestStatus.name:', response && response.requestStatus && response.requestStatus.name);
        console.log('- objectResult exists:', !!(response && response.objectResult));
        
        // If API doesn't return expected data, show verify phone button as fallback
        setShowVerifyPhone(true);
        setShowUpdateProfile(false);
        console.log('Fallback: showVerifyPhone set to true, showUpdateProfile set to false');
      }
    } catch (error) {
      console.error('Error validating user:', error);
      // On error, show verify phone button as fallback
      setShowVerifyPhone(true);
      setShowUpdateProfile(false);
      console.log('Error fallback: showVerifyPhone set to true, showUpdateProfile set to false');
    } finally {
      setIsValidating(false);
      console.log('Validation finished');
    }
  }, [isReady]);

  // Validate user on app load
  React.useEffect(() => {
    validateUser();
  }, [validateUser]);

  // Handle phone number verification
  const handleVerifyPhoneNumber = React.useCallback(async () => {
    if (!webApp) {
      // Telegram WebApp is not available - fail silently in production
      return;
    }

    // Request phone number directly without confirmation popup
    // Telegram will show its own confirmation dialog
    webApp.requestContact(async (access: boolean, response?: RequestContactResponse) => {
      if (access && response?.status === 'sent' && response?.responseUnsafe?.contact) {
        const contact = response.responseUnsafe.contact;
        
        try {
          // Process and normalize phone number for mobile compatibility
          let phoneNumber = contact.phone_number;
          
          console.log('Original phone number from Telegram:', phoneNumber);
          
          // Remove any non-digit characters except +
          phoneNumber = phoneNumber.replace(/[^\d+]/g, '');
          
          // Ensure phone number starts with + if it doesn't already
          if (!phoneNumber.startsWith('+')) {
            phoneNumber = '+' + phoneNumber;
          }
          
          // Validate phone number format (should be + followed by 7-15 digits)
          const phoneRegex = /^\+\d{7,15}$/;
          if (!phoneRegex.test(phoneNumber)) {
            throw new Error('فرمت شماره موبایل نامعتبر است');
          }
          
          console.log('Processed phone number:', phoneNumber);
          console.log('Phone number length:', phoneNumber.length);
          
          // Send phone number to API with better error handling for mobile
          const apiResponse = await apiService.verifyPhoneNumber({
            model: {
              phoneNumber: phoneNumber
            }
          });
          
          if (apiResponse.requestStatus.name === 'Successful') {
            // Show success message and refresh validation
            webApp.showAlert('شماره موبایل شما با موفقیت تایید شد!');
            // Refresh user validation status
            setTimeout(async () => {
              await validateUser();
            }, 1000);
          } else {
            // Show error message from API
            webApp.showAlert(apiResponse.message || 'خطا در تایید شماره موبایل');
          }
        } catch (error) {
          console.error('Error verifying phone number:', error);
          // More specific error handling for mobile issues
          const errorMessage = error instanceof Error ? error.message : 'خطا در ارسال شماره موبایل به سرور';
          webApp.showAlert(errorMessage);
        }
      } else if (access === false) {
        // User denied access to contact
        webApp.showAlert('برای تایید شماره موبایل، اجازه دسترسی به مخاطبین لازم است');
      } else {
        // Other errors in getting contact
        webApp.showAlert('خطا در دریافت شماره موبایل. لطفاً دوباره تلاش کنید.');
      }
    });
  }, [webApp, user, t]);


  if (!isReady || isValidating) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '20px',
        backgroundColor: '#17212b'
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
          <SkeletonLoader type="profile" height="60px" />
        </div>
        
        {/* Logo Skeleton */}
        <div style={{ marginBottom: '30px' }}>
          <SkeletonLoader type="text" width="120px" height="40px" />
        </div>
        
        {/* Welcome Text Skeleton */}
        <div style={{ marginBottom: '30px', width: '100%', maxWidth: '300px' }}>
          <SkeletonLoader type="text" height="20px" />
        </div>
        
        {/* Search Box Skeleton */}
        <div style={{ marginBottom: '30px', width: '100%', maxWidth: '400px' }}>
          <SkeletonLoader type="search" />
        </div>
        
        {/* Buttons Skeleton */}
        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonLoader type="text" width="100px" height="16px" />
          </div>
          <SkeletonLoader type="button" count={2} />
        </div>
        
        {/* Services Skeleton */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ marginBottom: '20px' }}>
            <SkeletonLoader type="text" width="80px" height="16px" />
          </div>
          <SkeletonLoader type="button" count={3} />
        </div>
      </div>
    );
  }

  // Render NotFound page
  if (currentPage === 'notFound' || authenticationFailed) {
    return <NotFound onRetry={validateUser} />;
  }

  // Render CreateRequest page
  if (currentPage === 'createRequest') {
    return <CreateRequest />;
  }

  // Render UpdateProfile page
  if (currentPage === 'updateProfile') {
    return <UpdateProfile onProfileUpdated={validateUser} />;
  }

  // Render AddPreferredLocation page
  if (currentPage === 'addPreferredLocation') {
    return <AddPreferredLocation />;
  }

  // Render ParcelList page
  if (currentPage === 'parcelList') {
    return <ParcelList />;
  }

  // Render Home page
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Settings Component */}
      <Settings activeButton={activeButton} setActiveButton={setActiveButton} />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <Logo />
      </div>
      <p style={{ marginBottom: '30px', fontSize: '14px', fontFamily: 'IRANSansX, sans-serif' }}>{t('app.welcome')}</p>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#212a33',
          borderRadius: '5px',
          padding: '8px 12px',
          border: '1px solid #3a4a5c',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            style={{
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0',
              color: '#848d96'
            }}
          >
            <path
              d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <input
            type="text"
            placeholder={t('search.placeholder')}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#848d96',
              fontSize: '13px',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: language === 'fa' ? 'right' : 'left',
              direction: language === 'fa' ? 'rtl' : 'ltr'
            }}
          />
        </div>
      </div>

      {/* Unlimited Access Section */}
      {(() => {
        console.log('Render check - showVerifyPhone:', showVerifyPhone);
        console.log('Render check - showUpdateProfile:', showUpdateProfile);
        console.log('Render check - condition result:', (showVerifyPhone || showUpdateProfile));
        return (showVerifyPhone || showUpdateProfile);
      })() && (
        <div style={{
          marginTop: '30px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <h3 style={{
            color: '#50b4ff',
            fontSize: '12px',
            fontFamily: 'IRANSansX, sans-serif',
            margin: '0 0 20px 0',
            fontWeight: '700',
            textAlign: language === 'fa' ? 'right' : 'left',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            {t('unlimited.title')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '30px' }}>
            {showVerifyPhone && (
              <button onClick={handleVerifyPhoneNumber} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#212a33',
                borderRadius: showUpdateProfile ? '8px 8px 0 0' : '8px',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
                direction: language === 'fa' ? 'rtl' : 'ltr'
              }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500'
              }}>
                {t('unlimited.verifyPhone')}
              </div>
            </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {showUpdateProfile && (
              <button onClick={() => setCurrentPage('updateProfile')} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#212a33',
                borderRadius: showVerifyPhone ? '0 0 8px 8px' : '8px',
                cursor: 'pointer',
                border: 'none',
                width: '100%',
                direction: language === 'fa' ? 'rtl' : 'ltr'
              }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '13px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '500'
              }}>
                {language === 'fa' ? 'تکمیل پروفایل' : 'Complete Profile'}
              </div>
            </div>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bot Links Section */}
      <div style={{
        marginTop: (showVerifyPhone || showUpdateProfile) ? '0px' : '30px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h3 style={{
          color: '#50b4ff',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 20px 0',
          fontWeight: '700',
          textAlign: language === 'fa' ? 'right' : 'left',
          direction: language === 'fa' ? 'rtl' : 'ltr'
        }}>
          {t('bots.title')}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>

          {/* Create New Request Link */}
          <button onClick={() => setCurrentPage('createRequest')} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: language === 'fa' ? 'rtl' : 'ltr',
            marginBottom: '1px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid #50b4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{
              color: '#50b4ff',
              fontSize: '12px',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '500'
            }}>
              {t('bots.createNew')}
            </span>
          </button>


          <button onClick={() => setCurrentPage('parcelList')} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '0',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: language === 'fa' ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {t('bots.parcelList')}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {t('bots.selectFlightFromList')}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#1a1f26',
            borderRadius: '0',
            cursor: 'not-allowed',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr',
            opacity: 0.5,
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#666666',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {t('bots.temporaryRoomRental')}
              </div>
              <div style={{
                color: '#444444',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {t('bots.findBestRoom')}
              </div>
            </div>
            <div style={{
              position: 'absolute',
              top: '8px',
              right: language === 'fa' ? 'auto' : '8px',
              left: language === 'fa' ? '8px' : 'auto',
              backgroundColor: '#ff6b35',
              color: '#ffffff',
              fontSize: '10px',
              fontFamily: 'IRANSansX, sans-serif',
              padding: '2px 6px',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}>
              {t('bots.soon')}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#444444', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#1a1f26',
            borderRadius: '0',
            cursor: 'not-allowed',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr',
            opacity: 0.5,
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 17H4C3.44772 17 3 16.5523 3 16V10C3 9.44772 3.44772 9 4 9H20C20.5523 9 21 9.44772 21 10V16C21 16.5523 20.5523 17 20 17H19M5 17C5 18.1046 5.89543 19 7 19C8.10457 19 9 18.1046 9 17M5 17C5 15.8954 5.89543 15 7 15C8.10457 15 9 15.8954 9 17M19 17C19 18.1046 18.1046 19 17 19C15.8954 19 15 18.1046 15 17M19 17C19 15.8954 18.1046 15 17 15C18.1046 15 19 15.8954 19 17M9 17H15M7 13H17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#666666',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {t('bots.carRental')}
              </div>
              <div style={{
                color: '#444444',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {t('bots.findBestCar')}
              </div>
            </div>
            <div style={{
               position: 'absolute',
               top: '8px',
               right: language === 'fa' ? 'auto' : '8px',
               left: language === 'fa' ? '8px' : 'auto',
               backgroundColor: '#ff6b35',
               color: '#ffffff',
               fontSize: '10px',
               fontFamily: 'IRANSansX, sans-serif',
               padding: '2px 6px',
               borderRadius: '8px',
               fontWeight: 'bold'
             }}>
              {t('bots.soon')}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#444444', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#1a1f26',
            borderRadius: ' 0 0 8px 8px',
            cursor: 'not-allowed',
            textDecoration: 'none',
            direction: language === 'fa' ? 'rtl' : 'ltr',
            opacity: 0.5,
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: language === 'fa' ? 'right' : 'left' }}>
              <div style={{
                color: '#666666',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {t('bots.personalServices')}
              </div>
              <div style={{
                color: '#444444',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {t('bots.chooseTrustedPeople')}
              </div>
            </div>
            <div style={{
               position: 'absolute',
               top: '8px',
               right: language === 'fa' ? 'auto' : '8px',
               left: language === 'fa' ? '8px' : 'auto',
               backgroundColor: '#ff6b35',
               color: '#ffffff',
               fontSize: '10px',
               fontFamily: 'IRANSansX, sans-serif',
               padding: '2px 6px',
               borderRadius: '8px',
               fontWeight: 'bold'
             }}>
              {t('bots.soon')}
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#444444', transform: language === 'fa' ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Providers
function App() {
  return (
    <TelegramProvider>
      <ThemeProvider>
        <LanguageProvider>
          <ErrorBoundary>
            <GlobalStyles />
            <AppContent />

          </ErrorBoundary>
        </LanguageProvider>
      </ThemeProvider>
    </TelegramProvider>
  );
}

export default App
