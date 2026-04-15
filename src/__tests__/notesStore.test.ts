import { useNotesStore } from '../stores/notesStore';

function resetStore() {
  useNotesStore.setState({
    notes: [],
    searchQuery: '',
    selectedTags: [],
  });
}

function createTestNote(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Test Note',
    content: 'This is a test note about closures in JavaScript.',
    platform: 'general' as const,
    tags: ['javascript', 'closures'],
    isAIEnhanced: false,
    ...overrides,
  };
}

describe('NotesStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('addNote', () => {
    it('should add a note with auto-generated id and timestamps', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote());

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(1);

      const note = state.notes[0];
      expect(note.title).toBe('Test Note');
      expect(note.content).toBe('This is a test note about closures in JavaScript.');
      expect(note.platform).toBe('general');
      expect(note.tags).toEqual(['javascript', 'closures']);
      expect(note.isAIEnhanced).toBe(false);
      expect(note.id).toMatch(/^note_/);
      expect(note.createdAt).toBeDefined();
      expect(note.updatedAt).toBeDefined();
    });

    it('should prepend new notes to the list', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ title: 'Note 1' }));
      store.addNote(createTestNote({ title: 'Note 2' }));

      const state = useNotesStore.getState();
      expect(state.notes[0].title).toBe('Note 2');
      expect(state.notes[1].title).toBe('Note 1');
    });

    it('should use provided id and timestamps when given', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({
        id: 'custom-note-id',
        createdAt: 1000,
        updatedAt: 2000,
      }));

      const note = useNotesStore.getState().notes[0];
      expect(note.id).toBe('custom-note-id');
      expect(note.createdAt).toBe(1000);
      expect(note.updatedAt).toBe(2000);
    });
  });

  describe('updateNote', () => {
    it('should update specified fields and auto-update timestamp', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1' }));

      const beforeUpdate = useNotesStore.getState().notes[0].updatedAt;

      // Small delay to ensure timestamp difference
      store.updateNote('note-1', { title: 'Updated Title', content: 'Updated content' });

      const note = useNotesStore.getState().notes[0];
      expect(note.title).toBe('Updated Title');
      expect(note.content).toBe('Updated content');
      expect(note.updatedAt).toBeGreaterThanOrEqual(beforeUpdate);
    });

    it('should not modify other notes', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1', title: 'Note 1' }));
      store.addNote(createTestNote({ id: 'note-2', title: 'Note 2' }));

      store.updateNote('note-1', { title: 'Updated' });

      const state = useNotesStore.getState();
      expect(state.notes.find(n => n.id === 'note-2')!.title).toBe('Note 2');
    });
  });

  describe('deleteNote', () => {
    it('should remove a note by id', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1' }));
      store.addNote(createTestNote({ id: 'note-2' }));

      store.deleteNote('note-1');

      const state = useNotesStore.getState();
      expect(state.notes).toHaveLength(1);
      expect(state.notes[0].id).toBe('note-2');
    });

    it('should handle deleting non-existent note gracefully', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1' }));
      store.deleteNote('non-existent');

      expect(useNotesStore.getState().notes).toHaveLength(1);
    });
  });

  describe('searchNotes', () => {
    it('should set the search query', () => {
      const store = useNotesStore.getState();
      store.searchNotes('javascript');

      expect(useNotesStore.getState().searchQuery).toBe('javascript');
    });

    it('should clear search query with empty string', () => {
      const store = useNotesStore.getState();
      store.searchNotes('something');
      store.searchNotes('');

      expect(useNotesStore.getState().searchQuery).toBe('');
    });
  });

  describe('filterByTags', () => {
    it('should set selected tags', () => {
      const store = useNotesStore.getState();
      store.filterByTags(['javascript', 'react']);

      expect(useNotesStore.getState().selectedTags).toEqual(['javascript', 'react']);
    });

    it('should clear filters with empty array', () => {
      const store = useNotesStore.getState();
      store.filterByTags(['javascript']);
      store.filterByTags([]);

      expect(useNotesStore.getState().selectedTags).toEqual([]);
    });
  });

  describe('getAllTags', () => {
    it('should return sorted unique tags from all notes', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'n1', tags: ['react', 'javascript'] }));
      store.addNote(createTestNote({ id: 'n2', tags: ['python', 'javascript'] }));
      store.addNote(createTestNote({ id: 'n3', tags: ['algorithms', 'python'] }));

      const tags = store.getAllTags();
      expect(tags).toEqual(['algorithms', 'javascript', 'python', 'react']);
    });

    it('should return empty array when no notes exist', () => {
      expect(useNotesStore.getState().getAllTags()).toEqual([]);
    });
  });

  describe('getFilteredNotes', () => {
    beforeEach(() => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({
        id: 'n1',
        title: 'JavaScript Closures',
        content: 'Closures capture variables from outer scope',
        tags: ['javascript', 'closures'],
      }));
      store.addNote(createTestNote({
        id: 'n2',
        title: 'Python Lists',
        content: 'Python lists are dynamic arrays',
        tags: ['python', 'data-structures'],
      }));
      store.addNote(createTestNote({
        id: 'n3',
        title: 'React Hooks',
        content: 'Hooks allow state in functional components',
        tags: ['javascript', 'react'],
      }));
    });

    it('should return all notes when no filters are applied', () => {
      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(3);
    });

    it('should filter by search query in title', () => {
      const store = useNotesStore.getState();
      store.searchNotes('python');

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('n2');
    });

    it('should filter by search query in content', () => {
      const store = useNotesStore.getState();
      store.searchNotes('dynamic arrays');

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('n2');
    });

    it('should filter by search query in tags', () => {
      const store = useNotesStore.getState();
      store.searchNotes('react');

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('n3');
    });

    it('should be case-insensitive in search', () => {
      const store = useNotesStore.getState();
      store.searchNotes('JAVASCRIPT');

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(2); // n1 (title has JavaScript) and n3 (tag has javascript)
    });

    it('should filter by selected tags (AND logic)', () => {
      const store = useNotesStore.getState();
      store.filterByTags(['javascript']);

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(2); // n1 and n3

      store.filterByTags(['javascript', 'closures']);
      const notes2 = useNotesStore.getState().getFilteredNotes();
      expect(notes2).toHaveLength(1); // Only n1 has both tags
    });

    it('should combine search query and tag filtering', () => {
      const store = useNotesStore.getState();
      store.searchNotes('hooks');
      store.filterByTags(['javascript']);

      const notes = useNotesStore.getState().getFilteredNotes();
      expect(notes).toHaveLength(1);
      expect(notes[0].id).toBe('n3');
    });
  });

  describe('enhanceNoteWithAI', () => {
    it('should preserve original content and mark as AI enhanced', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1', content: 'Original content' }));

      store.enhanceNoteWithAI('note-1', 'AI Enhanced content with more detail');

      const note = useNotesStore.getState().notes[0];
      expect(note.content).toBe('AI Enhanced content with more detail');
      expect(note.originalContent).toBe('Original content');
      expect(note.isAIEnhanced).toBe(true);
    });

    it('should not overwrite originalContent on subsequent enhancements', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1', content: 'First version' }));

      store.enhanceNoteWithAI('note-1', 'Second version');
      store.enhanceNoteWithAI('note-1', 'Third version');

      const note = useNotesStore.getState().notes[0];
      expect(note.content).toBe('Third version');
      expect(note.originalContent).toBe('First version');
    });

    it('should update the updatedAt timestamp', () => {
      const store = useNotesStore.getState();
      store.addNote(createTestNote({ id: 'note-1', updatedAt: 1000 }));

      store.enhanceNoteWithAI('note-1', 'Enhanced');

      const note = useNotesStore.getState().notes[0];
      expect(note.updatedAt).toBeGreaterThan(1000);
    });
  });
});
