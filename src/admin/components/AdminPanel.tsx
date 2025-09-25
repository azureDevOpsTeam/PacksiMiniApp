import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface AdminPanelProps {
  onNavigate?: (page: 'dashboard' | 'usermanagement' | 'advertisements') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'center',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '0',
      textAlign: 'center'
    }}>
      <div style={{
        width: '100%'
      }}>
        <h3 style={{
          color: '#50b4ff',
          fontSize: '12px',
          fontFamily: 'IRANSansX, sans-serif',
          margin: '0 0 20px 0',
          fontWeight: '700',
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          {isRTL ? 'پنل مدیریت' : 'Admin Panel'}
        </h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1px',
          backgroundColor: '#212a33',
          borderRadius: '8px',
          padding: '20px',
          border: '1px solid #3a4a5c',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {/* User Management Link */}
          <button 
            onClick={() => onNavigate?.('usermanagement')}
            style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: isRTL ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isRTL ? '0' : '12px',
              marginLeft: isRTL ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {isRTL ? 'مدیریت کاربران' : 'User Management'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'مشاهده و مدیریت کاربران' : 'View and manage users'}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Advertisement Link */}
          <button 
            onClick={() => onNavigate?.('advertisements')}
            style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: isRTL ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isRTL ? '0' : '12px',
              marginLeft: isRTL ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M7 8H17M7 12H17M7 16H17M3 5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5Z" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {isRTL ? 'تبلیغات' : 'Advertisement'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'مشاهده و مدیریت تبلیغات' : 'View and manage advertisements'}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Reports Link */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: isRTL ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isRTL ? '0' : '12px',
              marginLeft: isRTL ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M9 17H7C6.73478 17 6.48043 16.8946 6.29289 16.7071C6.10536 16.5196 6 16.2652 6 16V5C6 4.73478 6.10536 4.48043 6.29289 4.29289C6.48043 4.10536 6.73478 4 7 4H17C17.2652 4 17.5196 4.10536 17.7071 4.29289C17.8946 4.48043 18 4.73478 18 5V16C18 16.2652 17.8946 16.5196 17.7071 16.7071C17.5196 16.8946 17.2652 17 17 17H15M9 17V20C9 20.2652 9.10536 20.5196 9.29289 20.7071C9.48043 20.8946 9.73478 21 10 21H14C14.2652 21 14.5196 20.8946 14.7071 20.7071C14.8946 20.5196 15 20.2652 15 20V17M9 17H15M9 7H15M9 11H15" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {isRTL ? 'گزارشات' : 'Reports'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'مشاهده گزارشات سیستم' : 'View system reports'}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Send Ticker Link */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: isRTL ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isRTL ? '0' : '12px',
              marginLeft: isRTL ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 19L19 12L12 5M19 12H5" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {isRTL ? 'ارسال تیکت' : 'Send Ticker'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'ارسال تیکت جدید' : 'Send new ticker'}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Sended Parcel Link */}
          <button style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#212a33',
            borderRadius: '0 0 8px 8px',
            cursor: 'pointer',
            border: 'none',
            width: '100%',
            direction: isRTL ? 'rtl' : 'ltr'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: isRTL ? '0' : '12px',
              marginLeft: isRTL ? '12px' : '0'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M16 16L12 12M12 12L8 8M12 12L16 8M12 12L8 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#4f9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ flex: 1, textAlign: isRTL ? 'right' : 'left' }}>
              <div style={{
                color: '#ffffff',
                fontSize: '14px',
                fontFamily: 'IRANSansX, sans-serif',
                fontWeight: '400',
                marginBottom: '2px'
              }}>
                {isRTL ? 'بسته‌های ارسالی' : 'Sended Parcel'}
              </div>
              <div style={{
                color: '#848d96',
                fontSize: '12px',
                fontFamily: 'IRANSansX, sans-serif'
              }}>
                {isRTL ? 'مشاهده بسته‌های ارسال شده' : 'View sent parcels'}
              </div>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#848d96', transform: isRTL ? 'rotate(180deg)' : 'none' }}>
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;