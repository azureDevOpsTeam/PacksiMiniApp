import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import MyRequest from './components/MyRequest';
import InProgressRequest from './components/InProgressRequest';
import Logo from './components/Logo';
import Settings from './components/Settings';
import SafeAreaWrapper from './components/SafeAreaWrapper';
import NotFound from './components/NotFound';
import ChatPersonList from './components/ChatPersonList';
import { AdminRoutes } from './admin';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import HelpModal from './components/HelpModal';
import UnlimitedHelpModal from './components/UnlimitedHelpModal';
import TabBar from './components/TabBar';
import type { TabItem } from './components/TabBar';


import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import apiService from './services/apiService';
import type { RequestContactResponse } from '@twa-dev/types';

// Main App Content Component
const AppContent: React.FC = () => {
  const { isReady, webApp, user } = useTelegramContext();
  const { t, language } = useLanguage();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');
  const [currentPage, setCurrentPage] = React.useState<'home' | 'createRequest' | 'updateProfile' | 'addPreferredLocation' | 'parcelList' | 'myRequest' | 'inProgressRequest' | 'chatPersonList' | 'notFound'>('home');
  const [showVerifyPhone, setShowVerifyPhone] = React.useState<boolean>(false);
  const [showUpdateProfile, setShowUpdateProfile] = React.useState<boolean>(false);
  const [isValidating, setIsValidating] = React.useState<boolean>(true);
  const [authenticationFailed, setAuthenticationFailed] = React.useState<boolean>(false);
  const [forceSettingsExpanded, setForceSettingsExpanded] = React.useState<boolean>(false);
  const [hasShownAutoSettings, setHasShownAutoSettings] = React.useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = React.useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = React.useState<boolean>(false);
  const [showUnlimitedHelpModal, setShowUnlimitedHelpModal] = React.useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<string>('home');

  // Define tab items
  const tabItems: TabItem[] = React.useMemo(() => [
    {
      id: 'home',
      label: t('tabs.home') || 'خانه',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'requests',
      label: t('tabs.requests') || 'درخواست‌ها',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4H18C18.5304 4 19.0391 4.21071 19.4142 4.58579C19.7893 4.96086 20 5.46957 20 6V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V6C4 5.46957 4.21071 4.96086 4.58579 4.58579C4.96086 4.21071 5.46957 4 6 4H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 2H9C8.44772 2 8 2.44772 8 3V5C8 5.55228 8.44772 6 9 6H15C15.5523 6 16 5.55228 16 5V3C16 2.44772 15.5523 2 15 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'parcels',
      label: t('tabs.parcels') || 'بسته‌ها',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 8C21 6.89543 20.1046 6 19 6H5C3.89543 6 3 6.89543 3 8V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8L12 13L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'chat',
      label: t('tabs.chat') || 'چت',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.60573 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ], [t]);

  // Handle tab change
  const handleTabChange = React.useCallback((tabId: string) => {
    setActiveTab(tabId);
    switch (tabId) {
      case 'home':
        setCurrentPage('home');
        break;
      case 'requests':
        setCurrentPage('inProgressRequest');
        break;
      case 'parcels':
        setCurrentPage('parcelList');
        break;
      case 'chat':
        setCurrentPage('chatPersonList');
        break;
      default:
        setCurrentPage('home');
    }
  }, []);

  // Sync activeTab with currentPage
  React.useEffect(() => {
    switch (currentPage) {
      case 'home':
        setActiveTab('home');
        break;
      case 'myRequest':
        setActiveTab('requests');
        break;
      case 'inProgressRequest':
        setActiveTab('requests');
        break;
      case 'parcelList':
        setActiveTab('parcels');
        break;
      case 'chatPersonList':
        setActiveTab('chat');
        break;
      default:
        setActiveTab('home');
    }
  }, [currentPage]);

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
    if (!isReady) return;

    try {
      setIsValidating(true);
      setAuthenticationFailed(false);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Validation timeout')), 10000); // 10 seconds timeout
      });

      const response = await Promise.race([
        apiService.validate(),
        timeoutPromise
      ]) as any;

      // Check for authentication failure
      if (response && response.requestStatus && response.requestStatus.name === 'AuthenticationFailed') {
        setAuthenticationFailed(true);
        setCurrentPage('notFound');
        return;
      }

      // Handle successful response
      if (response && response.requestStatus && response.requestStatus.name === 'Successful' && response.objectResult) {
        const { confirmPhoneNumber, hasCompletedProfile } = response.objectResult;

        // Show Verify Phone button if phone is NOT confirmed
        const shouldShowVerifyPhone = confirmPhoneNumber === false;
        // Show Complete Profile button if profile is NOT completed
        const shouldShowUpdateProfile = hasCompletedProfile === false;

        setShowVerifyPhone(shouldShowVerifyPhone);
        setShowUpdateProfile(shouldShowUpdateProfile);
      } else {
        // If API doesn't return expected data, show verify phone button as fallback
        setShowVerifyPhone(true);
        setShowUpdateProfile(false);
      }
    } catch (error) {
      console.error('Error validating user:', error);
      // On error, show verify phone button as fallback
      setShowVerifyPhone(true);
      setShowUpdateProfile(false);
    } finally {
      setIsValidating(false);
    }
  }, [isReady]);

  // Validate user on app load
  React.useEffect(() => {
    validateUser();
  }, [validateUser]);

  // Auto-open settings for first-time users
  React.useEffect(() => {
    // Check if this is the first time opening the app
    const hasOpenedBefore = localStorage.getItem('hasOpenedAppBefore');

    if (!hasOpenedBefore && !hasShownAutoSettings && !isValidating && isReady) {
      // Mark that we've shown auto settings
      setHasShownAutoSettings(true);

      // Open settings after 3 seconds
      const openTimer = setTimeout(() => {
        setForceSettingsExpanded(true);

        // Close settings after 3 seconds
        const closeTimer = setTimeout(() => {
          setForceSettingsExpanded(false);
          // Mark that the app has been opened before
          localStorage.setItem('hasOpenedAppBefore', 'true');
        }, 3000);

        return () => clearTimeout(closeTimer);
      }, 3000);

      return () => clearTimeout(openTimer);
    }
  }, [hasShownAutoSettings, isValidating, isReady]);

  // Check if user has accepted terms of service
  React.useEffect(() => {
    const hasAcceptedTerms = localStorage.getItem('hasAcceptedTerms');

    if (!hasAcceptedTerms && isReady && !isValidating) {
      setShowTermsModal(true);
    }
  }, [isReady, isValidating]);

  // Handle terms of service acceptance
  const handleAcceptTerms = React.useCallback(() => {
    localStorage.setItem('hasAcceptedTerms', 'true');
    setShowTermsModal(false);
  }, []);

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

  // Render MyRequest page
  if (currentPage === 'myRequest') {
    return <MyRequest />;
  }

  // Render InProgressRequest page
  if (currentPage === 'inProgressRequest') {
    return <InProgressRequest />;
  }

  // Render ChatPersonList page
  if (currentPage === 'chatPersonList') {
    return <ChatPersonList />;
  }

  // Render AdminPanel if admin is selected
  if (activeButton === 'admin') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '80px 20px 30px 20px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Settings Component */}
        <Settings
          activeButton={activeButton}
          setActiveButton={setActiveButton}
          forceExpanded={forceSettingsExpanded}
          onMenuItemClick={() => setForceSettingsExpanded(false)}
        />
        <AdminRoutes currentPage="dashboard" />
      </div>
    );
  }

  // Render Home page
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '80px 20px 30px 20px',
      textAlign: 'center',
      position: 'relative'
    }}>
      {/* Settings Component */}
      <Settings
        activeButton={activeButton}
        setActiveButton={setActiveButton}
        forceExpanded={forceSettingsExpanded}
        onMenuItemClick={() => setForceSettingsExpanded(false)}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Logo />
        </div>
      </div>
      {/* Search Input */}
      {/* <div style={{ width: '100%', maxWidth: '400px' }}>
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
              fontSize: '13px !important',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: language === 'fa' ? 'right' : 'left',
              direction: language === 'fa' ? 'rtl' : 'ltr'
            }}
          />
        </div>
      </div> */}

      {/* Advertisement Banner - Only visible when Unlimited section is hidden */}
      {/*TODO Advertisement Banner*/}
      {/* Unlimited Access Section */}
      {(showVerifyPhone || showUpdateProfile) && (
        <div style={{
          marginTop: (showVerifyPhone || showUpdateProfile) ? '0px' : '30px',
          width: '100%',
          maxWidth: '400px'
        }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              margin: '0 0 20px 0',
              gap: '5px'
            }}
          >
            {/* متن */}
            <h3
              style={{
                color: '#50b4ff',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '700',
                textAlign: language === 'fa' ? 'right' : 'left', // 👈 متن راست یا چپ
                direction: language === 'fa' ? 'rtl' : 'ltr',
                margin: 0,
              }}
            >
              {t('unlimited.title')}
            </h3>

            {/* دکمه */}
            <button
              onClick={() => setShowUnlimitedHelpModal(true)}
              style={{
                background: 'none',
                border: '1px solid #848d96',
                color: '#848d96',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: '0',
                borderRadius: '50%',
                width: '19px',
                height: '19px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: language === 'fa' ? '8px' : '0', // فاصله مناسب
                marginRight: language === 'fa' ? '0' : '8px',
              }}
            >
              ?
            </button>
          </div>

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
                    fontSize: '13px !important',
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
                    fontSize: '13px !important',
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0 0 20px 0',
            gap: '5px'
          }}
        >
          {/* متن */}
          <h3
            style={{
              color: '#50b4ff',
              fontSize: '12px',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '700',
              textAlign: language === 'fa' ? 'right' : 'left', // 👈 متن راست یا چپ
              direction: language === 'fa' ? 'rtl' : 'ltr',
              margin: 0,
            }}
          >
            {t('bots.title')}
          </h3>

          {/* دکمه */}
          <button
            onClick={() => setShowHelpModal(true)}
            style={{
              background: 'none',
              border: '1px solid #848d96',
              color: '#848d96',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              padding: '0',
              borderRadius: '50%',
              width: '19px',
              height: '19px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: language === 'fa' ? '8px' : '0', // فاصله مناسب
              marginRight: language === 'fa' ? '0' : '8px',
            }}
          >
            ?
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>

          {/* Create New Request Link */}
          <button onClick={() => setCurrentPage('createRequest')}
            disabled={(showVerifyPhone)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: (showVerifyPhone) ? '#2f2e2e' : '#212a33', // رنگ غیرفعال
              borderRadius: '8px 8px 0 0',
              cursor: (showVerifyPhone) ? 'not-allowed' : 'pointer', border: 'none',
              width: '100%',
              direction: language === 'fa' ? 'rtl' : 'ltr',
              marginBottom: '1px',
              opacity: (showVerifyPhone) ? 0.6 : 1, // شفافیت غیرفعال
            }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '1px solid ' + ((showVerifyPhone) ? '#999' : '#50b4ff'),
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
              color: (showVerifyPhone) ? '#999' : '#50b4ff',
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

          <button onClick={() => setCurrentPage('myRequest')} style={{
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
                <path d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8M16 4V2M16 4V6M8 4V2M8 4V6M8 10H16M8 14H13" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                {language === 'fa' ? 'درخواست‌های من' : 'My Request'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {language === 'fa' ? 'مشاهده درخواست‌های شما' : 'View your requests'}
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

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        isOpen={showTermsModal}
        onAccept={handleAcceptTerms}
      />

      {showUnlimitedHelpModal && (
        <UnlimitedHelpModal
          isOpen={showUnlimitedHelpModal}
          onClose={() => setShowUnlimitedHelpModal(false)}
        />
      )}

      {showHelpModal && (
        <HelpModal
          isOpen={showHelpModal}
          onClose={() => setShowHelpModal(false)}
        />
      )}

      {/* Tab Bar - Show only on main pages */}
      {['home', 'myRequest', 'parcelList', 'chatPersonList'].includes(currentPage) && (
        <TabBar
          tabs={tabItems}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <ThemeProvider>
          <LanguageProvider>
            <SafeAreaWrapper>
              <GlobalStyles />
              <BrowserRouter>
                <Routes>
                  <Route path="/chatlist" element={<ChatPersonList />} />
                  <Route path="/*" element={<AppContent />} />
                </Routes>
              </BrowserRouter>
            </SafeAreaWrapper>
          </LanguageProvider>
        </ThemeProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
};

export default App;
