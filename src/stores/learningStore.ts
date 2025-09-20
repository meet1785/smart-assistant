import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LearningGoal, LearningPath } from '../features/learning';

export interface LearningSession {
  id: string;
  type: 'leetcode' | 'youtube' | 'interview' | 'general';
  platform: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  topics: string[];
  problems?: {
    attempted: number;
    solved: number;
    difficulty: Record<string, number>;
  };
  notes: string;
  achievements: string[];
}

export interface StudyStats {
  totalHours: number;
  sessionsCount: number;
  problemsSolved: number;
  averageSessionLength: number;
  favoriteTopics: string[];
  weakAreas: string[];
  strongAreas: string[];
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface LearningState {
  currentSession: LearningSession | null;
  recentSessions: LearningSession[];
  goals: LearningGoal[];
  paths: LearningPath[];
  stats: StudyStats;
  
  // Actions
  startSession: (type: LearningSession['type'], platform: string) => void;
  endSession: (notes?: string) => void;
  addGoal: (goal: LearningGoal) => void;
  updateGoal: (goalId: string, updates: Partial<LearningGoal>) => void;
  removeGoal: (goalId: string) => void;
  addPath: (path: LearningPath) => void;
  updatePath: (pathId: string, updates: Partial<LearningPath>) => void;
  removePath: (pathId: string) => void;
  updateStats: (updates: Partial<StudyStats>) => void;
  addProblemSolved: (difficulty: 'easy' | 'medium' | 'hard') => void;
  addAchievement: (achievement: string) => void;
}

const defaultStats: StudyStats = {
  totalHours: 0,
  sessionsCount: 0,
  problemsSolved: 0,
  averageSessionLength: 0,
  favoriteTopics: [],
  weakAreas: [],
  strongAreas: [],
  weeklyGoal: 10, // hours
  weeklyProgress: 0
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      recentSessions: [],
      goals: [],
      paths: [],
      stats: defaultStats,

      startSession: (type, platform) => {
        const session: LearningSession = {
          id: Date.now().toString(),
          type,
          platform,
          startTime: new Date(),
          duration: 0,
          topics: [],
          notes: '',
          achievements: []
        };
        set({ currentSession: session });
      },

      endSession: (notes = '') => {
        const state = get();
        if (!state.currentSession) return;

        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - state.currentSession.startTime.getTime()) / (1000 * 60));
        
        const completedSession: LearningSession = {
          ...state.currentSession,
          endTime,
          duration,
          notes
        };

        set((state) => ({
          currentSession: null,
          recentSessions: [completedSession, ...state.recentSessions.slice(0, 49)], // Keep last 50 sessions
          stats: {
            ...state.stats,
            totalHours: state.stats.totalHours + (duration / 60),
            sessionsCount: state.stats.sessionsCount + 1,
            averageSessionLength: Math.round(
              ((state.stats.averageSessionLength * state.stats.sessionsCount) + duration) / 
              (state.stats.sessionsCount + 1)
            )
          }
        }));
      },

      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, goal]
      })),

      updateGoal: (goalId, updates) => set((state) => ({
        goals: state.goals.map(goal => 
          goal.id === goalId ? { ...goal, ...updates } : goal
        )
      })),

      removeGoal: (goalId) => set((state) => ({
        goals: state.goals.filter(goal => goal.id !== goalId)
      })),

      addPath: (path) => set((state) => ({
        paths: [...state.paths, path]
      })),

      updatePath: (pathId, updates) => set((state) => ({
        paths: state.paths.map(path => 
          path.id === pathId ? { ...path, ...updates } : path
        )
      })),

      removePath: (pathId) => set((state) => ({
        paths: state.paths.filter(path => path.id !== pathId)
      })),

      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),

      addProblemSolved: (difficulty) => set((state) => {
        const currentSession = state.currentSession;
        if (currentSession) {
          const updatedProblems = {
            attempted: (currentSession.problems?.attempted || 0) + 1,
            solved: (currentSession.problems?.solved || 0) + 1,
            difficulty: {
              ...currentSession.problems?.difficulty,
              [difficulty]: (currentSession.problems?.difficulty?.[difficulty] || 0) + 1
            }
          };

          return {
            currentSession: {
              ...currentSession,
              problems: updatedProblems
            },
            stats: {
              ...state.stats,
              problemsSolved: state.stats.problemsSolved + 1
            }
          };
        }
        
        return {
          stats: {
            ...state.stats,
            problemsSolved: state.stats.problemsSolved + 1
          }
        };
      }),

      addAchievement: (achievement) => set((state) => {
        if (state.currentSession) {
          return {
            currentSession: {
              ...state.currentSession,
              achievements: [...state.currentSession.achievements, achievement]
            }
          };
        }
        return state;
      })
    }),
    {
      name: 'learnai-learning',
      partialize: (state) => ({
        recentSessions: state.recentSessions,
        goals: state.goals,
        paths: state.paths,
        stats: state.stats
      })
    }
  )
);