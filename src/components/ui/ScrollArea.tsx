import React, { useRef, useEffect, useState } from 'react';

export interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  maxHeight?: string | number;
  horizontal?: boolean;
  vertical?: boolean;
  showScrollbars?: 'always' | 'hover' | 'never';
  fadeEdges?: boolean;
}

export const ScrollArea: React.FC<ScrollAreaProps> = ({
  children,
  className = '',
  maxHeight = '300px',
  horizontal = false,
  vertical = true,
  showScrollbars = 'hover',
  fadeEdges = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  const scrollTimeout = useRef<any>();

  const updateFadeStates = () => {
    if (!fadeEdges || !containerRef.current) return;

    const element = containerRef.current;
    const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = element;

    setShowTopFade(scrollTop > 0);
    setShowBottomFade(scrollTop < scrollHeight - clientHeight - 1);
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
  };

  const handleScroll = () => {
    setIsScrolling(true);
    updateFadeStates();

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  useEffect(() => {
    updateFadeStates();
  }, [children, fadeEdges]);

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  const getScrollbarStyles = () => {
    const baseStyles = {
      scrollbarWidth: 'thin' as const,
      scrollbarColor: '#CBD5E0 transparent'
    };

    if (showScrollbars === 'never') {
      return {
        ...baseStyles,
        scrollbarWidth: 'none' as const,
        msOverflowStyle: 'none' as const,
        WebkitScrollbar: { display: 'none' }
      };
    }

    if (showScrollbars === 'hover') {
      return {
        ...baseStyles,
        '&:hover': {
          scrollbarColor: '#9CA3AF transparent'
        }
      };
    }

    return baseStyles;
  };

  const overflowX = horizontal ? 'auto' : 'hidden';
  const overflowY = vertical ? 'auto' : 'hidden';

  const containerStyles: React.CSSProperties = {
    maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
    overflowX: overflowX as any,
    overflowY: overflowY as any,
    scrollbarWidth: 'thin' as any,
    scrollbarColor: '#CBD5E0 transparent'
  };

  const fadeOverlayClasses = 'absolute inset-x-0 h-6 pointer-events-none z-10 transition-opacity duration-200';

  return (
    <div className={`relative ${className}`}>
      {/* Fade overlays */}
      {fadeEdges && (
        <>
          {/* Top fade */}
          <div
            className={`${fadeOverlayClasses} top-0 bg-gradient-to-b from-white to-transparent ${
              showTopFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Bottom fade */}
          <div
            className={`${fadeOverlayClasses} bottom-0 bg-gradient-to-t from-white to-transparent ${
              showBottomFade ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Left fade */}
          {horizontal && (
            <div
              className={`absolute inset-y-0 left-0 w-6 pointer-events-none z-10 transition-opacity duration-200 bg-gradient-to-r from-white to-transparent ${
                showLeftFade ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
          
          {/* Right fade */}
          {horizontal && (
            <div
              className={`absolute inset-y-0 right-0 w-6 pointer-events-none z-10 transition-opacity duration-200 bg-gradient-to-l from-white to-transparent ${
                showRightFade ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}
        </>
      )}

      {/* Scrollable content */}
      <div
        ref={containerRef}
        className={`
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400
          ${showScrollbars === 'never' ? 'scrollbar-none' : ''}
          ${isScrolling ? 'scrollbar-thumb-gray-400' : ''}
        `}
        style={containerStyles}
        onScroll={handleScroll}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollArea;