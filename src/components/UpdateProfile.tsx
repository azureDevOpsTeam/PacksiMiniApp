import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramButtons } from '../hooks/useTelegramButtons';
import Logo from './Logo';
import Settings from './Settings';

interface UpdateProfileFormData {
  countryOfResidenceId: number;
  firstName: string;
  lastName: string;
  displayName: string;
  address: string;
  company: string;
  postalCode: string;
  gender: number;
  maritalStatus: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface UpdateProfileProps {
}

const UpdateProfile: React.FC<UpdateProfileProps> = () => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<UpdateProfileFormData>({
    countryOfResidenceId: 0,
    firstName: '',
    lastName: '',
    displayName: '',
    address: '',
    company: '',
    postalCode: '',
    gender: -1,
    maritalStatus: -1
  });

  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Check if form is valid for submission
  const isFormValid = !!(formData.firstName.trim() !== '' && 
                     formData.lastName.trim() !== '' && 
                     formData.countryOfResidenceId !== 0);

  // Mock data for dropdowns
  const countries = [
    { id: 1, name: 'ایران', nameEn: 'Iran' },
    { id: 2, name: 'آمریکا', nameEn: 'United States' },
    { id: 3, name: 'کانادا', nameEn: 'Canada' },
    { id: 4, name: 'آلمان', nameEn: 'Germany' },
    { id: 5, name: 'فرانسه', nameEn: 'France' }
  ];

  const genderOptions = [
    { id: 0, name: t('updateProfile.male'), nameEn: 'Male' },
    { id: 1, name: t('updateProfile.female'), nameEn: 'Female' }
  ];

  const maritalStatusOptions = [
    { id: 0, name: t('updateProfile.single'), nameEn: 'Single' },
    { id: 1, name: t('updateProfile.married'), nameEn: 'Married' }
  ];

  const handleInputChange = (field: keyof UpdateProfileFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
      // Profile update submitted successfully
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
                value={formData.firstName}
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
                value={formData.lastName}
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
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
              style={inputStyle}
              placeholder={t('updateProfile.displayNamePlaceholder')}
            />
          </div>

          {/* Country of Residence */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.countryOfResidence')}</label>
            <select
              value={formData.countryOfResidenceId}
              onChange={(e) => handleInputChange('countryOfResidenceId', parseInt(e.target.value))}
              style={inputStyle}
            >
              <option value={0}>{t('updateProfile.selectCountry')}</option>
              {countries.map(country => (
                <option key={country.id} value={country.id}>
                  {isRTL ? country.name : country.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('updateProfile.address')}</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              style={{
                ...inputStyle,
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder={t('updateProfile.addressPlaceholder')}
            />
          </div>

          {/* Company and Postal Code */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Company */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.company')}</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder={t('updateProfile.companyPlaceholder')}
              />
            </div>

            {/* Postal Code */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.postalCode')}</label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                placeholder={t('updateProfile.postalCodePlaceholder')}
              />
            </div>
          </div>

          {/* Gender and Marital Status */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Gender */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.gender')}</label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', parseInt(e.target.value))}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <option value={-1}>{t('updateProfile.selectGender')}</option>
                {genderOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {isRTL ? option.name : option.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Marital Status */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('updateProfile.maritalStatus')}</label>
              <select
                value={formData.maritalStatus}
                onChange={(e) => handleInputChange('maritalStatus', parseInt(e.target.value))}
                style={{
                  ...inputStyle,
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                <option value={-1}>{t('updateProfile.selectMaritalStatus')}</option>
                {maritalStatusOptions.map(option => (
                  <option key={option.id} value={option.id}>
                    {isRTL ? option.name : option.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note: Submit button is now handled by Telegram's MainButton in the bottom bar */}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;