import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

const EmptyChatPage: React.FC = () => {
  const { isRTL } = useLanguage();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#17212b',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'IRANSansX, sans-serif',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <div style={{
        textAlign: 'center',
        color: '#848d96'
      }}>
        <h1 style={{
          fontSize: '24px',
          marginBottom: '10px',
          color: '#ffffff'
        }}>
          {isRTL ? 'صفحه چت' : 'Chat Page'}
        </h1>
        <p style={{
          fontSize: '16px',
          margin: 0
        }}>
          {isRTL ? 'این صفحه خالی است' : 'This page is empty'}
        </p>
      </div>
    </div>
  );
};

export default EmptyChatPage;