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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  concepts: string[];
  relatedSections: string[];
}

// Enhanced Learning Features
export interface StudyDashboard {
  todayStats: DailyStats;
  weeklyProgress: WeeklyProgress;
  learningStreak: number;
  upcomingReviews: ReviewItem[];
  recommendations: LearningRecommendation[];
  studyGoals: StudyGoal[];
}

export interface DailyStats {
  timeSpent: number;
  problemsSolved: number;
  videosWatched: number;
  notesCreated: number;
  flashcardsReviewed: number;
  achievementsUnlocked: number;
}

export interface WeeklyProgress {
  days: DailyStats[];
  totalTime: number;
  averageTime: number;
  completionRate: number;
  streakDays: number;
}

export interface ReviewItem {
  id: string;
  type: 'concept' | 'problem' | 'video' | 'note';
  title: string;
  dueDate: number;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: number;
}

export interface LearningRecommendation {
  id: string;
  type: 'video' | 'problem' | 'concept' | 'review';
  title: string;
  description: string;
  reason: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url?: string;
  confidence: number;
}

export interface StudyGoal {
  id: string;
  title: string;
  description: string;
  type: 'time' | 'problems' | 'videos' | 'concepts';
  target: number;
  current: number;
  deadline: number;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused';
}

export interface SmartNote {
  id: string;
  title: string;
  content: string;
  type: 'manual' | 'ai-generated' | 'code-snippet' | 'video-summary';
  tags: string[];
  sourceUrl?: string;
  sourceType?: 'youtube' | 'leetcode' | 'article';
  createdAt: number;
  updatedAt: number;
  importance: 'low' | 'medium' | 'high';
  reviewCount: number;
  lastReviewed?: number;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'concept' | 'code' | 'formula' | 'definition';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  createdAt: number;
  lastReviewed?: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  intervalDays: number;
  easeFactor: number;
}

export interface CodeAnalysis {
  id: string;
  code: string;
  language: string;
  analysis: {
    complexity: {
      time: string;
      space: string;
      cyclomatic: number;
    };
    suggestions: CodeSuggestion[];
    patterns: DetectedPattern[];
    performance: PerformanceMetric[];
    security: SecurityIssue[];
    style: StyleIssue[];
  };
  createdAt: number;
}

export interface CodeSuggestion {
  type: 'optimization' | 'refactor' | 'best-practice' | 'bug-fix';
  description: string;
  before: string;
  after: string;
  impact: 'low' | 'medium' | 'high';
  confidence: number;
}

export interface DetectedPattern {
  name: string;
  description: string;
  location: {
    startLine: number;
    endLine: number;
  };
  confidence: number;
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  recommendation?: string;
}

export interface SecurityIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    line: number;
    column: number;
  };
  fix: string;
}

export interface StyleIssue {
  type: 'formatting' | 'naming' | 'structure';
  description: string;
  location: {
    line: number;
    column: number;
  };
  suggestion: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  category: 'algorithms' | 'data-structures' | 'web-dev' | 'ai-ml' | 'systems';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  prerequisites: string[];
  modules: LearningModule[];
  completionRate: number;
  enrolledAt?: number;
  completedAt?: number;
}

export interface LearningModule {
  id: string;
  title: string;
  type: 'video' | 'problem' | 'reading' | 'project';
  content: ModuleContent;
  estimatedTime: number;
  completed: boolean;
  score?: number;
  attempts: number;
}

export interface ModuleContent {
  videos?: string[];
  problems?: string[];
  articles?: string[];
  projects?: ProjectContent[];
}

export interface ProjectContent {
  title: string;
  description: string;
  requirements: string[];
  starterCode?: string;
  testCases: string[];
}

export interface VoiceInteraction {
  sessionId: string;
  query: string;
  response: string;
  accuracy: number;
  language: string;
  timestamp: number;
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