import React, { useState, useRef, useEffect } from 'react';
import { GeminiResponse } from '../../types';
import { Button, Input } from '../ui';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  metadata?: {
    responseType?: GeminiResponse['type'];
    nextSteps?: string[];
    context?: string;
  };
}

export interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  showSuggestions?: boolean;
  suggestions?: string[];
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Ask a question or share your thoughts...",
  showSuggestions = true,
  suggestions = [],
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!isLoading) {
      onSendMessage(suggestion);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-2">🤖</div>
              <p>Start a conversation with your AI tutor!</p>
              <p className="text-sm mt-1">Ask questions, share your code, or request hints.</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
              />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Quick suggestions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            loading={isLoading}
            className="px-6"
          >
            Send
          </Button>
        </form>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;