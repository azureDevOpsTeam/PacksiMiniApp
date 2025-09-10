import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

const AdminPanel: React.FC = () => {
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
            textAlign: 'center',
            flexDirection: 'column'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              🚧
            </div>
            
            <div style={{
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'IRANSansX, sans-serif',
              fontWeight: '400',
              marginBottom: '8px'
            }}>
              {isRTL 
                ? 'این بخش در حال توسعه است'
                : 'This section is under development'
              }
            </div>
            
            <div style={{
              color: '#848d96',
              fontSize: '12px',
              fontFamily: 'IRANSansX, sans-serif'
            }}>
              {isRTL 
                ? 'به زودی امکانات مدیریتی در اینجا قرار خواهد گرفت'
                : 'Administrative features will be available here soon'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;