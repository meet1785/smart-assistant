import React, { useState, useEffect, useRef } from 'react';
import { GeminiResponse, TutorRequest, Achievement, Quiz, VideoSection } from '../types/index';
import EnhancedStudyDashboard from './EnhancedStudyDashboard';
import SmartNotesComponent from './SmartNotesComponent';
import CodeAnalyzerComponent from './CodeAnalyzerComponent';
import VoiceAssistantComponent from './VoiceAssistantComponent';

interface TutorInterfaceProps {
  request: TutorRequest;
  onClose: () => void;
}

export const TutorInterface: React.FC<TutorInterfaceProps> = ({ request, onClose }) => {
  const [responses, setResponses] = useState<GeminiResponse[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'features' | 'progress' | 'dashboard' | 'notes' | 'analyzer' | 'voice'>('chat');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [videoSections, setVideoSections] = useState<VideoSection[]>([]);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [videoSummary, setVideoSummary] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    handleGetInitialResponse();
    // Load progress and achievements
    loadProgressData();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [responses]);

  const loadProgressData = async () => {
    try {
      const [progressResponse, achievementsResponse] = await Promise.all([
        chrome.runtime.sendMessage({ action: 'getProgress' }),
        chrome.runtime.sendMessage({ action: 'getAchievements' })
      ]);
      
      if (progressResponse && !progressResponse.error) {
        setProgress(progressResponse);
      }
      if (achievementsResponse && Array.isArray(achievementsResponse)) {
        setAchievements(achievementsResponse);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  };

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
    } else if (request.type === 'youtube') {
      const context = request.context as any;
      return `YouTube: ${context.title}`;
    } else {
      const context = request.context as any;
      return `${context.title || 'Learning Session'}`;
    }
  };

  // Enhanced YouTube Features
  const handleGenerateVideoSections = async () => {
    if (request.type !== 'youtube') return;
    
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateVideoSections',
        data: request.context
      });
      
      if (response.sections) {
        setVideoSections(response.sections);
      } else {
        setError(response.error || 'Failed to generate video sections');
      }
    } catch (error) {
      setError('Failed to generate video sections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (request.type !== 'youtube') return;
    
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateVideoQuiz',
        data: request.context
      });
      
      if (response.quiz) {
        setCurrentQuiz(response.quiz);
      } else {
        setError(response.error || 'Failed to generate quiz');
      }
    } catch (error) {
      setError('Failed to generate quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (request.type !== 'youtube') return;
    
    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateVideoSummary',
        data: request.context
      });
      
      if (response.summary) {
        setVideoSummary(response.summary);
      } else {
        setError(response.error || 'Failed to generate summary');
      }
    } catch (error) {
      setError('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced LeetCode Features
  const handleGetApproachHelp = async () => {
    if (request.type !== 'leetcode') return;
    
    const approachRequest: TutorRequest = {
      ...request,
      requestedFeature: 'approach',
      userQuery: 'Help me understand the approach to solve this problem'
    };

    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: approachRequest
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        setResponses(prev => [...prev, response]);
      }
    } catch (error) {
      setError('Failed to get approach help');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplainTestCases = async () => {
    if (request.type !== 'leetcode') return;
    
    const testCaseRequest: TutorRequest = {
      ...request,
      requestedFeature: 'testcases',
      userQuery: 'Help me understand the test cases and edge cases'
    };

    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: testCaseRequest
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        setResponses(prev => [...prev, response]);
      }
    } catch (error) {
      setError('Failed to explain test cases');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetHints = async () => {
    const hintRequest: TutorRequest = {
      ...request,
      requestedFeature: 'hints',
      userQuery: 'Can you give me a hint to move forward?'
    };

    setIsLoading(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: hintRequest
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        setResponses(prev => [...prev, response]);
      }
    } catch (error) {
      setError('Failed to get hints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizAnswer = async (questionIndex: number, selectedAnswer: number) => {
    if (!currentQuiz) return;
    
    const updatedQuiz = { ...currentQuiz };
    updatedQuiz.questions[questionIndex].userAnswer = selectedAnswer;
    
    // Calculate score if all questions are answered
    const allAnswered = updatedQuiz.questions.every(q => q.userAnswer !== undefined);
    if (allAnswered) {
      const correct = updatedQuiz.questions.reduce((acc, q) => {
        return acc + (q.userAnswer === q.correctAnswer ? 1 : 0);
      }, 0);
      updatedQuiz.score = Math.round((correct / updatedQuiz.questions.length) * 100);
      updatedQuiz.attempts = (updatedQuiz.attempts || 0) + 1;
      
      // Save quiz completion
      try {
        await chrome.runtime.sendMessage({
          action: 'saveVideoProgress',
          data: {
            context: request.context,
            quiz: updatedQuiz
          }
        });
      } catch (error) {
        console.error('Failed to save quiz progress:', error);
      }
    }
    
    setCurrentQuiz(updatedQuiz);
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

      {/* Navigation Tabs */}
      <div className="learnai-tabs">
        <button 
          className={`learnai-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`learnai-tab ${activeTab === 'features' ? 'active' : ''}`}
          onClick={() => setActiveTab('features')}
        >
          ⚡ Features
        </button>
        <button 
          className={`learnai-tab ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          📊 Progress
        </button>
        <button 
          className="learnai-tab learnai-enhanced-tab"
          onClick={() => setShowDashboard(true)}
        >
          📈 Dashboard
        </button>
        <button 
          className="learnai-tab learnai-enhanced-tab"
          onClick={() => setShowNotes(true)}
        >
          📝 Notes
        </button>
        <button 
          className="learnai-tab learnai-enhanced-tab"
          onClick={() => setShowAnalyzer(true)}
        >
          🔬 Analyzer
        </button>
        <button 
          className="learnai-tab learnai-enhanced-tab"
          onClick={() => setShowVoice(true)}
        >
          🎤 Voice
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <>
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
        </>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="learnai-features">
          {/* YouTube Features */}
          {request.type === 'youtube' && (
            <div className="learnai-feature-section">
              <h4>🎥 YouTube Learning Features</h4>
              
              <div className="learnai-feature-grid">
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGenerateVideoSections}
                  disabled={isLoading}
                >
                  📑 Smart Sections
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGenerateQuiz}
                  disabled={isLoading}
                >
                  🧠 Interactive Quiz
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                >
                  📝 Video Summary
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGetHints}
                  disabled={isLoading}
                >
                  💡 Get Hints
                </button>
              </div>

              {/* Video Sections Display */}
              {videoSections.length > 0 && (
                <div className="learnai-sections">
                  <h5>📑 Smart Video Sections</h5>
                  {videoSections.map((section, index) => (
                    <div key={index} className="learnai-section">
                      <div className="learnai-section-header">
                        <strong>{section.title}</strong>
                        <span className="learnai-section-time">
                          {Math.floor(section.startTime / 60)}:{(section.startTime % 60).toString().padStart(2, '0')} - 
                          {Math.floor(section.endTime / 60)}:{(section.endTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p>{section.summary}</p>
                      {section.keyPoints.length > 0 && (
                        <ul className="learnai-key-points">
                          {section.keyPoints.map((point, idx) => (
                            <li key={idx}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Video Summary Display */}
              {videoSummary && (
                <div className="learnai-summary">
                  <h5>📝 Video Summary</h5>
                  <div className="learnai-summary-content">
                    {videoSummary.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* LeetCode Features */}
          {request.type === 'leetcode' && (
            <div className="learnai-feature-section">
              <h4>💻 LeetCode Problem Solving</h4>
              
              <div className="learnai-feature-grid">
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGetApproachHelp}
                  disabled={isLoading}
                >
                  🎯 Discuss Approach
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={handleExplainTestCases}
                  disabled={isLoading}
                >
                  🧪 Explain Test Cases
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={handleGetHints}
                  disabled={isLoading}
                >
                  💡 Get Hints
                </button>
                <button 
                  className="learnai-feature-btn"
                  onClick={async () => {
                    const errorRequest: TutorRequest = {
                      ...request,
                      requestedFeature: 'errors',
                      userQuery: 'Help me understand any errors in my approach'
                    };
                    setIsLoading(true);
                    try {
                      const response = await chrome.runtime.sendMessage({
                        action: 'generateTutorResponse',
                        data: errorRequest
                      });
                      if (response.type === 'error') {
                        setError(response.content);
                      } else {
                        setResponses(prev => [...prev, response]);
                        setActiveTab('chat');
                      }
                    } catch (error) {
                      setError('Failed to analyze errors');
                    }
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                >
                  🐛 Debug Errors
                </button>
              </div>
            </div>
          )}

          {/* General Features for any page */}
          <div className="learnai-feature-section">
            <h4>🌐 Context Awareness</h4>
            <div className="learnai-feature-grid">
              <button 
                className="learnai-feature-btn"
                onClick={handleGetHints}
                disabled={isLoading}
              >
                ⚡ Instant Help
              </button>
              <button 
                className="learnai-feature-btn"
                onClick={async () => {
                  const helpRequest: TutorRequest = {
                    ...request,
                    userQuery: 'Help me understand the selected content'
                  };
                  setIsLoading(true);
                  try {
                    const response = await chrome.runtime.sendMessage({
                      action: 'provideInstantHelp',
                      data: {
                        context: request.context,
                        selectedText: (request.context as any).selectedText || ''
                      }
                    });
                    if (response.type === 'error') {
                      setError(response.content);
                    } else {
                      setResponses(prev => [...prev, response]);
                      setActiveTab('chat');
                    }
                  } catch (error) {
                    setError('Failed to provide instant help');
                  }
                  setIsLoading(false);
                }}
                disabled={isLoading}
              >
                💬 Chat with Content
              </button>
            </div>
          </div>

          {/* Interactive Quiz Display */}
          {currentQuiz && (
            <div className="learnai-quiz">
              <h5>🧠 Interactive Quiz</h5>
              {currentQuiz.questions.map((question, qIndex) => (
                <div key={question.id} className="learnai-quiz-question">
                  <p className="learnai-question-text">
                    <strong>Q{qIndex + 1}:</strong> {question.question}
                  </p>
                  <div className="learnai-quiz-options">
                    {question.options.map((option, oIndex) => (
                      <label key={oIndex} className="learnai-quiz-option">
                        <input 
                          type="radio" 
                          name={`question-${qIndex}`}
                          checked={question.userAnswer === oIndex}
                          onChange={() => handleQuizAnswer(qIndex, oIndex)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {question.userAnswer !== undefined && (
                    <div className={`learnai-quiz-feedback ${question.userAnswer === question.correctAnswer ? 'correct' : 'incorrect'}`}>
                      {question.userAnswer === question.correctAnswer ? '✅ Correct!' : '❌ Incorrect'}
                      <p><strong>Explanation:</strong> {question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
              
              {currentQuiz.score !== undefined && (
                <div className="learnai-quiz-score">
                  <h6>📊 Quiz Results</h6>
                  <p>Score: <strong>{currentQuiz.score}%</strong></p>
                  <p>Questions Correct: {currentQuiz.questions.filter(q => q.userAnswer === q.correctAnswer).length}/{currentQuiz.questions.length}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Progress Tab */}
      {activeTab === 'progress' && (
        <div className="learnai-progress">
          <h4>📊 Learning Progress</h4>
          
          {progress && progress.stats && (
            <div className="learnai-stats">
              <div className="learnai-stat-card">
                <div className="learnai-stat-value">{progress.stats.totalQuizzes}</div>
                <div className="learnai-stat-label">Quizzes Completed</div>
              </div>
              <div className="learnai-stat-card">
                <div className="learnai-stat-value">{progress.stats.totalProblems}</div>
                <div className="learnai-stat-label">Problems Solved</div>
              </div>
              <div className="learnai-stat-card">
                <div className="learnai-stat-value">{progress.stats.totalHelpSessions}</div>
                <div className="learnai-stat-label">Help Sessions</div>
              </div>
              <div className="learnai-stat-card">
                <div className="learnai-stat-value">{progress.stats.accuracy}%</div>
                <div className="learnai-stat-label">Accuracy</div>
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="learnai-achievements">
              <h5>🏆 Achievements</h5>
              <div className="learnai-achievement-grid">
                {achievements.slice(0, 6).map((achievement) => (
                  <div key={achievement.id} className="learnai-achievement">
                    <div className="learnai-achievement-icon">{achievement.icon}</div>
                    <div className="learnai-achievement-info">
                      <strong>{achievement.title}</strong>
                      <p>{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {achievements.length > 6 && (
                <p className="learnai-achievement-count">
                  And {achievements.length - 6} more achievements!
                </p>
              )}
            </div>
          )}

          {/* Learning Tips */}
          <div className="learnai-tips">
            <h5>💡 Learning Tips</h5>
            <ul>
              <li>Ask questions about concepts you don't understand</li>
              <li>Try to solve problems step by step</li>
              <li>Use hints to guide your thinking, don't just look for answers</li>
              <li>Review your mistakes to learn from them</li>
              <li>Practice regularly to build your skills</li>
            </ul>
          </div>
        </div>
      )}

      {/* Enhanced Components */}
      {showDashboard && (
        <EnhancedStudyDashboard onClose={() => setShowDashboard(false)} />
      )}

      {showNotes && (
        <SmartNotesComponent 
          onClose={() => setShowNotes(false)}
          initialContent={request.type === 'leetcode' ? (request.context as any).selectedCode : ''}
          sourceUrl={request.type === 'youtube' ? (request.context as any).url : undefined}
          sourceType={request.type === 'general' ? 'article' : request.type}
        />
      )}

      {showAnalyzer && (
        <CodeAnalyzerComponent 
          onClose={() => setShowAnalyzer(false)}
          initialCode={request.type === 'leetcode' ? (request.context as any).selectedCode : ''}
          language={request.type === 'leetcode' ? (request.context as any).language : 'javascript'}
        />
      )}

      {showVoice && (
        <VoiceAssistantComponent 
          onClose={() => setShowVoice(false)}
          onVoiceQuery={(query) => {
            setCurrentQuestion(query);
            handleAskQuestion();
          }}
        />
      )}
    </div>
  );
};