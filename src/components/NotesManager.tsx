import React, { useState, useEffect } from 'react';
import { useNotesStore, useLearningStore, useFlashcardStore, Note } from '../stores';
import { Button, Input, Textarea, Badge, Modal, Alert } from './ui';

interface NotesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledNote?: {
    title?: string;
    content?: string;
    platform?: 'leetcode' | 'youtube' | 'general';
    sourceUrl?: string;
  };
}

export const NotesManager: React.FC<NotesManagerProps> = ({
  isOpen,
  onClose,
  prefilledNote
}) => {
  const {
    notes,
    addNote,
    updateNote,
    deleteNote,
    searchNotes,
    filterByTags,
    getAllTags,
    getFilteredNotes,
    enhanceNoteWithAI,
    searchQuery,
    selectedTags
  } = useNotesStore();

  const { currentSession } = useLearningStore();
  const { addFlashcards } = useFlashcardStore();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [enhancingNoteId, setEnhancingNoteId] = useState<string | null>(null);
  const [generatingFlashcardsId, setGeneratingFlashcardsId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (prefilledNote && isOpen && !isCreating) {
      setIsCreating(true);
      setFormData({
        title: prefilledNote.title || '',
        content: prefilledNote.content || '',
        tags: [],
        tagInput: ''
      });
    }
  }, [prefilledNote, isOpen]);

  const filteredNotes = getFilteredNotes();
  const allTags = getAllTags();

  const handleCreateNote = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    const platform = prefilledNote?.platform || 
                     (window.location.hostname.includes('leetcode') ? 'leetcode' : 
                      window.location.hostname.includes('youtube') ? 'youtube' : 'general');

    addNote({
      title: formData.title.trim(),
      content: formData.content.trim(),
      platform: platform as 'leetcode' | 'youtube' | 'general',
      sourceUrl: prefilledNote?.sourceUrl || window.location.href,
      tags: formData.tags,
      sessionId: currentSession?.id,
      isAIEnhanced: false
    });

    setSuccessMessage('Note created successfully!');
    resetForm();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleUpdateNote = () => {
    if (!editingNote || !formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required');
      return;
    }

    updateNote(editingNote.id, {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags
    });

    setSuccessMessage('Note updated successfully!');
    setIsEditing(false);
    setEditingNote(null);
    resetForm();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(id);
      setSuccessMessage('Note deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEditNote = (note: Note) => {
    setIsEditing(true);
    setEditingNote(note);
    setFormData({
      title: note.title,
      content: note.content,
      tags: [...note.tags],
      tagInput: ''
    });
    setIsCreating(false);
  };

  const handleEnhanceNote = async (note: Note) => {
    setEnhancingNoteId(note.id);
    setError('');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'enhanceNote',
        data: {
          content: note.content,
          title: note.title,
          platform: note.platform
        }
      });

      if (response.type === 'error') {
        setError('Failed to enhance note: ' + response.content);
      } else {
        enhanceNoteWithAI(note.id, response.content);
        setSuccessMessage('Note enhanced with AI!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      setError('Failed to enhance note. Please try again.');
    } finally {
      setEnhancingNoteId(null);
    }
  };

  const handleGenerateFlashcards = async (note: Note) => {
    setGeneratingFlashcardsId(note.id);
    setError('');

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateFlashcards',
        data: {
          content: note.content,
          tags: note.tags,
          title: note.title
        }
      });

      if (response.success && response.data) {
        // Add flashcards to store
        addFlashcards(response.data.map((card: any) => ({
          front: card.front,
          back: card.back,
          type: card.type || 'concept',
          difficulty: card.difficulty || 'medium',
          tags: card.tags || note.tags,
          sourceNoteId: note.id,
          sourcePlatform: note.platform,
          sourceUrl: note.sourceUrl
        })));
        
        setSuccessMessage(`Generated ${response.data.length} flashcards!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to generate flashcards: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      setError('Failed to generate flashcards. Please try again.');
    } finally {
      setGeneratingFlashcardsId(null);
    }
  };

  const handleAddTag = () => {
    const tag = formData.tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag],
        tagInput: ''
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag)
    });
  };

  const handleExportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leeco-ai-notes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Notes exported successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      tags: [],
      tagInput: ''
    });
    setIsCreating(false);
    setIsEditing(false);
    setEditingNote(null);
    setError('');
  };

  const getPlatformBadgeVariant = (platform: string) => {
    switch (platform) {
      case 'leetcode':
        return 'warning';
      case 'youtube':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📝 Smart Notes"
      size="xl"
    >
      <div className="flex flex-col h-full">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert variant="success" className="mb-4" closable onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert variant="error" className="mb-4" closable onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button
              variant="primary"
              onClick={() => {
                setIsCreating(true);
                setIsEditing(false);
                resetForm();
              }}
              disabled={isCreating || isEditing}
            >
              ➕ New Note
            </Button>
            <Button variant="outline" onClick={handleExportNotes}>
              💾 Export All
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || isEditing) && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <h3 className="font-medium mb-3">
              {isEditing ? 'Edit Note' : 'Create New Note'}
            </h3>
            <div className="space-y-3">
              <Input
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter note title..."
              />
              <Textarea
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your note content..."
                rows={6}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag and press Enter..."
                  />
                  <Button onClick={handleAddTag} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      {tag} ✕
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={isEditing ? handleUpdateNote : handleCreateNote}
                >
                  {isEditing ? 'Update' : 'Create'} Note
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-4 space-y-2">
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => searchNotes(e.target.value)}
            icon={<span>🔍</span>}
          />
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 self-center">Filter by tags:</span>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'info' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      filterByTags(selectedTags.filter((t) => t !== tag));
                    } else {
                      filterByTags([...selectedTags, tag]);
                    }
                  }}
                >
                  {tag}
                </Badge>
              ))}
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => filterByTags([])}
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-lg mb-2">No notes yet</p>
              <p className="text-sm">Create your first note to get started!</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-lg">{note.title}</h4>
                  <div className="flex gap-2">
                    <Badge variant={getPlatformBadgeVariant(note.platform)}>
                      {note.platform}
                    </Badge>
                    {note.isAIEnhanced && (
                      <Badge variant="success">✨ AI Enhanced</Badge>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-sm mb-3 whitespace-pre-wrap line-clamp-3">
                  {note.content}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>
                    Updated: {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditNote(note)}
                    >
                      ✏️ Edit
                    </Button>
                    {!note.isAIEnhanced && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEnhanceNote(note)}
                        loading={enhancingNoteId === note.id}
                        disabled={enhancingNoteId === note.id}
                      >
                        ✨ Enhance with AI
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleGenerateFlashcards(note)}
                      loading={generatingFlashcardsId === note.id}
                      disabled={generatingFlashcardsId === note.id}
                    >
                      🎴 Flashcards
                    </Button>
                    {note.sourceUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(note.sourceUrl, '_blank')}
                      >
                        🔗 Source
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotesManager;
