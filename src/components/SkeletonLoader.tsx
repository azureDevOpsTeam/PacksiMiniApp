import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface SkeletonLoaderProps {
  type?: 'button' | 'card' | 'text' | 'search' | 'profile';
  count?: number;
  height?: string;
  width?: string;
  borderRadius?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  height = '60px',
  width = '100%',
  borderRadius = '8px'
}) => {
  const { language } = useLanguage();

  const skeletonStyle: React.CSSProperties = {
    backgroundColor: '#212a33',
    borderRadius,
    width,
    height,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: type === 'button' ? '1px' : '12px'
  };

  const shimmerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: language === 'fa' ? 'auto' : '-100%',
    right: language === 'fa' ? '-100%' : 'auto',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    animation: language === 'fa' ? 'shimmerRTL 1.5s infinite' : 'shimmerLTR 1.5s infinite'
  };

  const renderSkeleton = () => {
    switch (type) {
      case 'button':
        return (
          <div style={{
            ...skeletonStyle,
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            padding: '12px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#2a3441',
              marginRight: language === 'fa' ? '0' : '12px',
              marginLeft: language === 'fa' ? '12px' : '0'
            }} />
            <div style={{
              flex: 1,
              height: '16px',
              backgroundColor: '#2a3441',
              borderRadius: '4px'
            }} />
            <div style={shimmerStyle} />
          </div>
        );

      case 'search':
        return (
          <div style={{
            ...skeletonStyle,
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
            backgroundColor: '#1a2128'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#2a3441',
              borderRadius: '2px',
              marginRight: language === 'fa' ? '0' : '8px',
              marginLeft: language === 'fa' ? '8px' : '0'
            }} />
            <div style={{
              flex: 1,
              height: '14px',
              backgroundColor: '#2a3441',
              borderRadius: '4px'
            }} />
            <div style={shimmerStyle} />
          </div>
        );

      case 'text':
        return (
          <div style={{
            ...skeletonStyle,
            height: '20px',
            backgroundColor: '#2a3441'
          }}>
            <div style={shimmerStyle} />
          </div>
        );

      case 'profile':
        return (
          <div style={{
            ...skeletonStyle,
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            padding: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#2a3441',
              marginRight: language === 'fa' ? '0' : '16px',
              marginLeft: language === 'fa' ? '16px' : '0'
            }} />
            <div style={{ flex: 1 }}>
              <div style={{
                height: '16px',
                backgroundColor: '#2a3441',
                borderRadius: '4px',
                marginBottom: '8px',
                width: '60%'
              }} />
              <div style={{
                height: '14px',
                backgroundColor: '#2a3441',
                borderRadius: '4px',
                width: '40%'
              }} />
            </div>
            <div style={shimmerStyle} />
          </div>
        );

      default: // card
        return (
          <div style={skeletonStyle}>
            <div style={shimmerStyle} />
          </div>
        );
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmerLTR {
            0% { left: -100%; }
            100% { left: 100%; }
          }
          @keyframes shimmerRTL {
            0% { right: -100%; }
            100% { right: 100%; }
          }
        `}
      </style>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </>
  );
};

export default SkeletonLoader;