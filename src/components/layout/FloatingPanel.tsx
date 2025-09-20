import React, { useState, useRef, useEffect } from 'react';

export interface FloatingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  draggable?: boolean;
  resizable?: boolean;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  maxSize?: { width: number; height: number };
  className?: string;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  draggable = true,
  resizable = true,
  defaultPosition = { x: 50, y: 50 },
  defaultSize = { width: 400, height: 500 },
  minSize = { width: 300, height: 200 },
  maxSize = { width: 800, height: 800 },
  className = ''
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - size.width, newX)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, newY))
        });
      }
      
      if (isResizing) {
        const newWidth = Math.min(
          maxSize.width,
          Math.max(minSize.width, resizeStart.width + (e.clientX - resizeStart.x))
        );
        const newHeight = Math.min(
          maxSize.height,
          Math.max(minSize.height, resizeStart.height + (e.clientY - resizeStart.y))
        );
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, size, minSize, maxSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!draggable) return;
    
    const rect = panelRef.current?.getBoundingClientRect();
    if (rect) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={panelRef}
        className={`absolute bg-white rounded-lg shadow-xl border border-gray-200 pointer-events-auto ${className}`}
        style={{
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          minWidth: minSize.width,
          minHeight: minSize.height,
          maxWidth: maxSize.width,
          maxHeight: maxSize.height
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-200 rounded-t-lg ${
            draggable ? 'cursor-move' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 select-none">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4" style={{ height: size.height - 80 }}>
          {children}
        </div>

        {/* Resize handle */}
        {resizable && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
            onMouseDown={handleResizeMouseDown}
          >
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21l10-10M21 7l-10 10"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingPanel;