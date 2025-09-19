import { GeminiService } from '../services/gemini';
import { ProgressTracker } from '../services/progressTracker';
import { YouTubeEnhancer } from '../services/youtubeEnhancer';
import { ContextAwarenessService } from '../services/contextAwareness';
import { TutorRequest, GeminiResponse, TutorSession } from '../types/index';
import { config } from '../config/config';

class BackgroundService {
  private geminiService: GeminiService | null = null;
  private progressTracker: ProgressTracker;
  private youtubeEnhancer: YouTubeEnhancer | null = null;
  private contextAwareness: ContextAwarenessService | null = null;
  private sessions: Map<string, TutorSession> = new Map();

  constructor() {
    this.progressTracker = ProgressTracker.getInstance();
    this.initializeServices();
    this.setupMessageHandlers();
  }

  private async initializeServices() {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      let apiKey = result.geminiApiKey;
      
      // Fallback to config API key if none is stored (for development)
      if (!apiKey && config.GEMINI_API_KEY) {
        apiKey = config.GEMINI_API_KEY;
        // Store the config API key for future use
        await chrome.storage.sync.set({ geminiApiKey: apiKey });
      }
      
      // Initialize services (API key retrieved securely when needed)
      this.geminiService = new GeminiService();
      this.youtubeEnhancer = new YouTubeEnhancer(this.geminiService);
      this.contextAwareness = new ContextAwarenessService(this.geminiService);
      
      // Initialize progress tracker
      await this.progressTracker.initialize();
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  }

  private setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender).then(sendResponse);
      return true; // Indicates we will send a response asynchronously
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.geminiApiKey) {
        this.initializeServices();
      }
    });
  }

  private async handleMessage(request: any, sender: chrome.runtime.MessageSender): Promise<any> {
    switch (request.action) {
      case 'generateTutorResponse':
        return this.generateTutorResponse(request.data);
      
      case 'startTutorSession':
        return this.startTutorSession(request.data);
      
      case 'getTutorSession':
        return this.getTutorSession(request.sessionId);
      
      case 'setApiKey':
        return this.setApiKey(request.apiKey);
      
      case 'getApiKeyStatus':
        return this.getApiKeyStatus();

      // New enhanced features
      case 'generateVideoSections':
        return this.generateVideoSections(request.data);
      
      case 'generateVideoQuiz':
        return this.generateVideoQuiz(request.data);
      
      case 'generateVideoSummary':
        return this.generateVideoSummary(request.data);
      
      case 'saveVideoProgress':
        return this.saveVideoProgress(request.data);
      
      case 'saveProblemSolution':
        return this.saveProblemSolution(request.data);
      
      case 'provideCodingHints':
        return this.provideCodingHints(request.data);
      
      case 'explainError':
        return this.explainError(request.data);
      
      case 'getProgress':
        return this.getProgress();
      
      case 'getAchievements':
        return this.getAchievements();
      
      case 'provideInstantHelp':
        return this.provideInstantHelp(request.data);
      
      case 'chatWithBlog':
        return this.chatWithBlog(request.data);

      // Enhanced Features
      case 'getStudyDashboard':
        return this.getStudyDashboard();
      
      case 'getNotes':
        return this.getNotes();
      
      case 'saveNote':
        return this.saveNote(request.data);
      
      case 'generateNoteTitle':
        return this.generateNoteTitle(request.data);
      
      case 'enhanceNote':
        return this.enhanceNote(request.data);
      
      case 'generateFlashcards':
        return this.generateFlashcards(request.data);
      
      case 'analyzeCode':
        return this.analyzeCode(request.data);
      
      case 'processVoiceCommand':
        return this.processVoiceCommand(request.data);
      
      case 'getVoiceHistory':
        return this.getVoiceHistory();
      
      case 'clearVoiceHistory':
        return this.clearVoiceHistory();
      
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }
  }

  private async generateTutorResponse(tutorRequest: TutorRequest): Promise<GeminiResponse> {
    if (!this.geminiService) {
      return {
        type: 'error',
        content: 'Please configure your Google Gemini API key in the extension popup.'
      };
    }

    try {
      const response = await this.geminiService.generateSocraticResponse(tutorRequest);
      
      // Update session if it exists
      const sessionId = this.generateSessionId(tutorRequest);
      const session = this.sessions.get(sessionId);
      if (session) {
        session.interactions.push({
          timestamp: Date.now(),
          userInput: tutorRequest.userQuery,
          aiResponse: response
        });
      }

      return response;
    } catch (error) {
      console.error('Error generating tutor response:', error);
      return {
        type: 'error',
        content: 'Sorry, I encountered an error while generating a response. Please try again.'
      };
    }
  }

  private startTutorSession(request: TutorRequest): TutorSession {
    const sessionId = this.generateSessionId(request);
    const session: TutorSession = {
      sessionId,
      type: request.type,
      context: request.context,
      interactions: []
    };
    
    this.sessions.set(sessionId, session);
    return session;
  }

  private getTutorSession(sessionId: string): TutorSession | null {
    return this.sessions.get(sessionId) || null;
  }

  private async setApiKey(apiKey: string): Promise<{ success: boolean }> {
    try {
      await chrome.storage.sync.set({ geminiApiKey: apiKey });
      this.geminiService = new GeminiService();
      return { success: true };
    } catch (error) {
      console.error('Failed to set API key:', error);
      return { success: false };
    }
  }

  private async getApiKeyStatus(): Promise<{ hasApiKey: boolean }> {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      return { hasApiKey: !!result.geminiApiKey };
    } catch (error) {
      return { hasApiKey: false };
    }
  }

  private generateSessionId(request: TutorRequest): string {
    const context = request.context as any;
    const identifier = request.type === 'leetcode' 
      ? context.title 
      : context.title || context.url || 'unknown';
    return `${request.type}-${btoa(identifier).slice(0, 10)}-${Date.now()}`;
  }

  // Enhanced YouTube Features
  private async generateVideoSections(context: any) {
    if (!this.youtubeEnhancer) {
      return { error: 'YouTube enhancer not available' };
    }
    
    try {
      const sections = await this.youtubeEnhancer.generateSmartSections(context);
      return { sections };
    } catch (error) {
      console.error('Error generating video sections:', error);
      return { error: 'Failed to generate video sections' };
    }
  }

  private async generateVideoQuiz(context: any) {
    if (!this.youtubeEnhancer) {
      return { error: 'YouTube enhancer not available' };
    }
    
    try {
      const quiz = await this.youtubeEnhancer.generateInteractiveQuiz(context);
      return { quiz };
    } catch (error) {
      console.error('Error generating video quiz:', error);
      return { error: 'Failed to generate quiz' };
    }
  }

  private async generateVideoSummary(context: any) {
    if (!this.youtubeEnhancer) {
      return { error: 'YouTube enhancer not available' };
    }
    
    try {
      const summary = await this.youtubeEnhancer.generateVideoSummary(context);
      return { summary };
    } catch (error) {
      console.error('Error generating video summary:', error);
      return { error: 'Failed to generate summary' };
    }
  }

  // Progress Tracking Features
  private async saveVideoProgress(data: any) {
    try {
      await this.progressTracker.saveVideo(data.context, data.currentTime);
      if (data.sections) {
        await this.progressTracker.updateVideoProgress(data.context.url || window.location.href, data.currentTime, data.sections);
      }
      return { success: true };
    } catch (error) {
      console.error('Error saving video progress:', error);
      return { error: 'Failed to save progress' };
    }
  }

  private async saveProblemSolution(data: any) {
    try {
      await this.progressTracker.saveSolvedProblem(
        data.problem,
        data.solution,
        data.language,
        data.attempts,
        data.hints || []
      );
      return { success: true };
    } catch (error) {
      console.error('Error saving problem solution:', error);
      return { error: 'Failed to save solution' };
    }
  }

  // Context Awareness Features
  private async provideCodingHints(data: any) {
    if (!this.contextAwareness) {
      return { error: 'Context awareness service not available' };
    }
    
    try {
      const response = await this.contextAwareness.provideCodingHints(
        data.context,
        data.selectedCode,
        data.errorMessage
      );
      await this.progressTracker.incrementHelpSessions();
      return response;
    } catch (error) {
      console.error('Error providing coding hints:', error);
      return { type: 'error', content: 'Failed to provide coding hints' };
    }
  }

  private async explainError(data: any) {
    if (!this.contextAwareness) {
      return { error: 'Context awareness service not available' };
    }
    
    try {
      const response = await this.contextAwareness.explainErrorCode(
        data.errorMessage,
        data.context,
        data.relatedCode
      );
      
      // Save mistake for learning
      if (data.problemId) {
        await this.progressTracker.saveMistake(data.problemId, {
          problemId: data.problemId,
          errorType: 'runtime',
          errorMessage: data.errorMessage,
          incorrectCode: data.relatedCode || '',
          correction: '',
          explanation: response.content,
          timestamp: Date.now()
        });
      }
      
      return response;
    } catch (error) {
      console.error('Error explaining error:', error);
      return { type: 'error', content: 'Failed to explain error' };
    }
  }

  private async provideInstantHelp(data: any) {
    if (!this.contextAwareness) {
      return { error: 'Context awareness service not available' };
    }
    
    try {
      const response = await this.contextAwareness.provideInstantHelp(
        data.context,
        data.selectedText
      );
      await this.progressTracker.incrementHelpSessions();
      return response;
    } catch (error) {
      console.error('Error providing instant help:', error);
      return { type: 'error', content: 'Failed to provide instant help' };
    }
  }

  private async chatWithBlog(data: any) {
    if (!this.contextAwareness) {
      return { error: 'Context awareness service not available' };
    }
    
    try {
      const response = await this.contextAwareness.provideChatWithBlog(
        data.context,
        data.selectedText,
        data.userQuery
      );
      await this.progressTracker.incrementHelpSessions();
      return response;
    } catch (error) {
      console.error('Error in chat with blog:', error);
      return { type: 'error', content: 'Failed to analyze blog content' };
    }
  }

  // Progress and Achievement Methods
  private getProgress() {
    const progress = this.progressTracker.getProgress();
    const stats = this.progressTracker.getStats();
    return { progress, stats };
  }

  private getAchievements() {
    return this.progressTracker.getAchievements();
  }

  // Enhanced Features Methods
  private async getStudyDashboard() {
    try {
      const progress = this.progressTracker.getProgress();
      const stats = this.progressTracker.getStats();
      const achievements = this.progressTracker.getAchievements();
      
      // Generate mock dashboard data (in a real app, this would come from the database)
      const dashboard = {
        todayStats: {
          timeSpent: stats.watchTime || 45,
          problemsSolved: stats.totalProblems || 3,
          videosWatched: Math.floor(stats.watchTime / 30) || 2,
          notesCreated: 1,
          flashcardsReviewed: 5,
          achievementsUnlocked: achievements.filter(a => 
            Date.now() - a.unlockedAt < 24 * 60 * 60 * 1000
          ).length
        },
        weeklyProgress: {
          days: Array.from({ length: 7 }, (_, i) => ({
            timeSpent: Math.floor(Math.random() * 120),
            problemsSolved: Math.floor(Math.random() * 5),
            videosWatched: Math.floor(Math.random() * 3),
            notesCreated: Math.floor(Math.random() * 2),
            flashcardsReviewed: Math.floor(Math.random() * 10),
            achievementsUnlocked: 0
          })),
          totalTime: 420,
          averageTime: 60,
          completionRate: 85,
          streakDays: 5
        },
        learningStreak: 7,
        upcomingReviews: [
          {
            id: '1',
            type: 'concept' as const,
            title: 'Binary Search Algorithm',
            dueDate: Date.now() + 24 * 60 * 60 * 1000,
            priority: 'high' as const,
            difficulty: 'medium' as const,
            lastReviewed: Date.now() - 3 * 24 * 60 * 60 * 1000
          }
        ],
        recommendations: [
          {
            id: '1',
            type: 'problem' as const,
            title: 'Two Pointers Technique',
            description: 'Practice problems using the two pointers approach',
            reason: 'Based on your recent algorithm study pattern',
            estimatedTime: 30,
            difficulty: 'intermediate' as const,
            confidence: 0.9
          }
        ],
        studyGoals: [
          {
            id: '1',
            title: 'Master Dynamic Programming',
            description: 'Complete 20 DP problems this month',
            type: 'problems' as const,
            target: 20,
            current: 7,
            deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
            priority: 'high' as const,
            status: 'active' as const
          }
        ]
      };

      return { success: true, data: dashboard };
    } catch (error) {
      console.error('Error getting study dashboard:', error);
      return { success: false, error: 'Failed to load dashboard' };
    }
  }

  private async getNotes() {
    try {
      const result = await chrome.storage.local.get(['smart_notes']);
      const notes = result.smart_notes || [];
      return { success: true, data: notes };
    } catch (error) {
      console.error('Error getting notes:', error);
      return { success: false, error: 'Failed to load notes' };
    }
  }

  private async saveNote(noteData: any) {
    try {
      const result = await chrome.storage.local.get(['smart_notes']);
      const notes = result.smart_notes || [];
      
      const existingIndex = notes.findIndex((n: any) => n.id === noteData.id);
      if (existingIndex >= 0) {
        notes[existingIndex] = noteData;
      } else {
        notes.unshift(noteData);
      }
      
      await chrome.storage.local.set({ smart_notes: notes });
      return { success: true, data: noteData };
    } catch (error) {
      console.error('Error saving note:', error);
      return { success: false, error: 'Failed to save note' };
    }
  }

  private async generateNoteTitle(data: any) {
    if (!this.geminiService) {
      return { success: false, error: 'AI service not available' };
    }

    try {
      const prompt = `Generate a concise, descriptive title for these notes and suggest 3-5 relevant tags:

Content: ${data.content.substring(0, 500)}...
Source Type: ${data.sourceType || 'general'}
Source URL: ${data.sourceUrl || 'N/A'}

Please respond in JSON format:
{
  "title": "Generated Title",
  "suggestedTags": ["tag1", "tag2", "tag3"]
}`;

      const response = await this.geminiService.generateSocraticResponse({
        type: 'general',
        context: {
          title: 'Note Title Generation',
          url: data.sourceUrl || '',
          selectedText: data.content,
          pageContent: data.content
        },
        userQuery: prompt
      });

      // Try to parse JSON from the response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, data: parsed };
      }

      // Fallback
      return { 
        success: true, 
        data: { 
          title: 'New Note', 
          suggestedTags: ['general'] 
        } 
      };
    } catch (error) {
      console.error('Error generating note title:', error);
      return { success: false, error: 'Failed to generate title' };
    }
  }

  private async enhanceNote(data: any) {
    if (!this.geminiService) {
      return { success: false, error: 'AI service not available' };
    }

    try {
      const prompt = `Enhance these study notes by:
1. Improving structure and organization
2. Adding key insights and connections
3. Suggesting related concepts
4. Creating potential flashcard questions

Original content: ${data.content}
Source: ${data.sourceType || 'general'}

Please respond in JSON format:
{
  "content": "Enhanced note content with better structure",
  "suggestedTags": ["tag1", "tag2"],
  "flashcards": [
    {
      "front": "Question",
      "back": "Answer",
      "type": "concept"
    }
  ]
}`;

      const response = await this.geminiService.generateSocraticResponse({
        type: 'general',
        context: {
          title: data.title || 'Note Enhancement',
          url: data.sourceUrl || '',
          selectedText: data.content,
          pageContent: data.content
        },
        userQuery: prompt
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return { success: true, data: parsed };
      }

      return { success: false, error: 'Failed to parse enhancement' };
    } catch (error) {
      console.error('Error enhancing note:', error);
      return { success: false, error: 'Failed to enhance note' };
    }
  }

  private async generateFlashcards(data: any) {
    if (!this.geminiService) {
      return { success: false, error: 'AI service not available' };
    }

    try {
      const prompt = `Create 5-10 flashcards from this content for spaced repetition learning:

Content: ${data.content}
Tags: ${data.tags?.join(', ') || 'general'}

Generate flashcards covering key concepts, definitions, and important facts.
Please respond in JSON format as an array:
[
  {
    "id": "unique_id",
    "front": "Question or concept",
    "back": "Answer or explanation",
    "type": "concept",
    "difficulty": "easy|medium|hard",
    "tags": ["tag1", "tag2"]
  }
]`;

      const response = await this.geminiService.generateSocraticResponse({
        type: 'general',
        context: {
          title: 'Flashcard Generation',
          url: '',
          selectedText: data.content,
          pageContent: data.content
        },
        userQuery: prompt
      });

      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Add additional properties to each flashcard
        const flashcards = parsed.map((card: any, index: number) => ({
          ...card,
          id: card.id || `card_${Date.now()}_${index}`,
          createdAt: Date.now(),
          lastReviewed: undefined,
          nextReviewDate: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
          reviewCount: 0,
          correctCount: 0,
          intervalDays: 1,
          easeFactor: 2.5
        }));
        
        return { success: true, data: flashcards };
      }

      return { success: false, error: 'Failed to parse flashcards' };
    } catch (error) {
      console.error('Error generating flashcards:', error);
      return { success: false, error: 'Failed to generate flashcards' };
    }
  }

  private async analyzeCode(data: any) {
    if (!this.geminiService) {
      return { success: false, error: 'AI service not available' };
    }

    try {
      const prompt = `Analyze this ${data.language} code for:
1. Time and space complexity
2. Performance optimizations
3. Security vulnerabilities
4. Code quality and best practices
5. Design patterns used

Code:
${data.code}

Please respond in JSON format:
{
  "complexity": {
    "time": "O(n)",
    "space": "O(1)",
    "cyclomatic": 5
  },
  "suggestions": [
    {
      "type": "optimization|refactor|best-practice|bug-fix",
      "description": "Description of suggestion",
      "before": "original code snippet",
      "after": "improved code snippet",
      "impact": "low|medium|high",
      "confidence": 0.9
    }
  ],
  "patterns": [
    {
      "name": "Pattern name",
      "description": "Pattern description",
      "location": {"startLine": 1, "endLine": 10},
      "confidence": 0.8
    }
  ],
  "performance": [
    {
      "metric": "Memory usage",
      "value": 100,
      "unit": "MB",
      "recommendation": "Consider using streaming"
    }
  ],
  "security": [
    {
      "severity": "high|medium|low|critical",
      "description": "Security issue description",
      "location": {"line": 5, "column": 10},
      "fix": "How to fix this issue"
    }
  ]
}`;

      const response = await this.geminiService.generateSocraticResponse({
        type: 'leetcode',
        context: {
          title: 'Code Analysis',
          difficulty: 'Medium',
          description: 'Code analysis request',
          selectedCode: data.code,
          language: data.language
        },
        userQuery: prompt
      });

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const analysis = {
          id: Date.now().toString(),
          code: data.code,
          language: data.language,
          analysis: parsed,
          createdAt: Date.now()
        };
        
        return { success: true, data: analysis };
      }

      return { success: false, error: 'Failed to parse analysis' };
    } catch (error) {
      console.error('Error analyzing code:', error);
      return { success: false, error: 'Failed to analyze code' };
    }
  }

  private async processVoiceCommand(data: any) {
    if (!this.geminiService) {
      return { success: false, error: 'AI service not available' };
    }

    try {
      // Save the voice interaction
      const result = await chrome.storage.local.get(['voice_history']);
      const history = result.voice_history || [];
      
      const response = await this.geminiService.generateSocraticResponse({
        type: 'general',
        context: {
          title: 'Voice Command',
          url: '',
          selectedText: data.query,
          pageContent: `Voice command with ${Math.round(data.confidence * 100)}% confidence`
        },
        userQuery: data.query
      });

      const voiceInteraction = {
        sessionId: Date.now().toString(),
        query: data.query,
        response: response.content,
        accuracy: data.confidence,
        language: data.language,
        timestamp: Date.now()
      };

      history.unshift(voiceInteraction);
      // Keep only last 50 interactions
      if (history.length > 50) history.splice(50);
      
      await chrome.storage.local.set({ voice_history: history });

      return { success: true, data: { response: response.content } };
    } catch (error) {
      console.error('Error processing voice command:', error);
      return { success: false, error: 'Failed to process voice command' };
    }
  }

  private async getVoiceHistory() {
    try {
      const result = await chrome.storage.local.get(['voice_history']);
      return { success: true, data: result.voice_history || [] };
    } catch (error) {
      console.error('Error getting voice history:', error);
      return { success: false, error: 'Failed to load voice history' };
    }
  }

  private async clearVoiceHistory() {
    try {
      await chrome.storage.local.set({ voice_history: [] });
      return { success: true };
    } catch (error) {
      console.error('Error clearing voice history:', error);
      return { success: false, error: 'Failed to clear voice history' };
    }
  }
}

// Initialize the background service
new BackgroundService();