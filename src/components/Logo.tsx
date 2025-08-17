import React from 'react';
import logo from '../assets/images/logo.png';

interface LogoProps {
  className?: string;
  style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className, style }) => {
  const defaultStyle: React.CSSProperties = {
    width: '150px',
    borderRadius: '12px',
    display: 'block',
    ...style
  };

  return (
    <img
      src={logo}
      alt="Packsi Logo"
      className={className}
      style={defaultStyle}
    />
  );
};

export default Logo;