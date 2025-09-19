import { GeminiService } from '../services/gemini';
import { ProgressTracker } from '../services/progressTracker';
import { YouTubeEnhancer } from '../services/youtubeEnhancer';
import { ContextAwarenessService } from '../services/contextAwareness';
import { TutorRequest, GeminiResponse, TutorSession } from '../types/index';

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
      if (result.geminiApiKey) {
        this.geminiService = new GeminiService(result.geminiApiKey);
        this.youtubeEnhancer = new YouTubeEnhancer(this.geminiService);
        this.contextAwareness = new ContextAwarenessService(this.geminiService);
      }
      
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
      this.geminiService = new GeminiService(apiKey);
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
}

// Initialize the background service
new BackgroundService();