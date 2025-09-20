import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
  className?: string;
  onChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  size = 'md',
  label,
  description,
  className = '',
  onChange
}) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const sizeClasses = {
    sm: {
      track: 'h-4 w-7',
      thumb: 'h-3 w-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5'
    },
    md: {
      track: 'h-6 w-11',
      thumb: 'h-5 w-5',
      translate: checked ? 'translate-x-5' : 'translate-x-0.5'
    },
    lg: {
      track: 'h-7 w-14',
      thumb: 'h-6 w-6',
      translate: checked ? 'translate-x-7' : 'translate-x-0.5'
    }
  };

  const sizes = sizeClasses[size];

  const trackClasses = `
    ${sizes.track} relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
    ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    ${checked 
      ? (disabled ? 'bg-blue-300' : 'bg-blue-600') 
      : (disabled ? 'bg-gray-200' : 'bg-gray-300 hover:bg-gray-400')
    }
  `;

  const thumbClasses = `
    ${sizes.thumb} ${sizes.translate} inline-block rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out
  `;

  const switchElement = (
    <button
      type="button"
      className={trackClasses}
      onClick={handleToggle}
      disabled={disabled}
      aria-checked={checked}
      role="switch"
      aria-label={label}
    >
      <span className={thumbClasses} />
    </button>
  );

  if (label || description) {
    return (
      <div className={`flex items-start space-x-3 ${className}`}>
        <div className="flex-shrink-0 pt-0.5">
          {switchElement}
        </div>
        <div className="flex-1">
          {label && (
            <label className={`block text-sm font-medium text-gray-900 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
              {label}
            </label>
          )}
          {description && (
            <p className={`text-sm text-gray-500 ${disabled ? 'opacity-50' : ''}`}>
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <div className={className}>{switchElement}</div>;
};

export default Switch;