import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import { useTelegramButtons } from '../hooks/useTelegramButtons';
import { useFormValidation } from '../hooks/useFormValidation';
import Logo from './Logo';
import Settings from './Settings';
import TreeDropdown from './TreeDropdown';
import SkeletonLoader from './SkeletonLoader';
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
  const [files, setFiles] = useState<File[]>([]); // برایل‌های عمومی

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null); // برایل‌های عمومی

  const [activeButton, setActiveButton] = useState<'user' | 'admin'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [citiesTree, setCitiesTree] = useState<CityItem[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [originCityLabel, setOriginCityLabel] = useState('');
  const [destinationCityLabel, setDestinationCityLabel] = useState('');
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [itemTypesLoading, setItemTypesLoading] = useState(true);

  // Validation rules
  const validationRules = {
    originCityId: { required: true, custom: (value: number) => value !== 0 },
    destinationCityId: { required: true, custom: (value: number) => value !== 0 },
    departureDate: { required: true },
    arrivalDate: { required: true },
    requestType: { required: true, custom: (value: number) => value !== -1 }
  };

  const {
    validateForm,
    hasFieldError,
    getFieldStyle,
    markFieldTouched
  } = useFormValidation(validationRules);



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

  // Update initial loading state when both cities and item types are loaded
  useEffect(() => {
    if (!citiesLoading && !itemTypesLoading) {
      setIsInitialLoading(false);
    }
  }, [citiesLoading, itemTypesLoading]);
  


  const requestTypes = [
    { id: 1, name: t('createRequest.passenger'), nameEn: 'Passenger' },
    { id: 2, name: t('createRequest.sender'), nameEn: 'Sender' }
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

  // مدیریت آپلود فایل‌های عمومی
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    // بررسی حجم هر فایل (حداکثر 2 مگابایت)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
    const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8MB

    // محاسبه حجم کل فایل‌های موجود
    const currentTotalSize = files.reduce((sum, file) => sum + file.size, 0);
    
    // اضافه کردن فایل‌های جدید که از حد مجاز کمتر هستند
    const newFiles: File[] = [];
    let errorShown = false;

    Array.from(selectedFiles).forEach(file => {
      // بررسی نوع فایل (فقط تصویر و PDF)
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        if (!errorShown) {
          setError(t('createRequest.validation.fileTypeInvalid') || 'فقط فایل‌های تصویر و PDF مجاز هستند');
          errorShown = true;
        }
        return;
      }

      // بررسی حجم هر فایل
      if (file.size > MAX_FILE_SIZE) {
        if (!errorShown) {
          setError(t('createRequest.validation.fileTooLarge') || 'حجم هر فایل نباید بیشتر از 2 مگابایت باشد');
          errorShown = true;
        }
        return;
      }

      // بررسی حجم کل
      if (currentTotalSize + file.size > MAX_TOTAL_SIZE) {
        if (!errorShown) {
          setError(t('createRequest.validation.totalSizeTooLarge') || 'حجم کل فایل‌ها نباید بیشتر از 8 مگابایت باشد');
          errorShown = true;
        }
        return;
      }

      newFiles.push(file);
    });

    if (newFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setError(null);
    }

    // پاک کردن مقدار input برای امکان انتخاب مجدد همان فایل
    if (generalFileInputRef.current) {
      generalFileInputRef.current.value = '';
    }
  };

  // حذف فایل از لیست فایل‌های عمومی
  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };




  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      setError(t('createRequest.validation.fillRequired') || 'لطفاً تمام فیلدهای الزامی را پر کنید');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {

      // Prepare files array for API
      const apiFiles: File[] = [];
      if (ticketFile) {
        apiFiles.push(ticketFile);
      }
      
      // اضافه کردن فایل‌های عمومی
      if (files.length > 0) {
        apiFiles.push(...files);
      }

      // Prepare API payload (files sent separately via FormData)
      const payload: CreateRequestPayload = {
        model: {
          ...formData,
          // Convert dates to ISO format if needed
          departureDate: new Date(formData.departureDate).toISOString(),
          arrivalDate: new Date(formData.arrivalDate).toISOString(),
          files: [] // Empty array - files are sent separately via FormData
        }
      };

      // Call API
      const response = await apiService.createRequest(payload, apiFiles);

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
      let errorMessage = t('createRequest.error.unknown') || 'خطای نامشخصص';
      
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
      isEnabled: !isLoading,
    }
  });

  // Update MainButton based on form state with debounce for iOS
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateMainButton({
        text: isLoading ? t('createRequest.sending') : success ? t('createRequest.success') : t('createRequest.submit'),
        isEnabled: !isLoading,
        isLoading: isLoading,
        color: success ? '#4CAF50' : '#50b4ff'
      });
    }, 150); // Debounce for iOS

    return () => clearTimeout(timeoutId);
  }, [isLoading, success, updateMainButton, t]);

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
        padding: '80px 20px 0 20px',
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
          <SkeletonLoader type="text" width="80px" height="16px" />
          <SkeletonLoader type="search" height="40px" />
          
          <SkeletonLoader type="text" width="100px" height="16px" />
          <SkeletonLoader type="search" height="40px" />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <SkeletonLoader type="text" width="80px" height="16px" />
              <SkeletonLoader type="search" height="40px" />
            </div>
            <div style={{ flex: 1 }}>
              <SkeletonLoader type="text" width="80px" height="16px" />
              <SkeletonLoader type="search" height="40px" />
            </div>
          </div>
          
          <SkeletonLoader type="text" width="90px" height="16px" />
          <SkeletonLoader type="button" count={2} height="40px" />
          
          <SkeletonLoader type="text" width="70px" height="16px" />
          <SkeletonLoader type="search" height="80px" />
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
      padding: '80px 20px 0 20px',
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
              <label style={{
                ...labelStyle,
                color: hasFieldError('originCityId') ? '#ff4757' : labelStyle.color
              }}>{t('createRequest.originCity')}</label>
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
                onBlur={() => markFieldTouched('originCityId')}
                style={getFieldStyle(inputStyle, 'originCityId')}
                theme={theme}
                isRTL={isRTL}
              />
            </div>

            {/* Destination City */}
            <div style={{ width: '100%' }}>
              <label style={{
                ...labelStyle,
                color: hasFieldError('destinationCityId') ? '#ff4757' : labelStyle.color
              }}>{t('createRequest.destinationCity')}</label>
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
                onBlur={() => markFieldTouched('destinationCityId')}
                style={getFieldStyle(inputStyle, 'destinationCityId')}
                theme={theme}
                isRTL={isRTL}
              />
            </div>
          </div>

          {/* Departure Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              ...labelStyle,
              color: hasFieldError('departureDate') ? '#ff4757' : labelStyle.color
            }}>{t('createRequest.departureDate')}</label>
            <input
              type="datetime-local"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              onBlur={() => markFieldTouched('departureDate')}
              style={getFieldStyle(inputStyle, 'departureDate')}
            />
          </div>

          {/* Arrival Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              ...labelStyle,
              color: hasFieldError('arrivalDate') ? '#ff4757' : labelStyle.color
            }}>{t('createRequest.arrivalDate')}</label>
            <input
              type="datetime-local"
              value={formData.arrivalDate}
              onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
              onBlur={() => markFieldTouched('arrivalDate')}
              style={getFieldStyle(inputStyle, 'arrivalDate')}
            />
          </div>

          {/* Request Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              ...labelStyle,
              color: hasFieldError('requestType') ? '#ff4757' : labelStyle.color
            }}>{t('createRequest.requestType')}</label>
            <select
              value={formData.requestType}
              onChange={(e) => handleInputChange('requestType', parseInt(e.target.value))}
              onBlur={() => markFieldTouched('requestType')}
              style={getFieldStyle(inputStyle, 'requestType')}
            >
              <option value={-1}>{t('createRequest.selectRequestType')}</option>
              {requestTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>




          
          {/* فایل‌های عمومی */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '5px',
              color: '#50b4ff',
              fontSize: '12px',
              fontWeight: '700',
              fontFamily: 'IRANSansX, sans-serif',
              textAlign: isRTL ? 'right' as const : 'left' as const
            }}>{t('createRequest.generalFiles') || 'فایل‌های عمومی'}</label>
            <div style={{
              border: '1px dashed #3a4a5c',
              borderRadius: '5px',
              padding: '15px',
              textAlign: 'center',
              marginBottom: '10px',
              cursor: 'pointer',
              backgroundColor: '#212a33'
            }} onClick={() => generalFileInputRef.current?.click()}>
              <input
                type="file"
                ref={generalFileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,application/pdf"
                multiple
              />
              <div style={{ color: '#50b4ff', marginBottom: '5px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#50b4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V15" stroke="#50b4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', color: '#848d96' }}>
                {t('createRequest.uploadGeneralFiles') || 'آپلود تصاویر و فایل‌های PDF'}
              </div>
              <div style={{ fontSize: '12px', color: '#848d96', marginTop: '5px' }}>
                (حداکثر 2 مگابایت برای هر فایل، مجموع 8 مگابایت)
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
                    backgroundColor: '#212a33',
                    borderRadius: '5px',
                    marginBottom: '8px'
                  }}>
                    {file.type.startsWith('image/') ? (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '6px',
                        overflow: 'hidden'
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
                    <div style={{ flex: 1, marginLeft: '10px', marginRight: '10px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#ffffff',
                        fontFamily: 'IRANSansX, sans-serif',
                        marginBottom: '4px'
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
                      onClick={() => handleRemoveFile(index)}
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
                <div style={{ fontSize: '12px', color: '#848d96', marginTop: '5px', textAlign: 'left' }}>
                  حجم کل: {(files.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(2)} / 8 MB
                </div>
              </div>
            )}
          </div>

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
                color: '#ff9800',
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
                  stroke="#ff9800"
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
                  padding: '80px 20px 0 20px',
                  color: '#848d96',
                  fontSize: '14px'
                }}>
                  {t('loading')}
                </div>
              ) : (
                itemTypes.map(itemType => (
                  <label
                    key={itemType.itemTypeId}
                    onClick={() => handleItemTypeToggle(itemType.itemTypeId)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px',
                      borderRadius: '8px',
                      border: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '2px solid #50b4ff'
                        : '1px solid #3a4a5c',
                      backgroundColor: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '#50b4ff15'
                        : '#212a33',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '0 0 0 1px #50b4ff40'
                        : 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.itemTypeIds.includes(itemType.itemTypeId)}
                      onChange={() => handleItemTypeToggle(itemType.itemTypeId)}
                      style={{
                        marginRight: isRTL ? '0' : '8px',
                        marginLeft: isRTL ? '8px' : '0',
                        width: '18px',
                        height: '18px',
                        accentColor: '#50b4ff',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '#ffffff'
                        : '#848d96',
                      fontFamily: 'IRANSansX, sans-serif',
                      fontWeight: formData.itemTypeIds.includes(itemType.itemTypeId)
                        ? '600'
                        : '400'
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