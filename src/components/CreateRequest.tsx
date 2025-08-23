import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramButtons } from '../hooks/useTelegramButtons';
import Logo from './Logo';
import Settings from './Settings';
import TreeDropdown from './TreeDropdown';
import { apiService } from '../services/apiService';
import type { CreateRequestPayload, CityItem, ItemType } from '../types/api';

interface CreateRequestFormData {
  originCityId: number;
  destinationCityId: number;
  departureDate: string;
  arrivalDate: string;
  requestType: number;
  description: string;
  maxWeightKg: number;
  maxLengthCm: number;
  maxWidthCm: number;
  maxHeightCm: number;
  itemTypeIds: number[];
  files: string[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CreateRequestProps {
}

const CreateRequest: React.FC<CreateRequestProps> = () => {
  const { t, isRTL } = useLanguage();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<CreateRequestFormData>({
    originCityId: 0,
    destinationCityId: 0,
    departureDate: '',
    arrivalDate: '',
    requestType: -1,
    description: '',
    maxWeightKg: 0,
    maxLengthCm: 0,
    maxWidthCm: 0,
    maxHeightCm: 0,
    itemTypeIds: [],
    files: []
  });

  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [citiesTree, setCitiesTree] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [originCityLabel, setOriginCityLabel] = useState('');
  const [destinationCityLabel, setDestinationCityLabel] = useState('');
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [itemTypesLoading, setItemTypesLoading] = useState(true);

  // Check if form is valid for submission
  const isFormValid = !!(formData.originCityId !== 0 && 
                     formData.destinationCityId !== 0 && 
                     formData.departureDate && 
                     formData.arrivalDate && 
                     formData.requestType !== -1);

  // Load cities tree on component mount
  useEffect(() => {
    const loadCitiesTree = async () => {
      try {
        setCitiesLoading(true);
        const response = await apiService.getCitiesTree();
        if (response.requestStatus.name === 'Successful') {
          setCitiesTree(response.objectResult.listItems);
        } else {
          setError('خطا در بارگذاری لیست شهرها');
        }
      } catch (error) {
        console.error('Error loading cities tree:', error);
        setError('خطا در بارگذاری لیست شهرها');
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCitiesTree();
  }, []);

  // Load item types on component mount
  useEffect(() => {
    const loadItemTypes = async () => {
      try {
        setItemTypesLoading(true);
        const response = await apiService.getItemTypes();
        if (response.requestStatus.name === 'Successful') {
          setItemTypes(response.objectResult);
        } else {
          setError('خطا در بارگذاری انواع اقلام');
        }
      } catch (error) {
        console.error('Error loading item types:', error);
        setError('خطا در بارگذاری انواع اقلام');
      } finally {
        setItemTypesLoading(false);
      }
    };

    loadItemTypes();
  }, []);

  const requestTypes = [
    { id: 0, name: t('createRequest.passenger'), nameEn: 'Passenger' },
    { id: 1, name: t('createRequest.sender'), nameEn: 'Sender' }
  ];



  const handleInputChange = (field: keyof CreateRequestFormData, value: string | number | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemTypeToggle = (itemTypeId: number) => {
    setFormData(prev => ({
      ...prev,
      itemTypeIds: prev.itemTypeIds.includes(itemTypeId)
        ? prev.itemTypeIds.filter(id => id !== itemTypeId)
        : [...prev.itemTypeIds, itemTypeId]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (formData.originCityId === 0 || formData.destinationCityId === 0) {
        throw new Error(t('createRequest.validation.citiesRequired') || 'لطفاً شهر مبدا و مقصد را انتخاب کنید');
      }

      if (!formData.departureDate || !formData.arrivalDate) {
        throw new Error(t('createRequest.validation.datesRequired') || 'لطفاً تاریخ حرکت و بازگشت را انتخاب کنید');
      }

      if (formData.requestType === -1) {
        throw new Error(t('createRequest.validation.typeRequired') || 'لطفاً نوع درخواست را انتخاب کنید');
      }

      // Prepare files array
      const files: File[] = [];
      if (ticketFile) {
        files.push(ticketFile);
      }

      // Prepare API payload (without files in model)
      const payload: CreateRequestPayload = {
        model: {
          ...formData,
          // Convert dates to ISO format if needed
          departureDate: new Date(formData.departureDate).toISOString(),
          arrivalDate: new Date(formData.arrivalDate).toISOString(),
          files: [] // Empty array since files are sent separately
        }
      };

      // Sending request to API

      // Call API with files
      const response = await apiService.createRequest(payload, files);

      if (response.success) {
        setSuccess(true);
        // Request created successfully
        
        // Reset form after successful submission
        setTimeout(() => {
          setFormData({
            originCityId: 0,
            destinationCityId: 0,
            departureDate: '',
            arrivalDate: '',
            requestType: -1,
            description: '',
            maxWeightKg: 0,
            maxLengthCm: 0,
            maxWidthCm: 0,
            maxHeightCm: 0,
            itemTypeIds: [],
            files: []
          });
          setTicketFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(response.message || t('createRequest.error.general') || 'خطا در ارسال درخواست');
      }
    } catch (err) {
      // Handle different types of errors
      let errorMessage = t('createRequest.error.unknown') || 'خطای نامشخص';
      
      if (err instanceof Error) {
        // Check for specific error types
        if (err.message.includes('اتصال به اینترنت')) {
          errorMessage = t('createRequest.error.network') || 'خطا در اتصال به اینترنت. لطفاً اتصال خود را بررسی کنید.';
        } else if (err.message.includes('احراز هویت')) {
          errorMessage = t('createRequest.error.auth') || 'خطا در احراز هویت. لطفاً دوباره تلاش کنید.';
        } else if (err.message.includes('سرور')) {
          errorMessage = t('createRequest.error.server') || 'خطای سرور. لطفاً بعداً تلاش کنید.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      
      // Log error in development mode
      if (import.meta.env.DEV) {
        // Error handled by user feedback
      }
    } finally {
      setIsLoading(false);
    }
  };

  const { updateMainButton } = useTelegramButtons({
    mainButton: {
      text: t('createRequest.submit'),
      isVisible: true,
      onClick: handleSubmit,
      color: '#50b4ff',
      isEnabled: isFormValid && !isLoading,
    }
  });

  // Update MainButton based on form state
  React.useEffect(() => {
    updateMainButton({
      text: isLoading ? t('createRequest.sending') : success ? t('createRequest.success') : t('createRequest.submit'),
      isEnabled: isFormValid && !isLoading,
      isLoading: isLoading,
      color: success ? '#4CAF50' : '#50b4ff'
    });
  }, [isFormValid, isLoading, success, updateMainButton, t]);

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
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: 'IRANSansX, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        {/* Header with Logo */}
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

        <p style={{
          fontSize: '14px',
          margin: '0 auto 20px auto',
          opacity: 0.8,
          maxWidth: '400px',
          textAlign: 'justify'
        }}>
          {t('createRequest.title')}
        </p>

        {/* Form */}
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          {/* City Fields */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '20px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Origin City */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('createRequest.originCity')}</label>
              <TreeDropdown
                data={citiesTree}
                loading={citiesLoading}
                placeholder={t('createRequest.selectCity')}
                value={formData.originCityId}
                displayValue={originCityLabel}
                onSelect={(value, label) => {
                  handleInputChange('originCityId', value);
                  setOriginCityLabel(label);
                }}
                theme={theme}
                isRTL={isRTL}
              />
            </div>

            {/* Destination City */}
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>{t('createRequest.destinationCity')}</label>
              <TreeDropdown
                data={citiesTree}
                loading={citiesLoading}
                placeholder={t('createRequest.selectCity')}
                value={formData.destinationCityId}
                displayValue={destinationCityLabel}
                onSelect={(value, label) => {
                  handleInputChange('destinationCityId', value);
                  setDestinationCityLabel(label);
                }}
                theme={theme}
                isRTL={isRTL}
              />
            </div>
          </div>

          {/* Departure Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('createRequest.departureDate')}</label>
            <input
              type="datetime-local"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Arrival Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('createRequest.arrivalDate')}</label>
            <input
              type="datetime-local"
              value={formData.arrivalDate}
              onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Request Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('createRequest.requestType')}</label>
            <select
              value={formData.requestType}
              onChange={(e) => handleInputChange('requestType', parseInt(e.target.value))}
              style={inputStyle}
            >
              <option value={-1}>{t('createRequest.selectRequestType')}</option>
              {requestTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Ticket Upload for Passenger */}
          {formData.requestType === 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>{isRTL ? 'بارگذاری بلیط' : 'Upload Ticket'}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                style={{
                  ...inputStyle,
                  padding: '12px',
                  cursor: 'pointer'
                }}
              />
              {ticketFile && (
                <div style={{
                  marginTop: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px',
                  backgroundColor: '#212a33',
                  borderRadius: '8px',
                  border: '1px solid #3a4a5c'
                }}>
                  {ticketFile.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(ticketFile)}
                      alt="Ticket preview"
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#3a4a5c',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      color: '#848d96'
                    }}>
                      PDF
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '14px',
                      color: '#ffffff',
                      fontFamily: 'IRANSansX, sans-serif',
                      marginBottom: '4px'
                    }}>
                      {ticketFile.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#848d96',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      {(ticketFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
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
              )}
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('createRequest.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '100px'
              }}
              placeholder={t('createRequest.description')}
            />
          </div>

          {/* Additional Details Accordion */}
          <div style={{ marginBottom: '20px' }}>
            <div
              onClick={() => setIsAccordionOpen(!isAccordionOpen)}
              style={{
                padding: '12px',
                borderRadius: '5px',
                border: '1px solid #3a4a5c',
                backgroundColor: '#212a33',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}
            >
              <span style={{
                color: '#50b4ff',
                fontSize: '14px',
                fontWeight: '700',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'توضیحات اضافی (اختیاری)' : 'Additional Details (Optional)'}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path
                  d="M6 9L12 15L18 9"
                  stroke="#50b4ff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {isAccordionOpen && (
              <div style={{
                padding: '16px',
                borderRadius: '5px',
                border: '1px solid #3a4a5c',
                backgroundColor: '#1a2128'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={labelStyle}>{t('createRequest.maxWeight')}</label>
                    <input
                      type="number"
                      value={formData.maxWeightKg || ''}
                      onChange={(e) => handleInputChange('maxWeightKg', parseFloat(e.target.value) || 0)}
                      style={inputStyle}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('createRequest.maxLength')}</label>
                    <input
                      type="number"
                      value={formData.maxLengthCm || ''}
                      onChange={(e) => handleInputChange('maxLengthCm', parseFloat(e.target.value) || 0)}
                      style={inputStyle}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('createRequest.maxWidth')}</label>
                    <input
                      type="number"
                      value={formData.maxWidthCm || ''}
                      onChange={(e) => handleInputChange('maxWidthCm', parseFloat(e.target.value) || 0)}
                      style={inputStyle}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>{t('createRequest.maxHeight')}</label>
                    <input
                      type="number"
                      value={formData.maxHeightCm || ''}
                      onChange={(e) => handleInputChange('maxHeightCm', parseFloat(e.target.value) || 0)}
                      style={inputStyle}
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Item Types */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>{t('createRequest.itemTypes')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px',
              marginTop: '8px'
            }}>
              {itemTypesLoading ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '20px',
                  color: '#848d96',
                  fontSize: '14px'
                }}>
                  {t('loading')}
                </div>
              ) : (
                itemTypes.map(itemType => (
                  <label
                    key={itemType.itemTypeId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '5px',
                      border: '1px solid #3a4a5c',
                      backgroundColor: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '#50b4ff20'
                        : '#212a33',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.itemTypeIds.includes(itemType.itemTypeId)}
                      onChange={() => handleItemTypeToggle(itemType.itemTypeId)}
                      style={{
                        marginRight: isRTL ? '0' : '8px',
                        marginLeft: isRTL ? '8px' : '0'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: '#848d96',
                      fontFamily: 'IRANSansX, sans-serif'
                    }}>
                      {isRTL ? itemType.persianName : itemType.itemType}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Note: Submit button is now handled by Telegram's MainButton in the bottom bar */}

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#ff4444',
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              marginTop: '15px',
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              borderRadius: '5px',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              {t('createRequest.success') || 'درخواست شما با موفقیت ارسال شد!'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;