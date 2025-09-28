import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TelegramProvider from './contexts/TelegramContext';
import ThemeProvider from './contexts/ThemeContext';
import LanguageProvider from './contexts/LanguageContext';
import ChatProvider from './contexts/ChatContext';
import RequestProvider from './contexts/RequestContext';
import { GlobalStyles } from './styles/GlobalStyles';
import { useTelegramContext } from './hooks/useTelegramContext';
import { useLanguage } from './hooks/useLanguage';
import { useChatContext } from './contexts/ChatContext';
import { useRequestContext } from './contexts/RequestContext';
import CreateRequest from './components/CreateRequest';
import UpdateProfile from './components/UpdateProfile';
import AddPreferredLocation from './components/AddPreferredLocation';
import ParcelList from './components/ParcelList';
import MyRequest from './components/MyRequest';
import InProgressRequest from './components/InProgressRequest';
import CryptoPayment from './components/CryptoPayment';
import Logo from './components/Logo';

import SettingsModal from './components/SettingsModal';
import SafeAreaWrapper from './components/SafeAreaWrapper';
import NotFound from './components/NotFound';
import ChatPersonList from './components/ChatPersonList';
import { AdminRoutes } from './admin';
import TermsOfServiceModal from './components/TermsOfServiceModal';
import HelpModal from './components/HelpModal';
import UnlimitedHelpModal from './components/UnlimitedHelpModal';
import type { TabItem } from './components/TabBar';
import AppLayout from './components/AppLayout';

import ErrorBoundary from './components/ErrorBoundary';
import SkeletonLoader from './components/SkeletonLoader';
import apiService from './services/apiService';
import type { RequestContactResponse } from '@twa-dev/types';

// Main App Content Component
const AppContent: React.FC = () => {
  const { isReady, webApp, user } = useTelegramContext();
  const { t, language } = useLanguage();
  const { chatCount } = useChatContext();
  const { requestCount } = useRequestContext();
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');
  const [currentPage, setCurrentPage] = React.useState<'home' | 'createRequest' | 'updateProfile' | 'addPreferredLocation' | 'parcelList' | 'myRequest' | 'inProgressRequest' | 'chatPersonList' | 'cryptoPayment' | 'notFound'>('home');
  const [adminCurrentPage, setAdminCurrentPage] = React.useState<'dashboard' | 'usermanagement' | 'advertisements'>('dashboard');
  const [showVerifyPhone, setShowVerifyPhone] = React.useState<boolean>(false);
  const [showUpdateProfile, setShowUpdateProfile] = React.useState<boolean>(false);
  const [hasCompletedProfile, setHasCompletedProfile] = React.useState<boolean>(true);
  const [isValidating, setIsValidating] = React.useState<boolean>(true);
  const [authenticationFailed, setAuthenticationFailed] = React.useState<boolean>(false);

  const [hasShownAutoSettings, setHasShownAutoSettings] = React.useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = React.useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = React.useState<boolean>(false);
  const [showUnlimitedHelpModal, setShowUnlimitedHelpModal] = React.useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = React.useState<boolean>(false);
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
      badge: requestCount > 0 ? requestCount : undefined,
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
      badge: chatCount > 0 ? chatCount : undefined,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.60573 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      id: 'settings',
      label: t('tabs.settings') || 'تنظیمات',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2579 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01127 9.77251C4.28054 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ], [t, chatCount, requestCount]);

  // Handle tab change
  const handleTabChange = React.useCallback((tabId: string) => {
    if (tabId === 'settings') {
      setShowSettingsModal(true);
      return;
    }
    
    setActiveTab(tabId);
    switch (tabId) {
      case 'home':
        setCurrentPage('home');
        break;
      case 'requests':
        setCurrentPage('inProgressRequest');
        break;
      case 'parcels':
        setCurrentPage('myRequest');
        break;
      case 'chat':
        setCurrentPage('chatPersonList');
        break;
      default:
        setCurrentPage('home');
    }
  }, []);

  // Support opening specific pages via URL params (e.g., ?page=cryptoPayment&wallet=...&amount=...&currency=USDT&network=BSC)
  const [paymentParams, setPaymentParams] = React.useState<{ wallet?: string; amount?: string; currency?: string; network?: string }>({});
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page');
    if (page === 'cryptoPayment') {
      setCurrentPage('cryptoPayment');
      setPaymentParams({
        wallet: params.get('wallet') || undefined,
        amount: params.get('amount') || undefined,
        currency: params.get('currency') || undefined,
        network: params.get('network') || undefined,
      });
    }
  }, []);

  // Sync activeTab with currentPage
  React.useEffect(() => {
    switch (currentPage) {
      case 'home':
        setActiveTab('home');
        break;
      case 'inProgressRequest':
        setActiveTab('requests');
        break;
      case 'myRequest':
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
        setHasCompletedProfile(hasCompletedProfile);
      } else {
        // If API doesn't return expected data, show verify phone button as fallback
        setShowVerifyPhone(true);
        setShowUpdateProfile(false);
        setHasCompletedProfile(true);
      }
    } catch (error) {
      console.error('Error validating user:', error);
      // On error, show verify phone button as fallback
      setShowVerifyPhone(true);
      setShowUpdateProfile(false);
      setHasCompletedProfile(true);
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
      // Mark that the app has been opened before
      localStorage.setItem('hasOpenedAppBefore', 'true');
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

  // Function to render page content
  const renderPageContent = () => {
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
      return <ParcelList setCurrentPage={setCurrentPage} hasCompletedProfile={hasCompletedProfile} shouldLoadData={currentPage === 'parcelList'} />;
    }

    // Render MyRequest page
    if (currentPage === 'myRequest') {
      return <MyRequest shouldLoadData={activeTab === 'parcels'} />;
    }

    // Render InProgressRequest page
    if (currentPage === 'inProgressRequest') {
      return <InProgressRequest shouldLoadData={activeTab === 'requests'} />;
    }

    // Render ChatPersonList page
    if (currentPage === 'chatPersonList') {
      return <ChatPersonList />;
    }

    // Render CryptoPayment page
    if (currentPage === 'cryptoPayment') {
      const wallet = paymentParams.wallet || 'TRX-TRC20-EXAMPLE-ADDRESS-1234567890';
      const amount = paymentParams.amount || '10';
      const currency = paymentParams.currency || 'USDT';
      const network = paymentParams.network || 'TRC20';
      return <CryptoPayment walletAddress={wallet} amount={amount} currency={currency} network={network} />;
    }

    // Render AdminPanel if admin is selected
    if (activeButton === 'admin') {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '10 20px 10px 20px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <AdminRoutes currentPage={adminCurrentPage} onNavigate={setAdminCurrentPage} />
        </div>
      );
    }

    // Render Home page (default)
    return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      padding: '10px 20px 30px 20px',
      textAlign: 'center',
      position: 'relative'
    }}>
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
          fontSize: '13px',
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

  // Determine if TabBar should be shown
  const shouldShowTabBar = !['notFound', 'createRequest', 'updateProfile', 'addPreferredLocation'].includes(currentPage) && 
                          !authenticationFailed;

  // Main render with AppLayout
  return (
    <>
      <AppLayout
        tabItems={tabItems}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        showTabBar={shouldShowTabBar}
      >
        {renderPageContent()}
      </AppLayout>

      {/* Modals */}
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

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        activeButton={activeButton}
        setActiveButton={setActiveButton}
      />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <TelegramProvider>
        <ThemeProvider>
          <LanguageProvider>
            <ChatProvider>
              <RequestProvider>
                <SafeAreaWrapper>
                  <GlobalStyles />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/chatlist" element={<ChatPersonList />} />
                      <Route path="/*" element={<AppContent />} />
                    </Routes>
                  </BrowserRouter>
                </SafeAreaWrapper>
              </RequestProvider>
            </ChatProvider>
          </LanguageProvider>
        </ThemeProvider>
      </TelegramProvider>
    </ErrorBoundary>
  );
};

export default App;
