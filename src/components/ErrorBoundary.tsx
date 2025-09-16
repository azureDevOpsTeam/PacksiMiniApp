import React, { Component, type ReactNode } from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // In production, you might want to send this to an error reporting service
    // Example: errorReportingService.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error} 
          resetError={() => this.setState({ hasError: false, error: undefined })}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'fa';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '200px',
      padding: '10px 20px 0 20px',
      backgroundColor: '#1b2026',
      color: '#848d96',
      textAlign: 'center',
      direction: isRTL ? 'rtl' : 'ltr'
    }}>
      <div style={{
        fontSize: '48px',
        marginBottom: '16px',
        color: '#ff4444'
      }}>
        ⚠️
      </div>
      
      <h2 style={{
        color: '#ffffff',
        fontSize: '18px',
        fontFamily: 'IRANSansX, sans-serif',
        fontWeight: '700',
        marginBottom: '12px',
        margin: 0
      }}>
        {t('error.boundary.title') || 'خطای غیرمنتظره'}
      </h2>
      
      <p style={{
        fontSize: '14px',
        fontFamily: 'IRANSansX, sans-serif',
        marginBottom: '20px',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {t('error.boundary.description') || 'متأسفانه خطایی رخ داده است. لطفاً دوباره تلاش کنید.'}
      </p>
      
      {import.meta.env.DEV && error && (
        <details style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#2a2a2a',
          borderRadius: '5px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: '#ff6b6b',
          maxWidth: '100%',
          overflow: 'auto'
        }}>
          <summary style={{ cursor: 'pointer', marginBottom: '10px' }}>
            Error Details (Development Only)
          </summary>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
            {error.name}: {error.message}\n{error.stack}
          </pre>
        </details>
      )}
      
      <button
        onClick={resetError}
        style={{
          padding: '12px 24px',
          backgroundColor: '#50b4ff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontSize: '14px',
          fontFamily: 'IRANSansX, sans-serif',
          fontWeight: '700',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#4a9de8';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#50b4ff';
        }}
      >
        {t('error.boundary.retry') || 'تلاش مجدد'}
      </button>
    </div>
  );
};

export default ErrorBoundary;