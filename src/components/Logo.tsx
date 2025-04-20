
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true }) => {
  const logoSize = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${logoSize[size]} relative`}>
        <div className="absolute inset-0 bg-food-orange rounded-full animate-pulse-scale opacity-75"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-2/3 h-2/3" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M8.5 14.25C8.5 14.25 9.75 12 12 12C14.25 12 15.5 14.25 15.5 14.25M9 9H9.01M15 9H15.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {showText && (
        <span className={`font-heading font-bold ${textSize[size]} text-food-orange`}>
          Foodies
        </span>
      )}
    </div>
  );
};

export default Logo;
