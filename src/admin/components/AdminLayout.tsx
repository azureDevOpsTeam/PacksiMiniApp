import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '400px',
      margin: '0 auto',
      padding: '0',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      {title && (
        <div style={{
          width: '100%',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: '#50b4ff',
            fontSize: '12px',
            fontFamily: 'IRANSansX, sans-serif',
            margin: '0',
            fontWeight: '700',
            textAlign: isRTL ? 'right' : 'left'
          }}>
            {title}
          </h3>
        </div>
      )}
        {children}
    </div>
  );
};

export default AdminLayout;