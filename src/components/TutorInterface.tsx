import React, { useState, useEffect, useRef } from 'react';
import { GeminiResponse, TutorRequest } from '../types/index';

interface TutorInterfaceProps {
  request: TutorRequest;
  onClose: () => void;
}

export const TutorInterface: React.FC<TutorInterfaceProps> = ({ request, onClose }) => {
  const [responses, setResponses] = useState<GeminiResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    handleGetInitialResponse();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGetInitialResponse = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: request
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        setResponses([response]);
      }
    } catch (err) {
      setError('Failed to connect to the AI tutor. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim() || isLoading) return;

    const userQuestion = currentQuestion.trim();
    setCurrentQuestion('');
    setIsLoading(true);
    setError('');

    // Add user question to conversation
    const userResponse: GeminiResponse = {
      type: 'question',
      content: `You: ${userQuestion}`
    };
    setResponses(prev => [...prev, userResponse]);

    try {
      const updatedRequest: TutorRequest = {
        ...request,
        userQuery: userQuestion,
        previousInteraction: responses[responses.length - 1]?.content
      };

      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: updatedRequest
      });

      if (response.type === 'error') {
        setError(response.content);
      } else {
        setResponses(prev => [...prev, response]);
      }
    } catch (err) {
      setError('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  const getResponseIcon = (type: GeminiResponse['type']) => {
    switch (type) {
      case 'question': return '❓';
      case 'hint': return '💡';
      case 'followup': return '🔍';
      case 'encouragement': return '🌟';
      case 'error': return '⚠️';
      default: return '🤖';
    }
  };

  const getContextTitle = () => {
    if (request.type === 'leetcode') {
      const context = request.context as any;
      return `LeetCode: ${context.title}`;
    } else {
      const context = request.context as any;
      return `YouTube: ${context.title}`;
    }
  };

  return (
    <div className="learnai-tutor-interface">
      <div className="learnai-header">
        <h3>🎓 LearnAI Socratic Tutor</h3>
        <button className="learnai-close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="learnai-context">
        <div className="learnai-context-title">{getContextTitle()}</div>
      </div>

      <div className="learnai-conversation">
        {responses.map((response, index) => (
          <div key={index} className={`learnai-message ${response.content.startsWith('You:') ? 'user' : 'ai'}`}>
            {!response.content.startsWith('You:') && (
              <div className="learnai-message-icon">
                {getResponseIcon(response.type)}
              </div>
            )}
            <div className="learnai-message-content">
              <div className="learnai-message-text">
                {response.content.replace(/^You: /, '')}
              </div>
              {response.nextSteps && response.nextSteps.length > 0 && (
                <div className="learnai-next-steps">
                  <strong>Next steps to consider:</strong>
                  <ul>
                    {response.nextSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="learnai-message ai">
            <div className="learnai-message-icon">🤔</div>
            <div className="learnai-message-content">
              <div className="learnai-loading">Thinking...</div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="learnai-error">
          {error}
        </div>
      )}

      <div className="learnai-input-area">
        <textarea
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question or describe what you're thinking..."
          className="learnai-input"
          rows={2}
          disabled={isLoading}
        />
        <button 
          onClick={handleAskQuestion}
          disabled={isLoading || !currentQuestion.trim()}
          className="learnai-send-btn"
        >
          Send
        </button>
      </div>
    </div>
  );
};