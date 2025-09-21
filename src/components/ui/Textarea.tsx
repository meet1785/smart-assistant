import React, { useEffect, useRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
  maxRows?: number;
  minRows?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  autoResize = false,
  maxRows = 10,
  minRows = 3,
  className = '',
  ...props
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      
      const adjustHeight = () => {
        textarea.style.height = 'auto';
        
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
        const minHeight = lineHeight * minRows;
        const maxHeight = lineHeight * maxRows;
        
        const scrollHeight = textarea.scrollHeight;
        const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
        
        textarea.style.height = `${newHeight}px`;
        
        // Show scrollbar if content exceeds maxRows
        textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
      };

      adjustHeight();
      
      const handleInput = () => adjustHeight();
      textarea.addEventListener('input', handleInput);
      
      return () => textarea.removeEventListener('input', handleInput);
    }
  }, [autoResize, maxRows, minRows, props.value]);

  const baseClasses = `
    w-full px-3 py-2 border rounded-lg shadow-sm placeholder-gray-400
    focus:outline-none focus:ring-2 focus:border-transparent transition-colors
    disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
    resize-none
  `;

  const variantClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400';

  const classes = `${baseClasses} ${variantClasses} ${className}`;

  const textareaProps = {
    ...props,
    ref: textareaRef,
    className: classes,
    rows: autoResize ? minRows : (props.rows || 4)
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <textarea {...textareaProps} />
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <div className="flex items-center space-x-1">
              <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Textarea;