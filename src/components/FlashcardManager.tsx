import React, { useState, useEffect } from 'react';
import { useFlashcardStore, Flashcard } from '../stores/flashcardStore';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface FlashcardManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlashcardManager: React.FC<FlashcardManagerProps> = ({ isOpen, onClose }) => {
  const {
    flashcards,
    currentSession,
    sessionCards,
    currentCardIndex,
    startReviewSession,
    endReviewSession,
    reviewFlashcard,
    nextCard,
    previousCard,
    getDueCards,
    getStats,
    deleteFlashcard,
  } = useFlashcardStore();

  const [view, setView] = useState<'list' | 'create' | 'review'>('list');
  const [showAnswer, setShowAnswer] = useState(false);
  const [newCard, setNewCard] = useState({
    front: '',
    back: '',
    type: 'concept' as const,
    difficulty: 'medium' as const,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const stats = getStats();
  const dueCards = getDueCards();
  const currentCard = currentSession && sessionCards.length > 0
    ? flashcards.find(c => c.id === sessionCards[currentCardIndex])
    : null;

  useEffect(() => {
    if (!isOpen) {
      setView('list');
      setShowAnswer(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateCard = () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      alert('Please fill in both front and back of the card');
      return;
    }

    useFlashcardStore.getState().addFlashcard(newCard);
    setNewCard({
      front: '',
      back: '',
      type: 'concept',
      difficulty: 'medium',
      tags: [],
    });
    setView('list');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newCard.tags.includes(tagInput.trim())) {
      setNewCard({ ...newCard, tags: [...newCard.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewCard({ ...newCard, tags: newCard.tags.filter(t => t !== tag) });
  };

  const handleStartReview = () => {
    const cardsToReview = selectedTags.length > 0
      ? useFlashcardStore.getState().getCardsByTag(selectedTags).filter(c => c.nextReviewDate <= Date.now())
      : dueCards;

    if (cardsToReview.length === 0) {
      alert('No cards due for review!');
      return;
    }

    startReviewSession(cardsToReview.map(c => c.id));
    setView('review');
    setShowAnswer(false);
  };

  const handleReviewResponse = (quality: number) => {
    if (!currentCard) return;

    reviewFlashcard(currentCard.id, quality);
    setShowAnswer(false);

    // Move to next card or end session
    if (currentCardIndex < sessionCards.length - 1) {
      nextCard();
    } else {
      endReviewSession();
      setView('list');
      alert(`Review session complete! You reviewed ${sessionCards.length} cards.`);
    }
  };

  const handleDeleteCard = (id: string) => {
    if (confirm('Are you sure you want to delete this flashcard?')) {
      deleteFlashcard(id);
    }
  };

  const getQualityButtonText = (quality: number): string => {
    const labels = ['Again', 'Hard', 'Good', 'Easy', 'Perfect', 'Too Easy'];
    return labels[quality] || 'Rate';
  };

  const getQualityColor = (quality: number): string => {
    if (quality <= 1) return 'bg-red-500';
    if (quality === 2) return 'bg-orange-500';
    if (quality === 3) return 'bg-yellow-500';
    if (quality === 4) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const filteredCards = selectedTags.length > 0
    ? flashcards.filter(card => selectedTags.every(tag => card.tags.includes(tag)))
    : flashcards;

  const allTags = Array.from(new Set(flashcards.reduce((acc: string[], card) => [...acc, ...card.tags], []))).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              🎴 Flashcard Manager
            </h2>
            <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span>Total: {stats.total}</span>
              <span>Due Today: <span className="font-semibold text-orange-600">{stats.dueToday}</span></span>
              <span>Reviewed: {stats.reviewedToday}</span>
              <span>Mastered: {stats.masteredCards}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 font-medium ${
              view === 'list'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            All Cards ({filteredCards.length})
          </button>
          <button
            onClick={() => setView('create')}
            className={`px-4 py-2 font-medium ${
              view === 'create'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            Create New
          </button>
          {currentSession && (
            <button
              onClick={() => setView('review')}
              className="px-4 py-2 font-medium border-b-2 border-green-500 text-green-600"
            >
              Review Session ({currentCardIndex + 1}/{sessionCards.length})
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {view === 'list' && (
            <div>
              {/* Filter Tags */}
              {allTags.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Tags:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag: string) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'success' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          setSelectedTags(prev =>
                            prev.includes(tag)
                              ? prev.filter(t => t !== tag)
                              : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {selectedTags.length > 0 && (
                      <button
                        onClick={() => setSelectedTags([])}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Review Button */}
              {dueCards.length > 0 && (
                <div className="mb-4">
                  <Button
                    onClick={handleStartReview}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    📚 Start Review Session ({selectedTags.length > 0 ? filteredCards.filter(c => c.nextReviewDate <= Date.now()).length : dueCards.length} cards due)
                  </Button>
                </div>
              )}

              {/* Cards List */}
              {filteredCards.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No flashcards yet</p>
                  <p className="text-sm mt-2">Create your first flashcard or generate them from notes!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCards.map((card) => {
                    const isDue = card.nextReviewDate <= Date.now();
                    const nextReviewDays = Math.ceil((card.nextReviewDate - Date.now()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={card.id}
                        className={`border rounded-lg p-4 ${
                          isDue
                            ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white mb-1">
                              {card.front}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {card.back.length > 100 ? card.back.substring(0, 100) + '...' : card.back}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="default">{card.type}</Badge>
                          <Badge variant="default">{card.difficulty}</Badge>
                          {card.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                          {isDue ? (
                            <Badge variant="warning">Due now!</Badge>
                          ) : (
                            <span className="text-xs text-gray-500">
                              Next review in {nextReviewDays} {nextReviewDays === 1 ? 'day' : 'days'}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Reviewed {card.reviewCount} times
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {view === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Front (Question/Term)
                </label>
                <textarea
                  value={newCard.front}
                  onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                  placeholder="What is the time complexity of binary search?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Back (Answer/Definition)
                </label>
                <textarea
                  value={newCard.back}
                  onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                  placeholder="O(log n) - The search space is halved with each iteration"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    value={newCard.type}
                    onChange={(e) => setNewCard({ ...newCard, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="concept">Concept</option>
                    <option value="definition">Definition</option>
                    <option value="code">Code</option>
                    <option value="problem">Problem</option>
                    <option value="fact">Fact</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newCard.difficulty}
                    onChange={(e) => setNewCard({ ...newCard, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Add a tag (press Enter)"
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
                {newCard.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newCard.tags.map(tag => (
                      <Badge key={tag} variant="info" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleCreateCard} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Create Flashcard
                </Button>
                <Button onClick={() => setView('list')} variant="secondary">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {view === 'review' && currentCard && (
            <div className="max-w-2xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Card {currentCardIndex + 1} of {sessionCards.length}</span>
                  <span>{Math.round(((currentCardIndex + 1) / sessionCards.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentCardIndex + 1) / sessionCards.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Card Display */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-8 min-h-[300px] flex flex-col items-center justify-center shadow-lg">
                <div className="mb-4 flex gap-2">
                  <Badge variant="default">{currentCard.type}</Badge>
                  <Badge variant="default">{currentCard.difficulty}</Badge>
                </div>
                
                <div className="text-center">
                  <div className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {currentCard.front}
                  </div>
                  
                  {showAnswer && (
                    <div className="mt-6 pt-6 border-t border-gray-300 dark:border-gray-600">
                      <div className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {currentCard.back}
                      </div>
                    </div>
                  )}
                </div>

                {!showAnswer && (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    className="mt-8 bg-blue-600 hover:bg-blue-700"
                  >
                    Show Answer
                  </Button>
                )}
              </div>

              {/* Rating Buttons */}
              {showAnswer && (
                <div className="mt-6">
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                    How well did you know this?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2, 3, 4, 5].map((quality) => (
                      <button
                        key={quality}
                        onClick={() => handleReviewResponse(quality)}
                        className={`${getQualityColor(quality)} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium`}
                      >
                        {getQualityButtonText(quality)}
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Rating determines next review date based on spaced repetition algorithm
                  </p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={previousCard}
                  disabled={currentCardIndex === 0}
                  variant="secondary"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to end this review session?')) {
                      endReviewSession();
                      setView('list');
                    }
                  }}
                  variant="secondary"
                >
                  End Session
                </Button>
                <Button
                  onClick={nextCard}
                  disabled={currentCardIndex === sessionCards.length - 1}
                  variant="secondary"
                >
                  Next →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlashcardManager;
