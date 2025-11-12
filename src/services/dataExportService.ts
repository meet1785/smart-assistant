import { useUserStore } from '../stores/userStore';
import { useLearningStore } from '../stores/learningStore';
import { useNotesStore } from '../stores/notesStore';
import { useFlashcardStore } from '../stores/flashcardStore';

export interface ExportData {
  version: string;
  exportedAt: number;
  appName: string;
  user: {
    profile: any;
    preferences: any;
    // API key is excluded for security
  };
  learning: {
    sessions: any[];
    goals: any[];
    paths: any[];
    stats: any;
  };
  notes: any[];
  flashcards: any[];
  metadata: {
    totalNotes: number;
    totalFlashcards: number;
    totalSessions: number;
    totalGoals: number;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  details?: {
    notesImported: number;
    flashcardsImported: number;
    goalsImported: number;
    pathsImported: number;
    sessionsImported: number;
  };
  errors?: string[];
}

export class DataExportService {
  private static instance: DataExportService;
  private readonly CURRENT_VERSION = '1.0.0';
  private readonly APP_NAME = 'Leeco AI Clone - Learning Companion';

  private constructor() {}

  static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  /**
   * Export all user data to a JSON file
   * @param includeApiKey - Whether to include API key (default: false for security)
   */
  async exportData(includeApiKey: boolean = false): Promise<ExportData> {
    try {
      // Get data from all stores
      const userState = useUserStore.getState();
      const learningState = useLearningStore.getState();
      const notesState = useNotesStore.getState();
      const flashcardState = useFlashcardStore.getState();

      const exportData: ExportData = {
        version: this.CURRENT_VERSION,
        exportedAt: Date.now(),
        appName: this.APP_NAME,
        user: {
          profile: userState.profile,
          preferences: userState.profile?.preferences,
          // Conditionally include API key
          ...(includeApiKey && { apiKey: userState.apiKey })
        },
        learning: {
          sessions: learningState.recentSessions,
          goals: learningState.goals,
          paths: learningState.paths,
          stats: learningState.stats
        },
        notes: notesState.notes,
        flashcards: flashcardState.flashcards,
        metadata: {
          totalNotes: notesState.notes.length,
          totalFlashcards: flashcardState.flashcards.length,
          totalSessions: learningState.recentSessions.length,
          totalGoals: learningState.goals.length
        }
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Download exported data as a JSON file
   */
  async downloadExportedData(includeApiKey: boolean = false): Promise<void> {
    try {
      const data = await this.exportData(includeApiKey);
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `leeco-ai-backup-${timestamp}.json`;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data) {
      errors.push('Import data is empty or invalid');
      return { valid: false, errors };
    }

    if (!data.version) {
      errors.push('Missing version information');
    }

    if (!data.appName || data.appName !== this.APP_NAME) {
      errors.push('Data does not appear to be from Leeco AI Clone');
    }

    if (!data.exportedAt || typeof data.exportedAt !== 'number') {
      errors.push('Invalid export timestamp');
    }

    // Validate data structure
    if (!data.user) {
      errors.push('Missing user data');
    }

    if (!data.learning) {
      errors.push('Missing learning data');
    }

    if (!Array.isArray(data.notes)) {
      errors.push('Invalid notes data format');
    }

    if (!Array.isArray(data.flashcards)) {
      errors.push('Invalid flashcards data format');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check version compatibility
   */
  private isVersionCompatible(importVersion: string): boolean {
    // Simple version check - can be enhanced with semver comparison
    const [importMajor] = importVersion.split('.').map(Number);
    const [currentMajor] = this.CURRENT_VERSION.split('.').map(Number);
    
    return importMajor === currentMajor;
  }

  /**
   * Import data from a JSON object
   * @param data - The parsed JSON data to import
   * @param options - Import options
   */
  async importData(
    data: any,
    options: {
      mergeMode?: 'replace' | 'merge';
      importApiKey?: boolean;
    } = {}
  ): Promise<ImportResult> {
    const { mergeMode = 'merge', importApiKey = false } = options;
    const errors: string[] = [];
    const details = {
      notesImported: 0,
      flashcardsImported: 0,
      goalsImported: 0,
      pathsImported: 0,
      sessionsImported: 0
    };

    try {
      // Validate data structure
      const validation = this.validateImportData(data);
      if (!validation.valid) {
        return {
          success: false,
          message: 'Invalid import data',
          errors: validation.errors
        };
      }

      // Check version compatibility
      if (!this.isVersionCompatible(data.version)) {
        errors.push(
          `Version mismatch: Import data is version ${data.version}, but current version is ${this.CURRENT_VERSION}`
        );
        return {
          success: false,
          message: 'Version incompatibility',
          errors
        };
      }

      // Import user data
      if (data.user) {
        const userStore = useUserStore.getState();
        
        if (data.user.profile) {
          if (mergeMode === 'replace' || !userStore.profile) {
            userStore.setProfile(data.user.profile);
          } else {
            // Merge preferences
            if (data.user.profile.preferences) {
              userStore.updatePreferences(data.user.profile.preferences);
            }
          }
        }

        // Optionally import API key
        if (importApiKey && data.user.apiKey) {
          userStore.setApiKey(data.user.apiKey);
        }
      }

      // Import learning data
      if (data.learning) {
        const learningStore = useLearningStore.getState();

        // Import goals
        if (Array.isArray(data.learning.goals)) {
          if (mergeMode === 'replace') {
            // Clear existing goals first
            learningStore.goals.forEach(goal => {
              learningStore.removeGoal(goal.id);
            });
          }
          
          data.learning.goals.forEach((goal: any) => {
            try {
              learningStore.addGoal(goal);
              details.goalsImported++;
            } catch (error) {
              errors.push(`Failed to import goal: ${goal.title || 'Unknown'}`);
            }
          });
        }

        // Import paths
        if (Array.isArray(data.learning.paths)) {
          if (mergeMode === 'replace') {
            learningStore.paths.forEach(path => {
              learningStore.removePath(path.id);
            });
          }

          data.learning.paths.forEach((path: any) => {
            try {
              learningStore.addPath(path);
              details.pathsImported++;
            } catch (error) {
              errors.push(`Failed to import path: ${path.name || 'Unknown'}`);
            }
          });
        }

        // Update stats if in replace mode
        if (mergeMode === 'replace' && data.learning.stats) {
          learningStore.updateStats(data.learning.stats);
        }
      }

      // Import notes
      if (Array.isArray(data.notes)) {
        const notesStore = useNotesStore.getState();

        if (mergeMode === 'replace') {
          // Clear existing notes
          notesStore.notes.forEach(note => {
            notesStore.deleteNote(note.id);
          });
        }

        data.notes.forEach((note: any) => {
          try {
            // Create a new note with the imported data
            notesStore.addNote({
              title: note.title,
              content: note.content,
              platform: note.platform,
              sourceUrl: note.sourceUrl,
              tags: note.tags || [],
              isAIEnhanced: note.isAIEnhanced || false,
              originalContent: note.originalContent,
              sessionId: note.sessionId
            });
            details.notesImported++;
          } catch (error) {
            errors.push(`Failed to import note: ${note.title || 'Unknown'}`);
          }
        });
      }

      // Import flashcards
      if (Array.isArray(data.flashcards)) {
        const flashcardStore = useFlashcardStore.getState();

        if (mergeMode === 'replace') {
          flashcardStore.flashcards.forEach(card => {
            flashcardStore.deleteFlashcard(card.id);
          });
        }

        const cardsToImport = data.flashcards.map((card: any) => ({
          front: card.front,
          back: card.back,
          type: card.type,
          difficulty: card.difficulty,
          tags: card.tags || [],
          sourceNoteId: card.sourceNoteId,
          sourcePlatform: card.sourcePlatform,
          sourceUrl: card.sourceUrl
        }));

        try {
          flashcardStore.addFlashcards(cardsToImport);
          details.flashcardsImported = cardsToImport.length;
        } catch (error) {
          errors.push('Failed to import flashcards');
        }
      }

      return {
        success: true,
        message: `Successfully imported data. ${details.notesImported} notes, ${details.flashcardsImported} flashcards, ${details.goalsImported} goals, and ${details.pathsImported} paths imported.`,
        details,
        ...(errors.length > 0 && { errors })
      };
    } catch (error) {
      console.error('Error importing data:', error);
      return {
        success: false,
        message: 'Failed to import data',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Import data from a file
   */
  async importFromFile(
    file: File,
    options?: {
      mergeMode?: 'replace' | 'merge';
      importApiKey?: boolean;
    }
  ): Promise<ImportResult> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      return await this.importData(data, options);
    } catch (error) {
      console.error('Error reading import file:', error);
      return {
        success: false,
        message: 'Failed to read import file',
        errors: [
          error instanceof Error ? error.message : 'Unknown error',
          'Please ensure the file is a valid JSON backup file'
        ]
      };
    }
  }

  /**
   * Get export metadata without exporting full data
   */
  getExportMetadata(): {
    totalNotes: number;
    totalFlashcards: number;
    totalGoals: number;
    totalPaths: number;
    totalSessions: number;
  } {
    const notesState = useNotesStore.getState();
    const flashcardState = useFlashcardStore.getState();
    const learningState = useLearningStore.getState();

    return {
      totalNotes: notesState.notes.length,
      totalFlashcards: flashcardState.flashcards.length,
      totalGoals: learningState.goals.length,
      totalPaths: learningState.paths.length,
      totalSessions: learningState.recentSessions.length
    };
  }
}
