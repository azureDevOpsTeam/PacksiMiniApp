import React from 'react';

interface StarRatingProps {
  rating: number; // 1-5 rating, can be decimal like 4.5
  size?: 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'small' }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  // Size configurations
  const sizeConfig = {
    small: { width: '18px', height: '18px', fontSize: '16px' },
    medium: { width: '22px', height: '22px', fontSize: '20px' },
    large: { width: '26px', height: '26px', fontSize: '24px' }
  };

  const currentSize = sizeConfig[size];

  // Create 5 stars
  for (let i = 1; i <= 5; i++) {
    let starType = 'empty';
    
    if (i <= fullStars) {
      starType = 'full';
    } else if (i === fullStars + 1 && hasHalfStar) {
      starType = 'half';
    }

    stars.push(
      <span
        key={i}
        style={{
          display: 'inline-block',
          width: currentSize.width,
          height: currentSize.height,
          fontSize: currentSize.fontSize,
          color: starType === 'empty' ? '#d1d5db' : '#f59e0b',
          position: 'relative',
          marginRight: '0px',
          textShadow: starType !== 'empty' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        {starType === 'half' ? (
          <span style={{ position: 'relative' }}>
            <span style={{ color: '#d1d5db' }}>★</span>
            <span 
              style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                width: '50%', 
                overflow: 'hidden',
                color: '#f59e0b',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              ★
            </span>
          </span>
        ) : (
          '★'
        )}
      </span>
    );
  }

  return (
    <div 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '0px',
        direction: 'ltr'
      }}
      title={`امتیاز: ${rating} از 5`}
    >
      {stars}
    </div>
  );
};

export default StarRating;