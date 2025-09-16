import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramButtons } from '../hooks/useTelegramButtons';
import { useFormValidation } from '../hooks/useFormValidation';
import MultiSelectTreeDropdown from './MultiSelectTreeDropdown';
import apiService from '../services/apiService';
import type { CountryItem, CityItem, AddUserPreferredLocationRequest } from '../types/api';
import SkeletonLoader from './SkeletonLoader';
import Logo from './Logo';
import Settings from './Settings';

interface AddPreferredLocationData {
  countryOfResidenceId: number;
  cityIds: number[];
}

interface AddPreferredLocationProps {
  onComplete?: () => void;
}

const AddPreferredLocation: React.FC<AddPreferredLocationProps> = ({ onComplete }) => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();
  const [formData, setFormData] = React.useState<AddPreferredLocationData>({
    countryOfResidenceId: 0,
    cityIds: []
  });
  const [countries, setCountries] = React.useState<CountryItem[]>([]);
  const [cities, setCities] = React.useState<CityItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const [success, setSuccess] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState<'user' | 'admin'>('user');

  // Validation rules
  const validationRules = {
    countryOfResidenceId: {
      required: true,
      custom: (value: number) => value > 0
    },
    cityIds: {
      required: true,
      custom: (value: number[]) => value.length > 0
    }
  };

  // Initialize validation hook
  const {
    validateForm,
    hasFieldError,
    getFieldStyle,
    markFieldTouched
  } = useFormValidation(validationRules);

  // Load countries and cities on component mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesResponse, citiesResponse] = await Promise.all([
          apiService.getCountries(),
          apiService.getCitiesTree()
        ]);
        setCountries(countriesResponse.objectResult?.listItems || []);
        setCities(citiesResponse.objectResult?.listItems || []);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = parseInt(event.target.value);
    setFormData(prev => ({
      ...prev,
      countryOfResidenceId: countryId,
      cityIds: [] // Reset cities when country changes
    }));
  };

  const handleCitySelectionChange = (selectedCityIds: number[]) => {
    setFormData(prev => ({
      ...prev,
      cityIds: selectedCityIds
    }));
  };

  const isFormValid = formData.countryOfResidenceId > 0 && formData.cityIds.length > 0;

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    try {
      const request: AddUserPreferredLocationRequest = {
        model: {
          countryOfResidenceId: formData.countryOfResidenceId,
          cityIds: formData.cityIds
        }
      };

      await apiService.addUserPreferredLocation(request);
      setSuccess(true);
      console.log('Form submitted successfully:', formData);
      
      // Call onComplete after successful submission
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1500); // Wait 1.5 seconds to show success message
      }
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Telegram buttons
  const { updateMainButton } = useTelegramButtons({
    mainButton: {
      text: success ? t('common.success') + ' ✓' : t('preferredLocation.submit'),
      onClick: handleSubmit,
      isVisible: true,
      isEnabled: isFormValid && !isLoading,
      isLoading: isLoading,
      color: success ? '#4CAF50' : '#50b4ff'
    }
  });

  // Update button state when form validity or loading state changes with debounce for iOS
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMainButton({
        text: success ? t('common.success') + ' ✓' : t('preferredLocation.submit'),
        isEnabled: isFormValid && !isLoading,
        isLoading: isLoading,
        color: success ? '#4CAF50' : '#50b4ff'
      });
    }, 150); // Debounce for iOS

    return () => clearTimeout(timeoutId);
  }, [isFormValid, isLoading, success, updateMainButton, t]);

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '5px',
    border: '1px solid #3a4a5c',
    backgroundColor: '#212a33',
    color: '#848d96',
    fontSize: '13px !important',
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
        padding: '10px 20px 0 20px',
        backgroundColor: theme.colors.background
      }}>
        {/* Header Skeleton */}
        <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
          <SkeletonLoader type="profile" height="60px" />
        </div>
        
        {/* Title Skeleton */}
        <div style={{ marginBottom: '10px', width: '100%', maxWidth: '400px' }}>
          <SkeletonLoader type="text" height="24px" />
        </div>
        
        {/* Description Skeleton */}
        <div style={{ marginBottom: '20px', width: '100%', maxWidth: '400px' }}>
          <SkeletonLoader type="text" height="40px" />
        </div>
        
        {/* Form Fields Skeleton */}
        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
          <SkeletonLoader type="text" height="50px" />
        </div>
        <div style={{ width: '100%', maxWidth: '400px', marginBottom: '20px' }}>
          <SkeletonLoader type="text" height="50px" />
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        padding: '10px 20px 0 20px',
        backgroundColor: theme.colors.background,
        textAlign: 'center'
      }}>
        <div style={{
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          width: '80px',
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px'
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 style={{
          color: theme.colors.text.primary,
          marginBottom: '10px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          {t('common.success')}
        </h2>
        <p style={{
          color: theme.colors.text.secondary,
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          {t('preferredLocation.successMessage')}
        </p>
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
      padding: '10px 20px 0 20px',
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
          {t('preferredLocation.description')}
        </p>

        {/* Form */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{
            color: theme.colors.text.primary,
            marginBottom: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {t('preferredLocation.title')}
          </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            ...labelStyle,
            color: hasFieldError('countryOfResidenceId') ? '#ff4757' : labelStyle.color
          }}>
            {t('preferredLocation.countryOfResidence')}
          </label>
          <select
            value={formData.countryOfResidenceId}
            onChange={handleCountryChange}
            onBlur={() => markFieldTouched('countryOfResidenceId')}
            style={{
              ...getFieldStyle(inputStyle, 'countryOfResidenceId'),
              cursor: 'pointer'
            }}
          >
            <option value={0}>{t('preferredLocation.selectCountry')}</option>
            {countries.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            ...labelStyle,
            color: hasFieldError('cityIds') ? '#ff4757' : labelStyle.color
          }}>
            {t('preferredLocation.preferredCities')}
          </label>
          <MultiSelectTreeDropdown
            data={cities}
            loading={isLoading}
            selectedValues={formData.cityIds}
            onSelectionChange={handleCitySelectionChange}
            placeholder={t('preferredLocation.selectCities')}
            theme={theme}
            isRTL={isRTL}
            style={getFieldStyle({}, 'cityIds')}
            onBlur={() => markFieldTouched('cityIds')}
            disabled={!formData.countryOfResidenceId}
            excludeCountryId={formData.countryOfResidenceId || undefined}
          />
        </div>
        </div>
      </div>
    </div>
  );
};

export default AddPreferredLocation;