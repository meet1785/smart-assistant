import { GeminiService } from '../services/gemini';
import { TutorRequest, GeminiResponse, TutorSession } from '../types/index';

class BackgroundService {
  private geminiService: GeminiService | null = null;
  private sessions: Map<string, TutorSession> = new Map();

  constructor() {
    this.initializeGeminiService();
    this.setupMessageHandlers();
  }

  private async initializeGeminiService() {
    try {
      const result = await chrome.storage.sync.get(['geminiApiKey']);
      if (result.geminiApiKey) {
        this.geminiService = new GeminiService(result.geminiApiKey);
      }
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
    }
  }

  private setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender).then(sendResponse);
      return true; // Indicates we will send a response asynchronously
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.geminiApiKey) {
        this.initializeGeminiService();
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
      : context.title;
    return `${request.type}-${btoa(identifier).slice(0, 10)}-${Date.now()}`;
  }
}

// Initialize the background service
new BackgroundService();