import { useFlashcardStore } from '../stores/flashcardStore';

// Helper to reset the store between tests
function resetStore() {
  const store = useFlashcardStore.getState();
  useFlashcardStore.setState({
    flashcards: [],
    currentSession: null,
    sessionCards: [],
    currentCardIndex: 0,
  });
}

function createTestCard(overrides: Record<string, unknown> = {}) {
  return {
    front: 'What is a closure?',
    back: 'A closure is a function that retains access to its lexical scope.',
    type: 'concept' as const,
    difficulty: 'medium' as const,
    tags: ['javascript', 'fundamentals'],
    ...overrides,
  };
}

describe('FlashcardStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('addFlashcard', () => {
    it('should add a flashcard with default SM-2 values', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard());

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(1);

      const card = state.flashcards[0];
      expect(card.front).toBe('What is a closure?');
      expect(card.back).toBe('A closure is a function that retains access to its lexical scope.');
      expect(card.type).toBe('concept');
      expect(card.difficulty).toBe('medium');
      expect(card.tags).toEqual(['javascript', 'fundamentals']);
      expect(card.reviewCount).toBe(0);
      expect(card.correctCount).toBe(0);
      expect(card.intervalDays).toBe(0);
      expect(card.easeFactor).toBe(2.5);
      expect(card.id).toMatch(/^card_/);
      expect(card.createdAt).toBeDefined();
      expect(card.nextReviewDate).toBeDefined();
    });

    it('should prepend new cards to the list', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ front: 'Card 1' }));
      store.addFlashcard(createTestCard({ front: 'Card 2' }));

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(2);
      expect(state.flashcards[0].front).toBe('Card 2');
      expect(state.flashcards[1].front).toBe('Card 1');
    });

    it('should use provided id and timestamps when given', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'custom-id',
        createdAt: 1000,
        nextReviewDate: 2000,
      }));

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.id).toBe('custom-id');
      expect(card.createdAt).toBe(1000);
      expect(card.nextReviewDate).toBe(2000);
    });
  });

  describe('addFlashcards (batch)', () => {
    it('should add multiple flashcards at once', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ front: 'Q1' }),
        createTestCard({ front: 'Q2' }),
        createTestCard({ front: 'Q3' }),
      ]);

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(3);
    });

    it('should assign unique IDs to each card', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ front: 'Q1' }),
        createTestCard({ front: 'Q2' }),
      ]);

      const state = useFlashcardStore.getState();
      const ids = state.flashcards.map(c => c.id);
      expect(new Set(ids).size).toBe(2);
    });
  });

  describe('updateFlashcard', () => {
    it('should update specified fields of a flashcard', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1' }));
      store.updateFlashcard('card-1', { front: 'Updated question', difficulty: 'hard' });

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.front).toBe('Updated question');
      expect(card.difficulty).toBe('hard');
      expect(card.back).toBe('A closure is a function that retains access to its lexical scope.');
    });

    it('should not modify other cards', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'card-1', front: 'Q1' }),
        createTestCard({ id: 'card-2', front: 'Q2' }),
      ]);
      store.updateFlashcard('card-1', { front: 'Updated' });

      const state = useFlashcardStore.getState();
      expect(state.flashcards.find(c => c.id === 'card-2')!.front).toBe('Q2');
    });
  });

  describe('deleteFlashcard', () => {
    it('should remove a flashcard by id', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'card-1' }),
        createTestCard({ id: 'card-2' }),
      ]);
      store.deleteFlashcard('card-1');

      const state = useFlashcardStore.getState();
      expect(state.flashcards).toHaveLength(1);
      expect(state.flashcards[0].id).toBe('card-2');
    });

    it('should handle deleting non-existent card gracefully', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1' }));
      store.deleteFlashcard('non-existent');

      expect(useFlashcardStore.getState().flashcards).toHaveLength(1);
    });
  });

  describe('SM-2 Algorithm - reviewFlashcard', () => {
    it('should set interval to 1 day on first review (quality >= 3)', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1' }));
      store.reviewFlashcard('card-1', 4);

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.intervalDays).toBe(1);
      expect(card.reviewCount).toBe(1);
      expect(card.correctCount).toBe(1);
      expect(card.lastReviewed).toBeDefined();
    });

    it('should set interval to 6 days on second review (quality >= 3)', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        reviewCount: 1,
        intervalDays: 1,
        easeFactor: 2.5,
      }));
      store.reviewFlashcard('card-1', 4);

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.intervalDays).toBe(6);
      expect(card.reviewCount).toBe(2);
    });

    it('should multiply interval by ease factor on third+ review', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        reviewCount: 2,
        intervalDays: 6,
        easeFactor: 2.5,
      }));
      store.reviewFlashcard('card-1', 4);

      const card = useFlashcardStore.getState().flashcards[0];
      // New ease factor: 2.5 + (0.1 - (5-4)*(0.08 + (5-4)*0.02)) = 2.5 + 0.1 - 0.1 = 2.5
      // New interval: round(6 * 2.5) = 15
      expect(card.intervalDays).toBe(15);
      expect(card.reviewCount).toBe(3);
    });

    it('should reset interval to 1 day on failed review (quality < 3)', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        reviewCount: 5,
        intervalDays: 30,
        easeFactor: 2.5,
      }));
      store.reviewFlashcard('card-1', 1);

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.intervalDays).toBe(1);
      expect(card.correctCount).toBe(0); // Not incremented on failure
    });

    it('should not decrease ease factor below 1.3', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        easeFactor: 1.3,
      }));
      store.reviewFlashcard('card-1', 0);

      const card = useFlashcardStore.getState().flashcards[0];
      expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should increase ease factor with perfect quality (5)', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        easeFactor: 2.5,
      }));
      store.reviewFlashcard('card-1', 5);

      const card = useFlashcardStore.getState().flashcards[0];
      // EF = 2.5 + (0.1 - 0*(0.08 + 0*0.02)) = 2.5 + 0.1 = 2.6
      expect(card.easeFactor).toBeCloseTo(2.6, 2);
    });

    it('should decrease ease factor with low quality (0)', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({
        id: 'card-1',
        easeFactor: 2.5,
      }));
      store.reviewFlashcard('card-1', 0);

      const card = useFlashcardStore.getState().flashcards[0];
      // EF = max(1.3, 2.5 + (0.1 - 5*(0.08 + 5*0.02))) = max(1.3, 2.5 + 0.1 - 5*0.18)
      //    = max(1.3, 2.5 + 0.1 - 0.9) = max(1.3, 1.7) = 1.7
      expect(card.easeFactor).toBeCloseTo(1.7, 2);
    });

    it('should increment correctCount only when quality >= 3', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1' }));

      store.reviewFlashcard('card-1', 2);
      expect(useFlashcardStore.getState().flashcards[0].correctCount).toBe(0);

      store.reviewFlashcard('card-1', 3);
      expect(useFlashcardStore.getState().flashcards[0].correctCount).toBe(1);
    });

    it('should not modify state for non-existent card', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1' }));
      const before = useFlashcardStore.getState().flashcards[0];

      store.reviewFlashcard('non-existent', 5);

      const after = useFlashcardStore.getState().flashcards[0];
      expect(after.reviewCount).toBe(before.reviewCount);
    });
  });

  describe('Review Sessions', () => {
    it('should start a review session with due cards', () => {
      const store = useFlashcardStore.getState();
      // Cards with nextReviewDate in the past are due
      store.addFlashcard(createTestCard({ id: 'card-1', nextReviewDate: Date.now() - 1000 }));
      store.addFlashcard(createTestCard({ id: 'card-2', nextReviewDate: Date.now() - 1000 }));
      store.addFlashcard(createTestCard({ id: 'card-3', nextReviewDate: Date.now() + 999999999 }));

      store.startReviewSession();

      const state = useFlashcardStore.getState();
      expect(state.currentSession).not.toBeNull();
      expect(state.sessionCards).toHaveLength(2);
      expect(state.currentCardIndex).toBe(0);
    });

    it('should start a review session with specific card IDs', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'card-1' }),
        createTestCard({ id: 'card-2' }),
        createTestCard({ id: 'card-3' }),
      ]);

      store.startReviewSession(['card-1', 'card-3']);

      const state = useFlashcardStore.getState();
      expect(state.sessionCards).toEqual(['card-1', 'card-3']);
    });

    it('should navigate to next and previous cards', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'card-1' }),
        createTestCard({ id: 'card-2' }),
        createTestCard({ id: 'card-3' }),
      ]);
      store.startReviewSession(['card-1', 'card-2', 'card-3']);

      expect(useFlashcardStore.getState().currentCardIndex).toBe(0);

      store.nextCard();
      expect(useFlashcardStore.getState().currentCardIndex).toBe(1);

      store.nextCard();
      expect(useFlashcardStore.getState().currentCardIndex).toBe(2);

      // Should not go beyond last card
      store.nextCard();
      expect(useFlashcardStore.getState().currentCardIndex).toBe(2);

      store.previousCard();
      expect(useFlashcardStore.getState().currentCardIndex).toBe(1);

      // Should not go below 0
      store.previousCard();
      store.previousCard();
      expect(useFlashcardStore.getState().currentCardIndex).toBe(0);
    });

    it('should end a review session', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1', nextReviewDate: 0 }));
      store.startReviewSession();
      store.endReviewSession();

      const state = useFlashcardStore.getState();
      // Session should have completedAt set, then be cleared after timeout
      expect(state.sessionCards).toEqual([]);
      expect(state.currentCardIndex).toBe(0);
    });
  });

  describe('getDueCards', () => {
    it('should return cards with nextReviewDate in the past', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'due-1', nextReviewDate: Date.now() - 100000 }),
        createTestCard({ id: 'not-due', nextReviewDate: Date.now() + 999999999 }),
        createTestCard({ id: 'due-2', nextReviewDate: Date.now() - 1 }),
      ]);

      const dueCards = store.getDueCards();
      expect(dueCards).toHaveLength(2);
      const dueIds = dueCards.map(c => c.id);
      expect(dueIds).toContain('due-1');
      expect(dueIds).toContain('due-2');
    });

    it('should return empty array when no cards are due', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcard(createTestCard({ id: 'card-1', nextReviewDate: Date.now() + 999999999 }));

      expect(store.getDueCards()).toHaveLength(0);
    });
  });

  describe('getCardsByTag', () => {
    it('should filter cards matching any of the given tags', () => {
      const store = useFlashcardStore.getState();
      store.addFlashcards([
        createTestCard({ id: 'card-1', tags: ['javascript', 'react'] }),
        createTestCard({ id: 'card-2', tags: ['python', 'algorithms'] }),
        createTestCard({ id: 'card-3', tags: ['javascript', 'algorithms'] }),
      ]);

      const result = store.getCardsByTag(['react']);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('card-1');

      const result2 = store.getCardsByTag(['algorithms']);
      expect(result2).toHaveLength(2);
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      const store = useFlashcardStore.getState();
      const now = Date.now();
      store.addFlashcards([
        createTestCard({
          id: 'card-1',
          nextReviewDate: now - 1000,
          lastReviewed: now - 500,
          reviewCount: 6,
          easeFactor: 2.6,
        }),
        createTestCard({
          id: 'card-2',
          nextReviewDate: now + 999999999,
          reviewCount: 1,
          easeFactor: 2.5,
        }),
        createTestCard({
          id: 'card-3',
          nextReviewDate: now - 500,
          reviewCount: 5,
          easeFactor: 2.5,
        }),
      ]);

      const stats = store.getStats();
      expect(stats.total).toBe(3);
      expect(stats.dueToday).toBe(2); // card-1 and card-3 are due
      expect(stats.masteredCards).toBe(2); // card-1 (6 reviews, ef 2.6) and card-3 (5 reviews, ef 2.5)
      expect(stats.averageEaseFactor).toBeCloseTo(2.53, 2);
    });

    it('should return default values for empty store', () => {
      const stats = useFlashcardStore.getState().getStats();
      expect(stats.total).toBe(0);
      expect(stats.dueToday).toBe(0);
      expect(stats.reviewedToday).toBe(0);
      expect(stats.masteredCards).toBe(0);
      expect(stats.averageEaseFactor).toBe(2.5);
    });
  });
});
