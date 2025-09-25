import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import AdminLayout from './AdminLayout';
import { apiService } from '../../services/apiService';
import type { Advertisement, GetAdsResponse } from '../../types/api';

const AdvertisementManagement: React.FC = () => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';

  const [ads, setAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch ads data
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: GetAdsResponse = await apiService.getAds();
        
        if (response?.requestStatus?.value === 0 && response.objectResult) {
          setAds(response.objectResult);
        } else {
          setError(isRTL ? 'خطا در دریافت اطلاعات تبلیغات' : 'Failed to fetch advertisements data');
        }
      } catch (err) {
        console.error('Error fetching ads:', err);
        setError(isRTL ? 'خطا در ارتباط با سرور' : 'Server connection error');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, [isRTL]);

  // Filter ads based on search term
  const filteredAds = ads.filter(ad =>
    ad.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.statusFa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.postTypeFa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ad.id.toString().includes(searchTerm)
  );

  // Statistics
  const totalAds = ads.length;
  const createdAds = ads.filter(ad => ad.statusEn === 'Created').length;
  const rejectedAds = ads.filter(ad => ad.statusEn === 'Rejected').length;

  // Get ad status color
  const getAdStatusColor = (ad: Advertisement): string => {
    switch (ad.statusEn) {
      case 'Created':
        return '#10b981'; // Green - Created
      case 'Rejected':
        return '#ef4444'; // Red - Rejected
      case 'Approved':
        return '#3b82f6'; // Blue - Approved
      case 'Pending':
        return '#f59e0b'; // Orange - Pending
      default:
        return '#6b7280'; // Gray - Unknown
    }
  };

  // Get post type icon
  const getPostTypeIcon = (postType: string): string => {
    switch (postType) {
      case 'Text':
        return '📝';
      case 'Image':
        return '🖼️';
      case 'Video':
        return '🎥';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#ffffff'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
            <div>{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          color: '#ef4444'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
            <div>{error}</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        direction: isRTL ? 'rtl' : 'ltr'
      }}>
        <div style={{
          textAlign: isRTL ? 'right' : 'left'
        }}>
          <h2 style={{
            color: '#ffffff',
            fontSize: '18px',
            fontFamily: 'IRANSansX, sans-serif',
            margin: '0 0 8px 0',
            fontWeight: '600'
          }}>
            {isRTL ? 'مدیریت تبلیغات' : 'Advertisement Management'}
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '12px',
            fontFamily: 'IRANSansX, sans-serif',
            margin: '0'
          }}>
            {isRTL ? 'مشاهده و مدیریت تبلیغات سیستم' : 'View and manage system advertisements'}
          </p>
        </div>
        
        {/* Registration Link */}
        <button
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '12px',
            fontFamily: 'IRANSansX, sans-serif',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.3)';
          }}
          onClick={() => {
            // TODO: Navigate to advertisement registration page
            alert(isRTL ? 'صفحه ثبت تبلیغات به زودی اضافه خواهد شد' : 'Advertisement registration page will be added soon');
          }}
        >
          <span style={{ fontSize: '14px' }}>➕</span>
          {isRTL ? 'ثبت تبلیغات' : 'Register Ad'}
        </button>
      </div>

      {/* Statistics Cards - Compact */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {totalAds}
          </div>
          <div style={{ color: '#dbeafe', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? 'کل تبلیغات' : 'Total Ads'}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {createdAds}
          </div>
          <div style={{ color: '#d1fae5', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? 'ثبت شده' : 'Created'}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          borderRadius: '8px',
          padding: '12px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
            {rejectedAds}
          </div>
          <div style={{ color: '#fecaca', fontSize: '10px', marginTop: '2px' }}>
            {isRTL ? 'رد شده' : 'Rejected'}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        marginBottom: '16px',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder={isRTL ? 'جستجو در تبلیغات...' : 'Search advertisements...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            backgroundColor: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontFamily: 'IRANSansX, sans-serif',
            direction: isRTL ? 'rtl' : 'ltr',
            textAlign: isRTL ? 'right' : 'left'
          }}
        />
      </div>

      {/* Advertisements List - Compact Table Style */}
      <div style={{
        backgroundColor: '#1f2937',
        borderRadius: '8px',
        border: '1px solid #374151',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 90px 80px',
          gap: '8px',
          padding: '12px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #374151',
          fontSize: '11px',
          fontWeight: '600',
          color: '#9ca3af',
          textTransform: 'uppercase',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'عنوان' : 'Title'}</div>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'وضعیت' : 'Status'}</div>
          <div style={{ textAlign: isRTL ? 'right' : 'left' }}>{isRTL ? 'نوع پست' : 'Post Type'}</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {filteredAds.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📭</div>
              <div style={{ fontSize: '14px' }}>
                {searchTerm 
                  ? (isRTL ? 'تبلیغی یافت نشد' : 'No advertisements found')
                  : (isRTL ? 'هنوز تبلیغی ثبت نشده' : 'No advertisements created yet')
                }
              </div>
            </div>
          ) : (
            filteredAds.map((ad, index) => (
              <div
                  key={ad.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 90px 80px',
                    gap: '8px',
                    padding: '12px',
                    borderBottom: index < filteredAds.length - 1 ? '1px solid #374151' : 'none',
                    backgroundColor: index % 2 === 0 ? '#1f2937' : '#111827',
                    transition: 'background-color 0.2s ease',
                    cursor: 'pointer',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.backgroundColor = '#374151';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#1f2937' : '#111827';
                 }}
               >
                 {/* Title with PostType Icon */}
                  <div style={{
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${getAdStatusColor(ad)} 0%, ${getAdStatusColor(ad)}80 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {getPostTypeIcon(ad.postTypeEn)}
                    </div>
                    <span style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {ad.title || (isRTL ? 'بدون عنوان' : 'No Title')}
                    </span>
                  </div>

                {/* Status */}
                <div style={{
                  color: getAdStatusColor(ad),
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: '500'
                }}>
                  {ad.statusFa || ad.statusEn}
                </div>

                {/* Post Type */}
                <div style={{
                  color: '#9ca3af',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {ad.postTypeFa || ad.postTypeEn}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Info */}
      {filteredAds.length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: '#111827',
          borderRadius: '6px',
          fontSize: '11px',
          color: '#6b7280',
          textAlign: 'center',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          {isRTL 
            ? `نمایش ${filteredAds.length} از ${totalAds} تبلیغ`
            : `Showing ${filteredAds.length} of ${totalAds} advertisements`
          }
        </div>
      )}
    </AdminLayout>
  );
};

export default AdvertisementManagement;