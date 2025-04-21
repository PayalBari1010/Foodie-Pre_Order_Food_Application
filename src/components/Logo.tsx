
import React from 'react';
import { MapPin } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

// Update Logo to Nashik branding: Pin icon & "Foodies Nashik"
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
      <div className={`${logoSize[size]} flex items-center justify-center bg-food-orange rounded-full`}>
        <MapPin size={size === "sm" ? 24 : size === "lg" ? 40 : 32} color="white" />
      </div>
      {showText && (
        <span className={`font-heading font-bold ${textSize[size]} text-food-orange`}>
          Foodies Nashik
        </span>
      )}
    </div>
  );
};

export default Logo;

