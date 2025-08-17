import React, { useState, useRef } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';
import Logo from './Logo';
import Settings from './Settings';

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

interface CreateRequestProps {
  onBack?: () => void;
}

const CreateRequest: React.FC<CreateRequestProps> = ({ onBack }) => {
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

  // Mock data for dropdowns
  const cities = [
    { id: 1, name: 'تهران', nameEn: 'Tehran' },
    { id: 2, name: 'اصفهان', nameEn: 'Isfahan' },
    { id: 3, name: 'شیراز', nameEn: 'Shiraz' },
    { id: 4, name: 'مشهد', nameEn: 'Mashhad' },
    { id: 5, name: 'تبریز', nameEn: 'Tabriz' }
  ];

  const requestTypes = [
    { id: 0, name: t('createRequest.passenger'), nameEn: 'Passenger' },
    { id: 1, name: t('createRequest.sender'), nameEn: 'Sender' }
  ];

  const itemTypes = [
    { id: 1, name: 'لوازم الکترونیکی', nameEn: 'Electronics' },
    { id: 2, name: 'پوشاک', nameEn: 'Clothing' },
    { id: 3, name: 'کتاب', nameEn: 'Books' },
    { id: 4, name: 'غذا', nameEn: 'Food' },
    { id: 5, name: 'دارو', nameEn: 'Medicine' }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { model: formData });
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '12px',
    border: '1px solid #3a4a5c',
    backgroundColor: '#212a33',
    color: '#848d96',
    fontSize: '16px',
    fontFamily: 'IRANSansX, sans-serif',
    direction: isRTL ? 'rtl' as const : 'ltr' as const,
    textAlign: isRTL ? 'right' as const : 'left' as const,
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#50b4ff',
    fontSize: '12px',
    fontWeight: '600',
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
        {/* Header with Logo */}
        {/* Settings Component */}
      <Settings activeButton={activeButton} setActiveButton={setActiveButton} />

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <Logo />
        </div>

        <p style={{
          fontSize: '16px',
          margin: '0 auto',
          opacity: 0.8,
          maxWidth: '400px',
          textAlign: 'justify'
        }}>
          {t('createRequest.title')}
        </p>

        {/* Form */}
        <div style={{ padding: '20px' }}>
          <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
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
                <select
                  value={formData.originCityId}
                  onChange={(e) => handleInputChange('originCityId', parseInt(e.target.value))}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={0}>{t('createRequest.selectCity')}</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {isRTL ? city.name : city.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination City */}
              <div style={{ width: '100%' }}>
                <label style={labelStyle}>{t('createRequest.destinationCity')}</label>
                <select
                  value={formData.destinationCityId}
                  onChange={(e) => handleInputChange('destinationCityId', parseInt(e.target.value))}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value={0}>{t('createRequest.selectCity')}</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {isRTL ? city.name : city.nameEn}
                    </option>
                  ))}
                </select>
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
                  borderRadius: '12px',
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
                  fontWeight: '600',
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
                  borderRadius: '12px',
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
                {itemTypes.map(itemType => (
                  <label
                    key={itemType.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      border: '1px solid #3a4a5c',
                      backgroundColor: formData.itemTypeIds.includes(itemType.id)
                        ? '#50b4ff20'
                        : '#212a33',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.itemTypeIds.includes(itemType.id)}
                      onChange={() => handleItemTypeToggle(itemType.id)}
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
                      {isRTL ? itemType.name : itemType.nameEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            {/* Buttons Container */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px'
            }}>
              {/* Back Button */}
              {onBack && (
                <button
                  onClick={onBack}
                  type="button"
                  style={{
                    flex: '0 0 auto',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: 'rgb(119 119 119)',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: 'IRANSansX, sans-serif',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {t('common.back')}
                </button>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                style={{
                  flex: '1',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#50b4ff',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  fontFamily: 'IRANSansX, sans-serif',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease'
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {t('common.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;