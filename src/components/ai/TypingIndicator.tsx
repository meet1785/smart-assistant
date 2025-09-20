import React from 'react';

export interface TypingIndicatorProps {
  className?: string;
  text?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
  text = 'AI is thinking...'
}) => {
  return (
    <div className={`flex justify-start ${className}`}>
      <div className="flex-shrink-0 mr-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-medium">
          🤖
        </div>
      </div>
      <div className="bg-gray-100 text-gray-900 border border-gray-200 rounded-lg px-4 py-2 max-w-[70%]">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">{text}</span>
          <div className="flex space-x-1 ml-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;