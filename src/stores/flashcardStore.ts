import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'concept' | 'definition' | 'code' | 'problem' | 'fact';
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  sourceNoteId?: string;
  sourcePlatform?: 'leetcode' | 'youtube' | 'general';
  sourceUrl?: string;
  createdAt: number;
  lastReviewed?: number;
  nextReviewDate: number;
  reviewCount: number;
  correctCount: number;
  intervalDays: number;
  easeFactor: number; // SM-2 algorithm ease factor (default 2.5)
}

export interface ReviewSession {
  id: string;
  startedAt: number;
  completedAt?: number;
  flashcardsReviewed: number;
  correctAnswers: number;
  averageResponseTime: number;
}

export interface FlashcardState {
  flashcards: Flashcard[];
  currentSession: ReviewSession | null;
  sessionCards: string[]; // IDs of cards in current session
  currentCardIndex: number;
  
  // Actions
  addFlashcard: (card: Omit<Flashcard, 'id' | 'createdAt' | 'nextReviewDate' | 'reviewCount' | 'correctCount' | 'intervalDays' | 'easeFactor'>) => void;
  addFlashcards: (cards: Omit<Flashcard, 'id' | 'createdAt' | 'nextReviewDate' | 'reviewCount' | 'correctCount' | 'intervalDays' | 'easeFactor'>[]) => void;
  updateFlashcard: (id: string, updates: Partial<Flashcard>) => void;
  deleteFlashcard: (id: string) => void;
  reviewFlashcard: (id: string, quality: number) => void; // quality: 0-5 (SM-2 algorithm)
  startReviewSession: (cardIds?: string[]) => void;
  endReviewSession: () => void;
  nextCard: () => void;
  previousCard: () => void;
  getDueCards: () => Flashcard[];
  getCardsByTag: (tags: string[]) => Flashcard[];
  getStats: () => {
    total: number;
    dueToday: number;
    reviewedToday: number;
    masteredCards: number;
    averageEaseFactor: number;
  };
}

// SM-2 Algorithm implementation
function calculateNextReview(
  quality: number, // 0-5
  reviewCount: number,
  intervalDays: number,
  easeFactor: number
): { intervalDays: number; easeFactor: number; nextReviewDate: number } {
  let newEaseFactor = easeFactor;
  let newInterval = intervalDays;

  // Update ease factor based on quality
  newEaseFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // Calculate new interval based on quality
  if (quality < 3) {
    // Failed - reset interval to 1 day
    newInterval = 1;
  } else {
    if (reviewCount === 0) {
      newInterval = 1;
    } else if (reviewCount === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEaseFactor);
    }
  }

  const nextReviewDate = Date.now() + newInterval * 24 * 60 * 60 * 1000;

  return { intervalDays: newInterval, easeFactor: newEaseFactor, nextReviewDate };
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set, get) => ({
      flashcards: [],
      currentSession: null,
      sessionCards: [],
      currentCardIndex: 0,

      addFlashcard: (cardData) => {
        const card: Flashcard = {
          ...cardData,
          id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          nextReviewDate: Date.now(), // Due immediately for first review
          reviewCount: 0,
          correctCount: 0,
          intervalDays: 0,
          easeFactor: 2.5, // Default SM-2 ease factor
        };
        set((state) => ({
          flashcards: [card, ...state.flashcards]
        }));
      },

      addFlashcards: (cardsData) => {
        const newCards: Flashcard[] = cardsData.map(cardData => ({
          ...cardData,
          id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: Date.now(),
          nextReviewDate: Date.now(), // Due immediately for first review
          reviewCount: 0,
          correctCount: 0,
          intervalDays: 0,
          easeFactor: 2.5,
        }));
        set((state) => ({
          flashcards: [...newCards, ...state.flashcards]
        }));
      },

      updateFlashcard: (id, updates) => {
        set((state) => ({
          flashcards: state.flashcards.map((card) =>
            card.id === id ? { ...card, ...updates } : card
          )
        }));
      },

      deleteFlashcard: (id) => {
        set((state) => ({
          flashcards: state.flashcards.filter((card) => card.id !== id)
        }));
      },

      reviewFlashcard: (id, quality) => {
        set((state) => {
          const card = state.flashcards.find(c => c.id === id);
          if (!card) return state;

          const { intervalDays, easeFactor, nextReviewDate } = calculateNextReview(
            quality,
            card.reviewCount,
            card.intervalDays,
            card.easeFactor
          );

          const updatedCard: Flashcard = {
            ...card,
            lastReviewed: Date.now(),
            nextReviewDate,
            reviewCount: card.reviewCount + 1,
            correctCount: quality >= 3 ? card.correctCount + 1 : card.correctCount,
            intervalDays,
            easeFactor,
          };

          return {
            flashcards: state.flashcards.map((c) =>
              c.id === id ? updatedCard : c
            )
          };
        });
      },

      startReviewSession: (cardIds) => {
        const state = get();
        const cards = cardIds 
          ? cardIds.map(id => state.flashcards.find(c => c.id === id)).filter(Boolean) as Flashcard[]
          : state.getDueCards();

        const session: ReviewSession = {
          id: `session_${Date.now()}`,
          startedAt: Date.now(),
          flashcardsReviewed: 0,
          correctAnswers: 0,
          averageResponseTime: 0,
        };

        set({
          currentSession: session,
          sessionCards: cards.map(c => c.id),
          currentCardIndex: 0,
        });
      },

      endReviewSession: () => {
        set((state) => {
          if (!state.currentSession) return state;

          return {
            currentSession: {
              ...state.currentSession,
              completedAt: Date.now(),
            },
            sessionCards: [],
            currentCardIndex: 0,
          };
        });

        // After a short delay, clear the session completely
        setTimeout(() => {
          set({ currentSession: null });
        }, 100);
      },

      nextCard: () => {
        set((state) => ({
          currentCardIndex: Math.min(
            state.currentCardIndex + 1,
            state.sessionCards.length - 1
          ),
        }));
      },

      previousCard: () => {
        set((state) => ({
          currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
        }));
      },

      getDueCards: () => {
        const state = get();
        const now = Date.now();
        return state.flashcards.filter(card => card.nextReviewDate <= now);
      },

      getCardsByTag: (tags) => {
        const state = get();
        return state.flashcards.filter(card =>
          tags.some(tag => card.tags.includes(tag))
        );
      },

      getStats: () => {
        const state = get();
        const now = Date.now();
        const today = new Date().setHours(0, 0, 0, 0);

        const dueToday = state.flashcards.filter(
          card => card.nextReviewDate <= now
        ).length;

        const reviewedToday = state.flashcards.filter(
          card => card.lastReviewed && card.lastReviewed >= today
        ).length;

        const masteredCards = state.flashcards.filter(
          card => card.reviewCount >= 5 && card.easeFactor >= 2.5
        ).length;

        const avgEaseFactor = state.flashcards.length > 0
          ? state.flashcards.reduce((sum, card) => sum + card.easeFactor, 0) / state.flashcards.length
          : 2.5;

        return {
          total: state.flashcards.length,
          dueToday,
          reviewedToday,
          masteredCards,
          averageEaseFactor: Math.round(avgEaseFactor * 100) / 100,
        };
      },
    }),
    {
      name: 'leeco-ai-flashcards',
      partialize: (state) => ({
        flashcards: state.flashcards,
      }),
    }
  )
);
