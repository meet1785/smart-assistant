import React from 'react';
import { createRoot } from 'react-dom/client';
import { TutorInterface } from '../components/TutorInterface';
import { LeetCodeProblem, TutorRequest } from '../types/index';
import '../components/styles.css';

class LeetCodeIntegration {
  private tutorRoot: any = null;
  private isActive = false;

  constructor() {
    this.init();
  }

  private init() {
    // Wait for page to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupLeetCodeIntegration());
    } else {
      this.setupLeetCodeIntegration();
    }
  }

  private setupLeetCodeIntegration() {
    // Add trigger button to problem page
    this.addTriggerButton();
    
    // Listen for text selection
    this.setupTextSelectionHandler();
    
    // Listen for code editor changes
    this.setupCodeEditorHandler();
  }

  private addTriggerButton() {
    const observer = new MutationObserver(() => {
      const problemTitle = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('h1') ||
                          document.querySelector('.text-title-large');
      
      if (problemTitle && !document.querySelector('.learnai-leetcode-trigger')) {
        const button = document.createElement('button');
        button.className = 'learnai-leetcode-trigger';
        button.innerHTML = '🎓 Get AI Help';
        button.onclick = () => this.startTutorSession();
        
        // Position relative to the problem title
        problemTitle.parentElement?.style.setProperty('position', 'relative');
        problemTitle.parentElement?.appendChild(button);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private setupTextSelectionHandler() {
    document.addEventListener('mouseup', () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 10) {
        this.showContextualHelp();
      }
    });
  }

  private setupCodeEditorHandler() {
    // Monitor for code editor (Monaco Editor or CodeMirror)
    const observer = new MutationObserver(() => {
      const codeEditor = document.querySelector('.monaco-editor') || 
                        document.querySelector('.CodeMirror') ||
                        document.querySelector('[data-testid="code-editor"]');
      
      if (codeEditor && !(codeEditor as HTMLElement).dataset.learnaiSetup) {
        (codeEditor as HTMLElement).dataset.learnaiSetup = 'true';
        this.attachCodeEditorHandlers(codeEditor);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  private attachCodeEditorHandlers(editor: Element) {
    // Add keyboard shortcut (Ctrl/Cmd + /)
    editor.addEventListener('keydown', (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if ((keyEvent.ctrlKey || keyEvent.metaKey) && keyEvent.key === '/') {
        e.preventDefault();
        this.startTutorSession();
      }
    });
  }

  private showContextualHelp() {
    const selection = window.getSelection();
    if (!selection) return;

    const selectedText = selection.toString().trim();
    const problem = this.extractProblemInfo();
    
    if (problem) {
      problem.selectedCode = selectedText;
      this.startTutorSession(problem);
    }
  }

  private extractProblemInfo(): LeetCodeProblem | null {
    try {
      // Extract problem title
      const titleElement = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('h1') ||
                          document.querySelector('.text-title-large');
      const title = titleElement?.textContent?.trim() || 'Unknown Problem';

      // Extract difficulty
      const difficultyElement = document.querySelector('[diff="easy"]') ||
                               document.querySelector('[diff="medium"]') ||
                               document.querySelector('[diff="hard"]') ||
                               document.querySelector('.text-difficulty-easy') ||
                               document.querySelector('.text-difficulty-medium') ||
                               document.querySelector('.text-difficulty-hard');
      const difficulty = difficultyElement?.textContent?.trim() || 
                        difficultyElement?.getAttribute('diff') || 'Unknown';

      // Extract problem description
      const descriptionElement = document.querySelector('[data-track-load="description_content"]') ||
                                document.querySelector('.content__u3I1') ||
                                document.querySelector('.question-content');
      const description = descriptionElement?.textContent?.trim().slice(0, 1000) || 'No description available';

      // Extract current programming language
      const languageSelector = document.querySelector('[data-cy="lang-select"]') ||
                              document.querySelector('.ant-select-selection-item');
      const language = languageSelector?.textContent?.trim() || 'Unknown';

      return {
        title,
        difficulty,
        description,
        language
      };
    } catch (error) {
      console.error('Error extracting problem info:', error);
      return null;
    }
  }

  private startTutorSession(problemOverride?: LeetCodeProblem) {
    if (this.isActive) {
      this.closeTutor();
      return;
    }

    const problem = problemOverride || this.extractProblemInfo();
    if (!problem) {
      alert('Could not extract problem information. Please make sure you are on a LeetCode problem page.');
      return;
    }

    const request: TutorRequest = {
      type: 'leetcode',
      context: problem
    };

    this.showTutorInterface(request);
  }

  private showTutorInterface(request: TutorRequest) {
    // Create container for the tutor interface
    const container = document.createElement('div');
    container.id = 'learnai-tutor-container';
    document.body.appendChild(container);

    // Create React root and render
    this.tutorRoot = createRoot(container);
    this.tutorRoot.render(
      <TutorInterface 
        request={request} 
        onClose={() => this.closeTutor()} 
      />
    );

    this.isActive = true;
  }

  private closeTutor() {
    const container = document.getElementById('learnai-tutor-container');
    if (container) {
      this.tutorRoot?.unmount();
      container.remove();
    }
    this.isActive = false;
  }
}

// Initialize the LeetCode integration
new LeetCodeIntegration();