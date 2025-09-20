import React from 'react';
import { createRoot } from 'react-dom/client';
import { EnhancedTutorInterface } from '../components/EnhancedTutorInterface';
import { LeetCodeProblem, TutorRequest } from '../types/index';
import '../components/styles.css';

class LeetCodeIntegration {
  private tutorRoot: any = null;
  private isActive = false;
  private codeEditor: HTMLElement | null = null;
  private lastCode = '';
  private problemData: LeetCodeProblem | null = null;

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
    
    // Enhanced code editor monitoring
    this.setupCodeEditorHandler();
    
    // Real-time test result monitoring
    this.setupTestResultMonitor();
    
    // Problem data extraction
    this.extractAndCacheProblemData();
  }

  private addTriggerButton() {
    const observer = new MutationObserver(() => {
      const problemTitle = document.querySelector('[data-cy="question-title"]') || 
                          document.querySelector('h1') ||
                          document.querySelector('.text-title-large');
      
      if (problemTitle && !document.querySelector('.learnai-leetcode-trigger')) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'leeco-ai-button-container';
        buttonContainer.style.cssText = `
          display: flex;
          gap: 8px;
          margin: 12px 0;
          flex-wrap: wrap;
        `;

        // Main help button
        const mainButton = document.createElement('button');
        mainButton.className = 'learnai-leetcode-trigger';  
        mainButton.innerHTML = '🎓 Get AI Help';
        mainButton.onclick = () => this.startTutorSession();
        
        // Quick action buttons
        const hintButton = document.createElement('button');
        hintButton.innerHTML = '💡 Hint';
        hintButton.onclick = () => this.getQuickHelp('hints');
        
        const approachButton = document.createElement('button');
        approachButton.innerHTML = '🎯 Approach';
        approachButton.onclick = () => this.getQuickHelp('approach');
        
        const debugButton = document.createElement('button');
        debugButton.innerHTML = '🐛 Debug';
        debugButton.onclick = () => this.debugCurrentCode();

        // Style buttons
        [mainButton, hintButton, approachButton, debugButton].forEach(btn => {
          btn.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          `;
          
          btn.addEventListener('mouseover', () => {
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          });
          
          btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          });
        });

        buttonContainer.appendChild(mainButton);
        buttonContainer.appendChild(hintButton);
        buttonContainer.appendChild(approachButton);
        buttonContainer.appendChild(debugButton);
        
        // Position relative to the problem title
        problemTitle.parentElement?.style.setProperty('position', 'relative');
        problemTitle.parentElement?.appendChild(buttonContainer);
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
      <EnhancedTutorInterface 
        request={request} 
        onClose={() => this.closeTutor()} 
      />
    );

    this.isActive = true;
  }

  // Enhanced Methods for Leeco AI Clone functionality
  private async getQuickHelp(feature: 'hints' | 'approach' | 'testcases') {
    const problem = this.problemData || this.extractProblemInfo();
    if (!problem) {
      alert('Could not extract problem information. Please make sure you are on a LeetCode problem page.');
      return;
    }

    // Get current code if available
    const currentCode = this.getCurrentCode();
    if (currentCode) {
      problem.selectedCode = currentCode;
    }

    const request: TutorRequest = {
      type: 'leetcode',
      context: problem,
      requestedFeature: feature,
      userQuery: `Please provide ${feature} for this problem`
    };

    this.showTutorInterface(request);
  }

  private async debugCurrentCode() {
    const problem = this.problemData || this.extractProblemInfo();
    const currentCode = this.getCurrentCode();
    
    if (!problem || !currentCode) {
      alert('Could not extract problem or code information for debugging.');
      return;
    }

    problem.selectedCode = currentCode;

    const request: TutorRequest = {
      type: 'leetcode',
      context: problem,
      requestedFeature: 'errors',
      userQuery: 'Please help me debug this code and identify any issues'
    };

    this.showTutorInterface(request);
  }

  private getCurrentCode(): string {
    // Try multiple selectors for the code editor
    const codeSelectors = [
      '.monaco-editor textarea',
      '.CodeMirror-code',
      'textarea[data-cy="code-editor"]',
      '.ace_text-input',
      'div[data-mode-id] textarea'
    ];

    for (const selector of codeSelectors) {
      const element = document.querySelector(selector) as HTMLTextAreaElement;
      if (element && element.value) {
        return element.value;
      }
    }

    // Try to get content from Monaco editor if present
    const monacoEditor = document.querySelector('.monaco-editor .view-lines');
    if (monacoEditor) {
      return monacoEditor.textContent || '';
    }

    return '';
  }

  private setupTestResultMonitor() {
    // Monitor for test result elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Look for failed test result indicators
            if (element.querySelector?.('.text-red-500') || 
                element.querySelector?.('.text-danger') ||
                element.textContent?.includes('Wrong Answer') ||
                element.textContent?.includes('Runtime Error') ||
                element.textContent?.includes('Time Limit Exceeded')) {
              
              this.handleTestFailure(element);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private handleTestFailure(element: Element) {
    // Add a debug button to failed test results
    if (!element.querySelector('.leeco-debug-btn')) {
      const debugBtn = document.createElement('button');
      debugBtn.className = 'leeco-debug-btn';
      debugBtn.innerHTML = '🔍 Debug with AI';
      debugBtn.style.cssText = `
        background: #ff4757;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        margin: 4px;
        cursor: pointer;
      `;
      
      debugBtn.onclick = () => {
        const errorText = element.textContent || '';
        this.debugFailedTest(errorText);
      };
      
      element.appendChild(debugBtn);
    }
  }

  private async debugFailedTest(errorText: string) {
    const problem = this.problemData || this.extractProblemInfo();
    const currentCode = this.getCurrentCode();
    
    if (!problem) return;

    problem.selectedCode = currentCode;

    const request: TutorRequest = {
      type: 'leetcode',
      context: problem,
      requestedFeature: 'errors',
      userQuery: `I got this test failure: "${errorText}". Please help me understand what went wrong and how to fix it.`
    };

    this.showTutorInterface(request);
  }

  private extractAndCacheProblemData() {
    // Cache problem data for quick access
    const problemData = this.extractProblemInfo();
    if (problemData) {
      this.problemData = problemData;
    }

    // Update cache when URL changes
    let currentUrl = window.location.href;
    setInterval(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        this.problemData = this.extractProblemInfo();
      }
    }, 1000);
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