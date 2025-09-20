import React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallbackIcon?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  fallbackIcon,
  className = '', 
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  };
  
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-gray-100 overflow-hidden ${sizeClasses[size]}`;
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const renderFallback = () => {
    if (name) {
      return (
        <span className="font-medium text-gray-600">
          {getInitials(name)}
        </span>
      );
    }
    
    if (fallbackIcon) {
      return fallbackIcon;
    }
    
    // Default user icon
    return (
      <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };
  
  return (
    <div className={`${baseClasses} ${className}`} {...props}>
      {src ? (
        <img 
          src={src} 
          alt={alt || name || 'Avatar'} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        renderFallback()
      )}
    </div>
  );
};

export default Avatar;