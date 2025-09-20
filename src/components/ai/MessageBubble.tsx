import React from 'react';
import { ChatMessage } from './ChatInterface';
import { Badge } from '../ui';

export interface MessageBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  className?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showTimestamp = true,
  className = ''
}) => {
  const isUser = message.type === 'user';
  const isAI = message.type === 'ai';
  
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getResponseTypeColor = (type?: string) => {
    switch (type) {
      case 'question': return 'info';
      case 'hint': return 'warning';
      case 'encouragement': return 'success';
      case 'error': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${className}`}>
      <div className={`max-w-[70%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-900 border border-gray-200'
          }`}
        >
          {/* AI Response Type Badge */}
          {isAI && message.metadata?.responseType && (
            <div className="mb-2">
              <Badge 
                variant={getResponseTypeColor(message.metadata.responseType)}
                size="sm"
              >
                {message.metadata.responseType}
              </Badge>
            </div>
          )}
          
          {/* Message Content */}
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
          
          {/* Context Information */}
          {isAI && message.metadata?.context && (
            <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
              <strong>Context:</strong> {message.metadata.context}
            </div>
          )}
          
          {/* Next Steps */}
          {isAI && message.metadata?.nextSteps && message.metadata.nextSteps.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="text-xs font-medium text-gray-600 mb-1">
                Next steps to consider:
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                {message.metadata.nextSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        {showTimestamp && (
          <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formatTimestamp(message.timestamp)}
          </div>
        )}
      </div>
      
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-200 text-gray-600'
        }`}>
          {isUser ? '👤' : '🤖'}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;