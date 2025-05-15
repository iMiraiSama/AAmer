import React, { useState } from 'react';

const Rating = ({ 
  initialRating = 0, 
  maxRating = 5, 
  readOnly = false, 
  onRatingChange = () => {}, 
  size = 'medium',
  showLabel = true
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readOnly) {
      setRating(value);
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const getStarSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '16px', gap: '2px' };
      case 'large':
        return { fontSize: '32px', gap: '8px' };
      default: // medium
        return { fontSize: '24px', gap: '4px' };
    }
  };

  const starSize = getStarSize();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div 
        style={{ 
          display: 'flex', 
          gap: starSize.gap,
          cursor: readOnly ? 'default' : 'pointer'
        }}
      >
        {[...Array(maxRating)].map((_, index) => {
          const value = index + 1;
          const isFilled = value <= (hoverRating || rating);
          
          return (
            <span
              key={index}
              style={{ 
                fontSize: starSize.fontSize,
                color: isFilled ? '#FFD700' : '#E0E0E0',
                transition: 'color 0.2s'
              }}
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
            >
              ★
            </span>
          );
        })}
      </div>
      {showLabel && (
        <span style={{ 
          fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
          color: '#666',
          marginLeft: '8px'
        }}>
          {rating} {rating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
};

export default Rating; 