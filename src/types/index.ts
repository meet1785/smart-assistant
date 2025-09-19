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
  type: 'leetcode' | 'youtube' | 'general';
  context: LeetCodeProblem | YouTubeContext | GeneralContext;
  userQuery?: string;
  previousInteraction?: string;
  requestedFeature?: 'quiz' | 'summary' | 'sections' | 'hints' | 'approach' | 'testcases' | 'errors';
}

export interface TutorSession {
  sessionId: string;
  type: 'leetcode' | 'youtube' | 'general';
  interactions: Array<{
    timestamp: number;
    userInput?: string;
    aiResponse: GeminiResponse;
  }>;
  context: LeetCodeProblem | YouTubeContext | GeneralContext;
}

// New interfaces for enhanced functionality
export interface GeneralContext {
  title: string;
  url: string;
  selectedText?: string;
  pageContent?: string;
}

export interface LearningProgress {
  userId: string;
  platforms: {
    youtube: YouTubeProgress;
    leetcode: LeetCodeProgress;
    general: GeneralProgress;
  };
  achievements: Achievement[];
  totalLearningTime: number;
  createdAt: number;
  updatedAt: number;
}

export interface YouTubeProgress {
  savedVideos: SavedVideo[];
  completedQuizzes: Quiz[];
  watchTime: number;
  videosCompleted: number;
}

export interface LeetCodeProgress {
  solvedProblems: SolvedProblem[];
  mistakes: ProblemMistake[];
  totalAttempts: number;
  correctSolutions: number;
}

export interface GeneralProgress {
  savedArticles: SavedArticle[];
  highlightedTexts: SavedHighlight[];
  helpSessions: number;
}

export interface SavedVideo {
  id: string;
  title: string;
  url: string;
  currentTime: number;
  duration: number;
  smartSections: VideoSection[];
  notes: string;
  completed: boolean;
  savedAt: number;
}

export interface VideoSection {
  title: string;
  startTime: number;
  endTime: number;
  summary: string;
  keyPoints: string[];
  quiz?: Quiz;
}

export interface Quiz {
  id: string;
  questions: QuizQuestion[];
  score?: number;
  completedAt?: number;
  attempts: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

export interface SolvedProblem {
  id: string;
  title: string;
  difficulty: string;
  solution: string;
  language: string;
  solvedAt: number;
  attempts: number;
  hints: string[];
}

export interface ProblemMistake {
  problemId: string;
  errorType: string;
  errorMessage: string;
  incorrectCode: string;
  correction: string;
  explanation: string;
  timestamp: number;
}

export interface SavedArticle {
  id: string;
  title: string;
  url: string;
  content: string;
  savedAt: number;
  readingProgress: number;
}

export interface SavedHighlight {
  id: string;
  text: string;
  url: string;
  context: string;
  notes: string;
  savedAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'milestone' | 'skill' | 'exploration';
  unlockedAt: number;
  icon: string;
}