import React, { useState, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramButtons } from '../hooks/useTelegramButtons';
import { apiService } from '../services/apiService';
import type { CountryItem, CityItem, UpdateProfileRequest } from '../types/api';
import Logo from './Logo';
import Settings from './Settings';
import SkeletonLoader from './SkeletonLoader';
import MultiSelectTreeDropdown from './MultiSelectTreeDropdown';

interface UpdateProfileFormData {
  countryOfResidenceId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  address: string;
  gender: number;
  selectedCities: number[];
}

interface UpdateProfileProps {
  onProfileUpdated?: () => void;
}

const UpdateProfile: React.FC<UpdateProfileProps> = ({ onProfileUpdated }) => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<UpdateProfileFormData>({
    countryOfResidenceId: 0,
    firstName: '',
    lastName: '',
    displayName: '',
    address: '',
    gender: -1,
    selectedCities: []
  });

  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);


  // Check if form is valid for submission
  const isFormValid = !!(formData.firstName && formData.firstName.trim() !== '' &&
    formData.lastName && formData.lastName.trim() !== '' &&
    formData.countryOfResidenceId !== 0);

  // Load user info and countries on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsInitialLoading(true);
        // Load user info
        const userInfoResponse = await apiService.getUserInfo();
        if (userInfoResponse.requestStatus.name === 'Successful') {
          const userInfo = userInfoResponse.objectResult;
          setFormData({
            countryOfResidenceId: userInfo.countryOfResidenceId || 0,
            firstName: userInfo.firstName || '',
            lastName: userInfo.lastName || '',
            displayName: userInfo.displayName || '',
            address: userInfo.address || '',
            gender: userInfo.gender || -1,
            selectedCities: userInfo.selectedCities || []
          });

        }

        // Load countries
        const countriesResponse = await apiService.getCountries();
        if (countriesResponse.requestStatus && countriesResponse.requestStatus.name === 'Successful') {
          setCountries(countriesResponse.objectResult?.listItems || []);
        }

        // Load cities
        setCitiesLoading(true);
        try {
          const citiesResponse = await apiService.getCities();
          if (citiesResponse.requestStatus && citiesResponse.requestStatus.name === 'Successful') {
            setCities(citiesResponse.objectResult?.listItems || []);
          }
        } catch (error) {
          console.error('Error loading cities:', error);
        } finally {
          setCitiesLoading(false);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const genderOptions = [
    { id: 0, name: t('updateProfile.male'), nameEn: 'Male' },
    { id: 1, name: t('updateProfile.female'), nameEn: 'Female' }
  ];



  const handleInputChange = (field: keyof UpdateProfileFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCitySelectionChange = (selectedValues: number[]) => {
    setFormData(prev => ({
      ...prev,
      selectedCities: selectedValues
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const request: UpdateProfileRequest = {
        model: {
          countryOfResidenceId: formData.countryOfResidenceId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          displayName: formData.displayName,
          address: formData.address,
          gender: formData.gender
        }
      };

      const response = await apiService.updateProfile(request);
      
      if (response.requestStatus.name === 'Successful') {
        setSuccess(true);
        // Call onProfileUpdated after successful update
        if (onProfileUpdated) {
          setTimeout(() => {
            onProfileUpdated();
          }, 1000); // Wait 1 second to show success message
        }
      } else {
        throw new Error(response.message || 'Profile update failed');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Telegram buttons
  const { updateMainButton } = useTelegramButtons({
    mainButton: {
      text: success ? (t('common.saved') || 'ذخیره شد ✓') : (t('common.save') || 'ذخیره تغییرات'),
      onClick: handleSubmit,
      isVisible: true,
      isEnabled: isFormValid && !isLoading,
      isLoading: isLoading,
      color: success ? '#4CAF50' : '#50b4ff'
    }
  });

  // Update button state when form validity or loading state changes
  React.useEffect(() => {
    updateMainButton({
      text: success ? (t('common.saved') || 'ذخیره شد ✓') : (t('common.save') || 'ذخیره تغییرات'),
      isEnabled: isFormValid && !isLoading,
      isLoading: isLoading,
      color: success ? '#4CAF50' : '#50b4ff'
    });
  }, [isFormValid, isLoading, success, t, updateMainButton]);

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid #3a4a5c',
    backgroundColor: '#212a33',
    color: '#848d96',
    fontSize: '13px',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    color: '#50b4ff',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'IRANSansX, sans-serif',
    textAlign: isRTL ? 'right' as const : 'left' as const
  };

  if (isInitialLoading) {
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

        {/* Form Fields Skeleton */}
        <div style={{ width: '100%', maxWidth: '400px', gap: '20px', display: 'flex', flexDirection: 'column' }}>
          <SkeletonLoader type="text" width="100px" height="16px" />
          <SkeletonLoader type="search" height="40px" />

          <SkeletonLoader type="text" width="80px" height="16px" />
          <SkeletonLoader type="search" height="40px" />

          <SkeletonLoader type="text" width="90px" height="16px" />
          <SkeletonLoader type="search" height="40px" />

          <SkeletonLoader type="text" width="120px" height="16px" />
          <SkeletonLoader type="search" height="40px" />

          <SkeletonLoader type="text" width="70px" height="16px" />
          <SkeletonLoader type="search" height="40px" />

          <SkeletonLoader type="text" width="60px" height="16px" />
          <SkeletonLoader type="search" height="40px" />
        </div>
      </div>
    );
  }

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

        <p style={{
          fontSize: '14px',
          margin: '0 auto 20px auto',
          opacity: 0.8,
          maxWidth: '400px',
          textAlign: 'justify'
        }}>
          {t('updateProfile.title')}
        </p>

        {/* Form */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* Name Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* First Name */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.firstName')}</label>
              <input
                type="text"
                value={formData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder={t('updateProfile.firstNamePlaceholder')}
              />
            </div>

            {/* Last Name */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.lastName')}</label>
              <input
                type="text"
                value={formData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder={t('updateProfile.lastNamePlaceholder')}
              />
            </div>
          </div>

          {/* Display Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.displayName')}</label>
            <input
              type="text"
              value={formData.displayName || ''}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              style={inputStyle}
              placeholder={t('updateProfile.displayNamePlaceholder')}
            />
          </div>

          {/* Country of Residence */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.countryOfResidence')}</label>
            <select
              value={formData.countryOfResidenceId || 0}
              onChange={(e) => handleInputChange('countryOfResidenceId', parseInt(e.target.value))}
              style={inputStyle}
            >
              <option value={0}>{t('updateProfile.selectCountry')}</option>
              {countries.map(country => (
                <option key={country.value} value={country.value}>
                  {isRTL ? country.text : country.label}
                </option>
              ))}
            </select>
          </div>

          {/* Cities Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.cities')}</label>
            <MultiSelectTreeDropdown
              data={cities}
              loading={citiesLoading}
              placeholder={t('updateProfile.selectCities')}
              selectedValues={formData.selectedCities}
              onSelectionChange={handleCitySelectionChange}
              theme={theme}
              isRTL={isRTL}
            />
          </div>
          
          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.address')}</label>
            <textarea
              value={formData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder={t('updateProfile.addressPlaceholder')}
            />
          </div>

          {/* Gender */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.gender')}</label>
            <select
              value={formData.gender || -1}
              onChange={(e) => handleInputChange('gender', parseInt(e.target.value))}
              style={inputStyle}
            >
              <option value={-1}>{t('updateProfile.selectGender')}</option>
              {genderOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {isRTL ? option.name : option.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Note: Submit button is now handled by Telegram's MainButton in the bottom bar */}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;