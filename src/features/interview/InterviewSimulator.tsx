import React, { useState, useEffect } from 'react';
import { Button, Card, CardHeader, CardContent, Progress, Badge, Alert } from '../../components/ui';
import { FloatingPanel } from '../../components/layout';
import { ChatInterface, ChatMessage } from '../../components/ai';

export interface InterviewQuestion {
  id: string;
  type: 'coding' | 'behavioral' | 'system-design' | 'technical';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  hints?: string[];
  timeLimit?: number; // in minutes
  testCases?: Array<{
    input: any;
    expected: any;
    description?: string;
  }>;
}

export interface InterviewSession {
  id: string;
  type: 'technical' | 'behavioral' | 'full-stack';
  duration: number; // in minutes
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  startTime: number;
  endTime?: number;
  responses: Array<{
    questionId: string;
    response: string;
    code?: string;
    timeSpent: number;
  }>;
  score?: {
    technical: number;
    communication: number;
    problemSolving: number;
    overall: number;
  };
}

export interface InterviewSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  sessionType?: 'technical' | 'behavioral' | 'full-stack';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export const InterviewSimulator: React.FC<InterviewSimulatorProps> = ({
  isOpen,
  onClose,
  sessionType = 'technical',
  difficulty = 'medium'
}) => {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);

  // Mock questions for demonstration
  const mockQuestions: InterviewQuestion[] = [
    {
      id: '1',
      type: 'coding',
      difficulty: 'medium',
      title: 'Two Sum Problem',
      description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      hints: [
        'Think about using a hash map to store values and their indices',
        'You can solve this in one pass through the array',
        'For each element, check if its complement exists in the hash map'
      ],
      timeLimit: 30,
      testCases: [
        { input: [2, 7, 11, 15], expected: [0, 1], description: 'target = 9' },
        { input: [3, 2, 4], expected: [1, 2], description: 'target = 6' }
      ]
    },
    {
      id: '2',
      type: 'behavioral',
      difficulty: 'medium',
      title: 'Tell me about a challenging project',
      description: 'Describe a challenging project you worked on. What made it challenging and how did you overcome the difficulties?',
      timeLimit: 10
    }
  ];

  const startInterview = () => {
    const newSession: InterviewSession = {
      id: Date.now().toString(),
      type: sessionType,
      duration: 60, // 1 hour
      questions: mockQuestions,
      currentQuestionIndex: 0,
      startTime: Date.now(),
      responses: []
    };
    
    setSession(newSession);
    setTimeRemaining(newSession.duration * 60); // Convert to seconds
    setIsSessionActive(true);
    
    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'ai',
      content: `Welcome to your ${sessionType} interview simulation! I'll be your interviewer today. Let's start with the first question. Take your time and think through the problem systematically.`,
      timestamp: Date.now(),
      metadata: {
        responseType: 'encouragement'
      }
    };
    setChatMessages([welcomeMessage]);
  };

  const endInterview = () => {
    if (session) {
      const updatedSession = {
        ...session,
        endTime: Date.now()
      };
      setSession(updatedSession);
    }
    setIsSessionActive(false);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (session && session.currentQuestionIndex < session.questions.length - 1) {
      setSession({
        ...session,
        currentQuestionIndex: session.currentQuestionIndex + 1
      });
      setCurrentCode('');
    } else {
      endInterview();
    }
  };

  const handleChatMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: Date.now()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Simulate AI interviewer response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateInterviewerResponse(message),
        timestamp: Date.now(),
        metadata: {
          responseType: 'question',
          nextSteps: ['Think about the approach', 'Consider edge cases', 'Start coding when ready']
        }
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateInterviewerResponse = (userMessage: string): string => {
    // Simple AI response simulation
    const responses = [
      "That's an interesting approach. Can you walk me through your thought process?",
      "Good thinking! What would be the time complexity of this solution?",
      "I see. How would you handle edge cases in this scenario?",
      "Can you think of a more efficient approach?",
      "Excellent! Let's discuss the trade-offs of your solution."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isSessionActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isSessionActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentQuestion = session?.questions[session.currentQuestionIndex];

  if (!isOpen) return null;

  return (
    <FloatingPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Mock Interview Simulator"
      defaultSize={{ width: 800, height: 600 }}
      className="flex flex-col"
    >
      {!isSessionActive && !showFeedback && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎤</div>
          <h2 className="text-2xl font-bold mb-4">Ready for your interview?</h2>
          <p className="text-gray-600 mb-6">
            This is a {sessionType} interview simulation with {difficulty} level questions.
          </p>
          <Button onClick={startInterview} size="lg">
            Start Interview
          </Button>
        </div>
      )}

      {isSessionActive && session && currentQuestion && (
        <div className="flex-1 flex flex-col">
          {/* Header with timer and progress */}
          <div className="border-b border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="info">
                Question {session.currentQuestionIndex + 1} of {session.questions.length}
              </Badge>
              <div className="text-sm font-medium text-red-600">
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>
            <Progress 
              value={session.currentQuestionIndex + 1} 
              max={session.questions.length} 
              className="mb-2"
            />
          </div>

          {/* Question and Chat */}
          <div className="flex-1 flex">
            {/* Question Panel */}
            <div className="w-1/2 p-4 border-r border-gray-200">
              <Badge variant={currentQuestion.difficulty === 'hard' ? 'danger' : currentQuestion.difficulty === 'medium' ? 'warning' : 'success'}>
                {currentQuestion.difficulty}
              </Badge>
              <h3 className="text-lg font-semibold mt-2 mb-4">{currentQuestion.title}</h3>
              <p className="text-gray-700 leading-relaxed">{currentQuestion.description}</p>
              
              {currentQuestion.testCases && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Test Cases:</h4>
                  {currentQuestion.testCases.map((testCase, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded text-sm mb-2">
                      <div><strong>Input:</strong> {JSON.stringify(testCase.input)}</div>
                      <div><strong>Output:</strong> {JSON.stringify(testCase.expected)}</div>
                      {testCase.description && <div><strong>Note:</strong> {testCase.description}</div>}
                    </div>
                  ))}
                </div>
              )}
              
              {currentQuestion.type === 'coding' && (
                <div className="mt-4">
                  <textarea
                    value={currentCode}
                    onChange={(e) => setCurrentCode(e.target.value)}
                    placeholder="Write your code here..."
                    className="w-full h-40 p-2 border border-gray-300 rounded font-mono text-sm"
                  />
                </div>
              )}
            </div>

            {/* Chat Panel */}
            <div className="w-1/2">
              <ChatInterface
                messages={chatMessages}
                onSendMessage={handleChatMessage}
                placeholder="Explain your approach, ask questions, or discuss your solution..."
                suggestions={[
                  "I need a hint",
                  "Can you clarify the requirements?",
                  "I'm ready for the next question",
                  "What's the expected time complexity?"
                ]}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 p-4 flex justify-between">
            <Button variant="outline" onClick={endInterview}>
              End Interview
            </Button>
            <Button onClick={nextQuestion}>
              {session.currentQuestionIndex < session.questions.length - 1 ? 'Next Question' : 'Finish Interview'}
            </Button>
          </div>
        </div>
      )}

      {showFeedback && (
        <div className="p-6">
          <Alert variant="success" title="Interview Completed!" className="mb-4">
            Great work! You've completed the interview simulation.
          </Alert>
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Interview Summary</h3>
            <p className="text-gray-600">
              Your performance data will be available soon with detailed feedback and improvement suggestions.
            </p>
            <Button onClick={onClose} className="mt-4">
              Close Interview
            </Button>
          </div>
        </div>
      )}
    </FloatingPanel>
  );
};

export default InterviewSimulator;