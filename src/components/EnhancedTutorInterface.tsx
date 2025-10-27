import React, { useState, useEffect } from 'react';
import { GeminiResponse, TutorRequest } from '../types/index';
import { FloatingPanel } from './layout';
import { ChatInterface, ChatMessage } from './ai';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Alert, Progress } from './ui';
import { InterviewSimulator } from '../features/interview';
import { LearningPathManager } from '../features/learning';
import { NotesManager } from './NotesManager';
import FlashcardManager from './FlashcardManager';
import { useUserStore, useLearningStore } from '../stores';

interface EnhancedTutorInterfaceProps {
  request: TutorRequest;
  onClose: () => void;
}

export const EnhancedTutorInterface: React.FC<EnhancedTutorInterfaceProps> = ({ 
  request, 
  onClose 
}) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('chat');
  const [showInterview, setShowInterview] = useState(false);
  const [showLearningPath, setShowLearningPath] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  
  // Store hooks
  const { profile, incrementExperience } = useUserStore();
  const { startSession, endSession, currentSession, addAchievement } = useLearningStore();

  useEffect(() => {
    // Start learning session
    const sessionType = request.type as 'leetcode' | 'youtube' | 'general';
    startSession(sessionType, getContextPlatform());
    
    // Initialize conversation
    handleGetInitialResponse();
    
    return () => {
      // End session on cleanup
      if (currentSession) {
        endSession('Session completed via tutor interface');
      }
    };
  }, []);

  const getContextPlatform = () => {
    if (request.type === 'leetcode') return 'LeetCode';
    if (request.type === 'youtube') return 'YouTube';
    return 'General';
  };

  const handleGetInitialResponse = async () => {
    setIsLoading(true);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: request
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        const initialMessage: ChatMessage = {
          id: 'initial',
          type: 'ai',
          content: response.content,
          timestamp: Date.now(),
          metadata: {
            responseType: response.type,
            nextSteps: response.nextSteps,
            context: response.context
          }
        };
        setChatMessages([initialMessage]);
      }
    } catch (error) {
      setError('Failed to get initial response from AI tutor');
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateTutorResponse',
        data: {
          ...request,
          userQuery: message,
          previousInteraction: chatMessages[chatMessages.length - 1]?.content
        }
      });
      
      if (response.type === 'error') {
        setError(response.content);
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: response.content,
          timestamp: Date.now(),
          metadata: {
            responseType: response.type,
            nextSteps: response.nextSteps,
            context: response.context
          }
        };
        
        setChatMessages(prev => [...prev, aiMessage]);
        
        // Award experience points
        incrementExperience(5);
        
        // Check for achievements
        if (chatMessages.length > 10) {
          addAchievement('Engaged Learner: Had a long conversation with AI tutor');
        }
      }
    } catch (error) {
      setError('Failed to get response from AI tutor');
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    const baseSuggestions = [
      "I need a hint",
      "Can you explain this differently?",
      "What should I focus on next?",
      "I'm ready for the next step"
    ];

    if (request.type === 'leetcode') {
      return [
        ...baseSuggestions,
        "Help me understand the approach",
        "What's the time complexity?",
        "Can you suggest test cases?",
        "I'm stuck on this part"
      ];
    }

    if (request.type === 'youtube') {
      return [
        ...baseSuggestions,
        "Can you summarize this section?",
        "Create a quiz for me",
        "What are the key takeaways?",
        "How does this apply in practice?"
      ];
    }

    return baseSuggestions;
  };

  const getContextInfo = () => {
    if (request.type === 'leetcode') {
      const leetcodeContext = request.context as any;
      return {
        title: leetcodeContext.title,
        subtitle: `Difficulty: ${leetcodeContext.difficulty}`,
        description: leetcodeContext.description,
        extra: leetcodeContext.selectedCode ? 'Code selected for analysis' : null
      };
    }

    if (request.type === 'youtube') {
      const youtubeContext = request.context as any;
      return {
        title: youtubeContext.title,
        subtitle: `YouTube Video${youtubeContext.timestamp ? ` at ${Math.floor(youtubeContext.timestamp / 60)}:${(youtubeContext.timestamp % 60).toString().padStart(2, '0')}` : ''}`,
        description: youtubeContext.selectedText || 'Video content analysis',
        extra: null
      };
    }

    const generalContext = request.context as any;
    return {
      title: generalContext.title || 'General Learning',
      subtitle: generalContext.url ? new URL(generalContext.url).hostname : 'Web Content',
      description: generalContext.selectedText || generalContext.pageContent || 'General content analysis',
      extra: null
    };
  };

  const contextInfo = getContextInfo();

  return (
    <FloatingPanel
      isOpen={true}
      onClose={onClose}
      title="AI Learning Assistant"
      defaultSize={{ width: 900, height: 700 }}
      defaultPosition={{ x: 100, y: 100 }}
    >
      <div className="flex flex-col h-full">
        {/* Context Header */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{contextInfo.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{contextInfo.subtitle}</p>
              {contextInfo.description && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {contextInfo.description.length > 100 
                    ? `${contextInfo.description.substring(0, 100)}...` 
                    : contextInfo.description
                  }
                </p>
              )}
              {contextInfo.extra && (
                <Badge variant="info" className="mt-2">
                  {contextInfo.extra}
                </Badge>
              )}
            </div>
            <Badge variant={request.type === 'leetcode' ? 'warning' : request.type === 'youtube' ? 'info' : 'default'}>
              {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="m-4" closable onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Session Info */}
        {currentSession && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700">
                📚 Active learning session: {Math.floor((Date.now() - currentSession.startTime.getTime()) / 60000)} minutes
              </span>
              {profile && (
                <span className="text-blue-600">
                  Level {profile.level} • {profile.experience} XP
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-gray-200 px-4">
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="flex-1 flex flex-col">
            <ChatInterface
              messages={chatMessages}
              onSendMessage={handleChatMessage}
              isLoading={isLoading}
              suggestions={getSuggestions()}
              placeholder="Ask questions, share your thoughts, or request specific help..."
              className="flex-1"
            />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="p-4">
            <div className="grid grid-cols-2 gap-4">
              {request.type === 'leetcode' && (
                <>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">🎯</span>
                    <span>Get Approach Hint</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">🧪</span>
                    <span>Analyze Test Cases</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">🐛</span>
                    <span>Debug Helper</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">⏱️</span>
                    <span>Complexity Analysis</span>
                  </Button>
                </>
              )}

              {request.type === 'youtube' && (
                <>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">📝</span>
                    <span>Video Summary</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">❓</span>
                    <span>Generate Quiz</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">📖</span>
                    <span>Key Sections</span>
                  </Button>
                  <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                    <span className="text-2xl mb-1">🎯</span>
                    <span>Practice Questions</span>
                  </Button>
                </>
              )}

              {/* Common features */}
              <Button onClick={() => setShowNotes(true)} className="h-20 flex flex-col justify-center">
                <span className="text-2xl mb-1">📚</span>
                <span>Smart Notes</span>
              </Button>
              <Button onClick={() => {/* TODO: Implement */}} className="h-20 flex flex-col justify-center">
                <span className="text-2xl mb-1">🎙️</span>
                <span>Voice Chat</span>
              </Button>
            </div>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="p-4">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => setShowInterview(true)}
                className="h-16 flex items-center justify-start px-6"
                variant="outline"
              >
                <span className="text-2xl mr-4">🎤</span>
                <div className="text-left">
                  <div className="font-medium">Mock Interview</div>
                  <div className="text-sm text-gray-500">Practice coding interviews with AI</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => setShowLearningPath(true)}
                className="h-16 flex items-center justify-start px-6"
                variant="outline"
              >
                <span className="text-2xl mr-4">🗺️</span>
                <div className="text-left">
                  <div className="font-medium">Learning Paths</div>
                  <div className="text-sm text-gray-500">Manage your learning goals and progress</div>
                </div>
              </Button>
              
              <Button 
                onClick={() => setShowFlashcards(true)}
                className="h-16 flex items-center justify-start px-6"
                variant="outline"
              >
                <span className="text-2xl mr-4">🎴</span>
                <div className="text-left">
                  <div className="font-medium">Flashcards</div>
                  <div className="text-sm text-gray-500">Review with spaced repetition system</div>
                </div>
              </Button>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="p-4">
            <div className="space-y-6">
              {profile && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-90">Level {profile.level}</span>
                    <span className="text-sm opacity-90">{profile.experience} XP</span>
                  </div>
                  <Progress 
                    value={profile.experience % 100} 
                    max={100}
                    className="mb-2"
                  />
                  <div className="text-xs opacity-75">
                    {profile.streak} day streak • Joined {profile.joinedAt.toLocaleDateString()}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {chatMessages.filter(m => m.type === 'user').length}
                  </div>
                  <div className="text-sm text-gray-600">Questions Asked</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor((Date.now() - (currentSession?.startTime.getTime() || Date.now())) / 60000)}
                  </div>
                  <div className="text-sm text-gray-600">Minutes Active</div>
                </div>
              </div>

              {currentSession?.achievements && currentSession.achievements.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Session Achievements</h4>
                  <div className="space-y-2">
                    {currentSession.achievements.map((achievement, index) => (
                      <Alert key={index} variant="success">
                        {achievement}
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <InterviewSimulator
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
        sessionType="technical"
        difficulty="medium"
      />

      <LearningPathManager
        isOpen={showLearningPath}
        onClose={() => setShowLearningPath(false)}
      />

      <NotesManager
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        prefilledNote={{
          platform: request.type,
          sourceUrl: window.location.href
        }}
      />

      <FlashcardManager
        isOpen={showFlashcards}
        onClose={() => setShowFlashcards(false)}
      />
    </FloatingPanel>
  );
};

export default EnhancedTutorInterface;