import { 
  LearningProgress, 
  SavedVideo, 
  Quiz, 
  SolvedProblem, 
  ProblemMistake, 
  SavedArticle, 
  SavedHighlight, 
  Achievement,
  VideoSection,
  YouTubeContext,
  LeetCodeProblem
} from '../types/index';

export class ProgressTracker {
  private static instance: ProgressTracker;
  private progress: LearningProgress | null = null;

  private constructor() {}

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  async initialize(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['learningProgress']);
      if (result.learningProgress) {
        this.progress = result.learningProgress;
      } else {
        // Initialize new progress
        this.progress = this.createNewProgress();
        await this.saveProgress();
      }
    } catch (error) {
      console.error('Failed to initialize progress tracker:', error);
      this.progress = this.createNewProgress();
    }
  }

  private createNewProgress(): LearningProgress {
    const userId = this.generateUserId();
    return {
      userId,
      platforms: {
        youtube: {
          savedVideos: [],
          completedQuizzes: [],
          watchTime: 0,
          videosCompleted: 0
        },
        leetcode: {
          solvedProblems: [],
          mistakes: [],
          totalAttempts: 0,
          correctSolutions: 0
        },
        general: {
          savedArticles: [],
          highlightedTexts: [],
          helpSessions: 0
        }
      },
      achievements: [],
      totalLearningTime: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  private generateUserId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  async saveProgress(): Promise<void> {
    if (!this.progress) return;
    
    this.progress.updatedAt = Date.now();
    try {
      await chrome.storage.sync.set({ learningProgress: this.progress });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  // YouTube Progress Methods
  async saveVideo(context: YouTubeContext, currentTime: number = 0): Promise<void> {
    if (!this.progress) await this.initialize();
    
    const existingIndex = this.progress!.platforms.youtube.savedVideos.findIndex(
      v => v.url === window.location.href
    );

    const savedVideo: SavedVideo = {
      id: this.generateId(),
      title: context.title,
      url: window.location.href,
      currentTime,
      duration: 0, // Will be updated when available
      smartSections: [],
      notes: '',
      completed: false,
      savedAt: Date.now()
    };

    if (existingIndex >= 0) {
      this.progress!.platforms.youtube.savedVideos[existingIndex] = {
        ...this.progress!.platforms.youtube.savedVideos[existingIndex],
        ...savedVideo,
        id: this.progress!.platforms.youtube.savedVideos[existingIndex].id
      };
    } else {
      this.progress!.platforms.youtube.savedVideos.push(savedVideo);
    }

    await this.saveProgress();
  }

  async updateVideoProgress(url: string, currentTime: number, sections?: VideoSection[]): Promise<void> {
    if (!this.progress) return;

    const video = this.progress.platforms.youtube.savedVideos.find(v => v.url === url);
    if (video) {
      video.currentTime = currentTime;
      if (sections) {
        video.smartSections = sections;
      }
      await this.saveProgress();
    }
  }

  async completeQuiz(quiz: Quiz): Promise<void> {
    if (!this.progress) return;

    quiz.completedAt = Date.now();
    this.progress.platforms.youtube.completedQuizzes.push(quiz);
    
    // Check for achievements
    await this.checkQuizAchievements(quiz);
    await this.saveProgress();
  }

  // LeetCode Progress Methods
  async saveSolvedProblem(problem: LeetCodeProblem, solution: string, language: string, attempts: number, hints: string[]): Promise<void> {
    if (!this.progress) await this.initialize();

    const solvedProblem: SolvedProblem = {
      id: this.generateId(),
      title: problem.title,
      difficulty: problem.difficulty,
      solution,
      language,
      solvedAt: Date.now(),
      attempts,
      hints
    };

    this.progress!.platforms.leetcode.solvedProblems.push(solvedProblem);
    this.progress!.platforms.leetcode.totalAttempts += attempts;
    this.progress!.platforms.leetcode.correctSolutions++;

    await this.checkLeetCodeAchievements();
    await this.saveProgress();
  }

  async saveMistake(problemId: string, error: ProblemMistake): Promise<void> {
    if (!this.progress) return;

    this.progress.platforms.leetcode.mistakes.push({
      ...error,
      problemId,
      timestamp: Date.now()
    });

    await this.saveProgress();
  }

  // General Progress Methods
  async saveArticle(title: string, url: string, content: string): Promise<void> {
    if (!this.progress) await this.initialize();

    const savedArticle: SavedArticle = {
      id: this.generateId(),
      title,
      url,
      content,
      savedAt: Date.now(),
      readingProgress: 0
    };

    this.progress!.platforms.general.savedArticles.push(savedArticle);
    await this.saveProgress();
  }

  async saveHighlight(text: string, url: string, context: string, notes: string = ''): Promise<void> {
    if (!this.progress) await this.initialize();

    const highlight: SavedHighlight = {
      id: this.generateId(),
      text,
      url,
      context,
      notes,
      savedAt: Date.now()
    };

    this.progress!.platforms.general.highlightedTexts.push(highlight);
    await this.saveProgress();
  }

  async incrementHelpSessions(): Promise<void> {
    if (!this.progress) await this.initialize();
    
    this.progress!.platforms.general.helpSessions++;
    await this.checkGeneralAchievements();
    await this.saveProgress();
  }

  // Achievement System
  private async checkQuizAchievements(quiz: Quiz): Promise<void> {
    if (!this.progress) return;

    const totalQuizzes = this.progress.platforms.youtube.completedQuizzes.length;
    const score = quiz.score || 0;

    // First quiz achievement
    if (totalQuizzes === 1) {
      await this.unlockAchievement({
        id: 'first_quiz',
        title: 'First Quiz Master',
        description: 'Completed your first interactive quiz!',
        type: 'milestone',
        unlockedAt: Date.now(),
        icon: '🎯'
      });
    }

    // Perfect score achievement
    if (score === 100) {
      await this.unlockAchievement({
        id: 'perfect_quiz',
        title: 'Quiz Perfectionist',
        description: 'Scored 100% on a quiz!',
        type: 'skill',
        unlockedAt: Date.now(),
        icon: '💯'
      });
    }

    // Quiz streak achievements
    if (totalQuizzes === 10) {
      await this.unlockAchievement({
        id: 'quiz_enthusiast',
        title: 'Quiz Enthusiast',
        description: 'Completed 10 quizzes!',
        type: 'milestone',
        unlockedAt: Date.now(),
        icon: '🏆'
      });
    }
  }

  private async checkLeetCodeAchievements(): Promise<void> {
    if (!this.progress) return;

    const solved = this.progress.platforms.leetcode.correctSolutions;

    if (solved === 1) {
      await this.unlockAchievement({
        id: 'first_problem',
        title: 'Problem Solver',
        description: 'Solved your first LeetCode problem!',
        type: 'milestone',
        unlockedAt: Date.now(),
        icon: '🚀'
      });
    }

    if (solved === 50) {
      await this.unlockAchievement({
        id: 'problem_veteran',
        title: 'Coding Veteran',
        description: 'Solved 50 LeetCode problems!',
        type: 'milestone',
        unlockedAt: Date.now(),
        icon: '🎖️'
      });
    }
  }

  private async checkGeneralAchievements(): Promise<void> {
    if (!this.progress) return;

    const sessions = this.progress.platforms.general.helpSessions;

    if (sessions === 10) {
      await this.unlockAchievement({
        id: 'help_seeker',
        title: 'Curious Learner',
        description: 'Asked for help 10 times!',
        type: 'exploration',
        unlockedAt: Date.now(),
        icon: '🤔'
      });
    }
  }

  private async unlockAchievement(achievement: Achievement): Promise<void> {
    if (!this.progress) return;

    // Check if achievement already exists
    const exists = this.progress.achievements.some(a => a.id === achievement.id);
    if (!exists) {
      this.progress.achievements.push(achievement);
    }
  }

  // Getter methods
  getProgress(): LearningProgress | null {
    return this.progress;
  }

  getSavedVideos(): SavedVideo[] {
    return this.progress?.platforms.youtube.savedVideos || [];
  }

  getSolvedProblems(): SolvedProblem[] {
    return this.progress?.platforms.leetcode.solvedProblems || [];
  }

  getAchievements(): Achievement[] {
    return this.progress?.achievements || [];
  }

  getStats() {
    if (!this.progress) return null;

    return {
      totalQuizzes: this.progress.platforms.youtube.completedQuizzes.length,
      totalProblems: this.progress.platforms.leetcode.correctSolutions,
      totalHelpSessions: this.progress.platforms.general.helpSessions,
      totalAchievements: this.progress.achievements.length,
      watchTime: this.progress.platforms.youtube.watchTime,
      accuracy: this.progress.platforms.leetcode.totalAttempts > 0 
        ? (this.progress.platforms.leetcode.correctSolutions / this.progress.platforms.leetcode.totalAttempts * 100).toFixed(1)
        : '0'
    };
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
}