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
      minHeight: '90px',
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
         width: '60px',
         height: '60px',
         borderRadius: '50%',
         backgroundColor: 'rgba(255, 255, 255, 0.08)',
         transform: 'translate(20px, -20px)'
       }}></div>
       <div style={{
         position: 'absolute',
         bottom: 0,
         left: 0,
         width: '40px',
         height: '40px',
         borderRadius: '50%',
         backgroundColor: 'rgba(255, 255, 255, 0.06)',
         transform: 'translate(-10px, 10px)'
       }}></div>
      
      {/* Content */}
      <div style={{
        position: 'relative',
        padding: '12px',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            transition: 'transform 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            {icon}
          </div>
          <div style={{
            display: 'flex',
            gap: '3px'
          }}>
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '50%'
            }}></div>
            <div style={{
              width: '4px',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50%'
            }}></div>
          </div>
        </div>
        
        <h3 style={{
          fontSize: '11px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.85)',
          marginBottom: '4px',
          fontFamily: 'IRANSansX, sans-serif',
          textAlign: isRTL ? 'right' : 'left',
          letterSpacing: '0.5px'
        }}>{title}</h3>
        
        <div style={{
          fontSize: '18px',
          fontWeight: '800',
          marginBottom: '2px',
          fontFamily: 'IRANSansX, sans-serif',
          textAlign: isRTL ? 'right' : 'left',
          transition: 'transform 0.3s ease',
          lineHeight: '1.2'
        }}>
          {value}
        </div>
        
        {subtitle && (
          <p style={{
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.75)',
            fontWeight: '600',
            fontFamily: 'IRANSansX, sans-serif',
            textAlign: isRTL ? 'right' : 'left',
            margin: 0,
            letterSpacing: '0.3px'
          }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;