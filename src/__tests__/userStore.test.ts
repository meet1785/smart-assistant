import { useUserStore } from '../stores/userStore';
import type { UserProfile } from '../stores/userStore';

function resetStore() {
  useUserStore.setState({
    profile: null,
    isAuthenticated: false,
    apiKey: null,
  });
  localStorage.clear();
}

function createTestProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    level: 1,
    experience: 0,
    streak: 0,
    joinedAt: new Date('2024-01-01'),
    preferences: {
      theme: 'auto',
      language: 'en',
      assistanceStyle: 'comprehensive',
      difficulty: 'intermediate',
      platforms: { leetcode: true, youtube: true, general: true },
      notifications: { achievements: true, reminders: true, progress: true },
      features: {
        voiceInteraction: true,
        realTimeHints: true,
        mockInterviews: true,
        learningPaths: true,
      },
    },
    ...overrides,
  };
}

describe('UserStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial state', () => {
    it('should start with null profile and unauthenticated', () => {
      const state = useUserStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.apiKey).toBeNull();
    });
  });

  describe('setProfile', () => {
    it('should set profile and mark as authenticated', () => {
      const profile = createTestProfile();
      useUserStore.getState().setProfile(profile);

      const state = useUserStore.getState();
      expect(state.profile).toEqual(profile);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should overwrite existing profile', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ name: 'User A' }));
      store.setProfile(createTestProfile({ name: 'User B' }));

      expect(useUserStore.getState().profile!.name).toBe('User B');
    });
  });

  describe('updatePreferences', () => {
    it('should partially update preferences', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile());
      store.updatePreferences({ theme: 'dark', language: 'es' });

      const prefs = useUserStore.getState().profile!.preferences;
      expect(prefs.theme).toBe('dark');
      expect(prefs.language).toBe('es');
      // Other preferences should remain unchanged
      expect(prefs.assistanceStyle).toBe('comprehensive');
      expect(prefs.difficulty).toBe('intermediate');
    });

    it('should do nothing when no profile exists', () => {
      const store = useUserStore.getState();
      store.updatePreferences({ theme: 'dark' });

      expect(useUserStore.getState().profile).toBeNull();
    });
  });

  describe('setApiKey', () => {
    it('should store the API key', () => {
      useUserStore.getState().setApiKey('AIzaTestKey123456789012345678901');

      expect(useUserStore.getState().apiKey).toBe('AIzaTestKey123456789012345678901');
    });
  });

  describe('clearUser', () => {
    it('should reset profile, auth status, and API key', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile());
      store.setApiKey('some-key');
      store.clearUser();

      const state = useUserStore.getState();
      expect(state.profile).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.apiKey).toBeNull();
    });
  });

  describe('incrementExperience', () => {
    it('should add experience points', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ experience: 0, level: 1 }));
      store.incrementExperience(50);

      const profile = useUserStore.getState().profile!;
      expect(profile.experience).toBe(50);
    });

    it('should calculate level based on 100 XP per level', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ experience: 0, level: 1 }));

      store.incrementExperience(99);
      expect(useUserStore.getState().profile!.level).toBe(1); // 99 XP = floor(99/100)+1 = 1

      store.incrementExperience(1);
      expect(useUserStore.getState().profile!.level).toBe(2); // 100 XP = floor(100/100)+1 = 2

      store.incrementExperience(100);
      expect(useUserStore.getState().profile!.level).toBe(3); // 200 XP = floor(200/100)+1 = 3
    });

    it('should do nothing when no profile exists', () => {
      useUserStore.getState().incrementExperience(100);
      expect(useUserStore.getState().profile).toBeNull();
    });

    it('should accumulate experience across multiple increments', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ experience: 0 }));

      store.incrementExperience(30);
      store.incrementExperience(25);
      store.incrementExperience(45);

      expect(useUserStore.getState().profile!.experience).toBe(100);
      expect(useUserStore.getState().profile!.level).toBe(2);
    });
  });

  describe('updateStreak', () => {
    it('should start streak at 1 on first activity', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ streak: 0 }));
      store.updateStreak();

      expect(useUserStore.getState().profile!.streak).toBe(1);
      expect(localStorage.setItem).toHaveBeenCalledWith('lastActiveDate', new Date().toDateString());
    });

    it('should increment streak for consecutive days', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ streak: 5 }));

      // Simulate yesterday's date in localStorage
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(yesterday.toDateString());

      store.updateStreak();
      expect(useUserStore.getState().profile!.streak).toBe(6);
    });

    it('should reset streak when more than 1 day gap', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ streak: 10 }));

      // Simulate 3 days ago
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(threeDaysAgo.toDateString());

      store.updateStreak();
      expect(useUserStore.getState().profile!.streak).toBe(1);
    });

    it('should not change streak on same day', () => {
      const store = useUserStore.getState();
      store.setProfile(createTestProfile({ streak: 5 }));

      // Simulate today's date in localStorage
      const today = new Date().toDateString();
      (localStorage.getItem as jest.Mock).mockReturnValueOnce(today);

      store.updateStreak();
      // daysDiff = 0, no change
      expect(useUserStore.getState().profile!.streak).toBe(5);
    });

    it('should do nothing when no profile exists', () => {
      useUserStore.getState().updateStreak();
      expect(useUserStore.getState().profile).toBeNull();
    });
  });
});
