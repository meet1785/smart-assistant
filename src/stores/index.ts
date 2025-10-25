// Export all stores
export { useUserStore } from './userStore';
export type { UserState, UserProfile, UserPreferences } from './userStore';

export { useLearningStore } from './learningStore';
export type { LearningState, LearningSession, StudyStats } from './learningStore';

export { useNotesStore } from './notesStore';
export type { NotesState, Note } from './notesStore';