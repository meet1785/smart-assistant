import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  assistanceStyle: 'direct' | 'progressive' | 'comprehensive';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  platforms: {
    leetcode: boolean;
    youtube: boolean;
    general: boolean;
  };
  notifications: {
    achievements: boolean;
    reminders: boolean;
    progress: boolean;
  };
  features: {
    voiceInteraction: boolean;
    realTimeHints: boolean;
    mockInterviews: boolean;
    learningPaths: boolean;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  level: number;
  experience: number;
  streak: number;
  joinedAt: Date;
  preferences: UserPreferences;
}

export interface UserState {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  apiKey: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  setApiKey: (apiKey: string) => void;
  clearUser: () => void;
  incrementExperience: (amount: number) => void;
  updateStreak: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: 'auto',
  language: 'en',
  assistanceStyle: 'comprehensive',
  difficulty: 'intermediate',
  platforms: {
    leetcode: true,
    youtube: true,
    general: true
  },
  notifications: {
    achievements: true,
    reminders: true,
    progress: true
  },
  features: {
    voiceInteraction: true,
    realTimeHints: true,
    mockInterviews: true,
    learningPaths: true
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isAuthenticated: false,
      apiKey: null,

      setProfile: (profile) => set({ profile, isAuthenticated: true }),

      updatePreferences: (newPreferences) => set((state) => ({
        profile: state.profile ? {
          ...state.profile,
          preferences: { ...state.profile.preferences, ...newPreferences }
        } : null
      })),

      setApiKey: (apiKey) => set({ apiKey }),

      clearUser: () => set({ 
        profile: null, 
        isAuthenticated: false, 
        apiKey: null 
      }),

      incrementExperience: (amount) => set((state) => {
        if (!state.profile) return state;
        
        const newExperience = state.profile.experience + amount;
        const newLevel = Math.floor(newExperience / 100) + 1;
        
        return {
          profile: {
            ...state.profile,
            experience: newExperience,
            level: newLevel
          }
        };
      }),

      updateStreak: () => set((state) => {
        if (!state.profile) return state;
        
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem('lastActiveDate');
        
        let newStreak = state.profile.streak;
        
        if (lastActive) {
          const lastDate = new Date(lastActive);
          const daysDiff = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff === 1) {
            // Consecutive day
            newStreak += 1;
          } else if (daysDiff > 1) {
            // Streak broken
            newStreak = 1;
          }
          // Same day, no change
        } else {
          newStreak = 1;
        }
        
        localStorage.setItem('lastActiveDate', today);
        
        return {
          profile: {
            ...state.profile,
            streak: newStreak
          }
        };
      })
    }),
    {
      name: 'leeco-ai-user',
      partialize: (state) => ({
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
        apiKey: state.apiKey
      })
    }
  )
);