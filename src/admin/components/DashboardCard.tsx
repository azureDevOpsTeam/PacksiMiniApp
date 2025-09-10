import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: string;
  subtitle?: string;
  gradient?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  icon = '📊', 
  subtitle, 
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'fa';

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '16px',
      background: gradient,
      minHeight: '120px',
      direction: isRTL ? 'rtl' : 'ltr',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.25)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '128px',
        height: '128px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'translate(32px, -32px)'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '96px',
        height: '96px',
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        transform: 'translate(-16px, 16px)'
      }}></div>
      
      {/* Content */}
      <div style={{
        position: 'relative',
        padding: '16px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'transform 0.3s ease'
          }}>
            {icon}
          </div>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '50%',
              marginBottom: '4px'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              marginBottom: '4px'
            }}></div>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%'
            }}></div>
          </div>
        </div>
        
        <h3 style={{
          fontSize: '14px',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '8px',
          fontFamily: 'IRANSansX, sans-serif',
          textAlign: isRTL ? 'right' : 'left'
        }}>{title}</h3>
        
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '4px',
          fontFamily: 'IRANSansX, sans-serif',
          textAlign: isRTL ? 'right' : 'left',
          transition: 'transform 0.3s ease'
        }}>
          {value}
        </div>
        
        {subtitle && (
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontWeight: '500',
            fontFamily: 'IRANSansX, sans-serif',
            textAlign: isRTL ? 'right' : 'left',
            margin: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;