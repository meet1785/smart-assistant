import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  disabled?: boolean;
  delay?: number;
  className?: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'top',
  trigger = 'hover',
  disabled = false,
  delay = 300,
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<any>();

  const showTooltip = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      calculatePosition();
    }, trigger === 'hover' ? delay : 0);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const toggleTooltip = () => {
    if (disabled) return;
    
    if (trigger === 'click') {
      setIsVisible(!isVisible);
      if (!isVisible) {
        calculatePosition();
      }
    }
  };

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const trigger = triggerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    let newPosition = position;
    
    // Check if tooltip would overflow and adjust position
    switch (position) {
      case 'top':
        if (trigger.top - tooltip.height < 0) {
          newPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (trigger.bottom + tooltip.height > viewport.height) {
          newPosition = 'top';
        }
        break;
      case 'left':
        if (trigger.left - tooltip.width < 0) {
          newPosition = 'right';
        }
        break;
      case 'right':
        if (trigger.right + tooltip.width > viewport.width) {
          newPosition = 'left';
        }
        break;
    }
    
    setActualPosition(newPosition);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trigger === 'click' && 
          triggerRef.current && 
          !triggerRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isVisible, trigger]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg
      pointer-events-none transform transition-all duration-200 ease-in-out
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `;

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    return `${baseClasses} ${positionClasses[actualPosition]}`;
  };

  const getArrowClasses = () => {
    const baseClasses = 'absolute w-2 h-2 bg-gray-900 transform rotate-45';
    
    const arrowPositions = {
      top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2',
      left: 'left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2',
      right: 'right-full top-1/2 transform translate-x-1/2 -translate-y-1/2'
    };

    return `${baseClasses} ${arrowPositions[actualPosition]}`;
  };

  const triggerProps = trigger === 'hover' ? {
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip
  } : {
    onClick: toggleTooltip
  };

  return (
    <div 
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      {...triggerProps}
    >
      {children}
      
      {!disabled && (
        <div
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{ 
            visibility: isVisible ? 'visible' : 'hidden',
            pointerEvents: 'none'
          }}
        >
          {content}
          <div className={getArrowClasses()} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;