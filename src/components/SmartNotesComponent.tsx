import React, { useState, useEffect, useRef } from 'react';
import { SmartNote, Flashcard } from '../types/index';

interface SmartNotesProps {
  onClose: () => void;
  initialContent?: string;
  sourceUrl?: string;
  sourceType?: 'youtube' | 'leetcode' | 'article';
}

export const SmartNotesComponent: React.FC<SmartNotesProps> = ({ 
  onClose, 
  initialContent = '', 
  sourceUrl, 
  sourceType 
}) => {
  const [notes, setNotes] = useState<SmartNote[]>([]);
  const [currentNote, setCurrentNote] = useState<SmartNote | null>(null);
  const [noteContent, setNoteContent] = useState(initialContent);
  const [noteTitle, setNoteTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'flashcards' | 'library'>('editor');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
  
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadNotes();
    if (initialContent) {
      generateAITitle(initialContent);
    }
  }, []);

  const loadNotes = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getNotes' });
      if (response && response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const generateAITitle = async (content: string) => {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateNoteTitle',
        data: { content, sourceType, sourceUrl }
      });
      if (response && response.success) {
        setNoteTitle(response.data.title);
        setTags(response.data.suggestedTags || []);
      }
    } catch (error) {
      console.error('Failed to generate title:', error);
    }
  };

  const enhanceWithAI = async () => {
    if (!noteContent.trim()) return;

    setIsGenerating(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'enhanceNote',
        data: {
          content: noteContent,
          title: noteTitle,
          sourceType,
          sourceUrl
        }
      });

      if (response && response.success) {
        const enhanced = response.data;
        setNoteContent(enhanced.content);
        setTags(prev => [...new Set([...prev, ...enhanced.suggestedTags])]);
        
        // Auto-generate flashcards if requested
        if (enhanced.flashcards) {
          setFlashcards(prev => [...prev, ...enhanced.flashcards]);
        }
      }
    } catch (error) {
      console.error('Failed to enhance note:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;

    const note: SmartNote = {
      id: currentNote?.id || Date.now().toString(),
      title: noteTitle,
      content: noteContent,
      type: initialContent ? 'ai-generated' : 'manual',
      tags,
      sourceUrl,
      sourceType,
      createdAt: currentNote?.createdAt || Date.now(),
      updatedAt: Date.now(),
      importance: 'medium',
      reviewCount: currentNote?.reviewCount || 0,
      lastReviewed: currentNote?.lastReviewed
    };

    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveNote',
        data: note
      });

      if (response && response.success) {
        setNotes(prev => {
          const filtered = prev.filter(n => n.id !== note.id);
          return [note, ...filtered];
        });
        
        // Clear editor
        setCurrentNote(null);
        setNoteTitle('');
        setNoteContent('');
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const generateFlashcards = async () => {
    const contentToConvert = selectedNotes.size > 0 
      ? notes.filter(n => selectedNotes.has(n.id)).map(n => n.content).join('\n\n')
      : noteContent;

    if (!contentToConvert.trim()) return;

    setIsGenerating(true);
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'generateFlashcards',
        data: {
          content: contentToConvert,
          sourceType,
          tags: tags.length > 0 ? tags : ['general']
        }
      });

      if (response && response.success) {
        setFlashcards(prev => [...prev, ...response.data]);
        setActiveTab('flashcards');
      }
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const loadNote = (note: SmartNote) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setTags(note.tags);
    setActiveTab('editor');
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderEditor = () => (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          placeholder="Note title..."
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="title-input"
        />
        <div className="editor-actions">
          <button 
            className="btn-secondary" 
            onClick={enhanceWithAI}
            disabled={isGenerating || !noteContent.trim()}
          >
            {isGenerating ? '🤖 Enhancing...' : '✨ AI Enhance'}
          </button>
          <button 
            className="btn-primary" 
            onClick={saveNote}
            disabled={!noteTitle.trim() || !noteContent.trim()}
          >
            💾 Save Note
          </button>
        </div>
      </div>

      <div className="tags-section">
        <div className="tags-list">
          {tags.map(tag => (
            <span key={tag} className="tag">
              {tag}
              <button onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
        </div>
        <div className="add-tag">
          <input
            type="text"
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
            className="tag-input"
          />
          <button onClick={addTag} className="btn-secondary">+</button>
        </div>
      </div>

      <textarea
        ref={editorRef}
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Start writing your notes... Use AI Enhance to improve structure and add insights!"
        className="note-textarea"
        rows={15}
      />

      <div className="editor-footer">
        <div className="word-count">
          {noteContent.split(/\s+/).filter(w => w.length > 0).length} words
        </div>
        <button 
          className="btn-accent" 
          onClick={generateFlashcards}
          disabled={isGenerating || !noteContent.trim()}
        >
          🧠 Generate Flashcards
        </button>
      </div>
    </div>
  );

  const renderFlashcards = () => (
    <div className="flashcards-section">
      <div className="flashcards-header">
        <h3>🧠 Flashcards ({flashcards.length})</h3>
        <div className="flashcard-actions">
          <button className="btn-secondary">Review All</button>
          <button className="btn-primary">Study Session</button>
        </div>
      </div>

      <div className="flashcards-grid">
        {flashcards.map((card, index) => (
          <div key={card.id} className={`flashcard difficulty-${card.difficulty}`}>
            <div className="flashcard-front">
              <div className="card-number">#{index + 1}</div>
              <p>{card.front}</p>
            </div>
            <div className="flashcard-back">
              <p>{card.back}</p>
              <div className="card-meta">
                <span className={`difficulty-${card.difficulty}`}>{card.difficulty}</span>
                <span className="card-type">{card.type}</span>
              </div>
            </div>
            <div className="card-tags">
              {card.tags.map(tag => (
                <span key={tag} className="tag-small">{tag}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {flashcards.length === 0 && (
        <div className="empty-state">
          <p>No flashcards yet. Generate some from your notes!</p>
          <button className="btn-primary" onClick={generateFlashcards}>
            Create Flashcards
          </button>
        </div>
      )}
    </div>
  );

  const renderLibrary = () => (
    <div className="notes-library">
      <div className="library-header">
        <input
          type="text"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <div className="library-actions">
          <button className="btn-secondary">Export Selected</button>
          <button className="btn-primary" onClick={() => setActiveTab('editor')}>
            + New Note
          </button>
        </div>
      </div>

      <div className="notes-grid">
        {filteredNotes.map(note => (
          <div key={note.id} className={`note-card type-${note.type}`}>
            <div className="note-header">
              <h4 onClick={() => loadNote(note)}>{note.title}</h4>
              <input
                type="checkbox"
                checked={selectedNotes.has(note.id)}
                onChange={(e) => {
                  const newSelected = new Set(selectedNotes);
                  if (e.target.checked) {
                    newSelected.add(note.id);
                  } else {
                    newSelected.delete(note.id);
                  }
                  setSelectedNotes(newSelected);
                }}
              />
            </div>
            
            <p className="note-preview">
              {note.content.substring(0, 150)}
              {note.content.length > 150 ? '...' : ''}
            </p>
            
            <div className="note-tags">
              {note.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag-small">{tag}</span>
              ))}
              {note.tags.length > 3 && (
                <span className="tag-small">+{note.tags.length - 3}</span>
              )}
            </div>
            
            <div className="note-meta">
              <span className={`importance-${note.importance}`}>
                {note.importance === 'high' ? '🔴' : note.importance === 'medium' ? '🟡' : '🟢'}
              </span>
              <span className="last-modified">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <span className="review-count">
                📚 {note.reviewCount} reviews
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="empty-state">
          <p>No notes found. Start creating your knowledge base!</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="smart-notes-container">
      <div className="notes-header">
        <h2>📝 Smart Notes</h2>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="notes-tabs">
        <button 
          className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          ✏️ Editor
        </button>
        <button 
          className={`tab ${activeTab === 'flashcards' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashcards')}
        >
          🧠 Flashcards ({flashcards.length})
        </button>
        <button 
          className={`tab ${activeTab === 'library' ? 'active' : ''}`}
          onClick={() => setActiveTab('library')}
        >
          📚 Library ({notes.length})
        </button>
      </div>

      <div className="notes-content">
        {activeTab === 'editor' && renderEditor()}
        {activeTab === 'flashcards' && renderFlashcards()}
        {activeTab === 'library' && renderLibrary()}
      </div>
    </div>
  );
};

export default SmartNotesComponent;