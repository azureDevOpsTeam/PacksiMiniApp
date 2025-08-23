import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramContext } from '../hooks/useTelegramContext';
import { apiService } from '../services/apiService';
import AddPreferredLocation from './AddPreferredLocation';
import Logo from './Logo';
import Settings from './Settings';
import SkeletonLoader from './SkeletonLoader';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface ParcelListProps {
}

const ParcelList: React.FC<ParcelListProps> = () => {
  const { isRTL } = useLanguage();
  const { theme } = useTheme();
  const { webApp } = useTelegramContext();
  
  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(true); // Default to showing form until API response
  const [parcels] = useState([
    {
      id: 1,
      origin: 'تهران',
      destination: 'اصفهان',
      departureDate: '1403/10/15',
      weight: '5 کیلوگرم',
      status: 'در انتظار'
    },
    {
      id: 2,
      origin: 'مشهد',
      destination: 'شیراز',
      departureDate: '1403/10/20',
      weight: '3 کیلوگرم',
      status: 'تایید شده'
    },
    {
      id: 3,
      origin: 'اصفهان',
      destination: 'تبریز',
      departureDate: '1403/10/25',
      weight: '7 کیلوگرم',
      status: 'در حال ارسال'
    }
  ]);

  // Check setPreferredLocation on component mount
  useEffect(() => {
    const checkPreferredLocation = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.validate();
        
        if (response.objectResult) {
          const { setPreferredLocation } = response.objectResult;
          setShowForm(!setPreferredLocation); // Show form if setPreferredLocation is false, show list if true
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
        
        {/* Content Skeleton */}
        <div style={{ width: '100%', maxWidth: '400px', gap: '20px', display: 'flex', flexDirection: 'column' }}>
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
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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

        {/* Parcel List */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {parcels.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#848d96',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              هیچ بسته‌ای یافت نشد
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {parcels.map((parcel) => (
                <div
                  key={parcel.id}
                  style={{
                    backgroundColor: '#212a33',
                    borderRadius: '8px',
                    padding: '16px',
                    border: '1px solid #3a4a5c',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#ffffff',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      {parcel.origin} → {parcel.destination}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: parcel.status === 'تایید شده' ? '#10b981' : 
                                     parcel.status === 'در حال ارسال' ? '#f59e0b' : '#6b7280',
                      color: '#ffffff',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      {parcel.status}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#848d96',
                    fontFamily: 'IRANSansX, sans-serif'
                  }}>
                    <span>تاریخ: {parcel.departureDate}</span>
                    <span>وزن: {parcel.weight}</span>
                  </div>
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