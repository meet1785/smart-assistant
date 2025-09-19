export interface GeminiResponse {
  type: 'question' | 'hint' | 'followup' | 'encouragement' | 'error';
  content: string;
  context?: string;
  nextSteps?: string[];
}

export interface LeetCodeProblem {
  title: string;
  difficulty: string;
  description: string;
  selectedCode?: string;
  language?: string;
}

export interface YouTubeContext {
  title: string;
  selectedText?: string;
  timestamp?: number;
  transcript?: string;
}

export interface TutorRequest {
  type: 'leetcode' | 'youtube';
  context: LeetCodeProblem | YouTubeContext;
  userQuery?: string;
  previousInteraction?: string;
}

export interface TutorSession {
  sessionId: string;
  type: 'leetcode' | 'youtube';
  interactions: Array<{
    timestamp: number;
    userInput?: string;
    aiResponse: GeminiResponse;
  }>;
  context: LeetCodeProblem | YouTubeContext;
}