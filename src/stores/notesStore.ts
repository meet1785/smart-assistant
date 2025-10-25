import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  platform: 'leetcode' | 'youtube' | 'general';
  sourceUrl?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  sessionId?: string;
  isAIEnhanced: boolean;
  originalContent?: string; // Store original before AI enhancement
}

export interface NotesState {
  notes: Note[];
  searchQuery: string;
  selectedTags: string[];
  
  // Actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  searchNotes: (query: string) => void;
  filterByTags: (tags: string[]) => void;
  getAllTags: () => string[];
  getFilteredNotes: () => Note[];
  enhanceNoteWithAI: (id: string, enhancedContent: string) => void;
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      searchQuery: '',
      selectedTags: [],

      addNote: (noteData) => {
        const note: Note = {
          ...noteData,
          id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          notes: [note, ...state.notes]
        }));
      },

      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: Date.now() }
              : note
          )
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id)
        }));
      },

      searchNotes: (query) => {
        set({ searchQuery: query });
      },

      filterByTags: (tags) => {
        set({ selectedTags: tags });
      },

      getAllTags: () => {
        const state = get();
        const tagSet = new Set<string>();
        state.notes.forEach((note) => {
          note.tags.forEach((tag) => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
      },

      getFilteredNotes: () => {
        const state = get();
        let filtered = [...state.notes];

        // Filter by search query
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase();
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query) ||
              note.tags.some((tag) => tag.toLowerCase().includes(query))
          );
        }

        // Filter by selected tags
        if (state.selectedTags.length > 0) {
          filtered = filtered.filter((note) =>
            state.selectedTags.every((tag) => note.tags.includes(tag))
          );
        }

        return filtered;
      },

      enhanceNoteWithAI: (id, enhancedContent) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  originalContent: note.originalContent || note.content,
                  content: enhancedContent,
                  isAIEnhanced: true,
                  updatedAt: Date.now()
                }
              : note
          )
        }));
      }
    }),
    {
      name: 'leeco-ai-notes',
      partialize: (state) => ({
        notes: state.notes
      })
    }
  )
);
