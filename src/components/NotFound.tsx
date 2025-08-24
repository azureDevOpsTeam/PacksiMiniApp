import React from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../hooks/useTheme';

interface NotFoundProps {
  onRetry?: () => void;
}

const NotFound: React.FC<NotFoundProps> = ({ onRetry }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '80px 20px 0 20px',
        backgroundColor: theme.colors.background,
        color: theme.colors.text.primary,
        textAlign: 'center'
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 'bold',
          color: theme.colors.error,
          marginBottom: '20px'
        }}
      >
        404
      </div>
      
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: theme.colors.text.primary
        }}
      >
        {t('notFound.title') || 'صفحه یافت نشد'}
      </h1>
      
      <p
        style={{
          fontSize: '16px',
          marginBottom: '32px',
          color: theme.colors.text.secondary,
          maxWidth: '400px',
          lineHeight: '1.5'
        }}
      >
        {t('notFound.description') || 'امضای دیجیتال نامعتبر است. لطفاً دوباره تلاش کنید.'}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            backgroundColor: theme.colors.primary,
            color: theme.colors.text.primary,
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '120px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {t('notFound.retry') || 'تلاش مجدد'}
        </button>
      )}
    </div>
  );
};

export default NotFound;