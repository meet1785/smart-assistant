import { useLearningStore } from '../stores/learningStore';
import type { LearningGoal, LearningPath } from '../features/learning';

function resetStore() {
  useLearningStore.setState({
    currentSession: null,
    recentSessions: [],
    goals: [],
    paths: [],
    stats: {
      totalHours: 0,
      sessionsCount: 0,
      problemsSolved: 0,
      averageSessionLength: 0,
      favoriteTopics: [],
      weakAreas: [],
      strongAreas: [],
      weeklyGoal: 10,
      weeklyProgress: 0,
    },
  });
}

function createTestGoal(overrides: Partial<LearningGoal> = {}): LearningGoal {
  return {
    id: 'goal-1',
    title: 'Learn Dynamic Programming',
    description: 'Master DP patterns',
    category: 'algorithms',
    difficulty: 'intermediate',
    estimatedHours: 20,
    completedHours: 0,
    isCompleted: false,
    milestones: [],
    resources: [],
    ...overrides,
  };
}

function createTestPath(overrides: Partial<LearningPath> = {}): LearningPath {
  return {
    id: 'path-1',
    name: 'Interview Prep',
    description: 'Full interview preparation path',
    category: 'interview-prep',
    difficulty: 'intermediate',
    estimatedWeeks: 8,
    goals: [],
    isActive: true,
    progress: 0,
    createdAt: new Date(),
    lastUpdated: new Date(),
    ...overrides,
  };
}

describe('LearningStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('Initial state', () => {
    it('should start with default values', () => {
      const state = useLearningStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.recentSessions).toEqual([]);
      expect(state.goals).toEqual([]);
      expect(state.paths).toEqual([]);
      expect(state.stats.totalHours).toBe(0);
      expect(state.stats.sessionsCount).toBe(0);
      expect(state.stats.weeklyGoal).toBe(10);
    });
  });

  describe('Session Management', () => {
    it('should start a new learning session', () => {
      useLearningStore.getState().startSession('leetcode', 'LeetCode');

      const state = useLearningStore.getState();
      expect(state.currentSession).not.toBeNull();
      expect(state.currentSession!.type).toBe('leetcode');
      expect(state.currentSession!.platform).toBe('LeetCode');
      expect(state.currentSession!.duration).toBe(0);
      expect(state.currentSession!.topics).toEqual([]);
      expect(state.currentSession!.notes).toBe('');
      expect(state.currentSession!.achievements).toEqual([]);
    });

    it('should end a session and update stats', () => {
      const store = useLearningStore.getState();
      store.startSession('youtube', 'YouTube');

      // Manually adjust startTime to simulate elapsed time
      const session = useLearningStore.getState().currentSession!;
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      useLearningStore.setState({
        currentSession: { ...session, startTime: twoMinutesAgo },
      });

      useLearningStore.getState().endSession('Great session');

      const state = useLearningStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.recentSessions).toHaveLength(1);
      expect(state.recentSessions[0].notes).toBe('Great session');
      expect(state.recentSessions[0].duration).toBeGreaterThanOrEqual(1);
      expect(state.stats.sessionsCount).toBe(1);
    });

    it('should default notes to empty string when not provided', () => {
      const store = useLearningStore.getState();
      store.startSession('general', 'Web');
      store.endSession();

      expect(useLearningStore.getState().recentSessions[0].notes).toBe('');
    });

    it('should do nothing when ending session without active session', () => {
      useLearningStore.getState().endSession('notes');

      const state = useLearningStore.getState();
      expect(state.recentSessions).toEqual([]);
      expect(state.stats.sessionsCount).toBe(0);
    });

    it('should keep only last 50 sessions', () => {
      const store = useLearningStore.getState();

      // Add 50 sessions to recentSessions directly
      const sessions = Array.from({ length: 50 }, (_, i) => ({
        id: `session-${i}`,
        type: 'general' as const,
        platform: 'web',
        startTime: new Date(),
        duration: 10,
        topics: [],
        notes: '',
        achievements: [],
      }));

      useLearningStore.setState({ recentSessions: sessions });

      // Start and end one more session
      store.startSession('leetcode', 'LC');
      useLearningStore.getState().endSession();

      const state = useLearningStore.getState();
      expect(state.recentSessions.length).toBeLessThanOrEqual(50);
    });

    it('should calculate average session length correctly', () => {
      const store = useLearningStore.getState();

      // First session: 10 minutes
      store.startSession('leetcode', 'LC');
      const session1 = useLearningStore.getState().currentSession!;
      useLearningStore.setState({
        currentSession: { ...session1, startTime: new Date(Date.now() - 10 * 60 * 1000) },
      });
      useLearningStore.getState().endSession();

      // Second session: 20 minutes
      store.startSession('youtube', 'YT');
      const session2 = useLearningStore.getState().currentSession!;
      useLearningStore.setState({
        currentSession: { ...session2, startTime: new Date(Date.now() - 20 * 60 * 1000) },
      });
      useLearningStore.getState().endSession();

      const stats = useLearningStore.getState().stats;
      expect(stats.sessionsCount).toBe(2);
      // Average should be approximately 15 minutes
      expect(stats.averageSessionLength).toBeGreaterThanOrEqual(14);
      expect(stats.averageSessionLength).toBeLessThanOrEqual(16);
    });
  });

  describe('Goal Management', () => {
    it('should add a goal', () => {
      const goal = createTestGoal();
      useLearningStore.getState().addGoal(goal);

      const state = useLearningStore.getState();
      expect(state.goals).toHaveLength(1);
      expect(state.goals[0]).toEqual(goal);
    });

    it('should update a goal', () => {
      const store = useLearningStore.getState();
      store.addGoal(createTestGoal({ id: 'goal-1' }));
      store.updateGoal('goal-1', { completedHours: 10, isCompleted: false });

      const goal = useLearningStore.getState().goals[0];
      expect(goal.completedHours).toBe(10);
      expect(goal.title).toBe('Learn Dynamic Programming');
    });

    it('should remove a goal', () => {
      const store = useLearningStore.getState();
      store.addGoal(createTestGoal({ id: 'goal-1' }));
      store.addGoal(createTestGoal({ id: 'goal-2', title: 'Learn Graphs' }));
      store.removeGoal('goal-1');

      const state = useLearningStore.getState();
      expect(state.goals).toHaveLength(1);
      expect(state.goals[0].id).toBe('goal-2');
    });

    it('should handle removing non-existent goal gracefully', () => {
      const store = useLearningStore.getState();
      store.addGoal(createTestGoal({ id: 'goal-1' }));
      store.removeGoal('non-existent');

      expect(useLearningStore.getState().goals).toHaveLength(1);
    });
  });

  describe('Path Management', () => {
    it('should add a path', () => {
      const path = createTestPath();
      useLearningStore.getState().addPath(path);

      expect(useLearningStore.getState().paths).toHaveLength(1);
      expect(useLearningStore.getState().paths[0]).toEqual(path);
    });

    it('should update a path', () => {
      const store = useLearningStore.getState();
      store.addPath(createTestPath({ id: 'path-1' }));
      store.updatePath('path-1', { progress: 50, isActive: true });

      const path = useLearningStore.getState().paths[0];
      expect(path.progress).toBe(50);
      expect(path.name).toBe('Interview Prep');
    });

    it('should remove a path', () => {
      const store = useLearningStore.getState();
      store.addPath(createTestPath({ id: 'path-1' }));
      store.addPath(createTestPath({ id: 'path-2', name: 'System Design' }));
      store.removePath('path-1');

      const state = useLearningStore.getState();
      expect(state.paths).toHaveLength(1);
      expect(state.paths[0].id).toBe('path-2');
    });
  });

  describe('updateStats', () => {
    it('should partially update stats', () => {
      useLearningStore.getState().updateStats({
        favoriteTopics: ['arrays', 'trees'],
        weeklyProgress: 5,
      });

      const stats = useLearningStore.getState().stats;
      expect(stats.favoriteTopics).toEqual(['arrays', 'trees']);
      expect(stats.weeklyProgress).toBe(5);
      // Default values should remain
      expect(stats.weeklyGoal).toBe(10);
      expect(stats.totalHours).toBe(0);
    });
  });

  describe('addProblemSolved', () => {
    it('should increment problemsSolved in stats', () => {
      useLearningStore.getState().addProblemSolved('medium');

      expect(useLearningStore.getState().stats.problemsSolved).toBe(1);
    });

    it('should update current session problems when session is active', () => {
      const store = useLearningStore.getState();
      store.startSession('leetcode', 'LC');
      store.addProblemSolved('easy');
      store.addProblemSolved('medium');
      store.addProblemSolved('easy');

      const session = useLearningStore.getState().currentSession!;
      expect(session.problems!.solved).toBe(3);
      expect(session.problems!.attempted).toBe(3);
      expect(session.problems!.difficulty['easy']).toBe(2);
      expect(session.problems!.difficulty['medium']).toBe(1);

      expect(useLearningStore.getState().stats.problemsSolved).toBe(3);
    });

    it('should only update stats when no session is active', () => {
      useLearningStore.getState().addProblemSolved('hard');

      const state = useLearningStore.getState();
      expect(state.currentSession).toBeNull();
      expect(state.stats.problemsSolved).toBe(1);
    });
  });

  describe('addAchievement', () => {
    it('should add achievement to current session', () => {
      const store = useLearningStore.getState();
      store.startSession('leetcode', 'LC');
      store.addAchievement('first-problem-solved');
      store.addAchievement('speed-demon');

      const session = useLearningStore.getState().currentSession!;
      expect(session.achievements).toEqual(['first-problem-solved', 'speed-demon']);
    });

    it('should do nothing when no session is active', () => {
      useLearningStore.getState().addAchievement('some-achievement');

      const state = useLearningStore.getState();
      expect(state.currentSession).toBeNull();
    });
  });
});
